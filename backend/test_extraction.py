
import asyncio
import os
from app.services.gemini_service import gemini_service

# Path to the file
file_path = "/home/luis/Desktop/Ecco-IA/frontend/public/lu.pdf"
# file_path = "/home/luis/Desktop/Ecco-IA/frontend/public/CamScanner 29-01-2026 14.49.pdf"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

async def test_extraction():
    print(f"Reading file: {file_path}")
    with open(file_path, "rb") as f:
        content = f.read()
    
    print(f"Sending {len(content)} bytes to Gemini...")
    result = await gemini_service.parse_energy_bill(content, mime_type="application/pdf")
    
    import json
    print("\n--- GEMINI RESPONSE ---")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("-----------------------")

if __name__ == "__main__":
    asyncio.run(test_extraction())
