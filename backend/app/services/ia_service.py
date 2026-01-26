import joblib
import os
from pathlib import Path  # <-- Importante para rutas robustas

# 1. Calculamos la ruta absoluta dinámicamente
# __file__ = este archivo (ia_service.py)
# .parent  = carpeta 'services'
# .parent.parent = carpeta 'app'
BASE_DIR = Path(__file__).resolve().parent.parent 
ARTIFACTS_DIR = BASE_DIR / "ML" / "Algoritmos"

class IAService:
    def __init__(self):
        self.model_residential = None
        self.model_industrial = None
        self.sector_list = None
        self.sector_metadata = None
        self.is_loaded = False

    def load_artifacts(self):
        print(f"🧠 Buscando modelos en ruta absoluta: {ARTIFACTS_DIR}")
        
        # Verificamos que la carpeta exista para evitar errores confusos
        if not ARTIFACTS_DIR.exists():
            raise FileNotFoundError(f"❌ No encuentro la carpeta de modelos en: {ARTIFACTS_DIR}")

        try:
            # Pathlib permite unir rutas con '/' como si fuera una URL
            self.model_residential = joblib.load(ARTIFACTS_DIR / 'cerebro_desagregador.pkl')
            self.model_industrial = joblib.load(ARTIFACTS_DIR / 'cerebro_industrial.pkl')
            self.sector_list = joblib.load(ARTIFACTS_DIR / 'lista_sectores.pkl')
            self.sector_metadata = joblib.load(ARTIFACTS_DIR / 'metadatos_sectores.pkl')
            
            self.is_loaded = True
            print("✅ Cerebros y metadatos cargados correctamente.")
        except Exception as e:
            print(f"❌ Error fatal cargando .pkl: {e}")
            raise e

    def predict(self, client_type: str, data: list):
        if not self.is_loaded:
            raise RuntimeError("El modelo no ha sido cargado aún. Revisa el inicio del servidor.")

        # Normalizamos a minúsculas para evitar errores por "Residencial" vs "residencial"
        ctype = client_type.lower()

        if ctype == "residencial":
            # El [0] es porque predict devuelve una lista [resultado]
            return self.model_residential.predict([data])[0]
        elif ctype == "industrial":
            return self.model_industrial.predict([data])[0]
        else:
            raise ValueError(f"Tipo de cliente '{client_type}' desconocido. Use 'residencial' o 'industrial'.")

    def get_sector_info(self, sector_id):
        if self.sector_metadata is None:
            return "Metadatos no cargados"
        return self.sector_metadata.get(sector_id, "Desconocido")

# Instancia global lista para importar
ia = IAService()

def predict(self, client_type: str, data: list):
        if not self.is_loaded:
            raise RuntimeError("El modelo no ha sido cargado aún.")

        ctype = client_type.lower()
        result = None

        # 1. Obtenemos la predicción cruda (formato NumPy)
        if ctype == "residencial":
            result = self.model_residential.predict([data])[0]
        elif ctype == "industrial":
            result = self.model_industrial.predict([data])[0]
        else:
            raise ValueError(f"Tipo de cliente '{client_type}' desconocido.")

        # 2. --- EL FIX MÁGICO ---
        # Si el resultado es un array de NumPy o un tipo numérico raro, lo convertimos
        if hasattr(result, "tolist"):
            return result.tolist()  # Convierte array([3]) -> [3] o 3
        
        # Si es un número numpy (float32, int64), lo forzamos a python nativo
        if hasattr(result, "item"):
             return result.item()

        return result