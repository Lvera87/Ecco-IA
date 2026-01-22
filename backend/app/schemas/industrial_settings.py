from typing import Optional
from pydantic import BaseModel

class IndustrialSettingsBase(BaseModel):
    company_name: str = "Mi Planta Industrial"
    industry_sector: str = "Manufactura"
    contact_email: Optional[str] = None
    monthly_budget_limit: float = 50000.0
    energy_cost_per_kwh: float = 0.15
    currency_code: str = "USD"
    auto_optimize: bool = True
    email_alerts: bool = True
    sms_alerts: bool = False
    push_notifications: bool = True
    critical_alerts: bool = True
    dark_mode: bool = False
    show_co2: bool = True
    ai_autonomy_level: int = 2
    peak_shaving_enabled: bool = True

class IndustrialSettingsCreate(IndustrialSettingsBase):
    pass

class IndustrialSettingsUpdate(IndustrialSettingsBase):
    pass

class IndustrialSettings(IndustrialSettingsBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
