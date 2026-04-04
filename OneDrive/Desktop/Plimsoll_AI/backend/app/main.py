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

class ProfessionalCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            response = Response()
            response.status_code = 200
        else:
            response = await call_next(request)
        
        # [CRITICAL] Forced Header Injection for Tunnel Immunity
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS, DELETE, PUT"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

app.add_middleware(ProfessionalCORSMiddleware)

app.include_router(auth.router, prefix="/api")
app.include_router(endpoints.router, prefix="/api")
app.include_router(drone.router, prefix="/api")
app.include_router(quote.router, prefix="/api/quote", tags=["Sales Automation"])
# [PHASE 11] ECO-DOMINATION ROUTER
app.include_router(omniscient.router, prefix="/api", tags=["OSINT"])
app.include_router(ballast.router, prefix="/api/ballast", tags=["Eco-Domination"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Plimsoll AI Backend"}
