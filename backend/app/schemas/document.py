from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    content_type: str

class DocumentCreate(DocumentBase):
    file_path: str
    user_id: int

class DocumentRead(DocumentBase):
    id: int
    created_at: datetime
    # We generally don't expose file_path to frontend for security, but might need method to download
    
    class Config:
        from_attributes = True
