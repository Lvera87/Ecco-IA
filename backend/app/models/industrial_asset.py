from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class IndustrialAsset(Base):
    __tablename__ = "industrial_assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    asset_type = Column(String(50), nullable=False)  # Motor, Compresor, Caldera, etc.
    nominal_power_kw = Column(Float, nullable=False) # Potencia Nominal
    efficiency_percentage = Column(Float, default=85.0) # Eficiencia actual (por defecto 85%)
    load_factor = Column(Float, default=0.75)           # Factor de carga promedio (0.0 - 1.0)
    power_factor = Column(Float, default=0.85)          # Cos φ (0.0 - 1.0)
    daily_usage_hours = Column(Float, nullable=False)   # Horas de uso diario
    op_days_per_month = Column(Integer, default=22)     # Días operativos al mes
    location = Column(String(100), nullable=True)       # Planta, Area, etc.
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="industrial_assets")

    # Relación con usuario e Indexación para performance
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    __table_args__ = (
        CheckConstraint('efficiency_percentage >= 0 AND efficiency_percentage <= 100', name='check_efficiency_range'),
        CheckConstraint('load_factor >= 0 AND load_factor <= 1.5', name='check_load_factor_range'),
        CheckConstraint('power_factor >= 0 AND power_factor <= 1.0', name='check_power_factor_range'),
        CheckConstraint('daily_usage_hours >= 0 AND daily_usage_hours <= 24', name='check_hours_range'),
        Index('ix_industrial_assets_user_id_location', 'user_id', 'location'),
    )
