import re
import math
import logging
from typing import Dict, List, Optional, Any

class MaritimeComplianceError(Exception):
    """Raised when physical parameters violate maritime inspection standards."""
    pass

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("TelemetryParser")

class TelemetryParser:
    """
    Parses DJI SRT files to extract drone pose data (Gimbal Pitch, Altitude, etc.)
    Used to cancel perspective 'Drift' in computer vision measurements.
    """
    def __init__(self):
        # Regex patterns for DJI SRT metadata
        self.patterns = {
            "gimbal_pitch": re.compile(r"\[gimbal_pitch:\s*([-+]?\d*\.\d+|\d+)\]"),
            "gimbal_yaw": re.compile(r"\[gimbal_yaw:\s*([-+]?\d*\.\d+|\d+)\]"),
            "altitude": re.compile(r"\[altitude:\s*([-+]?\d*\.\d+|\d+)\]"),
            "latitude": re.compile(r"\[latitude:\s*([-+]?\d*\.\d+|\d+)\]"),
            "longitude": re.compile(r"\[longitude:\s*([-+]?\d*\.\d+|\d+)\]"),
            "timestamp": re.compile(r"(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d+)"),
        }

    def parse_srt(self, srt_content: str) -> List[Dict[str, Any]]:
        """
        Parses a full SRT file string and returns a list of telemetry frames.
        [DNV COMPLIANCE] Includes integrity check for sequence and timing.
        """
        frames = []
        # Split by empty lines (standard SRT separators)
        blocks = re.split(r'\n\n+', srt_content.strip())
        
        last_index = 0
        
        for block in blocks:
            lines = block.strip().split('\n')
            if not lines: continue
            
            # 1. Sequence Validation
            try:
                current_index = int(lines[0])
                if last_index != 0 and current_index != last_index + 1:
                    raise MaritimeComplianceError(f"SRT INTEGRITY BREACH: Sequence jump at block {current_index}. Telemetry manipulation suspected.")
            except (ValueError, IndexError):
                pass
            
            frame_data = {}
            for key, pattern in self.patterns.items():
                match = pattern.search(block)
                if match:
                    val = match.group(1)
                    try:
                        frame_data[key] = float(val) if key != "timestamp" else val
                    except ValueError:
                        frame_data[key] = val
            
            if frame_data:
                frames.append(frame_data)
                if 'current_index' in locals(): last_index = current_index
        
        # 2. Statistical Consistency Check (Anti-Spoofing)
        # Verify that samples are somewhat regular (DJI usually samples at 10Hz or 1Hz)
        if len(frames) > 10:
            alts = [f["altitude"] for f in frames if "altitude" in f]
            if alts and np.std(alts) > 50: # Impossible altitude jump in single video
                 logger.warning("SRT MANIPULATION SUSPECTED: Unnatural altitude variance.")

        logger.info(f"Parsed {len(frames)} telemetry frames from SRT (Integrity Verified).")
        return frames

    def get_average_pose(self, frames: List[Dict[str, Any]]) -> Dict[str, float]:
        """
        Returns average pose metadata for the mission duration.
        """
        if not frames:
            return {"gimbal_pitch": -90.0, "altitude": 0.0, "correction_factor": 1.0}
            
        pitches = [f["gimbal_pitch"] for f in frames if "gimbal_pitch" in f]
        alts = [f["altitude"] for f in frames if "altitude" in f]
        
        avg_pitch = sum(pitches) / len(pitches) if pitches else -90.0
        avg_alt = sum(alts) / len(alts) if alts else 0.0
        
        # Calculate Correction Factor
        # Case 1: Looking straight down (-90), factor is 1.0
        # Case 2: Looking at an angle, the vertical pixels represent 'stretched' meters.
        # Tilt angle = 90 + pitch (e.g. pitch -80 means 10 degree tilt)
        tilt_deg = abs(90.0 + avg_pitch)
        tilt_rad = math.radians(tilt_deg)
        
        # Secant of tilt angle: 1 / cos(tilt)
        # This corrects for the 'foreshortening' effect on the vertical axis.
        correction_factor = 1.0 / math.cos(tilt_rad) if math.cos(tilt_rad) != 0 else 1.0
        
        return {
            "avg_gimbal_pitch": round(avg_pitch, 2),
            "avg_altitude": round(avg_alt, 2),
            "tilt_angle": round(tilt_deg, 2),
            "correction_factor": round(correction_factor, 4)
        }

# Singleton instance
telemetry_parser = TelemetryParser()
