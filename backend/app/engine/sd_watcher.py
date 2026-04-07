# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: sd_watcher.py
#
# Demonio de vigilancia de tarjeta SD para el DJI Air 3S.
# Usa la librería `watchdog` para detectar la inserción de una tarjeta SD
# y mueve automáticamente los archivos MP4 4K al disco local.
#
# Arquitectura:
#   1. SDCardWatcher.start() → lanza hilo de polling para nuevas unidades
#   2. Al detectar unidad removible nueva → registra MP4Handler con watchdog
#   3. MP4Handler.on_created/on_moved → espera fin de escritura → mueve archivo
# -----------------------------------------------------------------------------

import os
import time
import shutil
import logging
import platform
import threading
from pathlib import Path
from typing import Set

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

logger = logging.getLogger("Plimsoll-SDWatcher")

# Rutas relativas típicas del DJI Air 3S en la tarjeta SD
_DJI_DCIM_PATHS = [
    "DCIM/100MEDIA",
    "DCIM/DJI_001",
    "DCIM",
]


class MP4Handler(FileSystemEventHandler):
    """
    Manejador de eventos de sistema de archivos.
    Detecta archivos MP4 nuevos o finalizados y los transfiere al disco local.
    """

    def __init__(self, destination_dir: Path):
        self.destination_dir = destination_dir
        self.destination_dir.mkdir(parents=True, exist_ok=True)
        self._queued: Set[str] = set()
        self._lock = threading.Lock()

    # watchdog llama esto cuando aparece un archivo nuevo
    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(".mp4"):
            self._enqueue(event.src_path)

    # DJI a veces escribe en .MP4.tmp y luego renombra
    def on_moved(self, event):
        if not event.is_directory and event.dest_path.lower().endswith(".mp4"):
            self._enqueue(event.dest_path)

    def _enqueue(self, src_path: str):
        with self._lock:
            if src_path in self._queued:
                return
            self._queued.add(src_path)

        logger.info(f"[SDWatcher] MP4 detectado: {Path(src_path).name}")
        thread = threading.Thread(
            target=self._wait_and_transfer,
            args=(src_path,),
            name=f"Transfer-{Path(src_path).stem}",
            daemon=True,
        )
        thread.start()

    def _wait_and_transfer(self, src_path: str):
        """
        Espera a que la cámara termine de escribir el archivo (tamaño estable)
        y luego lo mueve al destino.
        Criterio de estabilidad: mismo tamaño en 3 comprobaciones sucesivas cada 2s.
        """
        src = Path(src_path)
        prev_size = -1
        stable_count = 0

        while stable_count < 3:
            time.sleep(2)
            try:
                current_size = src.stat().st_size
            except FileNotFoundError:
                logger.warning(f"[SDWatcher] Archivo desapareció: {src.name}")
                return

            if current_size > 0 and current_size == prev_size:
                stable_count += 1
            else:
                stable_count = 0
            prev_size = current_size

        # Construir ruta destino; evitar sobreescritura
        dst = self.destination_dir / src.name
        if dst.exists():
            dst = self.destination_dir / f"{src.stem}_{int(time.time())}{src.suffix}"

        try:
            shutil.move(str(src), str(dst))
            logger.info(f"[SDWatcher] ✓ Transferido: {src.name} → {dst}")
        except Exception as exc:
            logger.error(f"[SDWatcher] Error al transferir {src.name}: {exc}")
        finally:
            with self._lock:
                self._queued.discard(src_path)


