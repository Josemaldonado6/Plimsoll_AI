import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_oed_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/ballast/oed", params={"draft": 10.0, "speed": 15.0, "sea_state": 4})
    assert response.status_code == 200
    data = response.json()
    assert "optimal_draft" in data
    assert "adjustment_required" in data
    assert data["optimal_draft"] == 9.8 # 9.5 + 0.3 for sea_state 4

@pytest.mark.asyncio
async def test_tanks_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/ballast/tanks")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "simulation"
    assert len(data["tanks"]) == 4

@pytest.mark.asyncio
async def test_authorize_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/ballast/authorize", params={"target_draft": 9.5})
    assert response.status_code == 200
    assert response.json()["success"] == False # No real PLC connected
