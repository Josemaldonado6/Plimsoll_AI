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
    
    # Don't check status immediately, as it connects in background.
    # Frontend will poll /telemetry to see "CONNECTING..." -> "STREAMING"
        
    return {"status": "success", "message": f"Connection initiated to {config.url}", "state": "CONNECTING"}

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
    try:
        if streamer.status != "STREAMING" and streamer.status != "CONNECTED":
            # If we are CONNECTING, tell the frontend
            if streamer.status == "CONNECTING...":
                return {"status": "CONNECTING...", "waterline_y": 0, "message": "Establishing Link..."}
            return {"status": "NO_SIGNAL", "waterline_y": 0, "message": "Stream offline"}
        
        return surveyor.get_live_readout() or {"status": "NO_DATA"}
    except Exception as e:
        print(f"[API] Telemetry Error: {e}")
        # Return a safe fallback so the UI doesn't crash
        return {"status": "SERVER_ERROR", "waterline_y": 0, "message": "Internal Telemetry Error"}
