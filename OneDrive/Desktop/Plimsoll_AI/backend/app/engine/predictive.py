# -----------------------------------------------------------------------------
# MODULE: predictive.py
# DESCRIPTION: AI Logic for estimating cargo loads and operation times.
# -----------------------------------------------------------------------------

import logging
from datetime import datetime, timedelta

logger = logging.getLogger("PredictiveLogistics")

class LogisticPredictor:
    def __init__(self):
        self.history = {} # In-memory history of draft points: {imo: [(timestamp, draft), ...]}

    def estimate_cargo(self, ship_type: str, route_origin: str) -> str:
        """
        Uses heuristic logic to guess the cargo based on ship type + route.
        """
        ship_type = ship_type.lower()
        route_origin = route_origin.lower()
        
        if "bulk" in ship_type:
            if "brazil" in route_origin or "australia" in route_origin:
                return "Iron Ore (Fines)"
            if "indonesia" in route_origin or "colombia" in route_origin:
                return "Thermal Coal"
            if "ukraine" in route_origin or "usa" in route_origin:
                return "Grain / Soybeans"
            return "General Bulk"
            
        if "tanker" in ship_type:
            return "Crude Oil / Petroleum Products"
            
        if "container" in ship_type:
            return "TEU Containers"
            
        return "Unknown Cargo"

    def predict_completion(self, imo: str, current_draft: float, tpc: float, target_draft: float = 0) -> dict:
        """
        Advanced completion prediction using velocity tracking.
        """
        now = datetime.now()
        
        # Initialize history for this ship
        if imo not in self.history:
            self.history[imo] = []
            
        # Record current state
        self.history[imo].append((now, current_draft))
        
        # Keep only last 10 points for velocity calculation (short-term trend)
        if len(self.history[imo]) > 10:
            self.history[imo].pop(0)

        # Default values
        velocity_tph = 1200.0 # Default fallback tons/hour
        anomaly = None
        
        # Calculate velocity if we have enough points
        if len(self.history[imo]) >= 3:
            pts = self.history[imo]
            dt = (pts[-1][0] - pts[0][0]).total_seconds() / 3600 # Total hours between first and last point
            dd = pts[-1][1] - pts[0][1] # Total draft change in meters
            
            if dt > 0.01: # Avoid div zero
                velocity_mps = dd / dt # Meters per hour
                velocity_tph = abs(velocity_mps * 100 * tpc) # Tons per hour

            # Anomaly Detection: Crane Slowdown
            # If current velocity is < 40% of the initial trend in this session
            if len(pts) >= 5:
                # Compare last 2 points vs previous 3
                recent_dt = (pts[-1][0] - pts[-2][0]).total_seconds() / 3600
                recent_dd = pts[-1][1] - pts[-2][1]
                if recent_dt > 0.01:
                    recent_v = abs((recent_dd / recent_dt) * 100 * tpc)
                    if recent_v < (velocity_tph * 0.4):
                        anomaly = "CRANE_SLOWDOWN_DETECTED"

        # Calculate remaining
        is_loading = target_draft > current_draft if target_draft != 0 else True # Default to loading
        draft_to_go = abs(target_draft - current_draft) if target_draft != 0 else 2.0 # Mock 2m left if unknown
        remaining_tons = draft_to_go * 100 * tpc
        
        hours_left = remaining_tons / velocity_tph if velocity_tph > 100 else 99
        completion_time = now + timedelta(hours=hours_left)

        percentage = min(100, max(0, (1 - (draft_to_go / 12.0)) * 100)) # Mock scale assuming 12m max draft

        return {
            "operation": "Loading" if is_loading else "Discharging",
            "velocity_tph": round(velocity_tph, 1),
            "hours_remaining": round(hours_left, 1),
            "eta": completion_time.strftime("%Y-%m-%d %H:%M"),
            "percentage": round(percentage, 1),
            "anomaly": anomaly,
            "confidence": "HIGH" if len(self.history[imo]) > 5 else "ESTIMATING"
        }

predictor = LogisticPredictor()
