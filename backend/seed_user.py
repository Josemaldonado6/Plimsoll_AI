import asyncio
from app.db.database import engine, AsyncSessionLocal
from app.db.models import User
from app.api.security import get_password_hash

async def seed():
    async with AsyncSessionLocal() as db:
        try:
            user = User(
                email="jose@plimsoll.ai",
                hashed_password=get_password_hash("Plimsoll2026!"),
                full_name="José Maldonado (CPO)",
                tier="Sovereign",
                is_active=1
            )
            db.add(user)
            await db.commit()
            print("SUCCESS: CPO user seeded.")
        except Exception as e:
            print(f"ERROR: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed())
