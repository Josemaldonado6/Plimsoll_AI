# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: endpoints.py
#
# DERECHOS DE AUTOR / COPYRIGHT:
# (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
#
# PROPIEDAD INTELECTUAL:
# Este código fuente, algoritmos, lógica de negocio y diseño de interfaz
# son propiedad exclusiva de su autor. Queda prohibida su reproducción,
# distribución o uso sin una licencia otorgada por escrito.
#
# REGISTRO:
# Protegido bajo la Ley Federal del Derecho de Autor (México) y
# Tratados Internacionales de la OMPI.
#
# CONFIDENCIALIDAD:
# Este archivo contiene SECRETOS INDUSTRIALES. Su acceso no autorizado
# constituye un delito federal.
# -----------------------------------------------------------------------------
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Dict, List
from fastapi.responses import FileResponse
from app.engine.reporter import PDFGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.engine.ai_vision import AIDraftSurveyor
from app.db.database import get_db, engine, Base
from app.db.models import Survey
from app.engine.omniscient import omniscient
import shutil
import os
import asyncio
import uuid
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
surveyor = AIDraftSurveyor()

# Startups ensure data directory exists
# Using relative path './data' which is safer for Windows dev than absolute '/data'
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
os.makedirs(DATA_DIR, exist_ok=True)
logger.info(f"DATA_DIR RESOLVED TO: {DATA_DIR}")

# Create tables on startup (for MVP simplicity)
@router.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@router.get("/health")
def health_check():
    return {"status": "plimsoll_active"}

from fastapi import File, UploadFile, Form, HTTPException, Depends
from sqlalchemy.future import select
from app.db.models import Survey, Vessel

@router.post("/analyze")
async def analyze_draft(
    video: UploadFile = File(...), 
    imo: str = Form(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Recuperar Datos Maestros del Buque (si existe IMO)
        vessel_data = None
        if imo:
            result = await db.execute(select(Vessel).where(Vessel.imo == imo))
            vessel_data = result.scalars().first()
            if vessel_data:
                logger.info(f"[API] Barco reconocido: {vessel_data.name} (LBP: {vessel_data.lbp}m)")

        # 2. Guardar video temporalmente
        file_extension = video.filename.split(".")[-1]
        file_name = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(DATA_DIR, file_name)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)

        # 3. Procesar video con Ingeniería Naval Inyectada
        # Pasamos el objeto vessel_data completo al motor de visión
        result = await surveyor.process_video(file_path, vessel_data=vessel_data)

        if "error" in result:
            logger.error(f"Analysis Engine Error: {result['error']}")
            raise HTTPException(status_code=422, detail=result["error"])

        # 4. Guardar en Base de Datos con ADN del Barco
        db_survey = Survey(
            filename=file_name,
            draft_mean=result.get("draft_mean"),
            confidence=result.get("confidence"),
            sea_state=result.get("sea_state"),
            waterline_y=result.get("telemetry", {}).get("waterline_y"),
            variance=result.get("telemetry", {}).get("variance"),
            evidence_path=result.get("evidence_path")
        )

        db.add(db_survey)
        await db.commit()
        await db.refresh(db_survey)
        
        # Add ID to result
        result["id"] = db_survey.id
        return result

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Analysis Failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/surveys/{survey_id}/pdf")
async def generate_pdf(survey_id: int, lang: str = "en", db: AsyncSession = Depends(get_db)):
    # Fetch survey from DB
    result = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = result.scalars().first()
    
    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Generate PDF
    print(f"[PDF DEBUG] Starting generation for ID: {survey_id} | Lang: {lang}", flush=True)
    pdf_gen = PDFGenerator(output_dir=DATA_DIR)
    
    # Robust date formatting
    ts_str = "Unknown"
    if survey.timestamp:
        try:
            if hasattr(survey.timestamp, 'strftime'):
                ts_str = survey.timestamp.strftime("%Y-%m-%d %H:%M")
            else:
                # Handle cases where it might be a string from SQLite
                ts_str = str(survey.timestamp)
        except:
            ts_str = str(survey.timestamp)

    survey_data = {
        "id": survey.id,
        "timestamp": ts_str,
        "draft_mean": float(survey.draft_mean) if survey.draft_mean is not None else 0.0,
        "confidence": float(survey.confidence) if survey.confidence is not None else 0.0,
        "sea_state": str(survey.sea_state or "Unknown")
    }
    
    try:
        print(f"[PDF DEBUG] Survey Data: {survey_data}", flush=True)
        print(f"[PDF DEBUG] Evidence Path: {survey.evidence_path}", flush=True)
        # Pass lang to generator
        pdf_path = pdf_gen.generate_report(survey_data, survey.evidence_path, lang=lang)
        print(f"[PDF DEBUG] PDF Generated at: {pdf_path}", flush=True)
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"Generated PDF file not found at {pdf_path}")

        return FileResponse(pdf_path, media_type="application/pdf", filename=os.path.basename(pdf_path))
    except Exception as e:
        print(f"[PDF ERROR] CRITICAL FAILURE: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {str(e)}")

