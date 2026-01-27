import numpy as np
import os
from sklearn.neural_network import MLPRegressor
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import joblib

# Rutas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "app", "ML", "Algoritmos")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "cerebro_deeplearning.onnx")

print("🧪 1. Creando Red Neuronal Artificial...")
# Simulamos una arquitectura de Deep Learning simple
# 9 Entradas -> [64 neuronas] -> [32 neuronas] -> 4 Salidas (Nevera, Clima, Entret, Cocina)
model = MLPRegressor(
    hidden_layer_sizes=(64, 32), 
    activation='relu', 
    solver='adam', 
    max_iter=500,
    random_state=42
)

# Datos Dummy para inicializar los pesos (No sirve para predecir real, solo para estructura)
# 9 Features: Estrato, Consumo, Personas, TVs, PCs, Lavadoras, Aire, Nevera, Inverter
X_dummy = np.random.rand(10, 9).astype(np.float32)
# 4 Targets: Refrig, Clima, Entret, Cocina
y_dummy = np.random.rand(10, 4).astype(np.float32)

print("💪 2. Entrenando estructura del modelo...")
model.fit(X_dummy, y_dummy)

print("📦 3. Convirtiendo a formato ONNX (Deep Learning Standar)...")
# Definimos el tipo de entrada: Un tensor de flotantes con 9 columnas
initial_type = [('float_input', FloatTensorType([None, 9]))]
onnx_model = convert_sklearn(model, initial_types=initial_type)

print(f"💾 4. Guardando en: {OUTPUT_PATH}")
with open(OUTPUT_PATH, "wb") as f:
    f.write(onnx_model.SerializeToString())

print("\n🎉 ¡ÉXITO! Cerebro de Deep Learning creado e instalado.")
