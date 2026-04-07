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
        # 3. Merge and convert back to BGR
        lab_enhanced = cv2.merge((l_enhanced, a, b))
        enhanced_bgr = cv2.cvtColor(lab_enhanced, cv2.COLOR_LAB2BGR)

        # 4. Apply "Night Vision Green" filter (Tactical Overlay)
        # We isolate the green channel to simulate phosphor screen NVGs
        # But we keep some original detail to ensure text is readable.
        
        # Create a Green-Monochrome version based on Luminance
        zeros = np.zeros_like(l_enhanced)
        nvg_green = cv2.merge((zeros, l_enhanced, zeros))
        
        # Blend: 80% Green Phosphor, 20% Original Color (for draft mark red/white contrast)
        final_frame = cv2.addWeighted(enhanced_bgr, 0.2, nvg_green, 0.8, 0)
        
        # 5. Add simulated "Grain/Noise" for realism (optional, but requested for "Wow" factor)
        noise = np.random.normal(0, 5, final_frame.shape).astype(np.uint8)
        final_frame = cv2.add(final_frame, noise)
        
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
