@echo off
echo ==========================================
echo      PLIMSOLL AI SETUP (Windows)
echo ==========================================

echo [1/2] Setting up Backend...
cd backend
if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
cd ..

echo [2/2] Setting up Frontend...
cd frontend
echo Installing Node dependencies...
call npm install
cd ..

echo ==========================================
echo      SETUP COMPLETE!
echo ==========================================
echo.
echo To start backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn app.main:app --reload
echo To start frontend: cd frontend ^&^& npm run dev
pause
