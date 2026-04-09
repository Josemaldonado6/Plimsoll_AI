import asyncio
import os
import sys

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.db.database import engine
from sqlalchemy import text

async def upgrade():
    async with engine.begin() as conn:
        print("Checking if columns exist...")
        try:
            # Try to add operation_id
            await conn.execute(text("ALTER TABLE surveys ADD COLUMN operation_id VARCHAR;"))
            print("Added operation_id column.")
        except Exception as e:
            print(f"operation_id column might already exist. Error: {e}")
            
        try:
            # Try to add phase
            await conn.execute(text("ALTER TABLE surveys ADD COLUMN phase VARCHAR;"))
            print("Added phase column.")
        except Exception as e:
            print(f"phase column might already exist. Error: {e}")

if __name__ == '__main__':
    asyncio.run(upgrade())
