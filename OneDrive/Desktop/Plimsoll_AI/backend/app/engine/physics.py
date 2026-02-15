"""
PLIMSOLL AI - HYDROSTATIC PHYSICS ENGINE
----------------------------------------
Security: LEGAL_IP_PROTECTED
Version: 1.0.0 (The Physics Engine)
"""
import math

class HydrostaticEngine:
    """
    Advanced Naval Architecture processor for Draft Surveys.
    Converts raw linear measurements into volumetric and mass calculations.
    """
    
    def __init__(self, tpc: float = 50.0, lbp: float = 200.0):
        """
        Initialize with vessel specific constants.
        :param tpc: Tonnes Per Centimeter immersion (default: generic handy-size)
        :param lbp: Length Between Perpendiculars (meters)
        """
        self.tpc = tpc
        self.lbp = lbp
        self.water_density = 1.025 # Standard Seawater density

    def calculate_displacement(self, mean_draft_m: float) -> float:
        """
        Calculate total displacement in Metric Tonnes.
        Formula: Displacement = (Draft * TPC * 100) + Lightship (simplified)
        In a real scenario, this would interpolate from a hydrostatic table.
        For MVP, we use a linearized TPC model.
        """
        # Linear approximation: Displacement ~ Draft * TPC * 100
        # (Since TPC is tonnes per cm, and draft is meters)
        displacement = mean_draft_m * 100 * self.tpc
        return displacement

    def calculate_trim(self, draft_fwd_m: float, draft_aft_m: float) -> float:
        """
        Calculate Trim in meters.
        Positive Trim = By the Stern (Normal)
        Negative Trim = By the Head (Bad)
        """
        return draft_aft_m - draft_fwd_m

    def calculate_list(self, port_draft_m: float, stbd_draft_m: float, beam_m: float) -> float:
        """
        Calculate List (Heel) in degrees.
        """
        draft_diff = abs(port_draft_m - stbd_draft_m)
        if beam_m <= 0: return 0.0
        # tan(theta) = diff / beam
        angle_rad = math.atan(draft_diff / beam_m)
        angle_deg = math.degrees(angle_rad)
        
        # Direction
        val = angle_deg if stbd_draft_m > port_draft_m else -angle_deg
        return val

    def correct_for_density(self, measured_displacement: float, port_density: float = 1.025) -> float:
        """
        Apply Dock Water Allowance (DWA) correction.
        """
        # Displacement is proportional to density
        correction_factor = port_density / self.water_density
        return measured_displacement * correction_factor
