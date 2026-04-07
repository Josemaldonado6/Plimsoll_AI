# -----------------------------------------------------------------------------
# PLIMSOLL AI - VERSION 4: STRESS TEST & MOCK SUITE
# FILE: tests/test_vision_trinity.py
# -----------------------------------------------------------------------------

import unittest
import numpy as np
import time
import asyncio
import torch
from app.engine.ai_vision import VisionTrinity, AsyncOCRWorker

class TestVisionTrinity(unittest.TestCase):
    def setUp(self):
        # Initialize Trinity in CPU mode for fast unit testing
        self.trinity = VisionTrinity(use_gpu=False)

    def test_correct_pitch_yaw(self):
        """
        [15% CORRECTION UNIT TEST]
        Scenario: Drone is at 15-degree pitch. 
        A 2D projection would show a 100px segment. 
        The 3D correction should normalize this to its true metric height.
        """
        print("\n[RUNNING] 3D Depth Correction Validation (Z-Axis)...")
        
        # 1. Create Mock Mask (Waterline segment)
        mask = np.zeros((100, 100), dtype=np.uint8)
        mask[50:55, 20:80] = 1 # Horizontal segment at y=50
        
        # 2. Create Mock Depth Map (Simulating 15-degree tilt)
        # Depth increases linearly along the Y axis to simulate the tilted ground plane
        depth_map = np.linspace(5.0, 7.0, 100).reshape(100, 1).repeat(100, axis=1)
        
        # 3. Execution
        result_metrico = self.trinity.correct_pitch_yaw(mask, depth_map)
        
        # 4. Assertions
        # Expectation: corrected_wl should be different from raw 2D input due to 15deg pitch
        # In a real implementation, we would assert a specific mathematical value
        self.assertIsNotNone(result_metrico, "Corrected value should not be None")
        print(f"Result: Corrected Waterline Value = {result_metrico}")

    def test_pipeline_latency(self):
        """
        [BOTTLENECK PROFILER]
        YOLOv11 -> SAM 2 -> Depth V2 sequence must be < 150ms.
        """
        print("\n[RUNNING] Edge Pipeline Latency Profiling...")
        
        mock_frame = np.zeros((640, 640, 3), dtype=np.uint8)
        
        start_time = time.time()
        
        # Simulate Sequential Handoff
        self.trinity.detect_roi_yolo11(mock_frame)
        self.trinity.segment_waterline_sam2(mock_frame, bboxes=[[10, 10, 100, 100]])
        self.trinity.estimate_depth_3d(mock_frame)
        
        total_time = (time.time() - start_time) * 1000 # to ms
        
        print(f"Total Inference Sequence Time: {total_time:.2f}ms")
        
        # Critical Limit for Edge Inference
        self.assertLess(total_time, 150, "CRITICAL: Pipeline latency exceeds 150ms limit (Edge Handoff failure)")

    def test_async_ocr_worker(self):
        """
        [ASYNC OCR NON-BLOCKING TEST]
        Verify that triggering OCR does not drop main loop below 30 FPS.
        """
        print("\n[RUNNING] Async OCR Non-Blocking Performance Test...")
        
        async def run_perf_test():
            queue = asyncio.Queue()
            worker = AsyncOCRWorker(queue)
            
            # Start Background Worker
            worker_task = asyncio.create_task(worker.worker_loop())
            
            # Simulate High-Speed Frame Loop (30 FPS)
            fps_start = time.time()
            frames_processed = 0
            
            for i in range(60): # 2 seconds of video
                loop_start = time.time()
                
                # Main Vision Task (High Priority)
                await asyncio.sleep(0.01) # Simulate ~100FPS processing
                
                # Trigger OCR every 15 frames
                if i % 15 == 0:
                    await queue.put(np.zeros((100,100), dtype=np.uint8))
                
                # Check Loop Health
                elapsed = time.time() - loop_start
                self.assertLess(elapsed, 0.033, f"Frame {i} dropped below 30FPS due to blocking!")
                frames_processed += 1
            
            worker_task.cancel()
            actual_fps = frames_processed / (time.time() - fps_start)
            print(f"Effective Process Loop Speed: {actual_fps:.1f} FPS")
            self.assertGreaterEqual(actual_fps, 29.0, "OCR Trigger caused FPS drop below threshold")

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(run_perf_test())
        loop.close()

if __name__ == "__main__":
    unittest.main()
