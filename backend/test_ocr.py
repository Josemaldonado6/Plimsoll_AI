from paddleocr import PaddleOCR
import sys

try:
    print("Attempting to load PaddleOCR model...")
    # use_gpu removed due to deprecation/compatibility
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    print("PaddleOCR model loaded successfully!")
except Exception as e:
    print(f"CRITICAL ERROR: {e}")
    sys.exit(1)
