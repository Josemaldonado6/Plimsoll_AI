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
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints, drone, quote, stream

app = FastAPI(title="Plimsoll AI", version="1.0.1")
print("[SYSTEM] Backend Reloaded - Version 1.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)
app.include_router(drone.router, prefix="/api/v1")
app.include_router(quote.router, prefix="/api/quote", tags=["Sales Automation"])
app.include_router(stream.router, prefix="/api/stream", tags=["Live Stream"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Plimsoll AI Backend"}
