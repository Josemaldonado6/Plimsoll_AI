from fastapi import APIRouter, HTTPException
from app.engine.omniscient import omniscient

router = APIRouter()

@router.get("/ship/{imo}")
async def get_ship_details(imo: str):
    """
    Fetches ship details from the Omniscient OSINT Engine.
    """
    try:
        data = omniscient.fetch_ship_data(imo)
        if not data:
            raise HTTPException(status_code=404, detail="Ship not found")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
