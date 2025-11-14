#!/bin/bash

# CORS Issues Checker for Tijarah Web
echo "🌐 Checking CORS Configuration and Issues"
echo "========================================"

# Configuration
FRONTEND_URL="https://demo-app.tijarah360.com"
API_URL="https://be-qa.tijarah360.com"
LOCAL_URL="http://localhost:3000"

echo "🔍 1. Checking current next.config.js CORS configuration..."
if grep -q "headers()" next.config.js; then
    echo "✅ CORS headers function found in next.config.js"
    grep -A 15 "headers()" next.config.js
else
    echo "❌ No CORS headers configuration found in next.config.js"
    echo "   This is likely the cause of CORS issues!"
fi

echo ""
echo "🔍 2. Checking middleware.ts CORS configuration..."
if [ -f "middleware.ts" ]; then
    echo "✅ middleware.ts found"
    grep -A 5 "Access-Control-Allow-Origin" middleware.ts || echo "❌ No CORS headers in middleware"
else
    echo "❌ middleware.ts not found"
fi

echo ""
echo "🔍 3. Checking API proxy route..."
if [ -f "src/pages/api/proxy/[...path].ts" ]; then
    echo "✅ API proxy route found"
    grep -A 5 "Access-Control-Allow-Origin" "src/pages/api/proxy/[...path].ts" || echo "❌ No CORS headers in proxy"
else
    echo "❌ API proxy route not found"
fi

echo ""
echo "🔍 4. Testing CORS with actual requests..."

# Test preflight request
echo "Testing preflight (OPTIONS) request..."
curl -s -I -X OPTIONS \
    -H "Origin: $LOCAL_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    "$FRONTEND_URL/api/health" 2>/dev/null | grep -i "access-control" || echo "❌ No CORS headers in preflight response"

echo ""
echo "Testing actual GET request..."
curl -s -I -X GET \
    -H "Origin: $LOCAL_URL" \
    "$FRONTEND_URL/api/health" 2>/dev/null | grep -i "access-control" || echo "❌ No CORS headers in GET response"

echo ""
echo "🔍 5. Testing API backend CORS..."
echo "Testing backend API CORS..."
curl -s -I -X OPTIONS \
    -H "Origin: $FRONTEND_URL" \
    -H "Access-Control-Request-Method: GET" \
    "$API_URL/health" 2>/dev/null | grep -i "access-control" || echo "❌ Backend API doesn't support CORS"

echo ""
echo "🔍 6. Browser console errors simulation..."
echo "Common CORS errors you might see:"
echo "❌ 'Access to fetch at ... has been blocked by CORS policy'"
echo "❌ 'No 'Access-Control-Allow-Origin' header is present'"
echo "❌ 'CORS policy: Cross origin requests are only supported for protocol schemes'"

echo ""
echo "🔧 7. CORS Configuration Recommendations..."

if ! grep -q "headers()" next.config.js; then
    echo ""
    echo "🚨 CRITICAL: Missing CORS headers in next.config.js"
    echo "Add this to your next.config.js:"
    echo ""
    cat << 'EOF'
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: process.env.NODE_ENV === 'production'
            ? 'https://demo-app.tijarah360.com,https://app.tijarah360.com'
            : '*'
        },
        { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ],
    },
  ];
},
EOF
fi

echo ""
echo "🔍 8. Environment-specific CORS issues..."
echo "Current environment variables:"
echo "NODE_ENV: ${NODE_ENV:-'not set'}"
echo "NEXT_PUBLIC_APP_ENV: ${NEXT_PUBLIC_APP_ENV:-'not set'}"
echo "NEXT_PUBLIC_FRONTEND_URL: ${NEXT_PUBLIC_FRONTEND_URL:-'not set'}"
echo "NEXT_PUBLIC_PRODUCTION_API_URL: ${NEXT_PUBLIC_PRODUCTION_API_URL:-'not set'}"

echo ""
echo "🔍 9. Quick CORS fixes..."
echo "For development:"
echo "1. Use API proxy: /api/proxy/your-endpoint"
echo "2. Disable browser security (Chrome): --disable-web-security --user-data-dir=/tmp/chrome-dev"
echo "3. Use CORS browser extension"

echo ""
echo "For production:"
echo "1. Configure backend API to allow your frontend domain"
echo "2. Add proper CORS headers in next.config.js"
echo "3. Use middleware.ts for complex CORS logic"

echo ""
echo "📋 CORS Check Complete!"
echo "If you see ❌ errors above, those need to be fixed for proper CORS functionality."
