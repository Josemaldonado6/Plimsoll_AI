import pytest
import math
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_drone_mission_geometric_integrity():
    """
    INDUSTRIAL STANDARD TEST: 
    Verifies the geometric symmetry and safety clearance of the Hull-Orbit pattern.
    Target: ISO 17020 Maritime Inspection Standards.
    """
    L = 229.0 # Bulk Carrier V LOCUS Length
    S = 12.0  # Safe Distance for stormy conditions
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/drone/mission/waypoints", params={"vessel_length": L, "safe_distance": S})
    
    assert response.status_code == 200
    data = response.json()
    waypoints = data["waypoints"]
    
    # 1. Coordinate Symmetry Validation
    # Port side should be mirror of Starboard side on Y axis
    p_fwd = next(w for w in waypoints if w["id"] == "FWD-P")
    s_fwd = next(w for w in waypoints if w["id"] == "FWD-S")
    assert p_fwd["x"] == s_fwd["x"]
    assert p_fwd["y"] == -s_fwd["y"]
    
    # 2. Safety Clearance Assertion
    # Absolute Y component must never be less than safe_distance
    for wp in waypoints:
        assert abs(wp["y"]) >= S, f"Safety Violation: Waypoint {wp['id']} too close to hull!"

    # 3. Longitudinal Coverage (Draft Mark Positions)
    # Marks at 90% of half-length (FWD/AFT) and MID (0)
    expected_fwd_x = (L / 2.0) * 0.9
    assert math.isclose(p_fwd["x"], expected_fwd_x, rel_tol=1e-5)

@pytest.mark.asyncio
async def test_drone_mission_parameter_boundaries():
    """
    STRESS TEST:
    Verifies behavior with extreme vessel dimensions (Tugboats to ULCCs).
    """
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # ULCC Case (400m)
        res_ulcc = await ac.get("/api/drone/mission/waypoints", params={"vessel_length": 400.0})
        # Tugboat Case (20m)
        res_tug = await ac.get("/api/drone/mission/waypoints", params={"vessel_length": 20.0})
        
    assert res_ulcc.status_code == 200
    assert res_tug.status_code == 200
    
    ulcc_fwd = res_ulcc.json()["waypoints"][0]
    tug_fwd = res_tug.json()["waypoints"][0]
    
    assert ulcc_fwd["x"] > tug_fwd["x"]
    assert ulcc_fwd["x"] == 180.0 # (400/2) * 0.9
