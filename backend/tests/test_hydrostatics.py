import sys
import os
import unittest
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA

class TestHydrostaticEngine(unittest.TestCase):
    def setUp(self):
        # Initialize with standard mock data
        self.physics = NavalArchitect(lbp=180.0, hydrostatic_data=MOCK_HYDRO_DATA)

    def test_interpolation_logic(self):
        # Scenario: Draft = 8.0m
        # From MOCK_HYDRO_DATA:
        # draft: [..., 6.0, 8.0, 10.0, ...]
        # displacement: [..., 20000.0, 30000.0, 42000.0, ...]
        # tpc: [..., 48.0, 52.0, 56.0, ...]
        
        values = self.physics.data_store.get_values(8.0)
        
        # Test exact match at table point
        self.assertAlmostEqual(values['disp'], 30000.0, places=1)
        self.assertAlmostEqual(values['tpc'], 52.0, places=1)
        
        # Test interpolation between points (e.g., 9.0m)
        # Linear approximation for 9.0m: (30000 + 42000) / 2 = 36000
        # CubicSpline will be slightly different but close
        mid_values = self.physics.data_store.get_values(9.0)
        self.assertGreater(mid_values['disp'], 30000.0)
        self.assertLess(mid_values['disp'], 42000.0)
        self.assertAlmostEqual(mid_values['tpc'], 54.0, places=1)

    def test_density_correction(self):
        # Draft 8.0m, Density 1.010 (Brackish Water)
        # 1.025 is the standard for tables.
        res = self.physics.calculate_survey(
            fwd_obs=8.0, aft_obs=8.0, mid_obs=8.0,
            dist_fwd=0.0, dist_aft=0.0, dist_mid=0.0,
            lbp=180.0, observed_density=1.010
        )
        
        # Expected displacement: 30000 * (1.010 / 1.025) = 29560.97
        self.assertAlmostEqual(res['calculated_displacement'], 29560.98, places=1)

if __name__ == "__main__":
    unittest.main()
