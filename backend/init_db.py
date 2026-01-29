"""Script to create all database tables."""
import asyncio
from app.db.base import Base
from app.db.session import get_async_engine

# Import all models so metadata is populated
from app.models import user, industrial_asset, industrial_settings, residential, roi_scenario, gamification, document  # noqa

async def init_db():
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
