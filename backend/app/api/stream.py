# DEPRECATED: Live RTSP/WebSocket streaming removed.
# DJI Air 3S does not support the DJI Mobile SDK for live transmission.
# Video input is now handled via manual SD card extraction.
# See: backend/app/engine/sd_watcher.py  (SD card daemon)
#      backend/app/engine/surveyor.py    (frame extractor → VisionTrinity)

from fastapi import APIRouter
router = APIRouter()
