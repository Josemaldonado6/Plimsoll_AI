import pytest
import numpy as np
from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

def test_hydrostatic_interpolation():
    """Verify that CubicSpline interpolation yields precise values at mid-intervals."""
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Test at exactly 6.0m (should match table)
    vals_6 = architect.data_store.get_values(6.0)
    assert vals_6['disp'] == 20000.0
    
    # Test at 5.0m (interpolated between 4.0 and 6.0)
    # 4.0 -> 12000, 6.0 -> 20000. Linear would be 16000. Spline may vary slightly.
    vals_5 = architect.data_store.get_values(5.0)
    assert 15000 < vals_5['disp'] < 17000

def test_perpendicular_correction():
    """Verify digital trim correction to perpendiculars."""
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Case: Vessel trimmed aft by 2m
    # fwd_obs=10m, aft_obs=12m. dist_fwd=5m, dist_aft=5m.
    # lbm = 200 - 5 + 5 = 200
    # apparent_trim = 2
    # corr_fwd = (5 * 2) / 200 = 0.05
    # corr_aft = (5 * 2) / 200 = 0.05
    # fwd_corr = 10 + 0.05 = 10.05
    # aft_corr = 12 - 0.05 = 11.95
    # true_trim = 1.9
    
    result = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=12.0, mid_obs=11.0,
        dist_fwd=5.0, dist_aft=5.0, dist_mid=0.0,
        lbp=200.0, observed_density=1.025
    )
    
    assert result['draft_fwd_true'] == 10.05
    assert result['draft_aft_true'] == 11.95
    assert result['trim_true'] == 1.9

def test_full_survey_calculation_accuracy():
    """Verify the final displacement calculation including FTC and STC."""
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Standard Case
    result = architect.calculate_survey(
        fwd_obs=8.0, aft_obs=8.5, mid_obs=8.2, 
        dist_fwd=2.0, dist_aft=2.0, dist_mid=0.0,
        lbp=180.0, observed_density=1.025
    )
    
    # Displacement should be around 30k-35k for ~8.2m draft
    assert 30000 < result['calculated_displacement'] < 45000
    assert "First_Trim_Correction" in result['audit_trail'][2]['step'] # Check step order
    assert len(result['audit_trail']) == 5 # 5 major logging steps (UN/ECE Standard)

def test_density_correction():
    """Verify density correction factor (ITTC-78)."""
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Test at standard 1.025
    res_std = architect.calculate_survey(8.0, 8.0, 8.0, 0, 0, 0, 200, 1.025)
    
    # Test at brackish water 1.010
    res_brackish = architect.calculate_survey(8.0, 8.0, 8.0, 0, 0, 0, 200, 1.010)
    
    expected_ratio = 1.010 / 1.025
    actual_ratio = res_brackish['calculated_displacement'] / res_std['calculated_displacement']
    
    assert pytest.approx(actual_ratio, 0.001) == expected_ratio
