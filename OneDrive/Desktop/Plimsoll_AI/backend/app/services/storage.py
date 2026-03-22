import os
import boto3
import logging
from botocore.exceptions import NoCredentialsError
from botocore.config import Config
from typing import Optional

# Configure Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CloudStorage")

class CloudStorageService:
    """
    Handles asynchronous uploads to S3-compatible storage (Backblaze B2).
    As specified in DEPLOY_BIBLE.md, we use S3 for long-term video storage
    to keep the Bare Metal server disk light.
    """
    def __init__(self):
        self.endpoint_url = os.getenv("S3_ENDPOINT_URL")
        self.access_key = os.getenv("S3_ACCESS_KEY")
        self.secret_key = os.getenv("S3_SECRET_KEY")
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "plimsoll-audit-vault")
        
        # S3 client configuration for Backblaze B2
        self.s3 = None
        if all([self.endpoint_url, self.access_key, self.secret_key]):
            self.s3 = boto3.client(
                's3',
                endpoint_url=self.endpoint_url,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                config=Config(signature_version='s3v4')
            )
            logger.info(f"CloudStorageService initialized for bucket: {self.bucket_name}")
        else:
            logger.warning("CloudStorageService: Missing S3 credentials. Running in Local-Only mode.")

    async def upload_video(self, local_path: str, remote_filename: str) -> Optional[str]:
        """
        Uploads a video file to the cloud bucket.
        Returns the public/signed URL if successful.
        """
        if not self.s3:
            logger.error("CloudStorageService: S3 client not configured.")
            return None

        try:
            logger.info(f"Uploading {local_path} to {remote_filename}...")
            self.s3.upload_file(local_path, self.bucket_name, remote_filename)
            
            # Generate a public URL (assuming bucket policy allows read or using Cloudfront/B2 settings)
            url = f"{self.endpoint_url}/{self.bucket_name}/{remote_filename}"
            logger.info(f"Upload successful: {url}")
            return url
            
        except FileNotFoundError:
            logger.error(f"CloudStorageService: File {local_path} not found.")
        except NoCredentialsError:
            logger.error("CloudStorageService: Credentials not available.")
        except Exception as e:
            logger.error(f"CloudStorageService: Error during upload: {e}")
        
        return None

# Singleton Instance
cloud_storage = CloudStorageService()
