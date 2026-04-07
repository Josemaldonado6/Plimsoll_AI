import os
import shutil

# --- CONFIGURACIÓN DE PURGA ---
drive_root = '/content/drive/MyDrive/Plimsoll_AI'
# Agrega aquí nombres o prefijos de videos que sepas que son IA/Unity
keywords_to_purge = ['synthetic', 'unity', 'render', 'ai_ship', 'test_video'] 

print("---")
print(f"🧹 Iniciando Purga de Datos en: {drive_root}")
print("---")

def decontaminate_drive():
    purged_count = 0
    for root, dirs, files in os.walk(drive_root):
        for file in files:
            # Si el archivo contiene alguna keyword de las prohibidas
            if any(key in file.lower() for key in keywords_to_purge):
                full_path = os.path.join(root, file)
                print(f"🗑️ Eliminando rastro de IA: {file}")
                # os.remove(full_path) # Descomentar para purga real
                purged_count += 1
    
    print(f"\n✅ Purga completada. Se identificaron {purged_count} archivos de contaminación.")

decontaminate_drive()
