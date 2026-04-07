import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv('backend/.env')

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("FATAL: Missing Supabase credentials")
    exit(1)

client: Client = create_client(url, key)

bucket_name = "reports"
try:
    buckets = client.storage.list_buckets()
    bucket_exists = any(b.name == bucket_name for b in buckets)
    
    if not bucket_exists:
        print(f"Bucket '{bucket_name}' not found. Attempting to create it...")
        # create_bucket typically requires public=True for a public bucket. 
        # Check python-supabase documentation for exact signature
        client.storage.create_bucket(bucket_name, {"public": True})
        print(f"Bucket '{bucket_name}' created successfully (PUBLIC).")
    else:
        print(f"Bucket '{bucket_name}' already exists.")
        
    print("TEST SUCCESSFUL: Storage Connection Validated using Service Role.")
except Exception as e:
    print(f"ERROR connecting to Storage: {e}")
