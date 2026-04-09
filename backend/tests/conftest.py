import pytest
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import sys

# Test Database Configuration (Absolute Path for Stability)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Insert backend directory (parent of tests) into sys.path
sys.path.insert(0, os.path.dirname(BASE_DIR))

from app.main import app
from app.db.database import Base, get_db
from app.db.models import Survey
import os
import sqlalchemy

DB_PATH = os.path.join(BASE_DIR, "test_plimsoll.db")
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{DB_PATH}"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestingSessionLocal = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Synchronous engine for schema creation (bypass async loop issues during setup)
    sync_url = f"sqlite:///{DB_PATH}"
    sync_engine = sqlalchemy.create_engine(sync_url)
    Base.metadata.drop_all(bind=sync_engine)
    Base.metadata.create_all(bind=sync_engine)
    yield
    # No teardown to allow inspection if needed

@pytest.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session

@pytest.fixture
def client(db_session):
    # Dependency override
    async def _override_get_db():
        yield db_session
    
    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    # Cleanup
    app.dependency_overrides.clear()
