#!/bin/bash
set -e

echo "🚀 Building Tijarah Web for Production"
echo "======================================"

# Configuration
BUILD_DIR=".next"
NODE_MIN_VERSION="18.20.8"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# Check Node.js version
echo "🔍 Checking Node.js version..."
NODE_VERSION=$(node --version | sed 's/v//')
if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$NODE_MIN_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is below minimum required $NODE_MIN_VERSION"
    exit 1
fi
print_status "Node.js version $NODE_VERSION is compatible"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    print_error ".env.production file not found!"
    echo "Creating .env.production with default values..."
    cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
EOF
    print_status "Created .env.production file"
fi

# Load environment variables
echo "📄 Loading environment variables..."
export $(cat .env.production | grep -v '^#' | xargs)

# Validate environment variables
echo "🔍 Validating environment variables..."
if [ "$NODE_ENV" != "production" ]; then
    print_error "NODE_ENV must be 'production', got: $NODE_ENV"
    exit 1
fi

if [ "$NEXT_PUBLIC_APP_ENV" != "production" ]; then
    print_error "NEXT_PUBLIC_APP_ENV must be 'production', got: $NEXT_PUBLIC_APP_ENV"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_FRONTEND_URL" ]; then
    print_error "NEXT_PUBLIC_FRONTEND_URL is not set"
    exit 1
fi

print_status "Environment variables validated"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf $BUILD_DIR node_modules/.cache
print_status "Previous builds cleaned"

# Install dependencies
echo "📦 Installing dependencies..."
if npm install --production --legacy-peer-deps; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Set Node.js memory options
export NODE_OPTIONS="--max-old-space-size=4096"

# Build application
echo "🔨 Building application..."
if NODE_ENV=production \
   NEXT_PUBLIC_APP_ENV=production \
   NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
   NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com \
   npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed!"
    exit 1
fi

# Verify build
if [ -d $BUILD_DIR ]; then
    BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
    print_status "Build directory created (Size: $BUILD_SIZE)"
    
    # Check for environment variables in build
    echo "🔍 Verifying environment in build..."
    if grep -r "demo-app.tijarah360.com" $BUILD_DIR/static/chunks/ > /dev/null 2>&1; then
        print_status "Production URLs found in build"
    else
        print_warning "Production URLs not found in build - this might be normal"
    fi
    
    if grep -r "qa.vercel.app" $BUILD_DIR/static/chunks/ > /dev/null 2>&1; then
        print_error "QA URLs found in build! This indicates environment configuration issue"
        exit 1
    else
        print_status "No QA URLs found in build"
    fi
else
    print_error "Build directory not created!"
    exit 1
fi

# Test build
echo "🧪 Testing build..."
if node -e "console.log('Build test successful')"; then
    print_status "Build test passed"
else
    print_error "Build test failed"
    exit 1
fi

# Generate build report
echo "📊 Build Report:"
echo "=================="
echo "Build Size: $(du -sh $BUILD_DIR | cut -f1)"
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo "Environment: $NEXT_PUBLIC_APP_ENV"
echo "Frontend URL: $NEXT_PUBLIC_FRONTEND_URL"
echo "Build Time: $(date)"

print_status "Production build completed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Test the build: npm start"
echo "2. Deploy to production: Follow docs/03-PRODUCTION-DOCUMENTATION.md"
echo "3. Run health checks: ./docs/scripts/health-check.sh"
