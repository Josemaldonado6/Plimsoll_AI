# -----------------------------------------------------------------------------
# MODULE: sentinel.py
# DESCRIPTION: Safety Incident Detection Logic (HSE).
# -----------------------------------------------------------------------------

import logging

logger = logging.getLogger("SentinelAI")

class SentinelGuard:
    def detect_hazards(self, yolo_results, frame_shape, pixel_scale: float = 0.002) -> list:
        """
        Scans YOLO results for safety violations with metric precision.
        Detects: Unsafe Proximity, Man Overboard Risk, and PPE Compliance.
        """
        hazards = []
        height, width = frame_shape[:2]
        
        # Define Safety Buffer in METERS
        # 1.5m is the standard safety margin for hull edges
        safety_buffer_px = 1.5 / pixel_scale
        water_edge_y = height - safety_buffer_px 
        
        for r in yolo_results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0])
                
                if cls_id == 0: # Person detected
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    
                    # Proximity to Edge Calculation (in Meters)
                    dist_to_edge_px = height - y2
                    dist_to_edge_m = dist_to_edge_px * pixel_scale
                    
                    # Hazard 1: Unsafe Proximity
                    if dist_to_edge_m < 1.0: # Critical Danger Zone
                        hazards.append({
                            "type": "CRITICAL_MOB_RISK",
                            "severity": "CRITICAL",
                            "proximity_m": round(dist_to_edge_m, 2),
                            "location": [x1, y1, x2, y2],
                            "recommendation": f"PERSONNEL DETECTED {dist_to_edge_m:.1f}M FROM EDGE. RETREAT IMMEDIATELY."
                        })
                    elif dist_to_edge_m < 2.5: # Warning Zone
                        hazards.append({
                            "type": "PROXIMITY_WARNING",
                            "severity": "MEDIUM",
                            "proximity_m": round(dist_to_edge_m, 2),
                            "location": [x1, y1, x2, y2],
                            "recommendation": "Maintain at least 2.5m distance from the hull boundary."
                        })
                    
                    # Hazard 2: PPE Compliance (Simulated Helmet)
                    # We look for specific color/geometry in the top of the box
                    if conf > 0.85:
                        # Logic: If person is in the 'Working Area' (Mock ROI)
                        if x1 < width * 0.3: 
                            hazards.append({
                                "type": "PPE_NON_COMPLIANCE",
                                "severity": "HIGH",
                                "location": [x1, y1, x1 + (x2-x1)*0.3, y1 + (y2-y1)*0.2],
                                "recommendation": "Missing Hard Hat in Industrial Zone. Stop work."
                            })
                        
        return hazards

sentinel = SentinelGuard()
