#!/bin/bash

echo "🔍 FINDING YOUR CURRENT NGINX CONFIGURATION"
echo "==========================================="

echo ""
echo "1. 📋 Current Nginx Status:"
echo "---------------------------"
systemctl status nginx --no-pager -l | head -10

echo ""
echo "2. 🔍 Active Server Blocks:"
echo "---------------------------"
echo "Current server_name configurations:"
sudo nginx -T 2>/dev/null | grep -A 2 -B 2 "server_name" | head -20

echo ""
echo "3. 📁 Nginx Configuration Files:"
echo "--------------------------------"
echo "Main config file:"
ls -la /etc/nginx/nginx.conf

echo ""
echo "Sites available:"
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "No sites-available directory"

echo ""
echo "Sites enabled:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "No sites-enabled directory"

echo ""
echo "4. 🔍 Looking for Existing Tijarah Config:"
echo "------------------------------------------"
echo "Searching for tijarah in nginx configs..."
sudo find /etc/nginx -type f -name "*.conf" -exec grep -l "tijarah\|3000\|proxy_pass" {} \; 2>/dev/null

echo ""
echo "5. 📄 Current Configuration Content:"
echo "-----------------------------------"

# Check main nginx.conf
echo "=== /etc/nginx/nginx.conf ==="
sudo cat /etc/nginx/nginx.conf | grep -A 10 -B 5 "server\|include"

echo ""
echo "=== Sites-enabled files ==="
for file in /etc/nginx/sites-enabled/*; do
    if [ -f "$file" ]; then
        echo "--- $file ---"
        sudo cat "$file" | head -20
        echo ""
    fi
done

echo ""
echo "6. 🌐 Current Listening Ports:"
echo "-----------------------------"
sudo netstat -tulpn | grep nginx
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

echo ""
echo "7. 🧪 Test Current Configuration:"
echo "--------------------------------"
echo "Testing nginx configuration:"
sudo nginx -t

echo ""
echo "8. 📝 RECOMMENDATIONS:"
echo "---------------------"

# Check if there's a default site
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "✅ Found default site - you can add demo-app.tijarah360.com here"
    echo "   Edit: sudo nano /etc/nginx/sites-enabled/default"
fi

# Check if there's a custom site
custom_sites=$(ls /etc/nginx/sites-enabled/ 2>/dev/null | grep -v default | head -1)
if [ ! -z "$custom_sites" ]; then
    echo "✅ Found custom site: $custom_sites"
    echo "   Edit: sudo nano /etc/nginx/sites-enabled/$custom_sites"
fi

# Check main config
if sudo grep -q "server {" /etc/nginx/nginx.conf 2>/dev/null; then
    echo "✅ Found server block in main config"
    echo "   Edit: sudo nano /etc/nginx/nginx.conf"
fi

echo ""
echo "==========================================="
echo "🔍 NGINX CONFIGURATION ANALYSIS COMPLETE"
echo "==========================================="
