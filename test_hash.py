
import time
from passlib.context import CryptContext

def test_hash_speed():
    ctx = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")
    print(f"Schemes: {ctx.schemes()}")
    
    start = time.time()
    h = ctx.hash("password123")
    end = time.time()
    print(f"Hash time: {end - start:.4f}s")
    
    start = time.time()
    v = ctx.verify("password123", h)
    end = time.time()
    print(f"Verify time: {end - start:.4f}s")

if __name__ == "__main__":
    test_hash_speed()
