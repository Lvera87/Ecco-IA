from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models here for Alembic ONLY if needed elsewhere. 
# Best practice is to import them in alembic/env.py directly or here but without circularity.
