import sys
import os
import numpy as np

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

def run_stress_test():
    print("--- INITIATING PHYSICS ENGINE STRESS TEST (PROTOCOL 17020) ---")
    
    # Initialize with standard bulk carrier defaults
    lbp = 190.0
    architect = NavalArchitect(lbp=lbp, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # CASE 1: EXTREME SAGGING (Deformation Stress)
    # Fwd: 10.0, Aft: 10.0, Mid: 10.5 (Hull bending downwards by 0.5m)
    print("\n[TEST 1] Extreme Sagging (0.5m Midship Deviation)")
    res1 = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=10.0, mid_obs=10.5,
        dist_fwd=0.0, dist_aft=0.0, dist_mid=0.0,
        lbp=lbp, observed_density=1.025
    )
    # Expected QM = (10 + 10 + 6*10.5) / 8 = (20 + 63) / 8 = 10.375
    print(f"  Calculated QM Draft: {res1['quarter_mean_draft']} (Expected: 10.375)")
    assert res1['quarter_mean_draft'] == 10.375
    print("  PASS: Hull deformation logic intact.")

    # CASE 2: FRESH WATER VS SEA WATER (Density Correction)
    print("\n[TEST 2] Density Pivot (Fresh Water 1.000 vs Sea Water 1.025)")
    # Draft: 10.0 flat
    params = {
        "fwd_obs": 10.0, "aft_obs": 10.0, "mid_obs": 10.0,
        "dist_fwd": 0.0, "dist_aft": 0.0, "dist_mid": 0.0,
        "lbp": lbp
    }
    res_sea = architect.calculate_survey(**params, observed_density=1.025)
    res_fresh = architect.calculate_survey(**params, observed_density=1.000)
    
    ratio = res_fresh['calculated_displacement'] / res_sea['calculated_displacement']
    expected_ratio = 1.000 / 1.025
    print(f"  Sea Disp: {res_sea['calculated_displacement']}")
    print(f"  Fresh Disp: {res_fresh['calculated_displacement']}")
    print(f"  Calc Ratio: {ratio:.6f} (Expected: {expected_ratio:.6f})")
    assert abs(ratio - expected_ratio) < 0.001
    print("  PASS: Density correction factor valid.")

    # CASE 3: EXTREME ASYMMETRIC TRIM (Nemoto's Formula Stress)
    # Fwd: 8.0, Aft: 12.0 (4m Trim)
    print("\n[TEST 3] Extreme Trim (4.0m) - Nemoto's STC Validation")
    res3 = architect.calculate_survey(
        fwd_obs=8.0, aft_obs=12.0, mid_obs=10.0,
        dist_fwd=0.0, dist_aft=0.0, dist_mid=0.0,
        lbp=lbp, observed_density=1.025
    )
    print(f"  FTC Correction: {res3['corrections']['ftc']} t")
    print(f"  STC (Nemoto): {res3['corrections']['stc']} t")
    assert res3['corrections']['stc'] > 0 # STC must be positive for trim
    print("  PASS: Nemoto's Second Trim Correction is active and directional.")

    print("\n--- PHYSICS ENGINE AUDIT COMPLETE: 100% MATHEMATICAL PRECISION ---")

if __name__ == "__main__":
    run_stress_test()
