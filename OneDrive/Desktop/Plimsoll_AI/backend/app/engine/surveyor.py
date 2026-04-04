# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: surveyor.py
#
# Extractor de cuadros para video 4K del DJI Air 3S.
# Opera estrictamente a 1 o 2 FPS para no saturar la NPU del dispositivo Edge.
# Delega el análisis visual a VisionTrinity (YOLO → SAM2 → DepthAnythingV2).
#
# Flujo:
#   archivo MP4 → extract_frames(1-2 FPS) → VisionTrinity.analyze_frame()
#               → lista de resultados con waterline_y y métricas 3D
# -----------------------------------------------------------------------------

import os
import asyncio
import logging
import threading
import time
from pathlib import Path
from typing import Dict, List, Optional

import cv2
import numpy as np

from app.engine.ai_vision import VisionTrinity

logger = logging.getLogger("Plimsoll-Surveyor")

# Rango válido: 1 FPS (conservador, Edge) o 2 FPS (máximo permitido)
_VALID_FPS = (1, 2)


class FrameSurveyor:
    """
    Surveyor offline para video 4K del DJI Air 3S.

    Extrae cuadros del MP4 a una tasa controlada (1 o 2 FPS) para proteger
    la NPU del dispositivo Edge y los pasa a VisionTrinity para análisis.
    """

    def __init__(self, fps: int = 1):
        if fps not in _VALID_FPS:
            raise ValueError(f"fps debe ser 1 o 2 para proteger la NPU Edge. Recibido: {fps}")
        self.fps = fps
        self.vision = VisionTrinity()  # Edge: NPU-First Architecture
        self._results: List[Dict] = []
        self._is_running = False
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Extracción de cuadros
    # ------------------------------------------------------------------

    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Abre el MP4 con OpenCV y extrae cuadros a la tasa configurada.

        Estrategia: se lee el FPS nativo del video y se calcula el paso
        de cuadros (frame_step) de forma que la tasa de muestreo sea
        exactamente self.fps.

        Returns:
            Lista de frames BGR (numpy.ndarray).
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"No se puede abrir el video: {video_path}")

        source_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        # Redondeo: tomar 1 de cada N cuadros
        frame_step = max(1, int(round(source_fps / self.fps)))

        logger.info(
            f"[Surveyor] {Path(video_path).name} | "
            f"FPS fuente: {source_fps:.1f} | "
            f"Muestreo: cada {frame_step} cuadros → {self.fps} FPS efectivo"
        )

        frames: List[np.ndarray] = []
        idx = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if idx % frame_step == 0:
                frames.append(frame)
            idx += 1

        cap.release()
        logger.info(
            f"[Surveyor] Extraídos {len(frames)} cuadros de {total_frames} totales."
        )
        return frames

    # ------------------------------------------------------------------
    # Pipeline asíncrono
    # ------------------------------------------------------------------

    async def process_video(self, video_path: str) -> List[Dict]:
        """
        Pipeline completo:
          1. Extrae cuadros a 1-2 FPS.
          2. Envía cada cuadro a VisionTrinity.
          3. Agrega y devuelve resultados.

        Yields control del event-loop entre cuadros para no bloquear
        otras corutinas del servidor FastAPI.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video no encontrado: {video_path}")

        self._is_running = True
        self._results = []

        frames = self.extract_frames(video_path)
        if not frames:
            logger.warning("[Surveyor] Sin cuadros extraídos. El video puede estar corrupto.")
            return []

        total = len(frames)
        logger.info(f"[Surveyor] Enviando {total} cuadros a VisionTrinity...")

        for i, frame in enumerate(frames):
            if not self._is_running:
                logger.info("[Surveyor] Procesamiento interrumpido.")
                break

            try:
                result = await self.vision.analyze_frame(frame)
                result["frame_index"] = i
                result["timestamp_s"] = round(i / self.fps, 2)

                with self._lock:
                    self._results.append(result)

                logger.debug(
                    f"[Surveyor] [{i + 1}/{total}] "
                    f"status={result.get('status')} "
                    f"waterline_y={result.get('waterline_y')} "
                    f"latency={result.get('latency_ms', 0):.0f}ms"
                )

            except Exception as exc:
                logger.error(f"[Surveyor] Error en cuadro {i}: {exc}")

            # Ceder control entre cuadros para no bloquear el event-loop
            await asyncio.sleep(0)

        self._is_running = False
        logger.info(f"[Surveyor] Completado. {len(self._results)} resultados.")
        return self.get_results()

    # ------------------------------------------------------------------
    # Estado y control
    # ------------------------------------------------------------------

    def get_results(self) -> List[Dict]:
        """Devuelve copia thread-safe de los resultados acumulados."""
        with self._lock:
            return list(self._results)

    def get_best_reading(self) -> Optional[Dict]:
        """
        Devuelve el resultado con mayor confianza (status == TRACKING_3D)
        o None si no hay lecturas válidas.
        """
        with self._lock:
            tracking = [r for r in self._results if r.get("status") == "TRACKING_3D"]
        if not tracking:
            return None
        # El cuadro con menor latencia es el de mejor calidad de inferencia
        return min(tracking, key=lambda r: r.get("latency_ms", float("inf")))

    def stop(self):
        """Interrumpe el procesamiento en curso."""
        self._is_running = False


# ------------------------------------------------------------------
# Singleton de módulo (listo para importar desde endpoints)
# ------------------------------------------------------------------
frame_surveyor = FrameSurveyor(fps=1)
