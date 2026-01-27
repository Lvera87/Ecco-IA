import joblib
import os
from pathlib import Path
import numpy as np
# Intentamos importar onnxruntime, si no está instalado no rompemos todo, pero avisamos.
try:
    import onnxruntime as ort
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False
    print("⚠️ 'onnxruntime' no está instalado. El soporte de Deep Learning estará deshabilitado.")

BASE_DIR = Path(__file__).resolve().parent.parent 
ARTIFACTS_DIR = BASE_DIR / "ML" / "Algoritmos"

class IAService:
    def __init__(self):
        # Modelos Legacy (Scikit-Learn / Joblib)
        self.model_residential = None
        self.model_industrial = None
        
        # Modelos Deep Learning (ONNX)
        self.dl_session = None
        self.using_dl = False
        
        # Metadatos
        self.sector_list = None
        self.sector_metadata = None
        self.is_loaded = False

    def load_artifacts(self):
        print(f"🧠 Buscando modelos en ruta absoluta: {ARTIFACTS_DIR}")
        
        if not ARTIFACTS_DIR.exists():
            raise FileNotFoundError(f"❌ No encuentro la carpeta de modelos en: {ARTIFACTS_DIR}")

        try:
            # 1. Cargar Metadatos (Siempre necesarios)
            self.sector_list = joblib.load(ARTIFACTS_DIR / 'lista_sectores.pkl')
            self.sector_metadata = joblib.load(ARTIFACTS_DIR / 'metadatos_sectores.pkl')
            
            # 2. Intentar cargar modelo de Deep Learning (Prioridad)
            dl_path = ARTIFACTS_DIR / 'cerebro_deeplearning.onnx'
            if ONNX_AVAILABLE and dl_path.exists():
                print(f"🚀 Detectado modelo Deep Learning en: {dl_path.name}")
                self.dl_session = ort.InferenceSession(str(dl_path))
                self.using_dl = True
                print("✅ Motor Deep Learning (ONNX) INICIADO.")
            else:
                print("ℹ️ No se detectó modelo .onnx o falta onnxruntime. Usando modo Legacy.")

            # 3. Cargar modelos Legacy (Backup o para Industrial)
            if not self.using_dl:
                self.model_residential = joblib.load(ARTIFACTS_DIR / 'cerebro_desagregador.pkl')
            
            self.model_industrial = joblib.load(ARTIFACTS_DIR / 'cerebro_industrial.pkl')
            
            self.is_loaded = True
            print("✅ Servicios de IA listos.")
            
        except Exception as e:
            print(f"❌ Error fatal cargando artefactos IA: {e}")
            raise e

    def predict(self, client_type: str, data: list):
        if not self.is_loaded:
            raise RuntimeError("El modelo no ha sido cargado aún. Revisa el inicio del servidor.")

        ctype = client_type.lower()

        # --- LÓGICA RESIDENCIAL ---
        if ctype == "residencial":
            if self.using_dl and self.dl_session:
                return self._predict_onnx(data)
            else:
                return self._predict_legacy_residential(data)
                
        # --- LÓGICA INDUSTRIAL ---
        elif ctype == "industrial":
            # Por ahora Industrial sigue en Legacy
            return self.model_industrial.predict([data])[0]
        else:
            raise ValueError(f"Tipo de cliente '{client_type}' desconocido. Use 'residencial' o 'industrial'.")

    def _predict_onnx(self, data: list):
        """Ejecuta inferencia en el modelo ONNX Deep Learning"""
        try:
            # ONNX requiere tensores numpy float32
            # Asumimos que el modelo espera un input de forma (1, N_features)
            input_name = self.dl_session.get_inputs()[0].name
            input_tensor = np.array([data], dtype=np.float32)
            
            # Run returns a list of outputs
            raw_result = self.dl_session.run(None, {input_name: input_tensor})[0]
            
            # Extraemos el primer resultado (batch size 1)
            result_row = raw_result[0]
            
            # Convertimos a lista de Python estándar para compatibilidad
            if isinstance(result_row, np.ndarray):
                return result_row.tolist()
            return result_row
            
        except Exception as e:
            print(f"❌ Error en inferencia ONNX: {e}")
            raise e

    def _predict_legacy_residential(self, data: list):
        """Ejecuta inferencia en el modelo Scikit-Learn antiguo"""
        res = self.model_residential.predict([data])[0]
        # Compatibilidad de tipos
        if hasattr(res, "tolist"):
            return res.tolist()
        return res

    def get_sector_info(self, sector_id):
        if self.sector_metadata is None:
            return "Metadatos no cargados"
        return self.sector_metadata.get(sector_id, "Desconocido")

# Instancia global lista para importar
ia = IAService()