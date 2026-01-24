
import asyncio
from sqlalchemy import text
from app.db.session import get_async_engine

async def main():
    try:
        engine = get_async_engine()
        async with engine.connect() as conn:
            print("Checking active queries...")
            res = await conn.execute(text("""
                SELECT pid, query, state, wait_event_type, wait_event
                FROM pg_stat_activity
                WHERE state != 'idle' AND pid != pg_backend_pid();
            """))
            for r in res:
                print(r)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
