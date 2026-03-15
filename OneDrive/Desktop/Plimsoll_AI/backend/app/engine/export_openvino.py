# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: export_openvino.py
#
# Script de exportación e INT8 quantización para dispositivos Edge.
# Ejecutar UNA SOLA VEZ en una máquina con PyTorch antes del despliegue.
#
# Uso:
#   cd backend
#   python -m app.engine.export_openvino
#
# Produce en data/models/:
#   yolo11n_openvino_int8/   — YOLOv11n INT8 OpenVINO IR
#   sam2_openvino_int8/      — SAM 2-B INT8 OpenVINO IR
#   depth_v2_openvino_int8/  — Depth Anything V2 Small INT8 OpenVINO IR
# -----------------------------------------------------------------------------

import os
import sys
import glob
import logging
import shutil
from pathlib import Path
from typing import Generator

import cv2
import numpy as np

# --- OpenVINO & NNCF (disponibles en openvino-dev) -------------------------
import openvino as ov
import nncf
from nncf import QuantizationPreset

logger = logging.getLogger("Plimsoll-Export")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
_BACKEND_DIR = Path(__file__).resolve().parents[3]   # backend/
_MODELS_DIR  = _BACKEND_DIR / "data" / "models"
_FRAMES_DIR  = _BACKEND_DIR / "data" / "incoming"   # calibration frames
_MODELS_DIR.mkdir(parents=True, exist_ok=True)

# INPUT_SIZE constants por modelo
_YOLO_SIZE  = (640, 640)
_SAM2_SIZE  = (1024, 1024)
_DEPTH_SIZE = (518, 518)      # Depth Anything V2 Small input


# ===========================================================================
# 1. EXPORTAR A OPENVINO FP32 (usando ultralytics)
# ===========================================================================

def export_yolo11n(fp32_out: Path) -> Path:
    """Exporta YOLOv11n a OpenVINO IR FP32."""
    from ultralytics import YOLO
    logger.info("Exportando YOLOv11n → OpenVINO FP32 ...")
    model = YOLO("yolo11n.pt")
    model.export(format="openvino", imgsz=_YOLO_SIZE[0], half=False, dynamic=False)
    # ultralytics crea 'yolo11n_openvino_model/' en el directorio actual
    src = Path("yolo11n_openvino_model")
    fp32_out.mkdir(parents=True, exist_ok=True)
    for f in src.glob("*"):
        shutil.copy(f, fp32_out / f.name)
    logger.info(f"YOLOv11n FP32 IR → {fp32_out}")
    return fp32_out / "yolo11n.xml"


def export_sam2(fp32_out: Path) -> Path:
    """Exporta SAM 2-B a OpenVINO IR FP32."""
    from ultralytics import SAM
    logger.info("Exportando SAM 2-B → OpenVINO FP32 ...")
    model = SAM("sam2_b.pt")
    model.export(format="openvino", imgsz=_SAM2_SIZE[0], half=False, dynamic=False)
    src = Path("sam2_b_openvino_model")
    fp32_out.mkdir(parents=True, exist_ok=True)
    for f in src.glob("*"):
        shutil.copy(f, fp32_out / f.name)
    logger.info(f"SAM 2-B FP32 IR → {fp32_out}")
    return fp32_out / "sam2_b.xml"


def export_depth_anything_v2(fp32_out: Path) -> Path:
    """
    Exporta Depth Anything V2 Small de HuggingFace a OpenVINO IR FP32.
    Requiere torch + transformers (solo en tiempo de exportación).
    """
    import torch
    from transformers import AutoModelForDepthEstimation, AutoImageProcessor

    logger.info("Exportando Depth Anything V2 Small → OpenVINO FP32 ...")
    model_id = "depth-anything/Depth-Anything-V2-Small-hf"
    processor = AutoImageProcessor.from_pretrained(model_id)
    torch_model = AutoModelForDepthEstimation.from_pretrained(model_id)
    torch_model.eval()

    dummy = torch.zeros(1, 3, *_DEPTH_SIZE)
    ov_model = ov.convert_model(torch_model, example_input={"pixel_values": dummy})

    fp32_out.mkdir(parents=True, exist_ok=True)
    xml_path = fp32_out / "depth_anything_v2.xml"
    ov.save_model(ov_model, str(xml_path))
    logger.info(f"Depth Anything V2 FP32 IR → {xml_path}")
    return xml_path


# ===========================================================================
# 2. DATASET DE CALIBRACIÓN (frames reales o sintéticos)
# ===========================================================================

def _collect_calibration_frames(n: int = 300) -> list:
    """
    Carga n frames desde data/incoming/*.mp4 o genera sintéticos si no hay datos.
    """
    frames = []
    mp4s = sorted(Path(_FRAMES_DIR).glob("**/*.mp4"))

    for mp4 in mp4s:
        cap = cv2.VideoCapture(str(mp4))
        src_fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        step = max(1, int(src_fps))  # 1 FPS de calibración
        idx = 0
        while len(frames) < n:
            ret, frame = cap.read()
            if not ret:
                break
            if idx % step == 0:
                frames.append(frame)
            idx += 1
        cap.release()
        if len(frames) >= n:
            break

    if not frames:
        logger.warning("Sin datos reales — usando frames sintéticos para calibración NNCF.")
        rng = np.random.default_rng(42)
        frames = [rng.integers(0, 255, (2160, 3840, 3), dtype=np.uint8) for _ in range(n)]

    logger.info(f"Dataset de calibración: {len(frames)} frames.")
    return frames[:n]


