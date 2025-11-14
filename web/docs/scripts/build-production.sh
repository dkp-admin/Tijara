#!/bin/bash

echo "🚀 Building Tijarah Web for Production (demo-app.tijarah360.com)"

# Load production environment variables
if [ -f .env.production ]; then
    echo "📄 Loading .env.production file..."
    # Read and export each line from .env.production
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! "$key" =~ ^#.* ]] && [[ -n "$key" ]]; then
            export "$key"="$value"
            echo "   ✅ Exported $key=$value"
        fi
    done < .env.production
    echo "✅ Environment variables loaded from .env.production"
else
    echo "⚠️  .env.production not found, setting variables manually..."
    export NODE_ENV=production
    export NEXT_PUBLIC_APP_ENV=production
    export NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
    export NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
fi

# Verify environment variables are set
echo "📋 Environment Variables:"
echo "  NODE_ENV: $NODE_ENV"
echo "  NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "  NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
echo "  NEXT_PUBLIC_PRODUCTION_API_URL: $NEXT_PUBLIC_PRODUCTION_API_URL"

# Validate required variables
if [ "$NODE_ENV" != "production" ] || [ "$NEXT_PUBLIC_APP_ENV" != "production" ]; then
    echo "❌ Error: Environment variables not set correctly!"
    echo "   NODE_ENV should be 'production', got: '$NODE_ENV'"
    echo "   NEXT_PUBLIC_APP_ENV should be 'production', got: '$NEXT_PUBLIC_APP_ENV'"
    exit 1
fi

echo "✅ Environment variables validated successfully!"
echo ""

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf tijarah-web-deploy
rm -f tijarah-web-*.zip

# Verify environment before building
echo "🔍 Verifying environment configuration..."
node verify-production-env.js

if [ $? -ne 0 ]; then
    echo "❌ Environment verification failed!"
    exit 1
fi

# Build the application
echo "🔨 Building Next.js application with production environment..."
echo "   Using NODE_ENV=$NODE_ENV"
echo "   Using NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV"

# Ensure environment variables are available during build
NODE_ENV=production NEXT_PUBLIC_APP_ENV=production NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"

# Create deployment directory
echo "📦 Creating deployment package..."
mkdir tijarah-web-deploy

# Copy essential files
cp -r .next tijarah-web-deploy/
cp package.json tijarah-web-deploy/
cp package-lock.json tijarah-web-deploy/
cp next.config.js tijarah-web-deploy/
cp -r public tijarah-web-deploy/
cp ecosystem.production.config.js tijarah-web-deploy/

# Copy environment files and verification script
if [ -f .env.production ]; then
    cp .env.production tijarah-web-deploy/
    echo "✅ Copied .env.production to deployment package"
fi

if [ -f verify-production-env.js ]; then
    cp verify-production-env.js tijarah-web-deploy/
    echo "✅ Copied environment verification script"
fi

# Create production environment file in deployment
cat > tijarah-web-deploy/.env.local << EOF
# Production Environment - Auto-generated
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
EOF

echo "✅ Created .env.local in deployment package"

# Create deployment package
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="tijarah-web-production-${TIMESTAMP}.zip"

zip -r "$PACKAGE_NAME" tijarah-web-deploy/

# Verify environment in built package
echo "🔍 Verifying environment in deployment package..."
if grep -q "NEXT_PUBLIC_APP_ENV=production" tijarah-web-deploy/.env.local; then
    echo "✅ Production environment confirmed in package"
else
    echo "❌ Warning: Production environment not found in package!"
fi

echo ""
echo "✅ Production build complete!"
echo "📦 Package: $PACKAGE_NAME"
echo "📊 Size: $(du -h $PACKAGE_NAME | cut -f1)"
echo ""
echo "🎯 Build Configuration:"
echo "   Environment: production"
echo "   Frontend URL: https://demo-app.tijarah360.com"
echo "   API Backend: https://be.tijarah360.com"
echo "   Port: 3001"
echo ""
echo "🚀 Ready for deployment to demo-app.tijarah360.com"
echo ""
echo "📋 Deployment Instructions:"
echo "1. Transfer to Ubuntu server: scp $PACKAGE_NAME user@server:/path/"
echo "2. Extract: unzip $PACKAGE_NAME"
echo "3. Install: cd tijarah-web-deploy && npm install --production"
echo "4. Start: pm2 start ecosystem.production.config.js"
echo "5. Configure Nginx to proxy port 3001 to demo-app.tijarah360.com"
echo ""
echo "🔧 Environment Variables in Package:"
echo "   .env.production (source)"
echo "   .env.local (runtime)"
echo "   ecosystem.production.config.js (PM2)"
