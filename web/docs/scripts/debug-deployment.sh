#!/bin/bash

echo "🔍 Deployment Debugging - Tijarah Web"
echo "====================================="

# Configuration
NAMESPACE="tijarah-web"
DEPLOYMENT_NAME="tijarah-web-production"
SERVICE_NAME="tijarah-web-service"
INGRESS_NAME="tijarah-web-ingress"

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

# Start debugging
echo "🕐 Debug started at: $(date)"

# 1. System Information
print_section "📊 System Information"

echo "OS: $(uname -a)"
echo "Node.js: $(node --version 2>/dev/null || echo 'Not available')"
echo "npm: $(npm --version 2>/dev/null || echo 'Not available')"
echo "kubectl: $(kubectl version --client --short 2>/dev/null || echo 'Not available')"
echo "Docker: $(docker --version 2>/dev/null || echo 'Not available')"

# 2. Environment Check
print_section "🌐 Environment Check"

echo "Current directory: $(pwd)"
echo "User: $(whoami)"

# Check environment variables
echo ""
echo "Environment Variables:"
echo "NODE_ENV: ${NODE_ENV:-'Not set'}"
echo "NEXT_PUBLIC_APP_ENV: ${NEXT_PUBLIC_APP_ENV:-'Not set'}"
echo "NEXT_PUBLIC_FRONTEND_URL: ${NEXT_PUBLIC_FRONTEND_URL:-'Not set'}"

# Check environment files
echo ""
echo "Environment Files:"
for env_file in .env.production .env.local .env; do
    if [ -f "$env_file" ]; then
        print_success "$env_file exists ($(wc -l < $env_file) lines)"
    else
        print_warning "$env_file not found"
    fi
done

# 3. File System Check
print_section "📁 File System Check"

# Check important files
files=("package.json" "next.config.js" "verify-production-env.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done

# Check directories
dirs=(".next" "public" "src" "node_modules")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        size=$(du -sh "$dir" 2>/dev/null | cut -f1)
        print_success "$dir exists (Size: $size)"
    else
        print_error "$dir missing"
    fi
done

# 4. Process Check
print_section "🔄 Process Check"

# Check Node.js processes
echo "Node.js processes:"
ps aux | grep node | grep -v grep || print_warning "No Node.js processes running"

echo ""
echo "Port usage:"
netstat -tulpn | grep -E ":3000|:80|:443" || print_warning "No relevant ports in use"

# 5. Local Application Test
print_section "🏠 Local Application Test"

if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_success "Local application accessible"
    
    # Test API endpoints
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        print_success "Health API accessible"
    else
        print_error "Health API not accessible"
    fi
    
    # Check response time
    response_time=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000 2>/dev/null)
    print_info "Response time: ${response_time}s"
else
    print_error "Local application not accessible"
fi

# 6. Kubernetes Debugging
print_section "🐳 Kubernetes Debugging"

if command -v kubectl > /dev/null 2>&1; then
    if kubectl cluster-info > /dev/null 2>&1; then
        print_success "Kubernetes cluster accessible"
        
        # Check namespace
        if kubectl get namespace $NAMESPACE > /dev/null 2>&1; then
            print_success "Namespace '$NAMESPACE' exists"
        else
            print_error "Namespace '$NAMESPACE' not found"
        fi
        
        # Check deployment
        echo ""
        echo "Deployment Status:"
        if kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE > /dev/null 2>&1; then
            kubectl get deployment $DEPLOYMENT_NAME -n $NAMESPACE
        else
            print_error "Deployment '$DEPLOYMENT_NAME' not found"
        fi
        
        # Check pods
        echo ""
        echo "Pod Status:"
        kubectl get pods -n $NAMESPACE -l app=tijarah-web -o wide 2>/dev/null || print_error "No pods found"
        
        # Check service
        echo ""
        echo "Service Status:"
        if kubectl get service $SERVICE_NAME -n $NAMESPACE > /dev/null 2>&1; then
            kubectl get service $SERVICE_NAME -n $NAMESPACE
        else
            print_error "Service '$SERVICE_NAME' not found"
        fi
        
        # Check ingress
        echo ""
        echo "Ingress Status:"
        if kubectl get ingress $INGRESS_NAME -n $NAMESPACE > /dev/null 2>&1; then
            kubectl get ingress $INGRESS_NAME -n $NAMESPACE
        else
            print_error "Ingress '$INGRESS_NAME' not found"
        fi
        
    else
        print_error "Kubernetes cluster not accessible"
    fi
else
    print_warning "kubectl not available"
fi

# 7. Network Connectivity
print_section "🌐 Network Connectivity"

# Test external connectivity
urls=(
    "https://demo-app.tijarah360.com"
    "https://be.tijarah360.com"
    "https://google.com"
)

for url in "${urls[@]}"; do
    if curl -s --max-time 10 "$url" > /dev/null 2>&1; then
        print_success "$url accessible"
    else
        print_error "$url not accessible"
    fi
done

# 8. Environment Validation
print_section "🧪 Environment Validation"

if [ -f verify-production-env.js ]; then
    echo "Running environment validation..."
    if node verify-production-env.js; then
        print_success "Environment validation passed"
    else
        print_error "Environment validation failed"
    fi
else
    print_warning "Environment validation script not found"
fi

# 9. Build Validation
print_section "🔨 Build Validation"

if [ -d .next ]; then
    print_success "Build directory exists"
    
    # Check build size
    build_size=$(du -sh .next | cut -f1)
    print_info "Build size: $build_size"
    
    # Check for environment variables in build
    if grep -r "demo-app.tijarah360.com" .next/static/chunks/ > /dev/null 2>&1; then
        print_success "Production URLs found in build"
    else
        print_warning "Production URLs not found in build"
    fi
    
    if grep -r "qa.vercel.app" .next/static/chunks/ > /dev/null 2>&1; then
        print_error "QA URLs found in build!"
    else
        print_success "No QA URLs found in build"
    fi
else
    print_error "Build directory not found"
fi

# Summary
print_section "📋 Debug Summary"

echo "Debug completed at: $(date)"
echo ""
echo "🔍 Key Findings:"
echo "- Environment: ${NEXT_PUBLIC_APP_ENV:-'Not set'}"
echo "- Local app: $(curl -s http://localhost:3000 > /dev/null 2>&1 && echo 'Accessible' || echo 'Not accessible')"
echo "- Production: $(curl -s https://demo-app.tijarah360.com > /dev/null 2>&1 && echo 'Accessible' || echo 'Not accessible')"
echo "- Kubernetes: $(kubectl cluster-info > /dev/null 2>&1 && echo 'Connected' || echo 'Not connected')"
echo ""

print_info "For detailed troubleshooting, refer to docs/05-DEBUGGING-DOCUMENTATION.md"
