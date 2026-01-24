
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def test_conn():
    url = "postgresql+asyncpg://postgres:Ecco_IA2026@db.koqrdmheberjgphlsjad.supabase.co:5432/postgres"
    print(f"Connecting to {url}...")
    try:
        engine = create_async_engine(url, echo=True)
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            print(f"Result: {result.scalar()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_conn())
