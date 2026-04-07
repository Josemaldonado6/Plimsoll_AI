import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy import select
from app.db.database import AsyncSessionLocal, engine
from app.db.models import User
import hashlib

# Load .env
load_dotenv()

from app.api.security import get_password_hash

async def seed_data():
    print("Connecting to Supabase...")
    async with AsyncSessionLocal() as session:
        # Reset the user to ensure hashing is correct
        result = await session.execute(select(User).where(User.email == "admin@plimsoll.ai"))
        user = result.scalar_one_or_none()
        
        if user:
            print("Found existing admin. Deleting to reset hash...")
            await session.delete(user)
            await session.commit()

        print("Creating Sovereign Superuser: admin@plimsoll.ai")
        # PBKDF2-SHA256 (Compatible with the app)
        hashed_password = get_password_hash("admin")
        
        new_user = User(
            email="admin@plimsoll.ai",
            hashed_password=hashed_password,
            full_name="Plimsoll Administrator",
            tier="Sovereign",
            is_active=1
        )
        session.add(new_user)
        await session.commit()
        print("Seed complete! Login: admin@plimsoll.ai / admin")

if __name__ == "__main__":
    asyncio.run(seed_data())
