import sys
import os

print(f"Current Working Directory: {os.getcwd()}")
print(f"Python Executable: {sys.executable}")
print(f"System Path: {sys.path}")

try:
    import app
    print(f"SUCCESS: 'app' module found at {app.__file__}")
    from app.db.models import Survey
    print("SUCCESS: 'Survey' model imported correctly.")
except ImportError as e:
    print(f"FAILURE: {e}")
except Exception as e:
    print(f"ERROR: {e}")
