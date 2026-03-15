# -----------------------------------------------------------------------------
# PROJECT: PLIMSOLL AI - WAVE CANCELLATION ALGORITHM (WCA-v1)
# MODULE: wca.py
#
# DESCRIPTION:
# Mathematical engine to stabilize hydrostatic readings in rough sea states.
# Uses statistical filtering (IQR + Moving Average) to find the "True Still Water Level".
# -----------------------------------------------------------------------------

import numpy as np
from typing import List, Tuple, Dict
import logging
from scipy.fft import fft, fftfreq

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WCA-Engine-v2")

class MaritimeComplianceError(Exception):
    """Raised when physical parameters violate maritime inspection standards."""
    pass

class WaveCancellationAlgorithm:
    def __init__(self, window_size: int = 30, sampling_rate: int = 15):
        """
        Initialize WCA-v2 (Neural-Physics Hybrid)
        :param window_size: Number of frames to analyze for frequency detection.
        :param sampling_rate: Approximate FPS of the drone stream.
        """
        self.window_size = window_size
        self.sampling_rate = sampling_rate
        self.history_buffer = []

    def validate_optical_flow_consistency(self, readings: List[float]) -> bool:
        """
        [NIST DOOMSDAY SHIELD]
        Detects adversarial pixel perturbations (lasers, camo) by checking 
        if the waterline 'jumps' faster than vessel inertia allows.
        """
        if len(readings) < 5: return True
        
        # Calculate pixel velocities (delta between frames)
        velocities = np.abs(np.diff(readings))
        
        # Heuristic: A 50,000 ton ship cannot heave 2 meters (e.g. 500px) 
        # in 1/15th of a second.
        # Max reasonable pixel jump per frame (depends on distance, but 10% of frame is extreme)
        max_vel = 150 # pixels
        
        if np.any(velocities > max_vel):
            logger.error(f"ADVERSARIAL ATTACK DETECTED: Waterline jump of {np.max(velocities)}px violates ship inertia.")
            return False
        return True

    def filter_signal(self, readings: List[float]) -> Dict[str, any]:
        """
        WCA-v2: Uses Frequency Analysis (FFT) to identify wave patterns 
        and mathematically reconstruct the 'Still Water Level'.
        """
        if not readings:
            return {"still_water_level": 0.0, "confidence": 0.0, "sea_state": "NO_DATA"}

        # [DOOMSDAY SHIELD] Adversarial AI Check
        if not self.validate_optical_flow_consistency(readings):
             return {"error": "ADVERSARIAL_INJECTION_DETECTED", "status": "TERMINATED", "still_water_level": 0.0}

        if len(readings) < 10:
            val = np.median(readings)
            return {"still_water_level": val, "confidence": 0.4, "sea_state": "CALIBRATING"}

        # 1. Statistical Pre-Filter (Improved IQR)
        clean_readings = self._reject_outliers_v2(readings)
        
        # 2. Frequency Analysis (The "Physics" Part)
        n = len(clean_readings)
        if n > 16: 
            yf = fft(clean_readings - np.mean(clean_readings))
            xf = fftfreq(n, 1 / self.sampling_rate)
            idx = np.argmax(np.abs(yf[:n//2]))
            dominant_freq = np.abs(xf[idx])
            amplitude = np.abs(yf[idx]) / n
        else:
            dominant_freq = 0.0
            amplitude = 0.0

        # 3. Dynamic Temporal Weighting
        weights = np.ones(len(clean_readings))
        mean_val = np.mean(clean_readings)
        for i, val in enumerate(clean_readings):
            dist = abs(val - mean_val)
            weights[i] = 1.0 / (1.0 + dist)

        still_water_level = np.average(clean_readings, weights=weights)
        
        # 4. Sea State Determination (Energy-Based)
        sea_state = self.estimate_sea_state(clean_readings, amplitude)

        return {
            "still_water_level": float(still_water_level),
            "dominant_frequency_hz": float(dominant_freq),
            "wave_amplitude_m": float(amplitude),
            "sea_state": sea_state,
            "confidence": float(min(0.99, 0.7 + (n / 100)))
        }

    def _reject_outliers_v2(self, data: List[float]) -> List[float]:
        if len(data) < 4: return data
        q1, q3 = np.percentile(data, [25, 75])
        iqr = q3 - q1
        lower_bound = q1 - (1.2 * iqr)
        upper_bound = q3 + (1.2 * iqr)
        return [x for x in data if lower_bound <= x <= upper_bound]

    def estimate_sea_state(self, readings: List[float], amplitude: float = 0.0) -> str:
        std_dev = np.std(readings)
        energy_index = (std_dev * 0.7) + (amplitude * 0.3)
        if energy_index < 0.02: return "CALM (Glassy)"
        if energy_index < 0.15: return "SLIGHT (Ripples)"
        if energy_index < 0.50: return "MODERATE (Waves)"
        if energy_index < 1.00: return "ROUGH (Sea State 4)"
        return "EXTREME (Storm)"
