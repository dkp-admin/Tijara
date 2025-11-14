#!/bin/bash

echo "🧪 Testing Build Environment Loading..."

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
    echo "❌ .env.production not found!"
    exit 1
fi

echo ""
echo "🔍 Verifying loaded environment variables:"
echo "   NODE_ENV: $NODE_ENV"
echo "   NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "   NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
echo "   NEXT_PUBLIC_PRODUCTION_API_URL: $NEXT_PUBLIC_PRODUCTION_API_URL"

echo ""
echo "✅ Environment test completed!"

# Test the verification script with loaded environment
echo ""
echo "🧪 Testing verification script with loaded environment..."
node verify-production-env.js
