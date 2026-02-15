import cv2
import numpy as np

class AtmosphericEnhancer:
    """
    Provides algorithms to enhance visibility in adverse weather conditions.
    - Night Vision: Uses CLAHE (Contrast Limited Adaptive Histogram Equalization).
    - Dehazing: Uses Dark Channel Prior simplification (Gamma/Contrast enhancement).
    """

    def __init__(self):
        # CLAHE configuration for Night Vision
        self.clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))

    def apply_night_vision(self, frame: np.ndarray) -> np.ndarray:
        """
        Enhances low-light images using CLAHE on the L-channel of LAB color space.
        Simulates a "Night Vision Goggle" green effect.
        """
        # 1. Convert to LAB color space
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)

        # 2. Apply CLAHE to L-channel (Lightness)
        l_enhanced = self.clahe.apply(l)

        # 3. Merge and convert back to BGR
        lab_enhanced = cv2.merge((l_enhanced, a, b))
        enhanced_bgr = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # 4. Apply "Night Vision Green" filter (Simulated NVG)
        # Boost Green channel, dampen Red/Blue
        b, g, r = cv2.split(enhanced_bgr)
        # enhanced_g = cv2.addWeighted(g, 1.2, np.zeros_like(g), 0, 20)
        # This is a bit too artistic, let's keep it realistic but bright.
        # Actually, for "Industrial" use, we just want clarity, not necessarily green.
        # But the User asked for "NVG Mode" which implies the aesthetic.
        
        # Simple Green tint
        zeros = np.zeros_like(b)
        nvg_frame = cv2.merge((zeros, l_enhanced, zeros)) # Use Luminance as Green channel
        
        # Blend: 70% NVG effect, 30% original color details (enhanced)
        final_frame = cv2.addWeighted(enhanced_bgr, 0.3, nvg_frame, 0.7, 0)
        
        return final_frame

    def apply_dehaze(self, frame: np.ndarray) -> np.ndarray:
        """
        Simple dehazing using Contrast Stretching and Gamma Correction.
        Full Dark Channel Prior is too slow for real-time without GPU.
        """
        # Gamma Correction to cut through "white" fog
        gamma = 1.5
        inv_gamma = 1.0 / gamma
        table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
        gamma_corrected = cv2.LUT(frame, table)

        # Increase Contrast
        # Alpha > 1.0 increases contrast
        contrast_enhanced = cv2.convertScaleAbs(gamma_corrected, alpha=1.2, beta=10)
        
        return contrast_enhanced
