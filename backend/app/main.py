# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: main.py
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
import os
# [CRITICAL] Fix for PyTorch/PaddlePaddle libiomp5md.dll conflict on Windows
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.db import models  # [CRITICAL] Ensure metadata is populated
from app.api import endpoints, drone, quote, omniscient, ballast, sync, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Industrial Database Initialization
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Plimsoll AI", version="1.0.1", lifespan=lifespan)
print("[SYSTEM] Backend Reloaded - Version 1.0.1")

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replaced custom middleware due to Origin=* + Credentials=True conflict and missing error handler CORS injection
    allow_credentials=False,  # Bearer token auth via headers doesn't require cookies/credentials=True
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(endpoints.router, prefix="/api")
app.include_router(drone.router, prefix="/api")
app.include_router(quote.router, prefix="/api/quote", tags=["Sales Automation"])
app.include_router(omniscient.router, prefix="/api", tags=["OSINT"])
app.include_router(sync.router, prefix="/api", tags=["Data Synchronization"])
app.include_router(ballast.router, prefix="/api/ballast", tags=["Eco-Domination"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Plimsoll AI Backend"}
