
import asyncio
import os
import sys

# Add backend directory to sys.path to import modules
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

# Load env variables explicitly
env_path = os.path.join(os.getcwd(), 'backend', '.env')
load_dotenv(env_path)

database_url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {database_url}")

async def test_connection():
    if not database_url:
        print("Error: DATABASE_URL not found in environment variables.")
        return

    try:
        # Create engine with a short timeout to fail fast
        engine = create_async_engine(
            database_url, 
            echo=True,
            connect_args={"timeout": 10} # 10 seconds timeout for connect
        )
        
        print("Engine created. Attempting to connect...")
        
        async with engine.connect() as conn:
            print("Connection successful! Executing query...")
            result = await conn.execute(text("SELECT 1"))
            print(f"Query Result: {result.scalar()}")
            
        print("SUCCESS: Database connection verified.")
        
    except Exception as e:
        print(f"FAILURE: Could not connect to database.\nError: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(test_connection())
