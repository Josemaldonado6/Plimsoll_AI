import cv2
import numpy as np
import requests
import os
import time

# Configuration
API_URL = "http://localhost:8000/analyze"
VIDEO_FILENAME = "synthetic_test.mp4"

def generate_synthetic_video():
    """Generates a 3-second video with a moving sine wave to test WCA."""
    print(f"Generating {VIDEO_FILENAME} using MoviePy...")
    from moviepy.editor import ColorClip, CompositeVideoClip
    import numpy as np

    duration = 3
    w, h = 640, 480
    
    # Background - DARKER for Night Vision Test (Brightness ~40)
    bg = ColorClip(size=(w, h), color=(40, 40, 40), duration=duration)
    
    def make_frame(t):
        # Create a frame with a blue rectangle moving up and down
        frame = np.full((h, w, 3), 40, dtype=np.uint8)
        
        center_y = h // 2
        offset = int(20 * np.sin(2 * np.pi * 0.5 * t))
        y = center_y + offset
        
        # Draw blue water
        frame[y:, :, 0] = 255 # Blue channel
        frame[y:, :, 1] = 0
        frame[y:, :, 2] = 0
        
        # Draw SIMULATED DRAFT MARKS (White Rectangles)
        # Position them above the waterline
        # Mark 1
        cv2.rectangle(frame, (w//2, y-50), (w//2+20, y-30), (255, 255, 255), -1) 
        # Mark 2
        cv2.rectangle(frame, (w//2, y-100), (w//2+20, y-80), (255, 255, 255), -1)
        
        return frame

    from moviepy.editor import VideoClip
    clip = VideoClip(make_frame, duration=duration)
    clip.write_videofile(VIDEO_FILENAME, fps=30, codec='libx264')
    print("Video generated successfully.")

def test_api():
    if not os.path.exists(VIDEO_FILENAME):
        generate_synthetic_video()
        
    print(f"Uploading {VIDEO_FILENAME} to {API_URL}...")
    
    try:
        with open(VIDEO_FILENAME, 'rb') as f:
            files = {'video': (VIDEO_FILENAME, f, 'video/mp4')}
            response = requests.post(API_URL, files=files)
            
        if response.status_code == 200:
            data = response.json()
            # Print Raw JSON for debugging
            import json
            print("\n--- JSON DUMP ---")
            print(json.dumps(data, indent=2))
            
            sea_state = data.get("sea_state", "")
            engine = data.get("ai_metadata", {}).get("engine", "")
            
            # Assertions
            if "WCA" in engine:
                print("\n[PASS] SUCCESS: WCA Engine Active")
            else:
                print(f"\n[FAIL] FAILURE: WCA Engine NOT detected (Engine: {engine})")
                
            # Check for generic Sea State (CALM, SLIGHT, etc) or NVG
            if "CALM" in sea_state or "SLIGHT" in sea_state or "MODERATE" in sea_state:
                 print(f"[PASS] SUCCESS: WCA Sea State Detected: {sea_state}")
            else:
                 print(f"[FAIL] FAILURE: Invalid Sea State: {sea_state}")

            if "NVG Mode" in sea_state:
                print("[PASS] SUCCESS: Night Vision Triggered")
            else:
                print("[FAIL] FAILURE: Night Vision NOT Triggered (Is video dark enough?)")


        else:
            print(f"\n❌ API Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"\n❌ Connection Error: {e}")

if __name__ == "__main__":
    test_api()