@router.post("/surveys/{survey_id}/sync")
async def sync_survey(survey_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch survey
    result = await db.execute(select(Survey).where(Survey.id == survey_id))
    survey = result.scalars().first()

    if not survey:
        raise HTTPException(status_code=404, detail="Survey not found")

    # Simulate Cloud Upload Delay
    await asyncio.sleep(1.5)

    # Update Status
    survey.is_synced = 1
    await db.commit()

    return {"status": "synced", "cloud_id": f"cloud_{uuid.uuid4()}"}

@router.get("/history")
async def get_history(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Survey).order_by(Survey.timestamp.desc()))
    surveys = result.scalars().all()
    return surveys

    
    result = await db.execute(select(Survey).order_by(Survey.timestamp.desc()))
    surveys = result.scalars().all()
    return surveys
    
@router.get("/ship/{imo_number}")
async def get_ship_details(imo_number: str):
    """
    Returns OSINT data for a specific ship and initializes the Physics Engine.
    """
    try:
        # Trigger initialization in the DraftSurveyor
        ship_data = surveyor.legacy.initialize_vessel(imo_number)
        return ship_data
    except Exception as e:
        logger.error(f"Failed to fetch and initialize ship data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel

class CalibrationRequest(BaseModel):
    pixel_dist: int
    known_height_m: float

class EnvironmentConfig(BaseModel):
    density: float
    draft_fwd: float = None
    draft_aft: float = None

class HydrostaticTableRequest(BaseModel):
    lbp: float
    tables: Dict[str, List[float]]

@router.post("/ship/{imo_number}/hydrostatics")
async def set_ship_hydrostatics(imo_number: str, data: HydrostaticTableRequest):
    """
    Ingests vessel-specific hydrostatic tables for advanced displacement calculation.
    """
    try:
        res = surveyor.legacy.set_vessel_hydrostatics({
            "lbp": data.lbp,
            "tables": data.tables
        })
        return res
    except Exception as e:
        logger.error(f"Failed to ingest hydrostatics for {imo_number}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/environment")
async def set_environment(data: EnvironmentConfig):
    """
    Updates the physical environment parameters (Density, Trim).
    """
    try:
        # Update the surveyor (AIDraftSurveyor -> legacy DraftSurveyor)
        res = surveyor.legacy.set_environment_params(
            density=data.density,
            draft_fwd=data.draft_fwd,
            draft_aft=data.draft_aft
        )
        return {"status": "success", "physics_state": res}
    except Exception as e:
        logger.error(f"Failed to update environment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/calibrate")
async def calibrate_engine(data: CalibrationRequest):
    """
    Updates the pixel-to-meter scale based on user input.
    """
    try:
        # Access the legacy drafted surveyor instance within the AI wrapper
        res = surveyor.legacy.set_calibration(data.pixel_dist, data.known_height_m)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

