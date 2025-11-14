#!/bin/bash

echo "🌐 CORS Testing Suite - Tijarah Web"
echo "==================================="

# Configuration
PRODUCTION_URL="https://demo-app.tijarah360.com"
QA_URL="https://tijarah-qa.vercel.app"
LOCAL_URL="http://localhost:3000"
API_BACKEND="https://be.tijarah360.com"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo "ℹ️ $1"
}

# Function to test CORS preflight
test_cors_preflight() {
    local url=$1
    local origin=$2
    local description=$3
    
    print_info "Testing CORS preflight: $description"
    
    # Test preflight request
    response=$(curl -s -I -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        --max-time 10 \
        "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        # Check for CORS headers
        if echo "$response" | grep -qi "access-control-allow-origin"; then
            allow_origin=$(echo "$response" | grep -i "access-control-allow-origin" | cut -d: -f2- | tr -d '\r\n' | xargs)
            print_success "Preflight $description - Origin allowed: $allow_origin"
            return 0
        else
            print_error "Preflight $description - No CORS headers found"
            return 1
        fi
    else
        print_error "Preflight $description - Connection failed"
        return 1
    fi
}

# Function to test actual CORS request
test_cors_request() {
    local url=$1
    local origin=$2
    local description=$3
    
    print_info "Testing CORS request: $description"
    
    # Test actual request
    response=$(curl -s -I -X GET \
        -H "Origin: $origin" \
        -H "Content-Type: application/json" \
        --max-time 10 \
        "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        status_code=$(echo "$response" | head -n1 | cut -d' ' -f2)
        
        if [[ "$status_code" =~ ^[2-3][0-9][0-9]$ ]]; then
            print_success "Request $description - Status: $status_code"
            
            # Check for CORS headers in response
            if echo "$response" | grep -qi "access-control-allow-origin"; then
                print_success "Request $description - CORS headers present"
                return 0
            else
                print_warning "Request $description - No CORS headers in response"
                return 1
            fi
        else
            print_error "Request $description - HTTP $status_code"
            return 1
        fi
    else
        print_error "Request $description - Connection failed"
        return 1
    fi
}

# Function to test browser-like CORS
test_browser_cors() {
    local url=$1
    local origin=$2
    local description=$3
    
    print_info "Testing browser-like CORS: $description"
    
    # Simulate browser CORS check
    response=$(curl -s -X GET \
        -H "Origin: $origin" \
        -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
        -H "Accept: application/json" \
        -H "Referer: $origin" \
        --max-time 10 \
        "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        print_success "Browser-like $description - Request successful"
        return 0
    else
        print_error "Browser-like $description - Request failed"
        return 1
    fi
}

# Start CORS testing
echo "🕐 CORS testing started at: $(date)"

# Test domains and origins
DOMAINS=(
    "$PRODUCTION_URL"
    "$QA_URL"
    "$LOCAL_URL"
)

ORIGINS=(
    "$PRODUCTION_URL"
    "$QA_URL"
    "$LOCAL_URL"
)

API_ENDPOINTS=(
    "/api/health"
    "/api/auth/status"
)

# 1. Test Production Domain CORS
print_section "🚀 Production Domain CORS Tests"

for endpoint in "${API_ENDPOINTS[@]}"; do
    for origin in "${ORIGINS[@]}"; do
        test_cors_preflight "$PRODUCTION_URL$endpoint" "$origin" "Production$endpoint from $origin"
        test_cors_request "$PRODUCTION_URL$endpoint" "$origin" "Production$endpoint from $origin"
    done
done

# 2. Test Backend API CORS
print_section "🔌 Backend API CORS Tests"

backend_endpoints=("/health" "/api/auth/status")
for endpoint in "${backend_endpoints[@]}"; do
    for origin in "${ORIGINS[@]}"; do
        test_cors_preflight "$API_BACKEND$endpoint" "$origin" "Backend$endpoint from $origin"
        test_cors_request "$API_BACKEND$endpoint" "$origin" "Backend$endpoint from $origin"
    done
done

# 3. Test Local Development CORS
print_section "🏠 Local Development CORS Tests"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Local development server is running"
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        for origin in "${ORIGINS[@]}"; do
            test_cors_preflight "$LOCAL_URL$endpoint" "$origin" "Local$endpoint from $origin"
            test_cors_request "$LOCAL_URL$endpoint" "$origin" "Local$endpoint from $origin"
        done
    done
else
    print_warning "Local development server not running"
fi

# 4. Test Browser-like Requests
print_section "🌐 Browser-like CORS Tests"

# Test common browser scenarios
test_browser_cors "$PRODUCTION_URL/api/health" "$PRODUCTION_URL" "Same-origin request"
test_browser_cors "$API_BACKEND/health" "$PRODUCTION_URL" "Cross-origin to backend"
test_browser_cors "$PRODUCTION_URL/api/health" "$QA_URL" "Cross-origin from QA"

# 5. Test Specific CORS Headers
print_section "🔍 CORS Headers Analysis"

print_info "Analyzing CORS headers for production domain..."
headers=$(curl -s -I -X OPTIONS \
    -H "Origin: $PRODUCTION_URL" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    "$PRODUCTION_URL/api/health" 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "CORS Headers Found:"
    echo "$headers" | grep -i "access-control" || print_warning "No CORS headers found"
else
    print_error "Failed to retrieve CORS headers"
fi

# 6. Test Credentials Support
print_section "🔐 Credentials Support Tests"

print_info "Testing credentials support..."
response=$(curl -s -I -X OPTIONS \
    -H "Origin: $PRODUCTION_URL" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    "$PRODUCTION_URL/api/health" 2>/dev/null)

if echo "$response" | grep -qi "access-control-allow-credentials.*true"; then
    print_success "Credentials are supported"
else
    print_warning "Credentials support not found or disabled"
fi

# 7. Test Common CORS Issues
print_section "🚨 Common CORS Issues Check"

# Test for wildcard with credentials
print_info "Checking for wildcard origin with credentials (security issue)..."
response=$(curl -s -I -X OPTIONS \
    -H "Origin: $PRODUCTION_URL" \
    "$PRODUCTION_URL/api/health" 2>/dev/null)

if echo "$response" | grep -qi "access-control-allow-origin.*\*" && \
   echo "$response" | grep -qi "access-control-allow-credentials.*true"; then
    print_error "Security issue: Wildcard origin with credentials enabled"
else
    print_success "No wildcard + credentials security issue found"
fi

# Test for missing preflight handling
print_info "Testing preflight handling for complex requests..."
complex_response=$(curl -s -I -X OPTIONS \
    -H "Origin: $PRODUCTION_URL" \
    -H "Access-Control-Request-Method: PUT" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization,X-Custom-Header" \
    "$PRODUCTION_URL/api/health" 2>/dev/null)

if echo "$complex_response" | grep -qi "access-control-allow-methods.*PUT"; then
    print_success "Complex preflight requests are handled"
else
    print_warning "Complex preflight requests may not be properly handled"
fi

# 8. Generate CORS Report
print_section "📊 CORS Test Summary"

echo "CORS testing completed at: $(date)"
echo ""

# Count successful tests
total_tests=20  # Approximate number of tests
passed_tests=$(grep -c "✅" /tmp/cors_test_output 2>/dev/null || echo "0")

echo "📋 Test Results:"
echo "- Production domain CORS: $(curl -s -I -X OPTIONS -H "Origin: $PRODUCTION_URL" "$PRODUCTION_URL/api/health" 2>/dev/null | grep -qi "access-control-allow-origin" && echo "✅ Working" || echo "❌ Issues found")"
echo "- Backend API CORS: $(curl -s -I -X OPTIONS -H "Origin: $PRODUCTION_URL" "$API_BACKEND/health" 2>/dev/null | grep -qi "access-control-allow-origin" && echo "✅ Working" || echo "❌ Issues found")"
echo "- Local development CORS: $(curl -s http://localhost:3000 > /dev/null 2>&1 && echo "✅ Available" || echo "⚠️ Not running")"

echo ""
echo "🔧 Common CORS Fixes:"
echo "1. Backend: Add frontend domains to CORS allowed origins"
echo "2. Kubernetes: Update ingress CORS annotations"
echo "3. Development: Use proxy for API calls"
echo "4. Browser: Clear cache or use incognito mode"

echo ""
echo "📖 For detailed CORS configuration, see: docs/04-CORS-DOCUMENTATION.md"
