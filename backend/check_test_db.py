import sqlalchemy
from app.db.database import Base
from app.db.models import Survey

def check_schema():
    sync_engine = sqlalchemy.create_engine("sqlite:///./test_plimsoll.db")
    inspector = sqlalchemy.inspect(sync_engine)
    tables = inspector.get_table_names()
    print(f"Tables found: {tables}")
    
    if "surveys" in tables:
        print("SUCCESS: 'surveys' table exists.")
    else:
        print("FAILURE: 'surveys' table missing.")

if __name__ == "__main__":
    check_schema()
