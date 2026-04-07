# -----------------------------------------------------------------------------
# PROJECT: PLIMSOLL AI - THE VISUAL CORTEX
# MODULE: visual_cortex.py
#
# DESCRIPTION:
# Handles Foundation Model Inference (YOLOv11 + SAM) optimized for Intel Core Ultra 9 (NPU).
# This replaces the legacy OpenCV manual filtering logic.
#
# HARDWARE TARGET: 
# - Intel Core Ultra 9 NPU (via OpenVINO)
# - Fallback: CPU (OpenVINO Optimized)
# -----------------------------------------------------------------------------

import cv2
import numpy as np
import logging
import os
from pathlib import Path
from typing import Dict, List, Tuple

# Try importing Ultralytics for YOLO inference
try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("VisualCortex")

class VisualCortex:
    def __init__(self, model_path: str = "yolo11n.pt", use_npu: bool = True):
        """
        Initialize the Visual Cortex V4. 
        Targeting YOLOv11 for high-speed ROI detection.
        """
        self.model = None
        self.use_npu = use_npu
        self.reading_buffer = [] 
        self.buffer_size = 5
        
        # OpenVINO V4 Path (Expecting YOLO11)
        ov_dir = "yolo11n_openvino_model"
        self.model_path = ov_dir if os.path.exists(ov_dir) else model_path
        
        self.mock_mode = False
        self._load_model()

    def _load_model(self):
        """
        Loads the YOLOv11 model.
        """
        if YOLO is None:
            self.mock_mode = True
            return

        try:
            device = "npu" if self.use_npu else "cpu"
            self.model = YOLO(self.model_path, task='detect')
            self.inference_device = device
            logger.info(f"Visual Cortex V4 Loaded (YOLO11, Device: {device.upper()}).")
        except Exception as e:
            logger.error(f"Failed to load YOLOv11: {e}")
            self.mock_mode = True

    def detect_waterline(self, frame: np.ndarray) -> Dict:
        """
        [DEPRECATED HEURISTIC] 
        V4 now uses AIDraftSurveyorV4 master pipeline for true 3D coordinates.
        This method will return simple YOLOv11 bounding boxes for ROI.
        """
        if self.mock_mode or self.model is None:
            return {"status": "AI_ERROR", "waterline_y": 0}

        results = self.model(frame, verbose=False, conf=0.5)
        
        # In V4, we return the RAW detections to be processed by SAM 2 + Depth Anything
        return {
            "status": "V4_ROI_LOCKED",
            "boxes": results[0].boxes,
            "inference_device": self.inference_device
        }
