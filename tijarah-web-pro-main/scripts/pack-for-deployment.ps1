# Tijarah Web - Pack for Deployment Script
# This script creates a deployment package for moving to a new machine

param(
    [string]$OutputPath = ".\tijarah-web-deployment.zip",
    [switch]$IncludeNodeModules = $false,
    [switch]$IncludeBuild = $true
)

# Colors for output
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"

function Write-Status {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor $Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

Write-Host "Packing Tijarah Web for Deployment" -ForegroundColor $Green
Write-Host "====================================" -ForegroundColor $Green

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Error "package.json not found! Please run this script from the project root."
    exit 1
}

# Create temporary directory
$TempDir = ".\temp-deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null
Write-Status "Created temporary directory: $TempDir"

try {
    # Copy essential files
    Write-Host "Copying project files..." -ForegroundColor $Yellow
    
    # Core files
    $CoreFiles = @(
        "package.json",
        "package-lock.json",
        "next.config.js",
        "ecosystem.production.config.js",
        "tsconfig.json",
        ".babelrc",
        "next-env.d.ts",
        "i18next-scanner.config.js",
        "README.md",
        ".gitignore"
    )
    
    foreach ($file in $CoreFiles) {
        if (Test-Path $file) {
            Copy-Item $file $TempDir -Force
            Write-Status "Copied $file"
        } else {
            Write-Warning "$file not found - skipping"
        }
    }
    
    # Copy environment files
    Write-Host "Copying environment files..." -ForegroundColor $Yellow
    $EnvFiles = @(
        ".env.production",
        ".env.local.example",
        ".env.development",
        ".env.staging",
        ".env.qa",
        ".env.test",
        ".env.example"
    )
    
    foreach ($envFile in $EnvFiles) {
        if (Test-Path $envFile) {
            Copy-Item $envFile $TempDir -Force
            Write-Status "Copied $envFile"
        } else {
            Write-Warning "$envFile not found - skipping"
        }
    }
    
    # Copy verification and server files
    $ServerFiles = @(
        "server.js",
        "verify-production-env.js",
        "test-runtime-env.js",
        "test-build-env.sh"
    )
    
    foreach ($file in $ServerFiles) {
        if (Test-Path $file) {
            Copy-Item $file $TempDir -Force
            Write-Status "Copied $file"
        } else {
            Write-Warning "$file not found - skipping"
        }
    }
    
    # Copy directories
    $Directories = @(
        "src",
        "public",
        "assets",
        "docs",
        "scripts",
        "pages"
    )
    
    foreach ($dir in $Directories) {
        if (Test-Path $dir) {
            Copy-Item $dir $TempDir -Recurse -Force
            Write-Status "Copied $dir directory"
        } else {
            Write-Warning "$dir directory not found - skipping"
        }
    }
    
    # Copy build if requested and exists
    if ($IncludeBuild -and (Test-Path ".next")) {
        Copy-Item ".next" "$TempDir\.next" -Recurse -Force
        Write-Status "Copied .next build directory"
    }
    
    # Copy node_modules if requested
    if ($IncludeNodeModules -and (Test-Path "node_modules")) {
        Write-Host "Copying node_modules (this may take a while)..." -ForegroundColor $Yellow
        Copy-Item "node_modules" "$TempDir\node_modules" -Recurse -Force
        Write-Status "Copied node_modules directory"
    }
    
    # Create environment setup guide
    $EnvSetupGuide = @"
# Environment Configuration Guide
Generated: $(Get-Date)

## Environment Files Included

### Production Environment (.env.production)
- Used for production deployment
- Contains production API URLs and settings
- Required for production builds

### Local Development (.env.local.example)
- Template for local development
- Copy to .env.local and modify as needed
- Uses proxy to avoid CORS issues

### Other Environment Files
- .env.development - Development settings
- .env.staging - Staging environment
- .env.qa - QA environment
- .env.test - Test environment

## Setup Instructions

### 1. For Local Development
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your settings
# Set NEXT_PUBLIC_APP_ENV=local for proxy usage
```

### 2. For Production Deployment
```bash
# .env.production is already configured
# Update URLs if deploying to different domain

# Verify environment
node verify-production-env.js
```

### 3. Environment Variables Explained

**NODE_ENV**: Node.js environment (development/production)
**NEXT_PUBLIC_APP_ENV**: App environment (local/development/staging/production)
**NEXT_PUBLIC_FRONTEND_URL**: Your frontend domain
**NEXT_PUBLIC_PRODUCTION_API_URL**: Backend API URL

### 4. Testing Environment
```bash
# Test environment loading
./test-build-env.sh

# Test runtime environment
node test-runtime-env.js
```

## Important Notes
- Never commit .env.local to version control
- Always verify environment before deployment
- Use .env.local.example as template for new developers
"@
    
    $EnvSetupGuide | Out-File "$TempDir\ENVIRONMENT-SETUP.md" -Encoding UTF8
    Write-Status "Created environment setup guide"
    
    # Create deployment instructions
    $DeploymentInstructions = @"
# Tijarah Web Deployment Instructions
Generated: $(Get-Date)

## Prerequisites
- Node.js 18.20.8 or higher
- npm or yarn
- PM2 (for production): npm install -g pm2

## Deployment Steps

### 1. Extract and Setup
```bash
# Extract the deployment package
# Navigate to the project directory
cd tijarah-web

# Install dependencies (if node_modules not included)
npm install --production

# Build the application (if .next not included)
npm run build
```

### 2. Environment Configuration
```bash
# For local development
cp .env.local.example .env.local
# Edit .env.local with your local settings

# For production (already configured)
# Update .env.production if needed:
# - NEXT_PUBLIC_FRONTEND_URL (your domain)
# - NEXT_PUBLIC_PRODUCTION_API_URL (your backend)

# Verify environment
node verify-production-env.js
```

### 3. Start Application
```bash
# Development
npm run dev

# Production with PM2
pm2 start ecosystem.production.config.js --env production

# Production without PM2
npm start

# Custom server (uses .env.production)
node server.js
```

### 4. Health Check
- Visit your application URL
- Check PM2 status: pm2 status
- View logs: pm2 logs tijarah-web-prod
- Test environment: node test-runtime-env.js

## Files Included
- Source code (src/, pages/)
- Public assets (public/)
- Documentation (docs/)
- Scripts (scripts/)
- Configuration files
- Environment files (.env.*)
- Server files (server.js, verify-production-env.js)
$(if ($IncludeBuild) { "- Built application (.next/)" })
$(if ($IncludeNodeModules) { "- Node modules (node_modules/)" })

## Environment Files
- .env.production - Production configuration
- .env.local.example - Local development template
- Additional environment files for different stages

## Support
- Refer to docs/03-PRODUCTION-DOCUMENTATION.md for detailed deployment
- Check ENVIRONMENT-SETUP.md for environment configuration
- Use verify-production-env.js to validate setup
"@
    
    $DeploymentInstructions | Out-File "$TempDir\DEPLOYMENT-INSTRUCTIONS.md" -Encoding UTF8
    Write-Status "Created deployment instructions"
    
    # Create deployment script for target machine
    $DeploymentScript = @"
#!/bin/bash
# Auto-deployment script for new machine

echo "Setting up Tijarah Web..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js not found! Please install Node.js 18.20.8+"
    exit 1
fi

# Setup environment for local development
if [ ! -f ".env.local" ] && [ -f ".env.local.example" ]; then
    echo "Creating .env.local from example..."
    cp .env.local.example .env.local
    echo "Created .env.local - please edit with your settings"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Build if needed
if [ ! -d ".next" ]; then
    echo "Building application..."
    npm run build
fi

# Install PM2 if not present
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Verify environment
echo "Verifying environment..."
if [ -f "verify-production-env.js" ]; then
    node verify-production-env.js
fi

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "For development: npm run dev"
echo "For production: pm2 start ecosystem.production.config.js --env production"
echo "Custom server: node server.js"
"@
    
    $DeploymentScript | Out-File "$TempDir\setup.sh" -Encoding UTF8
    Write-Status "Created setup script for target machine"
    
    # Create ZIP package
    Write-Host "Creating deployment package..." -ForegroundColor $Yellow
    
    if (Test-Path $OutputPath) {
        Remove-Item $OutputPath -Force
        Write-Warning "Removed existing package: $OutputPath"
    }
    
    # Use .NET compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($TempDir, $OutputPath)
    
    # Get package size
    $PackageSize = [math]::Round((Get-Item $OutputPath).Length / 1MB, 2)
    
    Write-Status "Deployment package created: $OutputPath ($PackageSize MB)"
    
    # Summary
    Write-Host "`nDeployment Package Summary:" -ForegroundColor $Green
    Write-Host "============================" -ForegroundColor $Green
    Write-Host "Package: $OutputPath"
    Write-Host "Size: $PackageSize MB"
    Write-Host "Includes Build: $IncludeBuild"
    Write-Host "Includes node_modules: $IncludeNodeModules"
    Write-Host "Environment Files: Included"
    Write-Host "Server Files: Included"
    Write-Host "Created: $(Get-Date)"
    
    Write-Host "`nNext Steps:" -ForegroundColor $Green
    Write-Host "1. Transfer $OutputPath to the new machine"
    Write-Host "2. Extract the package"
    Write-Host "3. Follow DEPLOYMENT-INSTRUCTIONS.md"
    Write-Host "4. Check ENVIRONMENT-SETUP.md for environment configuration"
    Write-Host "5. Run setup.sh (Linux/Mac) or follow manual steps"
    
} finally {
    # Cleanup
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
        Write-Status "Cleaned up temporary directory"
    }
}

Write-Status "Packaging completed successfully!"
