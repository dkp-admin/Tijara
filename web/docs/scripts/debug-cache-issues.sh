#!/bin/bash

echo "🔍 DEBUGGING CACHE ISSUES - COMPREHENSIVE CHECK"
echo "================================================"

echo ""
echo "1. 📋 PM2 Process Information:"
echo "------------------------------"
pm2 list
echo ""
pm2 show tijarah-web-production 2>/dev/null || echo "❌ tijarah-web-production not found"
echo ""

echo "2. 🌐 Environment Variables in Running Process:"
echo "-----------------------------------------------"
pm2 show tijarah-web-production | grep -A 20 "env:" 2>/dev/null || echo "❌ No environment info found"
echo ""

echo "3. 🔍 Check What's Actually Running on Port 3001:"
echo "-------------------------------------------------"
netstat -tulpn | grep 3001
echo ""
lsof -i :3001 2>/dev/null || echo "❌ No process on port 3001"
echo ""

echo "4. 📁 Check Current Working Directory of PM2 Process:"
echo "----------------------------------------------------"
pm2 show tijarah-web-production | grep "cwd" 2>/dev/null || echo "❌ No cwd info found"
echo ""

echo "5. 🧪 Test Environment in Current Directory:"
echo "--------------------------------------------"
if [ -f verify-production-env.js ]; then
    echo "✅ Found verify-production-env.js"
    node verify-production-env.js
else
    echo "❌ verify-production-env.js not found in current directory"
    echo "Current directory: $(pwd)"
    echo "Files in current directory:"
    ls -la
fi
echo ""

echo "6. 🔍 Check for Multiple Node Processes:"
echo "----------------------------------------"
ps aux | grep node | grep -v grep
echo ""

echo "7. 🌐 Test API Response from Server:"
echo "-----------------------------------"
echo "Testing localhost:3001..."
curl -s http://localhost:3001 | head -20 2>/dev/null || echo "❌ Cannot connect to localhost:3001"
echo ""

echo "8. 📝 Check Nginx Configuration:"
echo "--------------------------------"
nginx -t 2>/dev/null && echo "✅ Nginx config is valid" || echo "❌ Nginx config has issues"
echo ""

echo "9. 🔍 Check for Old Build Artifacts:"
echo "------------------------------------"
echo "Looking for .next directories..."
find /home -name ".next" -type d 2>/dev/null | head -5
echo ""

echo "10. 🧪 Test Environment Variables Directly:"
echo "-------------------------------------------"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
echo ""

echo "================================================"
echo "🔍 CACHE DEBUGGING COMPLETE"
echo "================================================"
