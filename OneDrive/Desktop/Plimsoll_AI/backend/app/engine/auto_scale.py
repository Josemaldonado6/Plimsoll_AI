import cv2
import numpy as np
import logging

logger = logging.getLogger("AutoScale")

class AutoScaleEngine:
    def __init__(self, standard_disc_diameter_mm: float = 300.0):
        self.standard_disc_mm = standard_disc_diameter_mm
        self.scale_history = []
        self.MAX_HISTORY = 10

    def detect_plimsoll_mark(self, frame) -> dict:
        """
        Detects the circular Plimsoll Disc to establish Scale.
        Standard Plimsoll Disc is 300mm (0.3m) in diameter.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # Apply blur to reduce noise
        gray = cv2.medianBlur(gray, 5)
        
        height, width = frame.shape[:2]
        # Hough Circle Transform
        # param1: higher threshold for Canny, param2: accumulator threshold
        circles = cv2.HoughCircles(
            gray, 
            cv2.HOUGH_GRADIENT, 
            dp=1, 
            minDist=height//10,
            param1=100, 
            param2=20, 
            minRadius=5, 
            maxRadius=height//2
        )

        best_res = {"detected": False, "m_per_px": None, "confidence": 0}

        if circles is not None:
            circles = np.uint16(np.around(circles))
            for circle in circles[0, :3]: # Check top 3 candidates
                x, y, r = circle
                
                # ROI for line verification (The line should cross the circle)
                roi_x1 = max(0, x - r - 10)
                roi_x2 = min(width, x + r + 10)
                roi_y1 = max(0, y - r - 10)
                roi_y2 = min(height, y + r + 10)
                
                roi = gray[roi_y1:roi_y2, roi_x1:roi_x2]
                if roi.size == 0: continue
                
                # 2. Line Verification (HoughLinesP)
                edges = cv2.Canny(roi, 50, 150)
                lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=30, minLineLength=r, maxLineGap=10)
                
                has_plimsoll_line = False
                if lines is not None:
                    for line in lines:
                        lx1, ly1, lx2, ly2 = line[0]
                        # Check if line is horizontal-ish
                        angle = np.abs(np.arctan2(ly2 - ly1, lx2 - lx1) * 180 / np.pi)
                        if angle < 15 or angle > 165:
                            has_plimsoll_line = True
                            break

                # 3. Calibration
                diameter_px = r * 2
                m_per_px = (self.standard_disc_mm / diameter_px) / 1000.0
                
                confidence = 0.95 if has_plimsoll_line else 0.60
                
                # Temporal Smoothing
                self.scale_history.append(m_per_px)
                if len(self.scale_history) > self.MAX_HISTORY:
                    self.scale_history.pop(0)
                
                smoothed_m_per_px = np.median(self.scale_history)

                logger.info(f"Plimsoll Mark Identified: r={r}px, Line={has_plimsoll_line} -> Smoothed Scale: {smoothed_m_per_px:.6f}")
                
                return {
                    "detected": True,
                    "center": (int(x), int(y)),
                    "radius": int(r),
                    "m_per_px": float(smoothed_m_per_px),
                    "confidence": confidence,
                    "verified_by_line": has_plimsoll_line
                }
            
        return best_res

auto_scale = AutoScaleEngine()
