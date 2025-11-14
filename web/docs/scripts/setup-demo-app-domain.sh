#!/bin/bash

echo "🌐 Setting up demo-app.tijarah360.com"
echo "====================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run with sudo: sudo ./setup-demo-app-domain.sh"
    exit 1
fi

echo ""
echo "1. 🔍 Checking current Nginx configuration:"
echo "-------------------------------------------"
echo "Current enabled sites:"
ls -la /etc/nginx/sites-enabled/ | grep -v "^total"

echo ""
echo "Current server names:"
nginx -T 2>/dev/null | grep server_name | head -5

echo ""
echo "2. 🌐 Testing DNS resolution:"
echo "----------------------------"
nslookup demo-app.tijarah360.com || echo "❌ DNS not configured yet"

echo ""
echo "3. 🔧 Creating Nginx configuration:"
echo "----------------------------------"

# Create the Nginx configuration
cat > /etc/nginx/sites-available/demo-app.tijarah360.com << 'EOF'
server {
    listen 80;
    server_name demo-app.tijarah360.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers for API calls
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
    }
    
    # Handle API routes specifically
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS for API
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;
        add_header Access-Control-Allow-Credentials "true" always;
        
        # Handle preflight requests
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin "*";
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With";
            add_header Access-Control-Max-Age 86400;
            return 204;
        }
    }
    
    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

echo "✅ Created /etc/nginx/sites-available/demo-app.tijarah360.com"

echo ""
echo "4. 🔗 Enabling the site:"
echo "-----------------------"
# Enable the site
ln -sf /etc/nginx/sites-available/demo-app.tijarah360.com /etc/nginx/sites-enabled/
echo "✅ Site enabled"

echo ""
echo "5. 🧪 Testing Nginx configuration:"
echo "---------------------------------"
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    
    echo ""
    echo "6. 🔄 Reloading Nginx:"
    echo "--------------------"
    systemctl reload nginx
    echo "✅ Nginx reloaded"
    
    echo ""
    echo "7. 🔍 Verification:"
    echo "-----------------"
    echo "Nginx status:"
    systemctl status nginx --no-pager -l
    
    echo ""
    echo "Listening ports:"
    netstat -tulpn | grep :80
    
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "🌐 Your domain demo-app.tijarah360.com should now be configured"
    echo "📝 Next steps:"
    echo "   1. Make sure your DNS points demo-app.tijarah360.com to this server"
    echo "   2. Start your Node.js app on port 3000"
    echo "   3. Test: curl -H 'Host: demo-app.tijarah360.com' http://localhost"
    echo "   4. Access: http://demo-app.tijarah360.com"
    
else
    echo "❌ Nginx configuration test failed!"
    echo "Please check the configuration manually"
fi

echo ""
echo "====================================="
echo "🌐 Domain setup complete"
echo "====================================="
