
import asyncio
from sqlalchemy import text
from app.db.session import get_async_engine

async def main():
    try:
        engine = get_async_engine()
        async with engine.connect() as conn:
            res = await conn.execute(text('SELECT count(*) FROM users'))
            print(f"Total users: {res.scalar()}")
            
            res = await conn.execute(text('SELECT count(*) FROM missions'))
            print(f"Total missions: {res.scalar()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
