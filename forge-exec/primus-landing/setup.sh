#!/bin/bash

echo "============================================"
echo "Primus Insights Landing Page - Setup"
echo "============================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download from: https://nodejs.org"
    exit 1
fi
echo "✓ Node.js found: $(node --version)"

echo ""
echo "[2/3] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed!"
    exit 1
fi
echo "✓ Dependencies installed"

echo ""
echo "[3/3] Starting development server..."
echo ""
echo "============================================"
echo "Landing page will open at:"
echo "http://localhost:3000"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