def _preprocess_yolo(frame: np.ndarray) -> np.ndarray:
    img = cv2.resize(frame, _YOLO_SIZE)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    return np.expand_dims(np.transpose(img, (2, 0, 1)), 0)   # NCHW


def _preprocess_depth(frame: np.ndarray) -> np.ndarray:
    img = cv2.resize(frame, _DEPTH_SIZE)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img  = (img - mean) / std
    return np.expand_dims(np.transpose(img, (2, 0, 1)), 0)   # NCHW


def _preprocess_sam2(frame: np.ndarray) -> np.ndarray:
    img = cv2.resize(frame, _SAM2_SIZE)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img  = (img - mean) / std
    return np.expand_dims(np.transpose(img, (2, 0, 1)), 0)


# ===========================================================================
# 3. CUANTIZACIÓN INT8 CON CONTROL DE PRECISIÓN (NNCF)
# ===========================================================================

def quantize_int8(
    xml_path: Path,
    output_dir: Path,
    preprocess_fn,
    output_xml_name: str,
    max_drop: float = 0.01,
) -> Path:
    """
    Aplica cuantización INT8 con Accuracy Control de NNCF.

    Parámetros:
        xml_path       — ruta al modelo FP32 OpenVINO IR (.xml)
        output_dir     — directorio de salida del modelo INT8
        preprocess_fn  — función de preprocesamiento frame → np.ndarray
        output_xml_name— nombre del .xml de salida
        max_drop       — degradación máxima de métrica permitida (0.01 = 1%)

    Garantía: si la cuantización excede max_drop, NNCF restaura capas FP32
    hasta que la degradación quede dentro del límite.
    """
    logger.info(f"Cuantizando {xml_path.name} → INT8 (max_drop={max_drop*100:.0f}%) ...")

    core = ov.Core()
    ov_model = core.read_model(str(xml_path))

    raw_frames = _collect_calibration_frames(300)

    # nncf.Dataset acepta un iterable o generador
    calib_data  = nncf.Dataset(raw_frames, preprocess_fn)
    val_data    = nncf.Dataset(raw_frames[:50], preprocess_fn)

    # Función de validación: mide cosine similarity promedio entre FP32 e INT8
    def validation_fn(compiled_model, dataset):
        fp32_compiled = core.compile_model(ov_model, "CPU")
        sims = []
        for batch in dataset.get_inference_data():
            out_int8 = list(compiled_model({0: batch})[0].flatten())
            out_fp32 = list(fp32_compiled({0: batch})[0].flatten())
            a = np.array(out_fp32, dtype=np.float32)
            b = np.array(out_int8,  dtype=np.float32)
            norm_a, norm_b = np.linalg.norm(a), np.linalg.norm(b)
            if norm_a > 0 and norm_b > 0:
                sims.append(float(np.dot(a, b) / (norm_a * norm_b)))
        return float(np.mean(sims)) if sims else 1.0

    quantized = nncf.quantize_with_accuracy_control(
        ov_model,
        calibration_dataset=calib_data,
        validation_dataset=val_data,
        validation_fn=validation_fn,
        max_drop=max_drop,
        preset=QuantizationPreset.MIXED,  # INT8 para pesos, mixed para activaciones
    )

    output_dir.mkdir(parents=True, exist_ok=True)
    out_xml = output_dir / output_xml_name
    ov.save_model(quantized, str(out_xml))
    logger.info(f"✓ Modelo INT8 guardado: {out_xml}")
    return out_xml


# ===========================================================================
# 4. PIPELINE PRINCIPAL
# ===========================================================================

def run_export_pipeline():
    logger.info("=" * 60)
    logger.info("PLIMSOLL AI — Pipeline de Exportación OpenVINO INT8")
    logger.info("=" * 60)

    fp32_dir = _MODELS_DIR / "_fp32_temp"

    # -- YOLO11n --
    yolo_fp32_xml = export_yolo11n(fp32_dir / "yolo11n")
    quantize_int8(
        xml_path=yolo_fp32_xml,
        output_dir=_MODELS_DIR / "yolo11n_openvino_int8",
        preprocess_fn=_preprocess_yolo,
        output_xml_name="yolo11n.xml",
        max_drop=0.01,
    )

    # -- SAM 2-B --
    sam2_fp32_xml = export_sam2(fp32_dir / "sam2")
    quantize_int8(
        xml_path=sam2_fp32_xml,
        output_dir=_MODELS_DIR / "sam2_openvino_int8",
        preprocess_fn=_preprocess_sam2,
        output_xml_name="sam2_b.xml",
        max_drop=0.01,
    )

    # -- Depth Anything V2 Small --
    depth_fp32_xml = export_depth_anything_v2(fp32_dir / "depth_v2")
    quantize_int8(
        xml_path=depth_fp32_xml,
        output_dir=_MODELS_DIR / "depth_v2_openvino_int8",
        preprocess_fn=_preprocess_depth,
        output_xml_name="depth_anything_v2.xml",
        max_drop=0.01,
    )

    # Limpieza de temporales FP32
    shutil.rmtree(fp32_dir, ignore_errors=True)
    logger.info("Temporales FP32 eliminados.")
    logger.info("=" * 60)
    logger.info("✓ Exportación completa. Modelos INT8 en: " + str(_MODELS_DIR))
    logger.info("=" * 60)


if __name__ == "__main__":
    run_export_pipeline()
