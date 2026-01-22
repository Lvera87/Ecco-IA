import google.generativeai as genai
from app.core.config import get_settings
import json
import logging

logger = logging.getLogger("app")

class GeminiService:
    def __init__(self):
        settings = get_settings()
        if settings.gemini_api_key:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model_name)
        else:
            self.model = None
            logger.warning("Gemini API Key not found. AI features will be disabled.")

    async def get_dashboard_insights(self, plant_data: dict) -> dict:
        """
        Analiza los datos de la planta y devuelve insights para el dashboard.
        Este es el corazón del 'Backend Líquido'.
        """
        if not self.model:
            return {"error": "AI service not configured"}

        prompt = f"""
        Eres un experto en eficiencia energética industrial para Ecco-IA.
        Analiza los siguientes datos de la planta y genera un JSON para el dashboard.
        
        Datos de la Planta:
        {json.dumps(plant_data, indent=2)}
        
        Debes devolver UNICAMENTE un objeto JSON con esta estructura:
        {{
            "waste_score": (0-100),
            "top_waste_reason": "breve descripcion",
            "potential_savings": "$ amount",
            "recommendation_highlight": "accion inmediata",
            "ai_interpretation": "texto narrativo para el dashboard"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Intentamos parsear la respuesta como JSON
            # Nota: En produccion usaremos JSON mode especifico de Gemini para mayor robustez
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            return {"error": "Failed to generate insights"}

gemini_service = GeminiService()
