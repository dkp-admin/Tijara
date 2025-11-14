#!/bin/bash

echo "🔍 DEBUGGING ENVIRONMENT ISSUES"
echo "==============================="

echo ""
echo "1. 📁 Current Directory and Files:"
echo "----------------------------------"
pwd
ls -la | grep -E "\.(env|js|json)$"

echo ""
echo "2. 📄 Check .env.production content:"
echo "-----------------------------------"
if [ -f .env.production ]; then
    echo "✅ .env.production exists"
    cat .env.production
else
    echo "❌ .env.production NOT FOUND"
fi

echo ""
echo "3. 📄 Check .env.local content:"
echo "------------------------------"
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    cat .env.local
else
    echo "❌ .env.local NOT FOUND"
fi

echo ""
echo "4. 🔍 Check what's currently running:"
echo "------------------------------------"
ps aux | grep -E "(node|next|npm)" | grep -v grep

echo ""
echo "5. 🌐 Check port 3000:"
echo "---------------------"
netstat -tulpn | grep 3000 || echo "Nothing running on port 3000"

echo ""
echo "6. 🧪 Test environment loading:"
echo "------------------------------"
if [ -f .env.production ]; then
    echo "Loading .env.production..."
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "NODE_ENV: $NODE_ENV"
    echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
    echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
else
    echo "Cannot test - .env.production not found"
fi

echo ""
echo "7. 📦 Check package.json scripts:"
echo "--------------------------------"
if [ -f package.json ]; then
    echo "Available scripts:"
    grep -A 10 '"scripts"' package.json
else
    echo "❌ package.json NOT FOUND"
fi

echo ""
echo "8. 🔍 Check Next.js build:"
echo "-------------------------"
if [ -d .next ]; then
    echo "✅ .next directory exists"
    ls -la .next/ | head -5
else
    echo "❌ .next directory NOT FOUND - Need to run 'npm run build'"
fi

echo ""
echo "9. 🧪 Test direct environment start:"
echo "-----------------------------------"
echo "Testing if we can start with explicit environment..."

# Kill any existing processes
pkill -f "next start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

# Wait a moment
sleep 2

echo "Starting with explicit environment variables..."
NODE_ENV=production \
NEXT_PUBLIC_APP_ENV=production \
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com \
timeout 10s npm start &

# Wait for startup
sleep 5

echo ""
echo "10. 🔍 Check if it started:"
echo "--------------------------"
ps aux | grep -E "(node|next)" | grep -v grep
netstat -tulpn | grep 3000

echo ""
echo "11. 🧪 Test API response:"
echo "------------------------"
curl -s http://localhost:3000 | head -20 || echo "Cannot connect to localhost:3000"

echo ""
echo "==============================="
echo "🔍 DEBUGGING COMPLETE"
echo "==============================="
