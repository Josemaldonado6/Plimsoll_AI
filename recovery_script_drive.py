import os
from pathlib import Path
from ultralytics import YOLO

# --- CONFIGURACIÓN DEL BUSCADOR DE RESCATE ---
search_root = '/content/drive/MyDrive/Plimsoll_AI'
target_classes = ['draft_mark', 'waterline', 'hull_rust']

print("---")
print(f"🕵️  Iniciando Rastreo Profundo en: {search_root}")
print("---")

found_models = []

for root, dirs, files in os.walk(search_root):
    for file in files:
        if file.endswith(".pt"):
            full_path = os.path.join(root, file)
            try:
                # Carga rápida para ver metadatos
                model = YOLO(full_path)
                model_classes = list(model.names.values())
                
                # Verificar si es el modelo soberano
                is_sovereign = any(cls in model_classes for cls in target_classes)
                
                if is_sovereign:
                    m_time = os.path.getmtime(full_path)
                    import datetime
                    m_date = datetime.datetime.fromtimestamp(m_time).strftime('%Y-%m-%d %H:%M')
                    
                    print(f"✅ ¡ENCONTRADO!: {full_path}")
                    print(f"   📅 Fecha: {m_date} | 🏷️ Clases: {model_classes[:3]}...")
                    found_models.append(full_path)
                
            except Exception:
                continue

if not found_models:
    print("\n❌ No se encontraron archivos Soberanos. Verificando carpetas temporales de Ultralytics...")
    # Buscar en carpetas que Ultralytics crea por defecto
    default_runs = '/content/drive/MyDrive/Plimsoll_AI/runs'
    if os.path.exists(default_runs):
        print(f"📂 Contenido de {default_runs}: {os.listdir(default_runs)}")
else:
    print(f"\n🚀 Se encontraron {len(found_models)} archivos de inteligencia real.")
    print("RECOMENDACIÓN: Descarga el que tenga la fecha más reciente (Ciclo 8).")
