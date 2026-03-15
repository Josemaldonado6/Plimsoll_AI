import pytest
import numpy as np
from app.engine.auto_scale import AutoScaleEngine
from app.engine.sentinel import SentinelGuard

def test_auto_scale_calculation():
    engine = AutoScaleEngine(standard_disc_diameter_mm=300.0)
    
    # Mock a frame with a circle (r=50px -> d=100px)
    import cv2
    frame = np.zeros((500, 500, 3), dtype=np.uint8)
    # Circle
    cv2.circle(frame, (250, 250), 50, (255, 255, 255), 2)
    # Horizontal Line crossing the circle center
    cv2.line(frame, (180, 250), (320, 250), (255, 255, 255), 2)
    
    res = engine.detect_plimsoll_mark(frame)
    assert res["detected"] is True
    assert res["verified_by_line"] is True
    # Allow small tolerance for CV heuristics
    assert res["m_per_px"] == pytest.approx(0.003, abs=0.0005)

def test_sentinel_proximity_hazard():
    guard = SentinelGuard()
    # Mock YOLO result for a person near the bottom edge (500h frame)
    # y2 = 495px (5px from bottom) -> dist_to_edge = 5px
    # With pixel_scale = 0.005, dist = 0.025m (CRITICAL)
    class MockBox:
        def __init__(self):
            self.cls = [0] # Person
            self.conf = [0.9]
            self.xyxy = [np.array([100, 400, 150, 495])]
    
    class MockResult:
        def __init__(self):
            self.boxes = [MockBox()]
            
    hazards = guard.detect_hazards([MockResult()], (500, 500), pixel_scale=0.005)
    
    # Should detect CRITICAL_MOB_RISK
    mob_hazards = [h for h in hazards if h["type"] == "CRITICAL_MOB_RISK"]
    assert len(mob_hazards) > 0
    assert mob_hazards[0]["severity"] == "CRITICAL"
    assert "RETREAT" in mob_hazards[0]["recommendation"]

def test_sentinel_ppe_violation():
    guard = SentinelGuard()
    # Mock person in 'Working Area' (x < 30% of width)
    class MockBox:
        def __init__(self):
            self.cls = [0]
            self.conf = [0.95]
            self.xyxy = [np.array([50, 100, 100, 300])] # x1=50 in 500w frame
    
    class MockResult:
        def __init__(self):
            self.boxes = [MockBox()]
            
    hazards = guard.detect_hazards([MockResult()], (500, 500), pixel_scale=0.002)
    
    ppe_hazards = [h for h in hazards if h["type"] == "PPE_NON_COMPLIANCE"]
    assert len(ppe_hazards) > 0
    assert "Hard Hat" in ppe_hazards[0]["recommendation"]
