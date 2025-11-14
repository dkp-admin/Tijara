# 🔨 Build Documentation - Tijarah Web

## 📋 **Overview**

This document provides comprehensive instructions for building the Tijarah Web application for different environments, including development, QA, and production builds.

## 🎯 **Build Types**

### **Development Build**
- Fast compilation for local development
- Hot reloading enabled
- Debug information included
- Environment: `development`

### **QA Build**
- Optimized for testing
- Source maps included for debugging
- Environment: `qa`
- API endpoints: QA backend

### **Production Build**
- Fully optimized and minified
- No debug information
- Environment: `production`
- API endpoints: Production backend

## 🔧 **Prerequisites**

### **System Requirements**
- **Node.js**: v18.20.8 or higher
- **npm**: v9.0.0 or higher
- **Memory**: Minimum 4GB RAM for builds
- **Disk Space**: 2GB free space

### **Environment Setup**
```bash
# Verify Node.js version
node --version  # Should be v18.20.8+

# Verify npm version
npm --version   # Should be v9.0.0+

# Check available memory
free -h         # Linux
```

## 📁 **Project Structure**

```
tijarah-web/
├── .env.production              # Production environment variables
├── .env.local.example          # Environment template
├── package.json                 # Dependencies and scripts
├── next.config.js              # Next.js configuration
├── src/                        # Source code
├── public/                     # Static assets
├── docs/                       # Documentation
└── scripts/                    # Build and deployment scripts
```

## 🚀 **Build Commands**

### **Development Build**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Access application
http://localhost:3000
```

### **Production Build**
```bash
# Clean previous builds
rm -rf .next node_modules/.cache

# Install production dependencies
npm install --production --legacy-peer-deps

# Build for production
NODE_ENV=production NEXT_PUBLIC_APP_ENV=production npm run build

# Start production server
NODE_ENV=production NEXT_PUBLIC_APP_ENV=production npm start
```

### **QA Build**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build for QA
NODE_ENV=production NEXT_PUBLIC_APP_ENV=qa npm run build

# Start QA server
NODE_ENV=production NEXT_PUBLIC_APP_ENV=qa npm start
```

## 🔧 **Build Scripts**

### **Automated Production Build Script**

Create `scripts/build-production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Building Tijarah Web for Production"
echo "======================================"

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
else
    echo "❌ .env.production not found!"
    exit 1
fi

# Validate environment
if [ "$NEXT_PUBLIC_APP_ENV" != "production" ]; then
    echo "❌ NEXT_PUBLIC_APP_ENV must be 'production'"
    exit 1
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production --legacy-peer-deps

# Build application
echo "🔨 Building application..."
NODE_ENV=production \
NEXT_PUBLIC_APP_ENV=production \
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com \
npm run build

# Verify build
if [ -d .next ]; then
    echo "✅ Build completed successfully"
    echo "📊 Build size:"
    du -sh .next
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Production build ready!"
```

### **Environment Verification Script**

Create `scripts/verify-environment.sh`:

```bash
#!/bin/bash

echo "🔍 Environment Verification"
echo "==========================="

# Check Node.js version
NODE_VERSION=$(node --version)
echo "Node.js: $NODE_VERSION"

if [[ "$NODE_VERSION" < "v18.20.8" ]]; then
    echo "❌ Node.js version must be v18.20.8 or higher"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "npm: $NPM_VERSION"

# Check environment files
if [ -f .env.production ]; then
    echo "✅ .env.production exists"
    node verify-production-env.js
else
    echo "❌ .env.production missing"
    exit 1
fi

# Check package.json
if [ -f package.json ]; then
    echo "✅ package.json exists"
else
    echo "❌ package.json missing"
    exit 1
fi

echo "✅ Environment verification complete"
```

## 🔍 **Build Troubleshooting**

### **Common Build Errors**

#### **Dependency Conflicts**
```bash
# Error: peer dependency warnings
# Solution: Use legacy peer deps
npm install --legacy-peer-deps
```

#### **Memory Issues**
```bash
# Error: JavaScript heap out of memory
# Solution: Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### **Environment Variable Issues**
```bash
# Error: Environment variables not found
# Solution: Verify environment file
cat .env.production
node verify-production-env.js
```

#### **TypeScript Errors**
```bash
# Error: TypeScript compilation errors
# Solution: Skip type checking for production
npm run build -- --no-lint
```

### **Build Optimization**

#### **Reduce Build Time**
```bash
# Use npm cache
npm ci --cache .npm

# Parallel builds
export NODE_OPTIONS="--max-old-space-size=4096"

# Skip unnecessary checks
npm run build -- --no-lint --no-typecheck
```

#### **Reduce Bundle Size**
```javascript
// next.config.js optimizations
module.exports = {
  experimental: {
    optimizeCss: true,
    optimizeImages: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}
```

## 📊 **Build Verification**

### **Verify Build Success**
```bash
# Check build directory
ls -la .next/

# Check build manifest
cat .next/build-manifest.json

# Verify environment in build
grep -r "demo-app.tijarah360.com" .next/static/chunks/ || echo "Environment check needed"
```

### **Test Built Application**
```bash
# Start production server
npm start

# Test in another terminal
curl http://localhost:3000
curl http://localhost:3000/api/health
```

## 🎯 **Build Best Practices**

### **Before Building**
1. ✅ Verify Node.js and npm versions
2. ✅ Check environment variables
3. ✅ Clean previous builds
4. ✅ Update dependencies if needed

### **During Building**
1. ✅ Monitor build output for errors
2. ✅ Check memory usage
3. ✅ Verify environment variables are loaded
4. ✅ Watch for TypeScript/ESLint errors

### **After Building**
1. ✅ Verify build directory exists
2. ✅ Test application startup
3. ✅ Check bundle size
4. ✅ Validate environment configuration

## 📝 **Build Checklist**

- [ ] Node.js v18.20.8+ installed
- [ ] npm latest version installed
- [ ] .env.production file exists and valid
- [ ] Dependencies installed with --legacy-peer-deps
- [ ] Build completed without errors
- [ ] Application starts successfully
- [ ] Environment variables verified
- [ ] Bundle size acceptable
- [ ] No console errors in browser

---

**📞 Support**: For build issues, check the [Debugging Documentation](05-DEBUGGING-DOCUMENTATION.md) or contact the development team.
