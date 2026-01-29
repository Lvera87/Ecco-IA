from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class MissionBase(BaseModel):
    title: str
    description: Optional[str] = None
    xp_reward: int = 50
    point_reward: int = 10
    icon: Optional[str] = "Zap"
    category: str
    mission_type: str = "achievement"
    related_appliance_type: Optional[str] = None

class MissionRead(MissionBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserMissionRead(BaseModel):
    id: int
    status: str
    progress: float
    completed_at: Optional[datetime] = None
    mission: MissionRead
    
    model_config = ConfigDict(from_attributes=True)

class GamificationProfileRead(BaseModel):
    total_xp: int
    current_level: int
    eco_points: int
    streak: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class UserGamificationStats(BaseModel):
    profile: GamificationProfileRead
    active_missions: List[UserMissionRead]
    completed_count: int
    next_level_xp: int # XP necesario para el siguiente nivel

class MissionCompletionResponse(BaseModel):
    mission_result: UserMissionRead
    new_stats: UserGamificationStats
