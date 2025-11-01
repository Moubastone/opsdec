#!/bin/bash

echo "🚀 OpsDec Setup Script"
echo "============================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env file exists
if [ ! -f backend/.env ]; then
    echo "⚙️  Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Edit backend/.env and configure your Emby server settings:"
    echo "   - EMBY_URL: Your Emby server URL"
    echo "   - EMBY_API_KEY: Your Emby API key"
    echo ""
else
    echo "✅ backend/.env already exists"
    echo ""
fi

# Create data directory
echo "📁 Creating data directory..."
mkdir -p backend/data
echo "✅ Data directory created"
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Emby server credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For production deployment, see README.md"
