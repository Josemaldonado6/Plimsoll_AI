import pytest
from datetime import datetime, timedelta
from app.engine.predictive import LogisticPredictor

def test_velocity_calculation():
    predictor = LogisticPredictor()
    imo = "9406087"
    tpc = 50.0 # Tons per cm
    
    # Simulate points in the past (20 mins, 10 mins, now)
    base_time = datetime.now() - timedelta(minutes=20)
    predictor.history[imo] = [
        (base_time, 10.0),
        (base_time + timedelta(minutes=10), 10.1)
    ]
    
    # predict_completion will add the 3rd point at 'now' with 10.2
    res = predictor.predict_completion(imo, 10.2, tpc, target_draft=11.2)
    
    # Total dd = 0.2m, Total dt = 20 mins = 0.333h
    # v = 0.6 m/h -> 3000 t/h
    assert res["velocity_tph"] == 3000.0

def test_anomaly_detection_slowdown():
    predictor = LogisticPredictor()
    imo = "9406087"
    tpc = 50.0
    
    # 40 mins ago to 10 mins ago (high speed)
    base_time = datetime.now() - timedelta(minutes=40)
    predictor.history[imo] = [
        (base_time, 10.0),
        (base_time + timedelta(minutes=10), 10.1),
        (base_time + timedelta(minutes=20), 10.2),
        (base_time + timedelta(minutes=30), 10.3)
    ]
    
    # Now (10 mins later) only 0.01m change
    res = predictor.predict_completion(imo, 10.31, tpc, target_draft=11.0)
    assert res["anomaly"] == "CRANE_SLOWDOWN_DETECTED"

def test_etc_accuracy():
    predictor = LogisticPredictor()
    imo = "9406087"
    tpc = 100.0
    
    # 2 hours ago to 1 hour ago
    base_time = datetime.now() - timedelta(hours=2)
    predictor.history[imo] = [
        (base_time, 10.0),
        (base_time + timedelta(hours=1), 11.0)
    ]
    
    # Now (1 hour later) at 12.0
    res = predictor.predict_completion(imo, 12.0, tpc, target_draft=14.0)
    
    # v = 1m/h. 2m left = 2 hours.
    assert res["hours_remaining"] == 2.0
