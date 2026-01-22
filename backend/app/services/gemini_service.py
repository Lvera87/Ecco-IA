from google import genai
from app.core.config import get_settings
import json
import logging

logger = logging.getLogger("app")

class GeminiService:
    def __init__(self):
        settings = get_settings()
        self.api_key = settings.gemini_api_key
        self.model_name = settings.gemini_model_name
        
        if self.api_key:
            # Nueva librería google-genai usa un cliente centralizado
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("Gemini API Key not found. AI features will be disabled.")

    async def get_dashboard_insights(self, plant_data: dict) -> dict:
        """
        Analiza los datos de la planta y devuelve insights para el dashboard.
        """
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = f"""
        Eres un experto Senior en Eficiencia Energética Industrial (ISO 50001) para la plataforma Ecco-IA.
        Analiza los datos técnicos de la planta y genera un informe de inteligencia en formato JSON.
        
        CONTEXTO TÉCNICO:
        {json.dumps(plant_data, indent=2)}
        
        REGLAS DE CÁLCULO:
        1. Waste Score: 0 si todo es perfecto (>95% eficiencia), 100 si hay pérdidas críticas. 
           Usa el 'total_waste_monthly_kwh' vs 'total_consumption_monthly_kwh'.
        2. Potential Savings: Calcula cuánto dinero se UNICAMENTE por mejorar la eficiencia de los activos (mínimo 20% del desperdicio actual).
           Usa 'energy_cost_per_kwh' ({plant_data['energy_cost_per_kwh']}) y la moneda ({plant_data['currency']}).
        3. Recommendation: Debe ser técnica y específica (ej. "Reemplazar Motor Bobinado por IE4", "Corregir fugas de aire").
        
        ESTRUCTURA DE RESPUESTA (JSON PURO):
        {{
            "waste_score": int,
            "top_waste_reason": "string",
            "potential_savings": "Simbolo Moneda + Monto",
            "recommendation_highlight": "string",
            "ai_interpretation": "Explicación breve de por qué hay desperdicio y qué impacto tiene en los costos."
        }}
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            text = response.text
            
            # Buscamos el primer '{' y el último '}' para extraer el JSON puro
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                clean_json = json_match.group(0)
                return json.loads(clean_json)
            
            logger.error(f"Fallo al extraer JSON de la respuesta de Gemini: {text}")
            return {"error": "Invalid AI response format"}
            
        except Exception as e:
            logger.error(f"Error calling Gemini: {e}")
            return {"error": str(e)}

    async def get_residential_insights(self, home_context: dict) -> dict:
        """
        Analiza los datos del hogar y devuelve insights y misiones gamificadas.
        """
        if not self.client:
            return {}

        prompt = f"""
        Eres un experto en Eficiencia Energética Residencial para la plataforma Ecco-IA.
        Analiza el contexto del hogar y genera un informe de ahorro en formato JSON.
        
        CONTEXTO DEL HOGAR:
        {json.dumps(home_context, indent=2)}
        
        FORMATO DE RESPUESTA (JSON PURO):
        {{
            "efficiency_score": int (0-100),
            "top_waste_reason": "string (ej. Aire acondicionado antiguo)",
            "ai_advice": "Breve explicación motivadora sobre cómo bajar la factura",
            "potential_savings_percent": int,
            "missions": [
                {{ "id": 1, "title": "Nombre corto", "xp": 100, "icon": "Nombre Lucide Icon" }}
            ]
        }}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {}
        except Exception as e:
            logger.error(f"Error calling Gemini Residential: {e}")
            return {}

gemini_service = GeminiService()
