from fastapi import APIRouter, HTTPException
from app.engine.physics_v2 import NavalArchitect, MOCK_HYDRO_DATA
from app.engine.ballast_bridge import BallastPLCBridge
from typing import Dict, Any

router = APIRouter()
architect = NavalArchitect(lbp=229.0, hydrostatic_data=MOCK_HYDRO_DATA)
plc_bridge = BallastPLCBridge()

@router.get("/oed")
async def get_oed_optimization(draft: float, speed: float, sea_state: int) -> Dict[str, Any]:
    """Calculates the Optimal Efficiency Draft suggestion."""
    try:
        result = architect.calculate_oed(draft, speed, sea_state)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tanks")
async def get_plc_tank_levels():
    """Reads real-time tank data if PLC is connected, otherwise returns simulation data."""
    if not plc_bridge.is_connected:
        # Connect simulation if needed (in a real app, this would be managed by a background task)
        # For now, returning mock industrial data to avoid blocking the frontend preview
        return {
            "status": "simulation",
            "tanks": [
                {"id": "FP_TANK", "level": 45, "capacity": 500},
                {"id": "DB_1_P", "level": 82, "capacity": 1200},
                {"id": "DB_1_S", "level": 81, "capacity": 1200},
                {"id": "AP_TANK", "level": 12, "capacity": 450}
            ]
        }
    
    levels = await plc_bridge.read_tank_levels()
    return {"status": "plc_active", "data": levels}

@router.post("/authorize")
async def authorize_ballast_plan(target_draft: float):
    """Commits the AI-suggested OED to the PLC register after human authorization."""
    # Safety Check: Real hardware requires manual override
    # For simulation, we attempt to write to the mock register
    success = await plc_bridge.write_oed_suggestion(target_draft)
    return {"success": success, "message": "OED Suggestion Synced to PLC Buffer" if success else "PLC Connection Required"}
