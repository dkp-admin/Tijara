#!/bin/bash

echo "🚀 Starting Tijarah Web in Production Mode"
echo "=========================================="

# Load environment variables from .env.production
if [ -f .env.production ]; then
    echo "📄 Loading environment variables from .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.production file not found!"
    exit 1
fi

# Verify environment variables are set
echo ""
echo "🔍 Verifying environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
echo "NEXT_PUBLIC_PRODUCTION_API_URL: $NEXT_PUBLIC_PRODUCTION_API_URL"

# Validate required variables
if [ "$NODE_ENV" != "production" ] || [ "$NEXT_PUBLIC_APP_ENV" != "production" ]; then
    echo "❌ Error: Environment variables not set correctly!"
    exit 1
fi

echo "✅ Environment variables verified"

# Stop any existing process on port 3000
echo ""
echo "🛑 Stopping any existing process on port 3000..."
pkill -f "next start" 2>/dev/null || echo "No existing Next.js process found"
lsof -ti:3000 | xargs kill -9 2>/dev/null || echo "Port 3000 is free"

# Start the application with environment variables
echo ""
echo "🚀 Starting Next.js application..."
echo "Environment: $NEXT_PUBLIC_APP_ENV"
echo "Frontend URL: $NEXT_PUBLIC_FRONTEND_URL"
echo "API URL: Production backend"

# Start with explicit environment variables
NODE_ENV=production \
NEXT_PUBLIC_APP_ENV=production \
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com \
npm start

echo ""
echo "🎯 Application should now be running with production environment!"
echo "🌐 Access at: https://demo-app.tijarah360.com"
