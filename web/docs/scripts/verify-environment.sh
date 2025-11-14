#!/bin/bash

echo "🔍 Environment Verification - Tijarah Web"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_section() {
    echo -e "\n${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..40})"
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

# Track verification status
VERIFICATION_PASSED=true

# Function to check requirement
check_requirement() {
    local description=$1
    local command=$2
    local expected=$3
    
    print_info "Checking: $description"
    
    if eval "$command"; then
        if [ -n "$expected" ]; then
            result=$(eval "$command")
            if [[ "$result" == *"$expected"* ]]; then
                print_success "$description"
                return 0
            else
                print_error "$description (Expected: $expected, Got: $result)"
                VERIFICATION_PASSED=false
                return 1
            fi
        else
            print_success "$description"
            return 0
        fi
    else
        print_error "$description"
        VERIFICATION_PASSED=false
        return 1
    fi
}

# Start verification
echo "🕐 Verification started at: $(date)"

# 1. System Requirements
print_section "📊 System Requirements"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//')
NODE_MIN_VERSION="18.20.8"

print_info "Checking Node.js version..."
if [ -n "$NODE_VERSION" ]; then
    if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$NODE_MIN_VERSION" ]; then
        print_success "Node.js version $NODE_VERSION (>= $NODE_MIN_VERSION)"
    else
        print_error "Node.js version $NODE_VERSION is below minimum required $NODE_MIN_VERSION"
        VERIFICATION_PASSED=false
    fi
else
    print_error "Node.js not installed"
    VERIFICATION_PASSED=false
fi

# Check npm version
check_requirement "npm installed" "command -v npm > /dev/null"

# Check available memory
if command -v free > /dev/null; then
    MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$MEMORY_GB" -ge 4 ]; then
        print_success "Available memory: ${MEMORY_GB}GB (>= 4GB)"
    else
        print_warning "Available memory: ${MEMORY_GB}GB (recommended: >= 4GB)"
    fi
fi

# Check disk space
DISK_SPACE=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_SPACE" -ge 2 ]; then
    print_success "Available disk space: ${DISK_SPACE}GB (>= 2GB)"
else
    print_error "Available disk space: ${DISK_SPACE}GB (minimum: 2GB)"
    VERIFICATION_PASSED=false
fi

# 2. Environment Files
print_section "📄 Environment Files"

# Check .env.production
if [ -f .env.production ]; then
    print_success ".env.production exists"
    
    # Load and validate environment variables
    export $(cat .env.production | grep -v '^#' | xargs)
    
    # Validate required variables
    required_vars=("NODE_ENV" "NEXT_PUBLIC_APP_ENV" "NEXT_PUBLIC_FRONTEND_URL" "NEXT_PUBLIC_PRODUCTION_API_URL")
    
    for var in "${required_vars[@]}"; do
        if [ -n "${!var}" ]; then
            print_success "$var is set: ${!var}"
        else
            print_error "$var is not set"
            VERIFICATION_PASSED=false
        fi
    done
    
    # Validate specific values
    if [ "$NODE_ENV" = "production" ]; then
        print_success "NODE_ENV is correctly set to production"
    else
        print_error "NODE_ENV should be 'production', got: $NODE_ENV"
        VERIFICATION_PASSED=false
    fi
    
    if [ "$NEXT_PUBLIC_APP_ENV" = "production" ]; then
        print_success "NEXT_PUBLIC_APP_ENV is correctly set to production"
    else
        print_error "NEXT_PUBLIC_APP_ENV should be 'production', got: $NEXT_PUBLIC_APP_ENV"
        VERIFICATION_PASSED=false
    fi
    
else
    print_error ".env.production not found"
    VERIFICATION_PASSED=false
    
    print_info "Creating .env.production with default values..."
    cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
EOF
    print_success "Created .env.production file"
fi

# 3. Project Files
print_section "📁 Project Files"

# Check essential files
essential_files=("package.json" "next.config.js" "verify-production-env.js")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
        VERIFICATION_PASSED=false
    fi
done

# Check package.json scripts
if [ -f package.json ]; then
    if grep -q '"build"' package.json; then
        print_success "Build script found in package.json"
    else
        print_error "Build script not found in package.json"
        VERIFICATION_PASSED=false
    fi
    
    if grep -q '"start"' package.json; then
        print_success "Start script found in package.json"
    else
        print_error "Start script not found in package.json"
        VERIFICATION_PASSED=false
    fi
fi

# 4. Dependencies
print_section "📦 Dependencies"

if [ -f package.json ]; then
    if [ -d node_modules ]; then
        print_success "node_modules directory exists"
        
        # Check if dependencies are installed
        if npm list --depth=0 > /dev/null 2>&1; then
            print_success "Dependencies are properly installed"
        else
            print_warning "Dependencies may need to be reinstalled"
            print_info "Run: npm install --legacy-peer-deps"
        fi
    else
        print_warning "node_modules directory not found"
        print_info "Run: npm install --legacy-peer-deps"
    fi
fi

# 5. Build Environment
print_section "🔨 Build Environment"

# Check if build exists
if [ -d .next ]; then
    BUILD_SIZE=$(du -sh .next | cut -f1)
    print_success "Build directory exists (Size: $BUILD_SIZE)"
    
    # Check build age
    BUILD_AGE=$(find .next -name "*.js" -mtime +1 | wc -l)
    if [ "$BUILD_AGE" -gt 0 ]; then
        print_warning "Build may be outdated (files older than 1 day)"
        print_info "Consider running: npm run build"
    else
        print_success "Build appears to be recent"
    fi
else
    print_warning "Build directory not found"
    print_info "Run: npm run build"
fi

# 6. Network Connectivity
print_section "🌐 Network Connectivity"

# Test internet connectivity
if ping -c 1 google.com > /dev/null 2>&1; then
    print_success "Internet connectivity available"
else
    print_error "No internet connectivity"
    VERIFICATION_PASSED=false
fi

# Test API backend connectivity
if curl -s --max-time 10 https://be.tijarah360.com/health > /dev/null 2>&1; then
    print_success "Backend API accessible"
else
    print_warning "Backend API not accessible (may be normal if not deployed)"
fi

# 7. Kubernetes Environment (if available)
print_section "🐳 Kubernetes Environment"

if command -v kubectl > /dev/null 2>&1; then
    print_success "kubectl is available"
    
    if kubectl cluster-info > /dev/null 2>&1; then
        print_success "Kubernetes cluster accessible"
        
        # Check namespace
        if kubectl get namespace tijarah-web > /dev/null 2>&1; then
            print_success "tijarah-web namespace exists"
        else
            print_warning "tijarah-web namespace not found"
        fi
    else
        print_warning "Kubernetes cluster not accessible"
    fi
else
    print_warning "kubectl not available"
fi

# 8. Environment Validation Script
print_section "🧪 Environment Validation Script"

if [ -f verify-production-env.js ]; then
    print_info "Running environment validation script..."
    if node verify-production-env.js > /dev/null 2>&1; then
        print_success "Environment validation script passed"
    else
        print_error "Environment validation script failed"
        VERIFICATION_PASSED=false
    fi
else
    print_error "Environment validation script not found"
    VERIFICATION_PASSED=false
fi

# Final Summary
print_section "📊 Verification Summary"

echo "Verification completed at: $(date)"
echo ""

if [ "$VERIFICATION_PASSED" = true ]; then
    print_success "🎉 All verifications passed! Environment is ready for production deployment."
    echo ""
    echo "🚀 Next steps:"
    echo "1. Build for production: ./docs/scripts/build-production.sh"
    echo "2. Deploy to production: Follow docs/03-PRODUCTION-DOCUMENTATION.md"
    echo "3. Run health checks: ./docs/scripts/health-check.sh"
    exit 0
else
    print_error "❌ Some verifications failed. Please address the issues above before proceeding."
    echo ""
    echo "🔧 Common fixes:"
    echo "1. Install dependencies: npm install --legacy-peer-deps"
    echo "2. Create environment file: Check .env.production"
    echo "3. Build application: npm run build"
    echo "4. Check system requirements: Node.js >= 18.20.8"
    exit 1
fi
