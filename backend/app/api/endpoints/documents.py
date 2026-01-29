from typing import List, Any
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_async_session
from app.api import deps
from app.models.user import User as UserModel
from app.models.document import Document as DocumentModel
from app.schemas.document import DocumentRead, DocumentCreate
from app.core.security import get_current_user

router = APIRouter(tags=["documents"])

UPLOAD_DIR = "backend/uploads"

@router.post("/upload", response_model=DocumentRead)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_async_session),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    """
    Upload a PDF document and save it to the server.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")
    
    # Ensure directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Simple filename sanitization or unique naming could be better, 
    # but for now we prepend timestamp to avoid collisions
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    clean_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, clean_filename)
    
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")
        
    doc_in = DocumentCreate(
        filename=file.filename,
        file_path=file_path,
        content_type=file.content_type,
        user_id=current_user.id
    )
    
    doc_db = DocumentModel(
        filename=doc_in.filename,
        file_path=doc_in.file_path,
        content_type=doc_in.content_type,
        user_id=doc_in.user_id
    )
    
    db.add(doc_db)
    await db.commit()
    await db.refresh(doc_db)
    
    return doc_db

@router.get("/", response_model=List[DocumentRead])
async def list_documents(
    db: AsyncSession = Depends(get_async_session),
    current_user: UserModel = Depends(get_current_user)
) -> Any:
    """
    List all documents uploaded by the current user.
    """
    result = await db.execute(select(DocumentModel).where(DocumentModel.user_id == current_user.id))
    docs = result.scalars().all()
    return docs
