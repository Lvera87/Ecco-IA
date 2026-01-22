from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class IndustrialAsset(Base):
    __tablename__ = "industrial_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    asset_type = Column(String(50), nullable=False)  # Motor, Compresor, Caldera, etc.
    nominal_power_kw = Column(Float, nullable=False) # Potencia Nominal
    efficiency_percentage = Column(Float, nullable=True) # Eficiencia actual (opcional inicial)
    daily_usage_hours = Column(Float, nullable=False) # Horas de uso diario
    location = Column(String(100), nullable=True)     # Planta, Area, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacion con usuario (quien reporta el activo)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
