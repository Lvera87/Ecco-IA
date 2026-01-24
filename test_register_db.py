
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from app.models.user import User
from app.db.base import Base

async def test_register():
    url = "postgresql+asyncpg://postgres:Ecco_IA2026@db.koqrdmheberjgphlsjad.supabase.co:5432/postgres"
    print(f"Connecting...")
    engine = create_async_engine(url, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as db:
        print("Checking existing...")
        username = "testuser_555"
        email = "test_555@example.com"
        existing = await db.execute(
            select(User).where((User.username == username) | (User.email == email))
        )
        if existing.scalar_one_or_none():
            print("User exists")
            return
            
        print("Creating user...")
        new_user = User(
            username=username,
            email=email,
            full_name="Test User 555",
            hashed_password="dummy_hash",
            user_type="residential"
        )
        db.add(new_user)
        print("Flushing...")
        await db.flush()
        print(f"User ID: {new_user.id}")
        
        print("Commiting...")
        await db.commit()
        print("Refeshing...")
        await db.refresh(new_user)
        print("Done!")

if __name__ == "__main__":
    asyncio.run(test_register())
