# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: database.py
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
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# ------------------------------------------------------------------
# Resolución de DATABASE_URL
#
# Prioridad:
#   1. Variable de entorno DATABASE_URL (Vercel Postgres, Supabase, etc.)
#   2. SQLite local en data/plimsoll.db (Edge / desarrollo)
#
# Vercel: configurar DATABASE_URL en Settings → Environment Variables
# ------------------------------------------------------------------
_ENV_URL = os.environ.get("DATABASE_URL", "")

if _ENV_URL:
    # Vercel Postgres devuelve URLs con esquema "postgres://"; SQLAlchemy
    # requiere "postgresql+asyncpg://"
    DATABASE_URL = _ENV_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    if DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    _engine_kwargs = {}
else:
    # Edge / desarrollo local — SQLite
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    DATA_DIR = os.path.join(BASE_DIR, "data")
    os.makedirs(DATA_DIR, exist_ok=True)
    DB_PATH = os.path.join(DATA_DIR, "plimsoll.db")
    DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"
    _engine_kwargs = {"connect_args": {"check_same_thread": False}}

engine = create_async_engine(DATABASE_URL, echo=False, **_engine_kwargs)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
