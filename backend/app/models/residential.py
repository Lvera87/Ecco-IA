from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class ResidentialProfile(Base):
    __tablename__ = "residential_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    house_type = Column(String(50)) # apartment, house, etc.
    occupants = Column(Integer, default=1)
    area_sqm = Column(Float)
    city = Column(String(100))
    stratum = Column(Integer)
    occupancy_profile = Column(String(50)) # onsite, hybrid, full
    energy_source = Column(String(50))     # gas, electric
    monthly_bill_avg = Column(Float)
    target_monthly_bill = Column(Float)
    average_kwh_captured = Column(Float)
    history_kwh = Column(JSON, nullable=True) # [129, 116, ...]
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="residential_profile")

    __table_args__ = (
        CheckConstraint('occupants >= 1', name='check_min_occupants'),
        CheckConstraint('stratum >= 0 AND stratum <= 6', name='check_stratum_range'),
    )

class ResidentialAsset(Base):
    __tablename__ = "residential_assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String(100), nullable=False)
    icon = Column(String(50))
    category = Column(String(50)) # kitchen, laundry, etc.
    is_high_impact = Column(Boolean, default=False)
    status = Column(Boolean, default=True)
    
    # Datos para cálculo real (Sentido Común)
    power_watts = Column(Float, default=0.0)
    daily_hours = Column(Float, default=0.0)
    monthly_cost_estimate = Column(Float, default=0.0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="residential_assets")

    __table_args__ = (
        CheckConstraint('power_watts >= 0', name='check_positive_power'),
        CheckConstraint('daily_hours >= 0 AND daily_hours <= 24', name='check_daily_hours_range'),
    )

class ConsumptionReading(Base):
    __tablename__ = "consumption_readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    reading_value = Column(Float, nullable=False) # kWh
    cost = Column(Float, nullable=True) # Actual billed cost
    date = Column(DateTime(timezone=True), server_default=func.now())
    reading_type = Column(String(50), default="manual") # manual, scannned
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="consumption_readings")

    __table_args__ = (
        CheckConstraint('reading_value >= 0', name='check_positive_reading'),
        Index('ix_consumption_user_date', 'user_id', 'date'),
    )
