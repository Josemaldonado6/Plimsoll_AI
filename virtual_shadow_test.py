# -----------------------------------------------------------------------------
# PLIMSOLL AI - VERSION 4: VIRTUAL SHADOW TEST & X-RAY PROFILER
# -----------------------------------------------------------------------------
# Role: Visual Debugger & Latency Auditor
# -----------------------------------------------------------------------------

import cv2
import numpy as np
import time
import os
import torch
import csv
from backend.app.engine.ai_vision import VisionTrinity

def create_shadow_test_composite(video_path, output_path, log_path, num_frames=100):
    """
    Executes the Virtual Shadow Test on Plimsoll V4 core.
    Generates a 4-panel composite video for architectural audit.
    """
    print(f"🚀 Initializing Virtual Shadow Test on: {video_path}")
    
    # 1. Initialize Vision Trinity (V4)
    trinity = VisionTrinity(use_gpu=True)
    
    # 2. Setup Video Capture
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ Error: Could not open video file.")
        return

    # Metadata
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    
    # Output Setup (4-panel grid = 2x size)
    # Target size for each panel to avoid huge output
    panel_w, panel_h = 640, 480
    out_w, out_h = panel_w * 2, panel_h * 2
    
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(output_path, fourcc, fps, (out_w, out_h))
    
    # 3. Latency Logger Setup
    latency_logs = []
    
    frames_processed = 0
    
    print(f"🎬 Processing {num_frames} frames...")

    while frames_processed < num_frames:
        ret, frame = cap.read()
        if not ret: break
        
        # Resize to panel size for processing consistency
        proc_frame = cv2.resize(frame, (panel_w, panel_h))
        
        # --- VISION TRINITY PIPELINE ---
        t_start = time.time()
        
        # A. YOLO ROI
        t0 = time.time()
        boxes = trinity.detect_roi_yolo11(proc_frame)
        yolo_ms = (time.time() - t0) * 1000
        
        # B. SAM 2 Segmentation
        t1 = time.time()
        mask = trinity.segment_waterline_sam2(proc_frame, boxes)
        sam_ms = (time.time() - t1) * 1000
        
        # C. Depth Anything V2
        t2 = time.time()
        depth_map = trinity.estimate_depth_3d(proc_frame)
        depth_ms = (time.time() - t2) * 1000
        
        # D. 3D Correction & WCA
        t3 = time.time()
        corrected_pos = trinity.correct_pitch_yaw(mask, depth_map)
        final_wl = trinity.wca.process(corrected_pos)
        wca_ms = (time.time() - t3) * 1000
        
        total_ms = (time.time() - t_start) * 1000
        
        # --- GENERATE COMPOSITE PANELS ---
        
        # Panel 1: Top-Left (Raw + YOLO)
        p1 = proc_frame.copy()
        for box in boxes:
            x1, y1, x2, y2 = map(int, box)
            cv2.rectangle(p1, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(p1, "PANEL 1: YOLOv11 ROI", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

        # Panel 2: Top-Right (SAM 2 Mask Overlay)
        p2 = proc_frame.copy()
        mask_colored = np.zeros_like(p2)
        mask_colored[mask > 0] = [0, 0, 255] # Red mask
        p2 = cv2.addWeighted(p2, 1.0, mask_colored, 0.5, 0)
        cv2.putText(p2, "PANEL 2: SAM 2 SEGMENTATION", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)

        # Panel 3: Bottom-Left (Depth Anything V2 Heatmap)
        # Normalize depth for visualization
        depth_norm = cv2.normalize(depth_map, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8)
        p3 = cv2.applyColorMap(depth_norm, cv2.COLOR_MAP_MAGMA)
        cv2.putText(p3, "PANEL 3: DEPTH ANYTHING V2", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Panel 4: Bottom-Right (Final WCA + Metadata)
        p4 = proc_frame.copy()
        # Draw final waterline
        cv2.line(p4, (0, int(final_wl)), (panel_w, int(final_wl)), (255, 0, 0), 3)
        
        # Overlay latency stats
        cv2.putText(p4, "PANEL 4: WCA-v2 + DEPTH-CORRECTED", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
        cv2.putText(p4, f"YOLO: {yolo_ms:.1f}ms", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(p4, f"SAM2: {sam_ms:.1f}ms", (10, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(p4, f"DEPTH: {depth_ms:.1f}ms", (10, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        cv2.putText(p4, f"TOTAL: {total_ms:.1f}ms", (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
        cv2.putText(p4, f"DRAFT (Z-CORR): {final_wl:.2f}px", (10, 150), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # Combine into Grid
        top_row = np.hstack((p1, p2))
        bottom_row = np.hstack((p3, p4))
        composite = np.vstack((top_row, bottom_row))
        
        out.write(composite)
        
        # Log Latency
        latency_logs.append([frames_processed, yolo_ms, sam_ms, depth_ms, wca_ms, total_ms])
        
        frames_processed += 1
        if frames_processed % 10 == 0:
            print(f"   Progress: {frames_processed}/{num_frames} frames...")

    cap.release()
    out.release()
    
    # 4. Save CSV Logs
    with open(log_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(["Frame", "YOLO_ms", "SAM2_ms", "Depth_ms", "WCA_ms", "Total_ms"])
        writer.writerows(latency_logs)
    
    print(f"✅ Shadow Test Complete!")
    print(f"📂 Video saved to: {output_path}")
    print(f"📊 Logs saved to: {log_path}")

if __name__ == "__main__":
    # Configure for Colab/Drive or Local
    # Change video_path to your desired test clip
    TEST_VIDEO = "datasets/coatzacoalcos_v2/dc649322-6225-42c5-8fcc-38092ef7196a.mp4"
    OUTPUT_VIDEO = "backend/data/shadow_test_v4_xray.mp4"
    LOG_FILE = "backend/data/latency_audit_v4.csv"
    
    # Create directory if missing
    os.makedirs("backend/data", exist_ok=True)
    
    create_shadow_test_composite(TEST_VIDEO, OUTPUT_VIDEO, LOG_FILE)
