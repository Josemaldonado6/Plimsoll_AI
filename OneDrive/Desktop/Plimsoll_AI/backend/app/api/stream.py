from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.engine.rtsp_client import streamer
from app.engine.draft_calculator import DraftSurveyor

router = APIRouter()
surveyor = DraftSurveyor()

class StreamConfig(BaseModel):
    url: str

@router.post("/connect")
async def connect_stream(config: StreamConfig):
    """
    Connects the backend to an RTSP stream (or local camera index).
    """
    if streamer.status == "STREAMING" or streamer.status == "CONNECTED":
        streamer.stop() # Restart if already running
    
    streamer.source = config.url
    streamer.start()
    
    if streamer.status.startswith("ERROR"):
        raise HTTPException(status_code=400, detail=streamer.status)
        
    return {"status": "success", "message": f"Connected to {config.url}", "state": streamer.status}

@router.post("/disconnect")
async def disconnect_stream():
    """
    Stops the RTSP stream.
    """
    streamer.stop()
    return {"status": "success", "message": "Stream stopped"}

@router.get("/status")
async def get_stream_status():
    """
    Returns current stream status.
    """
    return {"status": streamer.status, "source": streamer.source}

@router.get("/telemetry")
async def get_live_telemetry():
    """
    Returns the latest AI analysis from the live stream.
    """
    if streamer.status != "STREAMING" and streamer.status != "CONNECTED":
        return {"status": "NO_SIGNAL", "waterline_y": 0, "message": "Stream offline"}
    
    return surveyor.get_live_readout() or {"status": "NO_DATA"}
