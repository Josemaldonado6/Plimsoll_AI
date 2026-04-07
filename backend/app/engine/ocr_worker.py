import sys
import json
import os
import argparse
import logging
import cv2

# Configure logging to stderr to avoid polluting stdout (which is used for JSON result)
logging.basicConfig(level=logging.ERROR)
logger = logging.getLogger("OCR_WORKER")

def run_ocr(image_path):
    try:
        from paddleocr import PaddleOCR
        # Initialize OCR - this happens in its own process space
        ocr = PaddleOCR(use_angle_cls=True, lang='en')
        
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read image: {image_path}")

        result = ocr.ocr(img, cls=True)
        
        # Parse result into JSON-serializable format
        parsed_result = []
        if result and result[0]:
            for line in result[0]:
                text = line[1][0]
                confidence = float(line[1][1])
                box = line[0] # List of points
                parsed_result.append({
                    "text": text,
                    "confidence": confidence,
                    "box": box
                })
        
        print(json.dumps({"success": True, "data": parsed_result}))
        
    except Exception as e:
        logger.error(f"OCR Failed: {e}")
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("image_path", help="Path to image for OCR")
    args = parser.parse_args()
    
    if not os.path.exists(args.image_path):
        print(json.dumps({"success": False, "error": "File not found"}))
        sys.exit(1)
        
    run_ocr(args.image_path)
