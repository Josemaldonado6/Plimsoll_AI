import os
from ultralytics import YOLO

# --- DIAGNÓSTICO PROFUNDO PLIMSOLL AI ---
model_path = r'c:\Users\joseu\OneDrive\Desktop\Plimsoll_AI\backend\best_model_latest.pt'

print("---")
print("🔍 Iniciando Inspección de Metadatos...")
print(f"📄 Archivo: {os.path.basename(model_path)}")
print(f"⚖️  Tamaño: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
print("---")

if not os.path.exists(model_path):
    print("❌ ERROR: Archivo no encontrado.")
else:
    try:
        model = YOLO(model_path)
        
        print("\n🏷️  COLLECTION DE CLASES (Names):")
        print(model.names)
        
        print("\n🏗️  ARQUITECTURA (Info):")
        model.info()
        
        print("\n🚀 TEST DE INFERENCIA RÁPIDA (Conf 0.001):")
        # Usamos una imagen de muestra si existe o el primer frame de un video
        video_source = r'c:\Users\joseu\OneDrive\Desktop\Plimsoll_AI\backend\data\dc649322-6225-42c5-8fcc-38092ef7196a.mp4'
        results = model.predict(source=video_source, conf=0.001, imgsz=640, frames=1, verbose=False)
        
        if len(results[0].boxes) > 0:
            print(f"✅ ¡DETECTADO! Se encontraron {len(results[0].boxes)} objetos sospechosos (incluso a muy baja confianza).")
            for box in results[0].boxes[:5]:
                print(f"   - Clase: {model.names[int(box.cls)]} | Conf: {box.conf.item():.4f}")
        else:
            print("❌ CERO DETECCIONES: El modelo no reconoce nada en este frame, ni siquiera a nivel de ruido (0.001).")

    except Exception as e:
        print(f"❌ ERROR DURANTE LA INSPECCIÓN: {e}")

input("\nPresiona ENTER para terminar...")
