import pytest
import numpy as np
from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

def test_hydrostatic_interpolation():
    """
    Validates that the CubicSpline interpolation returns expected values
    within the range of the mock data.
    """
    architect = NavalArchitect(lbp=229.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Mid-range lookup
    vals = architect.data_store.get_values(9.0)
    
    # Between 8.0 (30000) and 10.0 (42000)
    assert 30000 < vals['disp'] < 42000
    # Between 8.0 (52) and 10.0 (56)
    assert 52 < vals['tpc'] < 56

def test_perpendicular_correction():
    """
    Validates the Correction to Perpendiculars (Step 1).
    Scenario: Marks are 2.5m from perpendiculars.
    """
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Simplified inputs
    fwd_obs = 10.0
    aft_obs = 11.0 # Apparent trim = 1.0m
    mid_obs = 10.5
    
    dist_fwd = 2.0
    dist_aft = 3.0
    dist_mid = 0.0 # Exactly at midships
    
    res = architect.calculate_survey(
        fwd_obs=fwd_obs, aft_obs=aft_obs, mid_obs=mid_obs,
        dist_fwd=dist_fwd, dist_aft=dist_aft, dist_mid=dist_mid,
        lbp=200.0, observed_density=1.025
    )
    
    # LBM = 200 - 2 + 3 = 201
    # corr_fwd = (2 * 1.0) / 201 = 0.00995
    # corr_aft = (3 * 1.0) / 201 = 0.01492
    
    assert res['draft_fwd_true'] > fwd_obs
    assert res['draft_aft_true'] < aft_obs
    assert res['trim_true'] < 1.0 # True trim should be smaller than apparent 

def test_hull_deformation_means():
    """
    Validates Quarter Mean (Means of Means) calculation.
    """
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Marks at perpendiculars for simplicity
    res = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=10.0, mid_obs=11.0, # Hogging case
        dist_fwd=0, dist_aft=0, dist_mid=0,
        lbp=200.0, observed_density=1.025
    )
    
    # QM = (10 + 10 + 6*11) / 8 = 86 / 8 = 10.75
    assert res['quarter_mean_draft'] == 10.75

def test_density_correction_logic():
    """
    Validates that displacement scales correctly with water density.
    """
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Same draft, different densities
    res_salt = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=10.0, mid_obs=10.0,
        dist_fwd=0, dist_aft=0, dist_mid=0,
        lbp=200.0, observed_density=1.025 # Saltwater standard
    )
    
    res_fresh = architect.calculate_survey(
        fwd_obs=10.0, aft_obs=10.0, mid_obs=10.0,
        dist_fwd=0, dist_aft=0, dist_mid=0,
        lbp=200.0, observed_density=1.000 # Freshwater
    )
    
    # Freshwater displacement should be exactly (1.000/1.025) of salt
    expected_ratio = 1.000 / 1.025
    assert res_fresh['calculated_displacement'] < res_salt['calculated_displacement']
    assert pytest.approx(res_fresh['calculated_displacement'] / res_salt['calculated_displacement'], 0.001) == expected_ratio

def test_oed_optimization():
    """
    Validates Optimal Efficiency Draft logic.
    """
    architect = NavalArchitect(lbp=200.0, hydrostatic_data=MOCK_HYDRO_DATA)
    
    # Calm sea
    oed_calm = architect.calculate_oed(current_draft=10.0, target_speed=14.0, sea_state=0)
    # Heavy sea
    oed_heavy = architect.calculate_oed(current_draft=10.0, target_speed=14.0, sea_state=7)
    
    # Heavy sea should recommend a deeper draft for stability
    assert oed_heavy['optimal_draft'] > oed_calm['optimal_draft']
