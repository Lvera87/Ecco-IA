import joblib
import numpy as np
import onnxruntime as ort
from pathlib import Path

# Calculamos la ruta absoluta dinámicamente
BASE_DIR = Path(__file__).resolve().parent.parent 
ARTIFACTS_DIR = BASE_DIR / "ML" / "Algoritmos"

class IAService:
    def __init__(self):
        self.model_residential = None  # sklearn .pkl
        self.model_industrial = None   # ONNX session
        self.sector_list = None
        self.sector_metadata = None
        self.is_loaded = False

    def load_artifacts(self):
        print(f"🧠 Buscando modelos en ruta absoluta: {ARTIFACTS_DIR}")
        
        if not ARTIFACTS_DIR.exists():
            raise FileNotFoundError(f"❌ No encuentro la carpeta de modelos en: {ARTIFACTS_DIR}")

        try:
            # Modelo residencial (sklearn .pkl)
            self.model_residential = joblib.load(ARTIFACTS_DIR / 'cerebro_desagregador.pkl')
            
            # Modelo industrial (ONNX optimizado - 7.5MB)
            onnx_path = str(ARTIFACTS_DIR / 'cerebro_industrial.onnx')
            self.model_industrial = ort.InferenceSession(onnx_path, providers=['CPUExecutionProvider'])
            
            # Metadatos de sectores
            self.sector_list = joblib.load(ARTIFACTS_DIR / 'lista_sectores.pkl')
            self.sector_metadata = joblib.load(ARTIFACTS_DIR / 'metadatos_sectores.pkl')
            
            self.is_loaded = True
            print("✅ Cerebros (Residencial + Industrial ONNX) y metadatos cargados correctamente.")
        except Exception as e:
            print(f"❌ Error fatal cargando modelos: {e}")
            raise e

    def predict(self, client_type: str, data: list):
        if not self.is_loaded:
            raise RuntimeError("El modelo no ha sido cargado aún. Revisa el inicio del servidor.")

        ctype = client_type.lower()

        if ctype == "residencial":
            result = self.model_residential.predict([data])[0]
        elif ctype == "industrial":
            # Inferencia ONNX
            input_name = self.model_industrial.get_inputs()[0].name
            input_data = np.array([data], dtype=np.float32)
            result = self.model_industrial.run(None, {input_name: input_data})[0][0]
        else:
            raise ValueError(f"Tipo de cliente '{client_type}' desconocido. Use 'residencial' o 'industrial'.")

        # Convertir resultado a tipo Python nativo
        if hasattr(result, "tolist"):
            return result.tolist()
        if hasattr(result, "item"):
            return result.item()
        return result

    def get_sector_info(self, sector_id):
        if self.sector_metadata is None:
            return "Metadatos no cargados"
        return self.sector_metadata.get(sector_id, "Desconocido")

# Instancia global lista para importar
ia = IAService()
