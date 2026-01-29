from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class GamificationProfile(Base):
    """
    Perfil de gamificación del usuario.
    Almacena el progreso, nivel y moneda virtual (EcoPoints).
    """
    __tablename__ = "gamification_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True)
    total_xp = Column(Integer, default=0)
    current_level = Column(Integer, default=1)
    eco_points = Column(Integer, default=0) # Moneda para canjear por beneficios reales
    streak = Column(Integer, default=0) # Días de racha
    
    # Timestamps
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relaciones
    user = relationship("User", back_populates="gamification_profile")

class Mission(Base):
    """
    Definición de misiones disponibles en el sistema.
    Pueden ser de tipo 'fijo' o 'dinámico' (IA).
    """
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(String(255))
    xp_reward = Column(Integer, default=50)
    point_reward = Column(Integer, default=10)
    icon = Column(String(50)) # Lucide icon name
    category = Column(String(50)) # residential, industrial, global
    mission_type = Column(String(50), default="achievement") # survey, calculation, action
    related_appliance_type = Column(String(50), nullable=True) # e.g. "fridge", "ac", "washing_machine"

class UserMission(Base):
    """
    Seguimiento de misiones aceptadas o completadas por el usuario.
    """
    __tablename__ = "user_missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mission_id = Column(Integer, ForeignKey("missions.id", ondelete="CASCADE"))
    status = Column(String(20), default="pending") # pending, completed, claimed
    progress = Column(Float, default=0.0) # 0.0 to 1.0
    
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    mission = relationship("Mission")
