import os
import logging
from typing import Optional

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ModelOptimizer")

def export_models():
    """
    Exports YOLOv8 and SAM models to OpenVINO format (FP16).
    """
    try:
        from ultralytics import YOLO, SAM
    except ImportError:
        logger.error("Ultralytics not installed. Cannot export models.")
        return

    # 1. Export YOLOv8n
    logger.info("Exporting YOLOv8n to OpenVINO (FP16)...")
    yolo_model = YOLO("yolov8n.pt")
    # format: openvino, half: FP16
    yolo_path = yolo_model.export(format="openvino", half=True)
    logger.info(f"YOLOv8n exported to: {yolo_path}")

    # 2. Export SAM
    logger.info("Exporting SAM to OpenVINO (FP16)...")
    sam_model = SAM("sam_b.pt")
    sam_path = sam_model.export(format="openvino", half=True)
    logger.info(f"SAM exported to: {sam_path}")

if __name__ == "__main__":
    export_models()
