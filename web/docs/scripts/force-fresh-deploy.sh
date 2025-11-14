#!/bin/bash

echo "🚀 FORCE FRESH DEPLOYMENT WITH CACHE BUSTING"
echo "============================================="

# Get the deployment directory
DEPLOY_DIR="tijarah-web-deploy"

echo ""
echo "1. 🛑 Nuclear Cache Clear:"
echo "-------------------------"
chmod +x nuclear-cache-clear.sh
./nuclear-cache-clear.sh

echo ""
echo "2. 🧪 Verify Environment Before Start:"
echo "--------------------------------------"
cd $DEPLOY_DIR
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la

echo ""
echo "Environment verification:"
node verify-production-env.js

echo ""
echo "3. 🔧 Force Environment Variables:"
echo "----------------------------------"
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production
export NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
export NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com

echo "Forced environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"

echo ""
echo "4. 🔄 Fresh Install Dependencies:"
echo "---------------------------------"
rm -rf node_modules package-lock.json
npm install --production --no-cache

echo ""
echo "5. 🚀 Start with Explicit Environment:"
echo "--------------------------------------"
NODE_ENV=production NEXT_PUBLIC_APP_ENV=production NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com pm2 start ecosystem.production.config.js

echo ""
echo "6. 🔍 Verify Running Process:"
echo "-----------------------------"
sleep 3
pm2 list
pm2 logs tijarah-web-production --lines 10

echo ""
echo "7. 🧪 Test API Response:"
echo "-----------------------"
sleep 2
echo "Testing localhost:3001..."
curl -s http://localhost:3001 | head -10

echo ""
echo "8. 🌐 Add Cache-Busting Headers:"
echo "--------------------------------"
echo "Adding Nginx headers to prevent browser caching..."

cat > /tmp/nginx-cache-bust.conf << 'EOF'
# Add these to your Nginx server block for demo-app.tijarah360.com
location / {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    
    # Cache busting headers
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    add_header X-Environment "production";
    add_header X-Deployment-Time "$(date)";
}
EOF

echo "✅ Nginx cache-busting config created at /tmp/nginx-cache-bust.conf"
echo "📝 Apply this to your Nginx configuration and restart Nginx"

echo ""
echo "============================================="
echo "🚀 FORCE FRESH DEPLOYMENT COMPLETE"
echo "============================================="

echo ""
echo "🔍 FINAL VERIFICATION:"
echo "---------------------"
echo "PM2 Status:"
pm2 status
echo ""
echo "Environment in running process:"
pm2 show tijarah-web-production | grep -A 10 "env:"
echo ""
echo "🌐 Test the application now at: https://demo-app.tijarah360.com"
echo "🧹 Clear your browser cache (Ctrl+Shift+R) before testing"
