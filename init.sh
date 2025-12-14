#!/bin/bash
# Initialize FraudShieldAI Development Environment

echo "🚀 Initializing FraudShieldAI..."

# Backend setup
echo ""
echo "📦 Setting up Backend..."
cd backend

# Create .env if doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env for backend"
fi

# Create virtual environment if doesn't exist
if [ ! -d venv ]; then
    python -m venv venv
    echo "✅ Created virtual environment"
fi

# Activate venv and install dependencies
source venv/bin/activate
pip install -r requirements.txt
echo "✅ Installed backend dependencies"

cd ..

# Frontend setup
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Create .env.local if doesn't exist
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "✅ Created .env.local for frontend"
fi

# Install dependencies
if [ ! -d node_modules ]; then
    pnpm install
    echo "✅ Installed frontend dependencies"
fi

cd ..

echo ""
echo "✨ Setup complete!"
echo ""
echo "📖 To start the development environment:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate  # On Windows: venv\\Scripts\\activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  pnpm dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
