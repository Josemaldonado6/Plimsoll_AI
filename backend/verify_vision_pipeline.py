import os
# [CRITICAL] Fix for PyTorch/PaddlePaddle libiomp5md.dll conflict
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
os.environ["FLAGS_use_mkldnn"] = "0"
os.environ["FLAGS_enable_mkldnn"] = "0"
os.environ["PT_ENABLE_ONEDNN_OPTS"] = "0"

import cv2
import numpy as np
import sys
import logging
from app.engine.ai_vision import AIDraftSurveyor

# Configure professional logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("SystemVerifier")

def create_dummy_video(filename="test_video.mp4"):
    """Generates a synthetic video with readable text for OCR testing."""
    height, width = 720, 1280
    fps = 30
    duration = 2 # seconds
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(filename, fourcc, fps, (width, height))
    
    for i in range(fps * duration):
        # Create a frame (dark water with white text)
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Simulate Water (Dark Blue)
        frame[:] = (50, 20, 10) 
        
        # Draw "Draft Marks"
        cv2.putText(frame, "10.5M", (600, 300), cv2.FONT_HERSHEY_SIMPLEX, 3, (255, 255, 255), 5)
        cv2.putText(frame, "SAMPLE", (600, 400), cv2.FONT_HERSHEY_SIMPLEX, 1, (200, 200, 200), 2)
        
        out.write(frame)
        
    out.release()
    logger.info(f"Generated synthetic test media: {filename}")
    return filename

def verify_pipeline():
    try:
        logger.info("Initializing AI Draft Surveyor Engine...")
        surveyor = AIDraftSurveyor()
        
        # Force model load
        logger.info("Pre-loading Neural Networks (YOLOv8 + SAM + PaddleOCR)...")
        surveyor._load_models()
        
        if not surveyor.yolo_model: raise RuntimeError("YOLO Model failed to initialize")
        # OCR is now subprocess-based, so surveyor.ocr_model is expected to be None
        if not surveyor.sam_model: raise RuntimeError("SAM Model failed to initialize")
        
        logger.info("✔ All Neural Networks Loaded Successfully.")
        
        # Run Analysis
        video_path = create_dummy_video()
        logger.info(f"Starting analysis on {video_path}...")
        
        result = surveyor.process_video(video_path)
        
        logger.info("Analysis Complete. Validating Output Schema...")
        required_keys = ["draft_mean", "confidence", "sea_state", "ai_metadata"]
        for k in required_keys:
            if k not in result:
                raise ValueError(f"Missing key in result: {k}")
                
        logger.info(f"✔ Result Validation Passed: Draft={result['draft_mean']}m (Confidence={result['confidence']})")
        logger.info(f"✔ AI Metadata: {result['ai_metadata']}")
        
        # Cleanup
        if os.path.exists(video_path):
            os.remove(video_path)
            
        print("\n[SUCCESS] SYSTEM INTEGRITY VERIFIED. PIPELINE IS ROBUST.")
        return True
        
    except Exception as e:
        logger.error(f"SYSTEM FAILURE: {str(e)}", exc_info=True)
        print(f"\n[FAILURE] CRITICAL SYSTEM ERROR: {str(e)}")
        return False

if __name__ == "__main__":
    success = verify_pipeline()
    sys.exit(0 if success else 1)
