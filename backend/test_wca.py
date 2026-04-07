import numpy as np
from app.engine.wca import WaveCancellationAlgorithm
import logging

# Setup Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("WCA-TEST")

def test_wca():
    logger.info("--- STARTING WCA VERIFICATION ---")
    wca = WaveCancellationAlgorithm()
    
    # 1. Simulate Clean Signal (Still Water)
    true_level = 420.0
    clean_signal = [true_level] * 30
    res = wca.filter_signal(clean_signal)
    logger.info(f"Test 1 (Clean): Expected ~420.0, Got {res:.2f}")
    assert abs(res - true_level) < 0.1
    
    # 2. Simulate Periodic Wave (Sine Wave)
    # Amplitude 20px, Frequency 0.2Hz
    t = np.linspace(0, 10, 50)
    wave_signal = true_level + 20 * np.sin(2 * np.pi * 0.2 * t)
    res = wca.filter_signal(list(wave_signal))
    logger.info(f"Test 2 (Waves): Expected ~420.0, Got {res:.2f}")
    # Mean of sine wave is 0, so should return to center
    assert abs(res - true_level) < 5.0 # Allow small error due to sampling
    
    # 3. Simulate Outliers (Splash / Glitch)
    noisy_signal = list(wave_signal)
    noisy_signal[10] = 600.0 # Huge splash up
    noisy_signal[25] = 200.0 # Huge drop
    res = wca.filter_signal(noisy_signal)
    logger.info(f"Test 3 (Outliers): Expected ~420.0, Got {res:.2f}")
    assert abs(res - true_level) < 5.0
    
    logger.info("--- WCA VERIFICATION PASSED ✅ ---")

if __name__ == "__main__":
    test_wca()
