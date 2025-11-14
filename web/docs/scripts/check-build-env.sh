#!/bin/bash

echo "🔍 CHECKING BUILD ENVIRONMENT VARIABLES"
echo "======================================="

echo ""
echo "1. 📁 Check if we're in the right directory:"
echo "--------------------------------------------"
pwd
ls -la | grep -E "(package\.json|\.next|\.env)"

echo ""
echo "2. 🔍 Check what's in the Next.js build:"
echo "----------------------------------------"
if [ -d .next ]; then
    echo "✅ .next directory exists"
    
    # Check if environment variables are baked into the build
    echo "Checking for environment variables in build files..."
    
    if [ -f .next/static/chunks/webpack-*.js ]; then
        echo "Checking webpack chunks for environment variables..."
        grep -r "NEXT_PUBLIC_APP_ENV" .next/static/chunks/ | head -3 || echo "No NEXT_PUBLIC_APP_ENV found in chunks"
        grep -r "qa\.vercel\.app" .next/static/chunks/ | head -3 || echo "No QA URLs found in chunks"
        grep -r "demo-app\.tijarah360\.com" .next/static/chunks/ | head -3 || echo "No demo-app URLs found in chunks"
    fi
    
    # Check build manifest
    if [ -f .next/build-manifest.json ]; then
        echo "Build manifest exists"
    fi
    
else
    echo "❌ .next directory NOT FOUND - Need to rebuild!"
fi

echo ""
echo "3. 🧪 Test environment loading in current shell:"
echo "------------------------------------------------"
export $(cat .env.production | grep -v '^#' | xargs) 2>/dev/null || echo "Could not load .env.production"
echo "Current shell environment:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"

echo ""
echo "4. 🔄 Force rebuild with production environment:"
echo "------------------------------------------------"
echo "Stopping any running processes..."
pkill -f "next start" 2>/dev/null
pkill -f "npm start" 2>/dev/null

echo "Removing old build..."
rm -rf .next

echo "Building with production environment..."
NODE_ENV=production \
NEXT_PUBLIC_APP_ENV=production \
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com \
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    
    echo ""
    echo "5. 🔍 Check new build for environment variables:"
    echo "------------------------------------------------"
    if [ -d .next/static/chunks ]; then
        echo "Checking new build for environment variables..."
        grep -r "demo-app\.tijarah360\.com" .next/static/chunks/ | head -3 && echo "✅ Found demo-app URLs in build" || echo "❌ No demo-app URLs found"
        grep -r "qa\.vercel\.app" .next/static/chunks/ | head -3 && echo "❌ Still found QA URLs in build!" || echo "✅ No QA URLs found"
    fi
    
    echo ""
    echo "6. 🚀 Start with production environment:"
    echo "---------------------------------------"
    NODE_ENV=production \
    NEXT_PUBLIC_APP_ENV=production \
    NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
    NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com \
    npm start &
    
    # Wait for startup
    sleep 5
    
    echo ""
    echo "7. 🧪 Test the running application:"
    echo "----------------------------------"
    curl -s http://localhost:3000/api/debug-env || echo "Could not reach debug endpoint"
    
else
    echo "❌ Build failed!"
fi

echo ""
echo "======================================="
echo "🔍 BUILD ENVIRONMENT CHECK COMPLETE"
echo "======================================="
