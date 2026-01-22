from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class RoiScenario(Base):
    __tablename__ = "roi_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("industrial_assets.id"), nullable=False)
    target_efficiency = Column(Float, nullable=False)
    investment_usd = Column(Float, nullable=False)
    annual_savings_usd = Column(Float, nullable=False)
    payback_months = Column(Float, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship with user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
