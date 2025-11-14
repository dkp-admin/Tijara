#!/bin/bash

echo "📦 Moving Documentation and Script Files to docs/ Directory"
echo "==========================================================="

# Create necessary directories
mkdir -p docs/scripts
mkdir -p docs/kubernetes
mkdir -p docs/nginx

# Move documentation files
echo "📄 Moving documentation files..."
mv ENVIRONMENT-CONFIGURATION-SUMMARY.md docs/ 2>/dev/null || echo "ENVIRONMENT-CONFIGURATION-SUMMARY.md already moved or not found"
mv FINAL-DEPLOYMENT-PACKAGE.md docs/ 2>/dev/null || echo "FINAL-DEPLOYMENT-PACKAGE.md already moved or not found"
mv PRODUCTION-DEPLOYMENT-SUMMARY.md docs/ 2>/dev/null || echo "PRODUCTION-DEPLOYMENT-SUMMARY.md already moved or not found"
mv CORS-SETUP.md docs/ 2>/dev/null || echo "CORS-SETUP.md already moved or not found"

# Move script files
echo "🔧 Moving script files..."
mv build-production.sh docs/scripts/ 2>/dev/null || echo "build-production.sh already moved or not found"
mv deploy.sh docs/scripts/ 2>/dev/null || echo "deploy.sh already moved or not found"
mv start-production.sh docs/scripts/ 2>/dev/null || echo "start-production.sh already moved or not found"
mv server.js docs/scripts/ 2>/dev/null || echo "server.js already moved or not found"
mv setup-demo-app-domain.sh docs/scripts/ 2>/dev/null || echo "setup-demo-app-domain.sh already moved or not found"
mv force-fresh-deploy.sh docs/scripts/ 2>/dev/null || echo "force-fresh-deploy.sh already moved or not found"
mv nuclear-cache-clear.sh docs/scripts/ 2>/dev/null || echo "nuclear-cache-clear.sh already moved or not found"
mv debug-cache-issues.sh docs/scripts/ 2>/dev/null || echo "debug-cache-issues.sh already moved or not found"
mv debug-environment.sh docs/scripts/ 2>/dev/null || echo "debug-environment.sh already moved or not found"
mv check-build-env.sh docs/scripts/ 2>/dev/null || echo "check-build-env.sh already moved or not found"
mv test-build-env.sh docs/scripts/ 2>/dev/null || echo "test-build-env.sh already moved or not found"
mv find-nginx-config.sh docs/scripts/ 2>/dev/null || echo "find-nginx-config.sh already moved or not found"

# Move test files
echo "🧪 Moving test files..."
mv test-runtime-env.js docs/scripts/ 2>/dev/null || echo "test-runtime-env.js already moved or not found"
mv test-env.js docs/scripts/ 2>/dev/null || echo "test-env.js already moved or not found"
mv check-client-env.html docs/scripts/ 2>/dev/null || echo "check-client-env.html already moved or not found"

# Move Kubernetes files
echo "🐳 Moving Kubernetes files..."
mv k8s-demo-app-setup.yaml docs/kubernetes/ 2>/dev/null || echo "k8s-demo-app-setup.yaml already moved or not found"

# Move Nginx files
echo "🌐 Moving Nginx files..."
mv nginx-cache-bust.conf docs/nginx/ 2>/dev/null || echo "nginx-cache-bust.conf already moved or not found"

# Set permissions for scripts
echo "🔧 Setting script permissions..."
chmod +x docs/scripts/*.sh 2>/dev/null || echo "No shell scripts found to set permissions"

# Clean up empty directories
echo "🧹 Cleaning up..."
rmdir scripts 2>/dev/null || echo "scripts directory not empty or doesn't exist"

echo ""
echo "✅ File organization complete!"
echo ""
echo "📁 New structure:"
echo "docs/"
echo "├── Documentation files (*.md)"
echo "├── scripts/ (all automation scripts)"
echo "├── kubernetes/ (K8s configurations)"
echo "└── nginx/ (Nginx configurations)"
echo ""
echo "🎯 All files moved to docs/ directory while preserving original project structure!"
