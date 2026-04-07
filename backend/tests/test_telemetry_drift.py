import sys
import os
import math

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.engine.telemetry_parser import telemetry_parser

def run_telemetry_test():
    print("--- INITIATING TELEMETRY-DRIFT VERIFICATION ---")
    
    srt_path = "tests/mock_dji_mission.srt"
    
    # 1. Parsing Test
    print("\n[STEP 1] Parsing Mock SRT...")
    with open(srt_path, 'r') as f:
        content = f.read()
    
    frames = telemetry_parser.parse_srt(content)
    assert len(frames) == 2
    print(f"  SUCCESS: Parsed {len(frames)} frames.")
    
    # 2. Math Validation
    print("\n[STEP 2] Perspective Correction Math Validation...")
    metadata = telemetry_parser.get_average_pose(frames)
    
    # Pitch: -80 -> Tilt: 10deg. 
    # Factor = 1 / cos(10deg)
    expected_tilt = 10.0
    expected_factor = 1.0 / math.cos(math.radians(expected_tilt))
    
    print(f"  Avg Pitch: {metadata['avg_gimbal_pitch']}°")
    print(f"  Tilt Angle: {metadata['tilt_angle']}°")
    print(f"  Correction Factor: {metadata['correction_factor']} (Expected: {expected_factor:.4f})")
    
    assert abs(metadata['tilt_angle'] - expected_tilt) < 0.01
    assert abs(metadata['correction_factor'] - expected_factor) < 0.0001
    
    print("\n--- TELEMETRY-DRIFT VERIFIED: NO PERSPECTIVE BIAS DETECTED ---")

if __name__ == "__main__":
    run_telemetry_test()
