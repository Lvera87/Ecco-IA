from typing import Optional, Literal, Any, Dict, List
from pydantic import BaseModel, EmailStr, Field

# =====================
# Esquemas de Perfil (Nuevos)
# =====================

class ResidentialProfileSchema(BaseModel):
    """Esquema para el perfil residencial que acepta el objeto de la IA."""
    id: int
    city: Optional[str] = None
    stratum: Optional[int] = None
    # Cambiamos List[float] por Any para aceptar el diccionario detallado de la IA
    history_kwh: Optional[Any] = None 

    class Config:
        from_attributes = True

class IndustrialSettingsSchema(BaseModel):
    """Esquema para el perfil industrial."""
    id: int
    company_name: Optional[str] = None

    class Config:
        from_attributes = True

# =====================
# Esquemas de Autenticación
# =====================

class LoginRequest(BaseModel):
    username: str
    password: str

class RegisterRequest(BaseModel):
    """Schema para registro de nuevo usuario con perfil."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2, max_length=120)
    user_type: Literal["residential", "industrial"]
    
    # Campos opcionales de perfil residencial
    city: Optional[str] = None
    stratum: Optional[int] = Field(None, ge=1, le=6)
    occupants: Optional[int] = Field(None, ge=1)
    house_type: Optional[str] = None
    
    # Campos opcionales de perfil industrial
    company_name: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_type: Optional[str] = None

class UserResponse(BaseModel):
    """Respuesta de usuario incluyendo sus perfiles relacionados."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    user_type: str
    # Agregamos las relaciones para que FastAPI sepa cómo serializarlas
    residential_profile: Optional[ResidentialProfileSchema] = None
    industrial_settings: Optional[IndustrialSettingsSchema] = None

    class Config:
        from_attributes = True