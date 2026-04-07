# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: models.py
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
from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.db.database import Base

class Survey(Base):
    __tablename__ = "surveys"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    filename = Column(String)
    draft_mean = Column(Float)
    confidence = Column(Float)
    sea_state = Column(String)
    waterline_y = Column(Integer)
    variance = Column(Float)
    evidence_path = Column(String, nullable=True)
    is_synced = Column(Integer, default=0) # 0=False, 1=True (SQLite boolean usually integer)
    hash_seal = Column(String, nullable=True) # Cryptographic proof of integrity
    notarized_at = Column(DateTime, nullable=True) # Canonical timestamp of notarization

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    tier = Column(String, default="Explorer") # Explorer, Commander, Sovereign
    is_active = Column(Integer, default=1)
    last_login = Column(DateTime, nullable=True)

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(Integer, primary_key=True, index=True)
    imo = Column(String, unique=True, index=True)
    name = Column(String)
    lbp = Column(Float, nullable=True)      # Length Between Perpendiculars
    beam = Column(Float, nullable=True)     # Breadth
    max_draft = Column(Float, nullable=True)
    deadweight = Column(Float, nullable=True)
    hydrostatics_data = Column(String, nullable=True) # JSON Blob of Draft-vs-Displacement
    last_profile_sync = Column(DateTime, default=datetime.utcnow)

