import os
import cv2
from ultralytics import YOLO

# --- CONFIGURACIÓN DE AUDITORÍA PLIMSOLL AI ---
# 1. Asegúrate de haber descargado 'best_model_latest.pt' a la carpeta backend
model_path = r'c:\Users\joseu\OneDrive\Desktop\Plimsoll_AI\backend\best_model_latest.pt'

# 2. Prueba con un video REAL (cambiando el simulador por realidad)
video_source = r'c:\Users\joseu\OneDrive\Desktop\Plimsoll_AI\backend\data\dc649322-6225-42c5-8fcc-38092ef7196a.mp4'

print("---")
print(f"🕵️  Auditando 'Sovereign Intelligence v3'...")
print(f"📄 Video: {os.path.basename(video_source)}")
print("---")

import time
if not os.path.exists(model_path):
    print(f"❌ ERROR CRÍTICO: No se encontró el archivo de pesos en:\n{model_path}")
    print("\nPASOS A SEGUIR:")
    print("1. Ve a Google Drive: Plimsoll_AI / runs / Plimsoll_Sovereign / Audit_...")
    print("2. Descarga 'best_model_latest.pt'.")
    print(f"3. Colócalo en: {os.path.dirname(model_path)}")
else:
    print("\n👀 ¡Prepárate! La auditoría visual comienza en 5 segundos...")
    for i in range(5, 0, -1):
        print(f"{i}...")
        time.sleep(1)
    
    # Cargar el modelo entrenado en la A100
    try:
        model = YOLO(model_path)
        print(f"\n🏷️  Clases detectadas por el modelo: {model.names}")
        
        # Ejecutar predicción con visualización en tiempo real (3 ciclos)
        for i in range(3):
            print(f"--- Ciclo de Auditoría {i+1}/3 ---")
            results = model.predict(
                source=video_source, 
                show=True, 
                conf=0.01, 
                line_width=2,
                imgsz=640
            )
        
        print("\n✅ Auditoría Completada.")
        print("Si el modelo detecta los objetivos, ¡la destilación del Oráculo fue un éxito!")
        
    except Exception as e:
        print(f"❌ Error durante la auditoría: {e}")

input("\nPresiona ENTER para cerrar...")
