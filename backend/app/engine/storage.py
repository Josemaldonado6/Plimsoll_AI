# -----------------------------------------------------------------------------
# PROYECTO: PLIMSOLL AI - MARITIME AUDIT SYSTEM
# ARCHIVO: storage.py
#
# DERECHOS DE AUTOR / COPYRIGHT:
# (c) 2026 José de Jesús Maldonado Ordaz. Todos los derechos reservados.
#
# UTILIDAD:
# Gestor de Sincronización Edge-to-Cloud (Supabase Storage) para asegurar
# que los reportes generados en el dispositivo local (Intel NPU) estén
# disponibles instantáneamente a nivel mundial en el dashboard de Vercel.
# -----------------------------------------------------------------------------
import os
import uuid
import logging
from supabase import create_client, Client

logger = logging.getLogger("Plimsoll-Storage")

class SupabaseStorage:
    def __init__(self):
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Service Role Key required for backend bypass
        self.bucket_name = "reports"
        
        self.client: Client = None
        if self.url and self.key:
            try:
                self.client = create_client(self.url, self.key)
                logger.info("Supabase Storage Client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
        else:
            logger.warning("SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. Storage operates in Local-Only Fallback Mode.")

    def upload_pdf(self, local_pdf_path: str, content_type: str = "application/pdf") -> str:
        """
        Uploads a generated PDF from the Edge Server to the Cloud Storage.
        Returns the public URL of the uploaded file.
        """
        if not self.client:
            logger.warning(f"[Storage Fallback] Cloud upload disabled. File remained local at: {local_pdf_path}")
            return local_pdf_path

        if not os.path.exists(local_pdf_path):
            raise FileNotFoundError(f"PDF missing at {local_pdf_path}. Cannot sync to cloud.")

        # Generate a secure cloud identifier
        cloud_filename = f"{uuid.uuid4()}_{os.path.basename(local_pdf_path)}"
        
        try:
            logger.info(f"Syncing {cloud_filename} to Cloud (reports bucket)...")
            with open(local_pdf_path, 'rb') as f:
                res = self.client.storage.from_(self.bucket_name).upload(
                    file=f,
                    path=cloud_filename,
                    file_options={"content-type": content_type}
                )
            
            # Fetch the public URL after successful upload
            public_url = self.client.storage.from_(self.bucket_name).get_public_url(cloud_filename)
            logger.info(f"Cloud Sync Complete: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Cloud Sync Failed: {e}")
            # If network fails, return the local file as fallback 
            return local_pdf_path

storage = SupabaseStorage()
