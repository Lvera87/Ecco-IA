
import asyncio
import os
from google import genai

# Manual .env loading
def load_env():
    try:
        with open(".env", "r") as f:
            for line in f:
                if line.strip() and not line.startswith("#"):
                    key, value = line.strip().split("=", 1)
                    os.environ[key] = value.strip('"').strip("'")
    except FileNotFoundError:
        print("No .env file found")

load_env()

async def test_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    model_name = os.getenv("GEMINI_MODEL_NAME", "gemini-2.0-flash-exp")

    print(f"API Key present: {bool(api_key)}")
    print(f"Model: {model_name}")

    if not api_key:
        print("ERROR: missing API ID")
        return

    try:
        client = genai.Client(api_key=api_key)
        print("Client initialized. Sending request...")
        
        response = client.models.generate_content(
            model=model_name,
            contents="Say 'Hello from Gemini!'"
        )
        print("Response received:")
        print(response.text)
        print("SUCCESS")
    except Exception as e:
        print(f"FAILED with error: {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
