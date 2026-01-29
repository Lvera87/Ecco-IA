from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.services.gemini_service import gemini_service
import logging

router = APIRouter()
logger = logging.getLogger("app")

@router.post("/upload-bill")
async def upload_bill(file: UploadFile = File(...)):
    """
    Sube una factura (PDF/Imagen), la analiza con Gemini y devuelve los datos extraídos.
    """
    if not file.content_type in ["application/pdf", "image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and Images allowed.")
    
    try:
        content = await file.read()
        
        # Call AI Service
        result = await gemini_service.parse_energy_bill(content, file.content_type)
        
        if "error" in result:
             raise HTTPException(status_code=500, detail=result["error"])
             
        return result

    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
