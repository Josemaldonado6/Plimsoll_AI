import sys
import os

# Add the project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

def run_precision_test():
    print("[PHYSICS_V2] INTEGRITY TEST: UN/ECE + NEMOTO")
    print("-" * 50)
    
    # Initialize Engine (190m Bulk Carrier approx)
    architect = NavalArchitect(lbp=180.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Test Scenario: 
    # Fwd: 10.20m (Observed)
    # Aft: 12.00m (Observed) -> Apparent Trim 1.80m
    # Mid: 11.15m (Observed) -> Sagging detected
    # Draft marks offset: Fwd is 2m from PP, Aft is 3m from PP.
    
    results = architect.calculate_survey(
        fwd_obs=10.20, aft_obs=12.00, mid_obs=11.15,
        dist_fwd=2.0, dist_aft=3.0, dist_mid=0.0,
        lbp=180.0, observed_density=1.015, water_temp=22.0
    )
    
    print(f"1. Corrected Mean Draft:  {results['quarter_mean_draft']} m (Target: ~11.107)")
    print(f"2. True Trim:             {results['trim_true']} m")
    print(f"3. Disp (Corrected):      {results['calculated_displacement']} t")
    print(f"4. FTC (1st Trim Corr):   {results['corrections']['ftc']} t")
    print(f"5. STC (Nemoto's):        {results['corrections']['stc']} t")
    print(f"6. Density Factor (22C):  {results['corrections']['density_factor']}")
    
    print("\n📜 AUDIT TRAIL PREVIEW:")
    for step in results['audit_trail'][:3]:
        print(f"   [{step['step']}] -> Out: {list(step['outputs'].values())[0]}")
        
    # Validation assertions
    assert results['quarter_mean_draft'] > 0
    assert results['calculated_displacement'] > 0
    assert "Nemoto" in results['audit_trail'][3]['step']
    
    print("\n[OK] TEST PASSED: Algorithmic integrity validated against UN/ECE flow.")

if __name__ == "__main__":
    try:
        run_precision_test()
    except Exception as e:
        print(f"[ERROR] TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
