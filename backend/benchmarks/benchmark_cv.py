import cv2
import numpy as np
import time
import sys
import os
import psutil

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.engine.ai_vision import AIDraftSurveyor

def benchmark_vision():
    print("--- INITIATING VISUAL CORTEX BENCHMARK (PROTOCOL 17020) ---")
    
    # 1. Initialize System
    surveyor = AIDraftSurveyor()
    
    # Create a mock 4K frame (3840x2160)
    print("\n[SETUP] Generating Mock 4K Maritime Frame (3840x2160)...")
    frame = np.zeros((2160, 3840, 3), dtype=np.uint8)
    # Draw a mock hull and draft marks
    cv2.rectangle(frame, (1000, 1000), (2800, 2000), (40, 40, 40), -1) # Hull
    cv2.putText(frame, "8.6M", (1500, 1500), cv2.FONT_HERSHEY_SIMPLEX, 5, (255, 255, 255), 10)
    
    process = psutil.Process(os.getpid())
    mem_start = process.memory_info().rss / (1024 * 1024)
    print(f"  Initial Memory: {mem_start:.2f} MB")

    # 2. Benchmark Model Loading
    print("\n[STEP 1] Model Loading Latency (YOLOv8 + SAM)...")
    start_load = time.time()
    surveyor._load_models()
    load_time = time.time() - start_load
    print(f"  Load Time: {load_time:.2f}s")

    # 3. Benchmark YOLO Inference
    print("\n[STEP 2] YOLOv8 Inference (Single Frame)...")
    start_yolo = time.time()
    yolo_results = surveyor.yolo_model(frame, verbose=False)
    yolo_time = time.time() - start_yolo
    print(f"  YOLO Latency: {yolo_time*1000:.2f}ms")

    # 4. Benchmark SAM Segmentation
    print("\n[STEP 3] SAM Segmentation (Box Prompt)...")
    # Mock a box if YOLO didn't find anything (since it's a black frame)
    x1, y1, x2, y2 = 1000, 1000, 2800, 2000
    start_sam = time.time()
    sam_results = surveyor.sam_model(frame, bboxes=[[x1, y1, x2, y2]], verbose=False)
    sam_time = time.time() - start_sam
    print(f"  SAM Latency: {sam_time*1000:.2f}ms")

    # 5. Benchmark OCR Subprocess
    print("\n[STEP 4] OCR Subprocess Latency...")
    start_ocr = time.time()
    # We pass a cropped ROI to simulate real performance
    roi = frame[1400:1600, 1400:1700]
    ocr_data = surveyor._run_ocr_subprocess(roi)
    ocr_time = time.time() - start_ocr
    print(f"  OCR Latency: {ocr_time*1000:.2f}ms")

    mem_end = process.memory_info().rss / (1024 * 1024)
    total_latency = (yolo_time + sam_time + ocr_time) * 1000
    
    print("\n--- BENCHMARK SUMMARY ---")
    print(f"  Total Pipeline Latency: {total_latency:.2f}ms")
    print(f"  Memory Footprint Increase: {mem_end - mem_start:.2f} MB")
    print(f"  Target Latency (<200ms): {'PASS' if total_latency < 200 else 'FAIL (Optimization Required)'}")
    print("---------------------------------------------------------")

if __name__ == "__main__":
    benchmark_vision()
