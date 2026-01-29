"""Pydantic schemas for User model."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, List
from app.schemas.gamification import GamificationProfileRead


# =====================
# Esquemas de Perfil (Para anidarlos en User)
# =====================

class ResidentialProfileRead(BaseModel):
    id: int
    city: Optional[str] = None
    stratum: Optional[int] = None
    occupants: Optional[int] = 1
    house_type: Optional[str] = "apartment"
    energy_source: Optional[str] = "grid"
    # Cambiamos a Any para que acepte el diccionario de la IA sin errores de validación
    history_kwh: Optional[Any] = None 
    average_kwh_captured: Optional[float] = None
    
    model_config = ConfigDict(from_attributes=True)

class IndustrialSettingsRead(BaseModel):
    id: int
    company_name: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# =====================
# Esquemas de Usuario
# =====================

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    user_type: Optional[str] = "residential"
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    username: Optional[str] = None
    # We could allow updating other fields here if needed


class UserRead(UserBase):
    id: int
    # IMPORTANTÍSIMO: Agregamos los perfiles para que viajen al Frontend
    residential_profile: Optional[ResidentialProfileRead] = None
    industrial_settings: Optional[IndustrialSettingsRead] = None
    
    gamification_profile: Optional[GamificationProfileRead] = None 

    # Note: We need to ensure GamificationProfileRead is available.
    # If circular import issues arise, we might need a ForwardRef or "if TYPE_CHECKING".
    # But since gamification.py doesn't import user.py, we should be fine adding the import at top.



class User(UserRead):
    pass