class SDCardWatcher:
    """
    Demonio principal.
    Detecta la inserción de unidades removibles multiplataforma
    (Windows: letras de unidad; Linux: /media, /run/media; macOS: /Volumes)
    y registra vigilantes de watchdog en las rutas DCIM del DJI Air 3S.
    """

    def __init__(self, destination_dir: str, poll_interval: float = 5.0):
        self.destination_dir = Path(destination_dir)
        self.poll_interval = poll_interval
        self._observer: Observer = Observer()
        self._watched_paths: Set[str] = set()
        self._running = False
        self._poll_thread: threading.Thread | None = None

    # ------------------------------------------------------------------
    # Detección de unidades removibles
    # ------------------------------------------------------------------

    def _get_removable_roots(self) -> list[str]:
        """Devuelve raíces de unidades/volúmenes removibles montados."""
        roots: list[str] = []
        system = platform.system()

        if system == "Windows":
            import ctypes
            bitmask = ctypes.windll.kernel32.GetLogicalDrives()
            for i in range(26):
                if bitmask & (1 << i):
                    drive = f"{chr(65 + i)}\\"
                    # DRIVE_REMOVABLE = 2
                    if ctypes.windll.kernel32.GetDriveTypeW(drive) == 2:
                        roots.append(drive)

        elif system == "Linux":
            for base in ("/media", "/run/media"):
                base_path = Path(base)
                if not base_path.exists():
                    continue
                try:
                    for entry in base_path.iterdir():
                        if entry.is_dir():
                            if os.path.ismount(str(entry)):
                                roots.append(str(entry))
                            else:
                                for sub in entry.iterdir():
                                    if sub.is_dir() and os.path.ismount(str(sub)):
                                        roots.append(str(sub))
                except PermissionError:
                    pass

        elif system == "Darwin":
            volumes = Path("/Volumes")
            if volumes.exists():
                for vol in volumes.iterdir():
                    if vol.is_dir() and os.path.ismount(str(vol)) and vol.name != "Macintosh HD":
                        roots.append(str(vol))

        return roots

    def _find_dji_paths(self, drive_root: str) -> list[str]:
        """
        Busca las carpetas DCIM del DJI Air 3S en la unidad.
        Si no las encuentra, observa la raíz completa como fallback.
        """
        root = Path(drive_root)
        found = [str(root / rel) for rel in _DJI_DCIM_PATHS if (root / rel).exists()]
        return found if found else [drive_root]

    # ------------------------------------------------------------------
    # Control del observer
    # ------------------------------------------------------------------

    def _start_watching(self, path: str):
        if path in self._watched_paths:
            return
        handler = MP4Handler(self.destination_dir)
        self._observer.schedule(handler, path, recursive=True)
        self._watched_paths.add(path)
        logger.info(f"[SDWatcher] Observando: {path}")

    def _poll_loop(self):
        logger.info("[SDWatcher] Esperando inserción de tarjeta SD...")
        while self._running:
            try:
                for drive in self._get_removable_roots():
                    for path in self._find_dji_paths(drive):
                        self._start_watching(path)
            except Exception as exc:
                logger.error(f"[SDWatcher] Error en poll: {exc}")
            time.sleep(self.poll_interval)

    # ------------------------------------------------------------------
    # API pública
    # ------------------------------------------------------------------

    def start(self):
        """Inicia el observer de watchdog y el hilo de polling."""
        self._running = True
        self._observer.start()
        self._poll_thread = threading.Thread(
            target=self._poll_loop,
            name="SDWatcher-Poll",
            daemon=True,
        )
        self._poll_thread.start()
        logger.info(f"[SDWatcher] Demonio iniciado. Destino: {self.destination_dir}")

    def stop(self):
        self._running = False
        self._observer.stop()
        self._observer.join()
        logger.info("[SDWatcher] Demonio detenido.")

    def run_forever(self):
        """Punto de entrada bloqueante para ejecución standalone."""
        self.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()


# ------------------------------------------------------------------
# Singleton de módulo
# ------------------------------------------------------------------
_INCOMING_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "incoming")
)

sd_watcher = SDCardWatcher(destination_dir=_INCOMING_DIR)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%H:%M:%S",
    )
    logger.info("=== Plimsoll AI — SD Card Watcher Daemon ===")
    logger.info(f"Destino: {_INCOMING_DIR}")
    sd_watcher.run_forever()
