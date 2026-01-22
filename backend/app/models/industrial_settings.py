from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.db.base import Base

class IndustrialSettings(Base):
    __tablename__ = "industrial_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Perfil de Empresa
    company_name = Column(String, default="Mi Planta Industrial")
    industry_sector = Column(String, default="Manufactura")
    contact_email = Column(String, nullable=True)
    
    # Gestión Energética
    monthly_budget_limit = Column(Float, default=50000.0)
    energy_cost_per_kwh = Column(Float, default=0.15) # Costo por kWh (USD/COP/etc)
    currency_code = Column(String, default="USD")     # USD, COP, EUR, etc.
    auto_optimize = Column(Boolean, default=True)
    
    # Notificaciones (Stored as booleans for MVP simplicity vs JSON)
    email_alerts = Column(Boolean, default=True)
    sms_alerts = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)
    critical_alerts = Column(Boolean, default=True)
    
    # Visualización
    dark_mode = Column(Boolean, default=False)
    show_co2 = Column(Boolean, default=True)
    
    # Gobernanza IA
    ai_autonomy_level = Column(Integer, default=2) # 1: Manual, 2: Semi-Auto, 3: Full-Auto
    peak_shaving_enabled = Column(Boolean, default=True)
    
    # Relationship
    user = relationship("User", backref="industrial_settings")
