@echo off
REM Initialize FraudShieldAI Development Environment

echo.
echo 🚀 Initializing FraudShieldAI...
echo.

REM Backend setup
echo 📦 Setting up Backend...
cd backend

REM Create .env if doesn't exist
if not exist .env (
    copy .env.example .env
    echo ✅ Created .env for backend
)

REM Create virtual environment if doesn't exist
if not exist venv (
    python -m venv venv
    echo ✅ Created virtual environment
)

REM Activate venv and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✅ Installed backend dependencies

cd ..

REM Frontend setup
echo.
echo 📦 Setting up Frontend...
cd frontend

REM Create .env.local if doesn't exist
if not exist .env.local (
    copy .env.local.example .env.local
    echo ✅ Created .env.local for frontend
)

REM Install dependencies
if not exist node_modules (
    pnpm install
    echo ✅ Installed frontend dependencies
)

cd ..

echo.
echo ✨ Setup complete!
echo.
echo 📖 To start the development environment:
echo.
echo Backend (Terminal 1):
echo   cd backend
echo   venv\Scripts\activate
echo   uvicorn app.main:app --reload
echo.
echo Frontend (Terminal 2):
echo   cd frontend
echo   pnpm dev
echo.
echo Then open http://localhost:3000 in your browser
echo.
pause
