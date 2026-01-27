import sys
import os

# Ensure backend root is in path
sys.path.append(os.getcwd())

print("🔍 Verificando entorno e integración de IA...\n")

try:
    import onnxruntime
    print(f"✅ Librería ONNX Runtime detectada (v{onnxruntime.__version__})")
except ImportError:
    print("❌ ONNX Runtime NO está instalado.")

print("------------------------------------------------")

try:
    # Simulamos el boot de la aplicación
    from app.services.ia_service import ia
    
    print("⏳ Ejecutando ia.load_artifacts()...")
    ia.load_artifacts()
    
    print("\n📊 REPORTE FINAL DE AUDITORÍA:")
    print(f"➤ Estado del Servicio:   {'✅ LISTO' if ia.is_loaded else '❌ ERROR'}")
    print(f"➤ Motor de Inferencia:   {'🚀 DEEP LEARNING (ONNX)' if ia.using_dl else '🐢 LEGACY (Scikit-learn)'}")
    
    if ia.using_dl:
        print("\n🎉 ¡ÉXITO! El modelo de Deep Learning fue detectado y cargado.")
    else:
        print("\n⚠️ AVISO: El sistema está operativo pero usando el modelo ANTIGUO.")
        print("   Razón: No se encontró el archivo 'cerebro_deeplearning.onnx'")
        print(f"   Ruta esperada: {os.path.abspath('app/ML/Algoritmos/cerebro_deeplearning.onnx')}")

except Exception as e:
    print(f"\n❌ ERROR CRÍTICO DURANTE LA CARGA: {e}")
