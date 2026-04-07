import numpy as np
import pytest
import sys
import os

# Ensure the app package is discoverable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.engine.wca import WaveCancellationAlgorithm

def test_wca_accuracy_in_rough_sea():
    """
    Simulates a rough sea state with a 1-meter wave oscillation 
    and random detection jitter.
    Goal: WCA-v2 should filter this to within 5cm of the 'True' level.
    """
    wca = WaveCancellationAlgorithm(sampling_rate=15)
    
    # Parameters
    true_level = 10.5  # Meters
    wave_amplitude = 1.0  # +/ 1 meter oscillation
    wave_freq = 0.5  # 0.5 Hz (one wave every 2 seconds)
    fps = 15
    duration = 10  # Seconds
    
    t = np.linspace(0, duration, fps * duration)
    # Sinusoidal wave + High-frequency noise (jitter)
    noise = np.random.normal(0, 0.05, len(t))
    readings = true_level + (wave_amplitude * np.sin(2 * np.pi * wave_freq * t)) + noise
    
    # Process
    result = wca.filter_signal(readings.tolist())
    
    calculated_level = result["still_water_level"]
    error = abs(calculated_level - true_level)
    
    print(f"\n[WCA-v2 TEST RESULTS]")
    print(f"True Level: {true_level}m")
    print(f"Calculated Level: {calculated_level:.4f}m")
    print(f"Error: {error:.4f}m ({error*100:.2f}cm)")
    print(f"Detected Sea State: {result['sea_state']}")
    print(f"Detected Amplitude: {result['wave_amplitude_m']:.4f}m")
    
    # ASSERTIONS
    # 1. Error should be less than 5cm (Industrial Standard for High Precision)
    assert error < 0.05, f"WCA Error too high: {error*100:.2f}cm"
    
    # 2. Sea State should be correctly identified (1.0m amplitude is ROUGH/MODERATE)
    assert "ROUGH" in result["sea_state"] or "MODERATE" in result["sea_state"]
    
    # 3. Confidence should be high
    assert result["confidence"] > 0.8
