#!/bin/bash

echo "🏥 Tijarah Web Health Check"
echo "=========================="

# Configuration
PRODUCTION_URL="https://demo-app.tijarah360.com"
LOCAL_URL="http://localhost:3000"
API_BACKEND="https://be.tijarah360.com"
NAMESPACE="tijarah-web"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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
    echo -e "ℹ️ $1"
}

# Function to test HTTP endpoint
test_endpoint() {
    local url=$1
    local description=$2
    local expected_status=${3:-200}
    
    print_info "Testing: $description"
    
    # Test with timeout
    response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}" --max-time 10 "$url" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        status_code=$(echo $response | cut -d: -f1)
        response_time=$(echo $response | cut -d: -f2)
        
        if [ "$status_code" = "$expected_status" ]; then
            print_success "$description (${status_code}, ${response_time}s)"
            return 0
        else
            print_error "$description (Expected: $expected_status, Got: $status_code)"
            return 1
        fi
    else
        print_error "$description (Connection failed)"
        return 1
    fi
}

# Function to test CORS
test_cors() {
    local url=$1
    local origin=$2
    local description=$3
    
    print_info "Testing CORS: $description"
    
    # Test preflight request
    response=$(curl -s -I -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        --max-time 10 \
        "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
        print_success "CORS $description"
        return 0
    else
        print_error "CORS $description"
        return 1
    fi
}

# Start health check
echo "🕐 Health check started at: $(date)"
echo ""

# 1. Local application health
echo "🏠 Local Application Health:"
echo "----------------------------"

if pgrep -f "node.*next" > /dev/null; then
    print_success "Node.js process running"
    
    # Test local endpoints
    test_endpoint "$LOCAL_URL" "Local application"
    test_endpoint "$LOCAL_URL/api/health" "Local health API"
    
    # Check port
    if netstat -tulpn | grep -q ":3000"; then
        print_success "Port 3000 is listening"
    else
        print_error "Port 3000 is not listening"
    fi
else
    print_error "Node.js process not running"
fi

echo ""

# 2. Production application health
echo "🌐 Production Application Health:"
echo "---------------------------------"

test_endpoint "$PRODUCTION_URL" "Production application"
test_endpoint "$PRODUCTION_URL/api/health" "Production health API"

# Test static assets
test_endpoint "$PRODUCTION_URL/favicon.png" "Static assets"

echo ""

# 3. Backend API health
echo "🔌 Backend API Health:"
echo "---------------------"

test_endpoint "$API_BACKEND/health" "Backend health API" "200"

echo ""

# 4. CORS testing
echo "🌐 CORS Testing:"
echo "---------------"

test_cors "$PRODUCTION_URL/api/health" "$PRODUCTION_URL" "Production CORS"
test_cors "$API_BACKEND/api/health" "$PRODUCTION_URL" "Backend CORS"

echo ""

# 5. Kubernetes health (if available)
echo "🐳 Kubernetes Health:"
echo "--------------------"

if command -v kubectl > /dev/null 2>&1; then
    if kubectl cluster-info > /dev/null 2>&1; then
        print_success "Kubernetes cluster accessible"
        
        # Check pods
        pod_status=$(kubectl get pods -n $NAMESPACE -l app=tijarah-web --no-headers 2>/dev/null | awk '{print $3}' | head -1)
        if [ "$pod_status" = "Running" ]; then
            print_success "Pods are running"
        else
            print_error "Pods are not running (Status: $pod_status)"
        fi
        
        # Check service
        if kubectl get service tijarah-web-service -n $NAMESPACE > /dev/null 2>&1; then
            print_success "Service exists"
        else
            print_error "Service not found"
        fi
        
        # Check ingress
        if kubectl get ingress tijarah-web-ingress -n $NAMESPACE > /dev/null 2>&1; then
            print_success "Ingress exists"
        else
            print_error "Ingress not found"
        fi
    else
        print_warning "Kubernetes cluster not accessible"
    fi
else
    print_warning "kubectl not available"
fi

echo ""

# 6. Performance testing
echo "⚡ Performance Testing:"
echo "----------------------"

# Test response times
print_info "Testing response times..."
for i in {1..3}; do
    response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time 10 "$PRODUCTION_URL" 2>/dev/null)
    if [ $? -eq 0 ]; then
        if (( $(echo "$response_time < 3.0" | bc -l 2>/dev/null || echo "0") )); then
            print_success "Response time $i: ${response_time}s"
        else
            print_warning "Response time $i: ${response_time}s (>3s)"
        fi
    else
        print_error "Response time test $i failed"
    fi
done

echo ""

# 7. Environment validation
echo "🌐 Environment Validation:"
echo "-------------------------"

if [ -f verify-production-env.js ]; then
    if node verify-production-env.js > /dev/null 2>&1; then
        print_success "Environment validation passed"
    else
        print_error "Environment validation failed"
    fi
else
    print_warning "Environment validation script not found"
fi

echo ""

# 8. SSL/TLS check
echo "🔒 SSL/TLS Check:"
echo "----------------"

ssl_info=$(curl -s -I "$PRODUCTION_URL" 2>/dev/null | grep -i "strict-transport-security\|x-frame-options")
if [ ! -z "$ssl_info" ]; then
    print_success "Security headers present"
else
    print_warning "Security headers not found"
fi

# Check certificate
if openssl s_client -connect demo-app.tijarah360.com:443 -servername demo-app.tijarah360.com < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    print_success "SSL certificate valid"
else
    print_warning "SSL certificate validation failed"
fi

echo ""

# Summary
echo "📊 Health Check Summary:"
echo "========================"
echo "Timestamp: $(date)"
echo "Production URL: $PRODUCTION_URL"
echo "Backend API: $API_BACKEND"
echo ""

print_info "For detailed troubleshooting, refer to docs/05-DEBUGGING-DOCUMENTATION.md"

echo ""
echo "🏥 Health check completed at: $(date)"
