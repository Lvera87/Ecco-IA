import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
import json

async def run_manual_test():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "username": "tester_poly",
            "email": "tester@example.com",
            "password": "Secret123!",
            "full_name": "Tester Manual",
            "user_type": "residential"
        }
        print(f"Enviando registro: {payload}")
        try:
            resp = await client.post("/api/v1/auth/register", json=payload)
            print(f"Status: {resp.status_code}")
            print(f"Data: {resp.json()}")
        except TypeError as e:
            print(f"!!! Error de serialización: {e}")
        except Exception as e:
            print(f"!!! Otro error: {e}")

if __name__ == "__main__":
    asyncio.run(run_manual_test())
