#!/bin/bash

echo "💥 NUCLEAR CACHE CLEARING - CLEARING ALL POSSIBLE CACHES"
echo "========================================================="

echo ""
echo "1. 🛑 Stopping All Node/PM2 Processes:"
echo "--------------------------------------"
pm2 stop all
pm2 delete all
pkill -f node 2>/dev/null || echo "No additional node processes found"
echo "✅ All processes stopped"

echo ""
echo "2. 🧹 Clearing PM2 Cache:"
echo "-------------------------"
pm2 flush
rm -rf ~/.pm2/logs/*
rm -rf ~/.pm2/pids/*
echo "✅ PM2 cache cleared"

echo ""
echo "3. 🧹 Clearing Node.js Cache:"
echo "-----------------------------"
npm cache clean --force 2>/dev/null || echo "npm cache already clean"
echo "✅ Node.js cache cleared"

echo ""
echo "4. 🧹 Clearing Next.js Build Cache:"
echo "-----------------------------------"
if [ -d ".next" ]; then
    rm -rf .next
    echo "✅ Removed .next directory"
else
    echo "ℹ️  No .next directory found"
fi

if [ -d "node_modules/.cache" ]; then
    rm -rf node_modules/.cache
    echo "✅ Removed node_modules/.cache"
else
    echo "ℹ️  No node_modules/.cache found"
fi

echo ""
echo "5. 🧹 Clearing System DNS Cache:"
echo "--------------------------------"
sudo systemctl flush-dns 2>/dev/null || echo "DNS flush not available"
sudo systemctl restart systemd-resolved 2>/dev/null || echo "systemd-resolved restart not available"
echo "✅ DNS cache cleared (if available)"

echo ""
echo "6. 🧹 Clearing Browser Cache Headers:"
echo "-------------------------------------"
# This will be handled by Nginx headers
echo "ℹ️  Browser cache will be cleared by response headers"

echo ""
echo "7. 🔄 Restarting Nginx:"
echo "-----------------------"
sudo systemctl restart nginx 2>/dev/null && echo "✅ Nginx restarted" || echo "❌ Cannot restart Nginx (check permissions)"

echo ""
echo "8. 🧹 Clearing Temporary Files:"
echo "-------------------------------"
rm -rf /tmp/next-* 2>/dev/null || echo "No Next.js temp files found"
rm -rf /tmp/npm-* 2>/dev/null || echo "No npm temp files found"
echo "✅ Temporary files cleared"

echo ""
echo "9. 🔍 Verifying Clean State:"
echo "----------------------------"
echo "PM2 processes:"
pm2 list
echo ""
echo "Node processes:"
ps aux | grep node | grep -v grep || echo "No node processes running"
echo ""
echo "Port 3001 usage:"
netstat -tulpn | grep 3001 || echo "Port 3001 is free"

echo ""
echo "========================================================="
echo "💥 NUCLEAR CACHE CLEARING COMPLETE"
echo "🚀 Ready for fresh deployment"
echo "========================================================="
