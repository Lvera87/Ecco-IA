"""Pydantic schemas for User model."""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, Any, List


# =====================
# Esquemas de Perfil (Para anidarlos en User)
# =====================

class ResidentialProfileRead(BaseModel):
    id: int
    city: Optional[str] = None
    stratum: Optional[int] = None
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

    model_config = ConfigDict(from_attributes=True)


class UserCreate(UserBase):
    password: str


class UserRead(UserBase):
    id: int
    # IMPORTANTÍSIMO: Agregamos los perfiles para que viajen al Frontend
    residential_profile: Optional[ResidentialProfileRead] = None
    industrial_settings: Optional[IndustrialSettingsRead] = None


class User(UserRead):
    pass