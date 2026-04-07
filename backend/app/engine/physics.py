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
    
    def __init__(self, tpc_table: dict = None, lbp: float = 200.0):
        """
        Initialize with vessel specific constants.
        :param tpc_table: Dict of {draft_m: tpc_value} (e.g., {5.0: 45.2, 10.0: 55.4})
        :param lbp: Length Between Perpendiculars (meters)
        """
        self.lbp = lbp
        self.water_density = 1.025 # Standard Seawater density
        
        # Default to a linear model if no table provided (Fallback)
        # Handy-size: 5m draft = 40 TPC, 15m draft = 60 TPC
        self.tpc_table = tpc_table if tpc_table else {
            0.0: 0.0,
            5.0: 40.0,
            10.0: 50.0,
            15.0: 58.0,
            20.0: 65.0
        }

        # Default LCF Table (Distance from Aft Perpendicular)
        # For a standard 200m bulk carrier, LCF is usually slightly aft of midships (100m) at light draft
        # and moves forward as draft increases.
        self.lcf_table = {
            5.0: self.lbp * 0.48, # 96m from AP
            10.0: self.lbp * 0.50, # 100m (Midships)
            15.0: self.lbp * 0.52  # 104m
        }

    def _interpolate_lcf(self, draft: float) -> float:
        """
        Interpolate Longitudinal Center of Flotation (LCF) from Aft Perpendicular.
        """
        # Simplified linear interpolation (Copy of TPC logic)
        # In production, this generic interpolator should be its own helper method
        drafts = sorted(self.lcf_table.keys())
        if draft <= drafts[0]: return self.lcf_table[drafts[0]]
        if draft >= drafts[-1]: return self.lcf_table[drafts[-1]]
        
        for i in range(len(drafts) - 1):
            d1, d2 = drafts[i], drafts[i+1]
            if d1 <= draft <= d2:
                lcf1, lcf2 = self.lcf_table[d1], self.lcf_table[d2]
                return lcf1 + (draft - d1) * (lcf2 - lcf1) / (d2 - d1)
        return self.lbp / 2

    def _interpolate_tpc(self, draft: float) -> float:
        """
        Finds the exact TPC for a given draft using Linear Interpolation.
        """
        drafts = sorted(self.tpc_table.keys())
        
        # Edge cases
        if draft <= drafts[0]: return self.tpc_table[drafts[0]]
        if draft >= drafts[-1]: return self.tpc_table[drafts[-1]]
        
        # Find interval
        for i in range(len(drafts) - 1):
            d1, d2 = drafts[i], drafts[i+1]
            if d1 <= draft <= d2:
                tpc1, tpc2 = self.tpc_table[d1], self.tpc_table[d2]
                # Linear Interp Formula: y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
                tpc = tpc1 + (draft - d1) * (tpc2 - tpc1) / (d2 - d1)
                return tpc
        
        return 50.0 

    def calculate_displacement_raw(self, mean_draft_m: float) -> float:
        """
        Calculate uncorrected displacement from Hydrostatic Table.
        """
        mid_draft = mean_draft_m / 2
        avg_tpc = self._interpolate_tpc(mid_draft)
        current_tpc = self._interpolate_tpc(mean_draft_m)
        effective_tpc = (avg_tpc + current_tpc) / 2
        displacement = mean_draft_m * 100 * effective_tpc
        return displacement

    def calculate_trim_corrections(self, displacement: float, draft_mean: float, trim_m: float) -> float:
        """
        Apply First and Second Trim Corrections (Nemoto's Formula).
        FTC = (Trim * LCF_diff * TPC * 100) / LBP
        STC = (Trim^2 * MCTC_diff * 50) / LBP ... (Simplified for MVP)
        """
        if abs(trim_m) < 0.01: return 0.0
        
        # 1. First Trim Correction (Layer correction based on LCF position)
        tpc = self._interpolate_tpc(draft_mean)
        lcf_from_ap = self._interpolate_lcf(draft_mean)
        lcf_from_midships = lcf_from_ap - (self.lbp / 2) # Positive if Fwd of Midships
        
        # Formula: Correction (MT) = (Trim(m) * LCF_from_mid(m) * TPC(t/cm) * 100) / LBP(m)
        # Note: Trim is +ve by Stern. If LCF is Fwd (+), and Trim is Stern (+), 
        # the ship is floating on a smaller waterplane (aft is wider usually? No, complex).
        # Standard Formula: Correction = (Trim * LCF_diff * TPC * 100) / LBP
        ftc = (trim_m * lcf_from_midships * tpc * 100) / self.lbp
        
        # 2. Second Trim Correction (Nemoto's - Accounts for hull curvature)
        # Requires MCTC (Moment to Change Trim) derivative relative to draft.
        # MVP Approximation: Assumes 1% adjustment for heavy trim (>1m)
        stc = 0.0
        if abs(trim_m) > 1.0:
            # Simplified Second Correction: 50 * trim^2 * (dMCTC/dz) / LBP
            # We don't have MCTC curve, so we estimate a small curvature factor
            stc = (trim_m ** 2) * 50 * 0.05 # Mock factor 0.05
            
        total_correction = ftc + stc
        return total_correction

    def calculate_list_correction(self, displacement: float, list_deg: float, draft: float) -> float:
        """
        Apply correction for list (Heel).
        Formula: Disp_corr = Disp + 6 * (Draft_corr - Draft) * TPC ?
        Actual: List increases draft reading but not displacement.
        We correct the DRAFT reading, not the displacement directly usually.
        But if we have Mean Draft, list correction is: Correction = 6 * (TPC diff?)
        
        MVP: Basic cosine correction for waterplane area?
        Area_effective = Area / cos(theta)
        """
        # Usually ignored for < 3 degrees.
        return 0.0

    def calculate_exact_hydrostatics(self, draft_fwd: float, draft_aft: float, draft_mid: float = None) -> dict:
        """
        Master calculation method. Returns full hydrostatic report.
        """
        # 1. Calculate Mean Draft
        if draft_mid:
            # Quarter Mean (Most Accurate)
            # QM = (Df + 6*Dm + Da) / 8
            mean_draft = (draft_fwd + 6*draft_mid + draft_aft) / 8
        else:
            mean_draft = (draft_fwd + draft_aft) / 2
            
        trim = draft_aft - draft_fwd
        
        # 2. Raw Displacement
        disp_raw = self.calculate_displacement_raw(mean_draft)
        
        # 3. Trim Correction
        trim_corr = self.calculate_trim_corrections(disp_raw, mean_draft, trim)
        
        # 4. Density Correction (DWA) - Applied later or here?
        # Let's return the standard seawater displacement
        disp_final = disp_raw + trim_corr
        
        return {
            "draft_mean": mean_draft,
            "trim": trim,
            "displacement_raw": disp_raw,
            "trim_correction": trim_corr,
            "displacement_final": disp_final,
            "lcf": self._interpolate_lcf(mean_draft),
            "tpc": self._interpolate_tpc(mean_draft)
        }

    def correct_for_density(self, measured_displacement: float, port_density: float = 1.025) -> float:
        """
        Apply Dock Water Allowance (DWA) correction.
        """
        # Displacement is proportional to density
        correction_factor = port_density / self.water_density
        return measured_displacement * correction_factor
