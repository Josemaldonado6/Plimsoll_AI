import sys
import os
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

def test_cargo_weight_calculation():
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Simulation parameters
    # Mid-draft around 10.0m -> Disp should be ~42000 t
    # Lightship: 12000, Ballast: 5000, Consumables: 500 -> Total Ded: 17500
    # Expected Cargo: 42000 - 17500 = 24500
    
    result = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=10.0, mid_obs=10.0, # Even keel
        dist_fwd=0.0, dist_aft=0.0, dist_mid=0.0,
        lbp=200.0, observed_density=1.025, # Standard salt water
        lightship=12000.0, ballast=5000.0, consumables=500.0
    )
    
    disp = result["calculated_displacement"]
    cargo = result["net_cargo_weight"]
    deductions = result["deductions"]
    
    print(f"--- HYDROSTATIC TONNAGE TEST ---")
    print(f"Total Displacement: {disp} t")
    print(f"Lightship: {deductions['lightship']} t")
    print(f"Ballast: {deductions['ballast']} t")
    print(f"Consumables: {deductions['consumables']} t")
    print(f"Expected Net Cargo: ~24500 t")
    print(f"Calculated Net Cargo: {cargo} t")
    
    # Assertions
    assert abs(disp - 42000) < 1.0, f"Displacement calculation error: {disp}"
    assert abs(cargo - 24500) < 1.0, f"Cargo calculation error: {cargo}"
    print("TEST PASSED: Industrial precision achieved.")

if __name__ == "__main__":
    try:
        test_cargo_weight_calculation()
    except Exception as e:
        print(f"TEST FAILED: {e}")
        sys.exit(1)
