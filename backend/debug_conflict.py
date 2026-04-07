import os

# Uncomment to potentially fix the issue
# os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

print("Importing Ultralytics (PyTorch)...")
from ultralytics import YOLO
model_yolo = YOLO('yolov8n.pt')
print("YOLO Loaded.")

print("Importing PaddleOCR...")
from paddleocr import PaddleOCR
ocr = PaddleOCR(use_angle_cls=True, lang='en')
print("PaddleOCR Loaded.")

print("SIMULATING CONFLICT...")
import numpy as np
img = np.zeros((100, 100, 3), dtype=np.uint8)

print("Running YOLO inference...")
res_yolo = model_yolo(img)

print("Running OCR inference...")
res_ocr = ocr.ocr(img)

print("SUCCESS: No Conflict Detected.")
