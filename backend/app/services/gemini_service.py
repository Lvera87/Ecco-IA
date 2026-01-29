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
            import asyncio
            loop = asyncio.get_running_loop()
            
            def _call_gemini():
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
                
            response = await loop.run_in_executor(None, _call_gemini)

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

    async def get_chat_response(self, message: str, context: dict, profile_type: str = "residential") -> dict:
        """
        Maneja una conversación fluida con el usuario inyectando contexto técnico.
        """
        if not self.client:
            return {"response": "Lo siento, el servicio de IA no está configurado."}

        role_desc = "Residencial" if profile_type == "residential" else "Industrial"
        
        prompt = f"""
        Eres el asistente inteligente de Ecco-IA para el sector {role_desc}.
        Tu objetivo es ayudar al usuario a entender sus datos de energía y proponer ahorros.
        
        CONTEXTO ACTUAL DEL USUARIO:
        {json.dumps(context, indent=2)}
        
        MENSAJE DEL USUARIO:
        {message}
        
        INSTRUCCIONES:
        1. Sé profesional pero cercano.
        2. Si el usuario pregunta cosas técnicas, usa el contexto proporcionado (estrato, equipos, consumos).
        3. Si eres residencial, habla de 'vampiros energéticos' y electrodomésticos.
        4. Si eres industrial, habla de 'factor de carga', 'penalidades por reactiva' y 'ROI'.
        5. Responde en español.
        
        RESPUESTA (JSON):
        {{ "response": "tu respuesta aquí" }}
        """
        
        try:
            import asyncio
            loop = asyncio.get_running_loop()
            
            def _call_gemini_chat():
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt
                )
            
            logger.info("Chat: Sending request to Gemini...")
            response = await loop.run_in_executor(None, _call_gemini_chat)
            logger.info("Chat: Received response from Gemini")
            
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group(0))
            return {"response": response.text}

        except Exception as e:
            logger.error(f"Error in Gemini Chat: {e}")
            return {"response": "Tuve un pequeño corto circuito mental. ¿Podrías repetir la pregunta?"}

    async def parse_energy_bill(self, file_content: bytes, mime_type: str = "application/pdf") -> dict:
        """
        Analiza una factura de energía (PDF/Imagen) y extrae datos clave.
        """
        if not self.client:
            return {"error": "AI service not configured"}

        prompt = """
        Eres un experto auditor energético especializado en facturas de servicios públicos de Latinoamérica (Colombia/regional).
        Analiza esta imagen/PDF y extrae los datos clave con alta precisión.

        INSTRUCCIONES ESPECÍFICAS DE EXTRACCIÓN:
        
        1. **FECHAS (period_start, period_end):** 
           - Busca "Periodo Facturado", "Lectura Actual", "Lectura Anterior" o "Fecha de Emisión".
           - Si encuentras un rango (ej. "30 ENE - 28 FEB"), úsalo.
           - Si solo hay "Fecha de Emisión" o "Pague Hasta", asume que el periodo es el mes anterior a esa fecha.
           - Formato ISO 8601: YYYY-MM-DD.

        2. **CONSUMO (total_kwh):**
           - Busca el valor numérico asociado a "Consumo", "Total Consumo", "Diferencia" o "KWh".
           - Si hay lecturas, calcula: Lectura Actual - Lectura Anterior.
           - Si hay gráfico, toma el valor correspondiente a la barra más reciente.
           - Importante: Diferencia de "Consumo Reactiva" (kVArh) vs "Activa" (kWh). Queremos Activa.
           - Si no encuentras etiqueta, busca el número más grande cercano a "kWh" que sea razonable (ej. 50-1000).

        3. **COSTO (total_cost):**
           - Busca "Total a Pagar", "Valor Total", "Total Factura", "Neto a Pagar".
           - Si hay "Saldo Anterior", NO lo incluyas en este total si puedes separarlo. Si solo hay un gran total, úsalo.

        4. **ESTRATO (stratum):**
           - Busca "Estrato", "Clase de Uso" (Residencial/Comercial).
           - Devuelve un número entero (1-6). Si no es visible, null.

        5. **HISTORIAL CONSUMO (historical_consumption):**
           - Busca tablas o gráficas de barras. Si es gráfica, estima los valores de las barras.
           - Si es tabla, extrae cada fila.
           - Devuelve lista de objetos {date, kwh, cost}. Si cost no está, null.

        FORMATO DE RESPUESTA (JSON PURO):
        {
            "period_start": "YYYY-MM-DD",
            "period_end": "YYYY-MM-DD",
            "total_kwh": 123.45,
            "total_cost": 50000.00,
            "stratum": 3,
            "historical_consumption": [
                { "date": "YYYY-MM-DD", "kwh": 100.0, "cost": 45000.0 }
            ]
        }
        """
        
        try:
            from google import genai
            from google.genai import types
            import asyncio
            from functools import partial

            # Run blocking call in thread pool
            loop = asyncio.get_running_loop()
            
            def _call_gemini():
                # Configuración para forzar respuesta JSON
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
                
                # Simple retry logic for 503 Service Unavailable
                max_retries = 3
                base_delay = 2
                
                for attempt in range(max_retries):
                    try:
                        return self.client.models.generate_content(
                            model=self.model_name,
                            contents=[
                                types.Part.from_bytes(data=file_content, mime_type=mime_type),
                                prompt
                            ],
                            config=config
                        )
                    except Exception as e:
                        is_503 = "503" in str(e) or "overloaded" in str(e).lower()
                        if is_503 and attempt < max_retries - 1:
                            wait_time = base_delay * (2 ** attempt)
                            logger.warning(f"Gemini overloaded (503). Retrying in {wait_time}s... (Attempt {attempt + 1}/{max_retries})")
                            import time
                            time.sleep(wait_time)
                        else:
                            raise e

            logger.info(f"Bill Parsing: Sending file ({len(file_content)} bytes) to Gemini...")
            response = await loop.run_in_executor(None, _call_gemini)
            logger.info("Bill Parsing: Received response from Gemini")
            
            # Extract JSON
            import re
            # Limpiamos bloques de código markdown si el modelo los añade
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            
            try:
                logger.info("Bill Parsing: Successfully extracted JSON")
                return json.loads(clean_text)
            except json.JSONDecodeError:
                # Si falla el parseo directo, intentamos regex como respaldo
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if json_match:
                     return json.loads(json_match.group(0))
                
                logger.error(f"Bill Parsing: Failed to find JSON in response: {response.text[:200]}...")
                # Devolvemos el texto crudo en el error para poder depurar en el frontend
                return {"error": f"Could not parse JSON. Raw response: {response.text[:100]}..."}
            
        except Exception as e:
            logger.error(f"Error parsing bill: {e}")
            return {"error": f"Failed to parse bill: {str(e)}"}

    async def generate_daily_missions(self, user_context: str) -> list:
        """
        Genera misiones diarias personalizadas basadas en el contexto del usuario.
        """
        if not self.client:
            return []

        prompt = f"""
        Eres el Gamification Engine de Ecco-IA. Genera 3-4 misiones diarias (retos cortos)
        para un usuario con el siguiente contexto:
        {user_context}
        
        REGLAS:
        1. Las misiones deben ser accionables y verificables (abrir una app, bajar consumo, revisar algo).
        2. Incluye XP entre 50 y 150.
        3. Usa iconos de Lucide (Zap, Leaf, Lightbulb, Thermometer, etc).
        4. Category debe ser "ai_daily".
        
        FORMATO RESPUESTA (JSON LIST):
        [
            {{ "title": "Nombre corto", "description": "Instrucción clara", "xp_reward": 100, "icon": "Zap" }}
        ]
        """
        
        try:
            import asyncio
            from google import genai
            from google.genai import types
            
            loop = asyncio.get_running_loop()
            
            def _call():
                config = types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7
                )
                return self.client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config
                )
            
            response = await loop.run_in_executor(None, _call)
            import json
            import re
            
            # Extract JSON
            text = response.text.strip()
            # Remove markdown if present
            if text.startswith("```json"):
                text = text[7:]
            if text.endswith("```"):
                text = text[:-3]
                
            try:
                return json.loads(text)
            except:
                 # Fallback regex
                match = re.search(r'\[.*\]', response.text, re.DOTALL)
                if match:
                    return json.loads(match.group(0))
                return []
                
        except Exception as e:
            logger.error(f"Error generating missions: {e}")
            return []


gemini_service = GeminiService()
