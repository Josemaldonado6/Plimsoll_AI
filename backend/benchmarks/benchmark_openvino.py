import cv2
import numpy as np
import time
import sys
import os
import psutil

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.engine.visual_cortex import VisualCortex

def benchmark_openvino():
    print("--- INITIATING OPENVINO LATENCY BENCHMARK (PROTOCOL 17020) ---")
    
    # Create a mock 4K frame
    frame = np.zeros((2160, 3840, 3), dtype=np.uint8)
    cv2.rectangle(frame, (1000, 1000), (2800, 2000), (40, 40, 40), -1)

    # 1. Benchmark PyTorch (Fallback)
    print("\n[TEST 1] Standard PyTorch (CPU)...")
    cortex_pt = VisualCortex(model_path="yolov8n.pt", use_npu=False)
    # Warmup
    cortex_pt.detect_waterline(frame)
    
    start_pt = time.time()
    for _ in range(5):
        cortex_pt.detect_waterline(frame)
    avg_pt = (time.time() - start_pt) / 5
    print(f"  PyTorch Avg Latency: {avg_pt*1000:.2f}ms")

    # 2. Benchmark OpenVINO
    print("\n[TEST 2] OpenVINO Optimized (CPU)...")
    # This should automatically pick up the 'yolov8n_openvino_model' directory
    cortex_ov = VisualCortex()
    
    # Warmup
    cortex_ov.detect_waterline(frame)
    
    start_ov = time.time()
    for _ in range(5):
        cortex_ov.detect_waterline(frame)
    avg_ov = (time.time() - start_ov) / 5
    print(f"  OpenVINO Avg Latency: {avg_ov*1000:.2f}ms")

    improvement = (avg_pt - avg_ov) / avg_pt * 100
    print(f"\n[RESULT] Performance Improvement: {improvement:.2f}%")
    print(f"  Target Latency (<200ms): {'PASS' if avg_ov*1000 < 200 else 'FAIL (Further Optimization Required)'}")

if __name__ == "__main__":
    benchmark_openvino()
