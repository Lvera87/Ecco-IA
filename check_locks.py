
import asyncio
from sqlalchemy import text
from app.db.session import get_async_engine

async def main():
    try:
        engine = get_async_engine()
        async with engine.connect() as conn:
            print("Checking for locks...")
            res = await conn.execute(text("""
                SELECT 
                    pg_class.relname AS table_name, 
                    pg_locks.mode AS lock_mode, 
                    pg_stat_activity.query AS blocked_query, 
                    pg_stat_activity.pid AS blocked_pid
                FROM pg_locks
                JOIN pg_stat_activity ON pg_locks.pid = pg_stat_activity.pid
                JOIN pg_class ON pg_locks.relation = pg_class.oid
                WHERE pg_stat_activity.pid != pg_backend_pid();
            """))
            for r in res:
                print(r)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
