# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: api/index.py
#
# PUNTO DE ENTRADA VERCEL (Serverless / Cloud)
#
# Arquitectura split:
#   ├─ api/index.py  ← ESTE ARCHIVO — Cloud-safe, sin OpenVINO, sin PyTorch
#   └─ backend/app/main.py — Edge-full, con OpenVINO INT8 (tablet local)
#
# Regla estricta: este módulo NUNCA importa ai_vision, surveyor, sd_watcher
# ni export_openvino. Esos módulos corren exclusivamente en el dispositivo Edge.
# -----------------------------------------------------------------------------

import os
import sys

# Agrega backend/ al path para que los imports de app.* funcionen
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Cloud-safe DB (soporta SQLite local y PostgreSQL en Vercel)
from app.db.database import engine, Base, get_db
from app.db.models import Survey

# Cloud-safe routers (sin dependencias de OpenVINO / PyTorch / pymodbus)
# EXCLUIDOS del cloud (requieren hardware físico o librerías Edge-only):
#   - ballast  → BallastPLCBridge usa pymodbus (PLC físico en el barco)
#   - endpoints → AIDraftSurveyor usa OpenVINO INT8 (NPU en la tablet)
from fastapi.responses import JSONResponse
import traceback

# SAFE IMPORT BLOCK FOR DIAGNOSTICS
DEBUG_INFO = {}
try:
    DEBUG_INFO['sys_path'] = sys.path
    backend_path = os.path.join(os.path.dirname(__file__), "..", "backend")
    DEBUG_INFO['backend_exists'] = os.path.exists(backend_path)
    if os.path.exists(backend_path):
        DEBUG_INFO['backend_dirs'] = os.listdir(backend_path)
        app_path = os.path.join(backend_path, "app")
        if os.path.exists(app_path):
            DEBUG_INFO['app_dirs'] = os.listdir(app_path)
            api_path = os.path.join(app_path, "api")
            if os.path.exists(api_path):
                DEBUG_INFO['api_dirs'] = os.listdir(api_path)
    
    from app.api.auth import router as auth_router
    from app.api.drone import router as drone_router
    from app.api.quote import router as quote_router
    from app.api.omniscient import router as omniscient_router
    ROUTERS_LOADED = True
except Exception as e:
    ROUTERS_LOADED = False
    DEBUG_INFO['error_type'] = type(e).__name__
    DEBUG_INFO['error_msg'] = str(e)
    DEBUG_INFO['traceback'] = traceback.format_exc()

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="Plimsoll AI — Cloud API",
    version="1.0.1",
    description="Serverless API gateway. ML inference corre en dispositivo Edge con OpenVINO INT8.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------
# Routers cloud-safe
# ------------------------------------------------------------------
if ROUTERS_LOADED:
    app.include_router(auth_router,       prefix="/api")
    app.include_router(drone_router,      prefix="/api")
    app.include_router(quote_router,      prefix="/api/quote", tags=["Sales Automation"])
    app.include_router(omniscient_router, prefix="/api",       tags=["OSINT"])
else:
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH", "TRACE"])
    async def catch_all(path_name: str):
        return JSONResponse(status_code=500, content={"error": "ROUTER_IMPORT_FAILED", "debug": DEBUG_INFO})


# ------------------------------------------------------------------
# Endpoints de base de datos (sin ML)
# ------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "plimsoll_cloud_active", "inference": "edge_only"}


@app.get("/api/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Survey).order_by(Survey.timestamp.desc()))
    return result.scalars().all()


@app.get("/api/surveys/{survey_id}/pdf")
async def get_pdf_stub(survey_id: int):
    """PDF se genera en el Edge; este endpoint redirige al Edge o devuelve 503."""
    raise HTTPException(
        status_code=503,
        detail={
            "error": "EDGE_REQUIRED",
            "message": "La generación de PDF requiere el dispositivo Edge con OpenVINO INT8.",
        },
    )


@app.post("/api/surveys/{survey_id}/sync")
async def sync_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    """Marca una encuesta como sincronizada en la DB cloud."""
    import uuid, asyncio
    result = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = result.scalars().first()
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")
    await asyncio.sleep(0.5)
    survey.is_synced = 1
    await db.commit()
    return {"status": "synced", "cloud_id": f"cloud_{uuid.uuid4()}"}


# ------------------------------------------------------------------
# Stub para /api/analyze — ML corre en Edge, no en Vercel
# ------------------------------------------------------------------
@app.post("/api/analyze")
async def analyze_stub(video: UploadFile = File(...)):
    """
    Este endpoint está deshabilitado en el despliegue cloud de Vercel.
    El análisis OpenVINO INT8 se ejecuta exclusivamente en el dispositivo Edge
    (tablet con NPU). El Edge llama directamente a backend/app/main.py.
    """
    raise HTTPException(
        status_code=503,
        detail={
            "error": "EDGE_REQUIRED",
            "message": (
                "La inferencia de IA (YOLOv11n + SAM2 + Depth Anything V2) "
                "requiere el runtime OpenVINO INT8 en el dispositivo Edge. "
                "Conecta la tablet al servidor local para procesar el video."
            ),
        },
    )


@app.get("/")
def root():
    return {
        "service": "Plimsoll AI",
        "mode": "cloud",
        "inference": "edge_device_only",
        "docs": "/docs",
    }
