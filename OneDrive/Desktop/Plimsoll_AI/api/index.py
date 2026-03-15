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
from app.api import auth, drone, quote, omniscient


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
app.include_router(auth.router,       prefix="/api")
app.include_router(drone.router,      prefix="/api")
app.include_router(quote.router,      prefix="/api/quote", tags=["Sales Automation"])
app.include_router(omniscient.router, prefix="/api",       tags=["OSINT"])


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
