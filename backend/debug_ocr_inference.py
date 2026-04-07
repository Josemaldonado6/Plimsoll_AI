from paddleocr import PaddleOCR
import numpy as np

try:
    ocr = PaddleOCR(use_angle_cls=True, lang='en')
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    
    # Test 1: With cls=True
    try:
        print("Testing ocr(img, cls=True)...")
        res = ocr.ocr(img, cls=True)
        print("Success with cls=True")
    except Exception as e:
        print(f"Failed with cls=True: {e}")

    # Test 2: Without cls arg
    try:
        print("Testing ocr(img)...")
        res = ocr.ocr(img)
        print("Success without cls arg")
    except Exception as e:
        print(f"Failed without cls arg: {e}")

except Exception as e:
    print(f"Init failed: {e}")
