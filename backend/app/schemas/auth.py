from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field

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
    id: int
    username: str
    email: str
    full_name: Optional[str]
    user_type: str
