# 🚀 Tijarah Web - Next.js POS & E-commerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-13.x-black?logo=next.js)](https://nextjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.x-blue?logo=mui)](https://mui.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.20.8+-green?logo=node.js)](https://nodejs.org/)

A comprehensive Next.js-based Point of Sale (POS) and E-commerce platform built with Material-UI, featuring enterprise-grade deployment automation and comprehensive documentation.

## 📋 **Quick Start**

### **Prerequisites**
- **Node.js**: v18.20.8 or higher
- **npm**: Latest version
- **Git**: For version control

### **Installation**
```bash
# Clone the repository
git clone https://github.com/TijarahV2/tijarah-web.git
cd tijarah-web

# Install dependencies
npm install --legacy-peer-deps

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### **Environment Setup**
```bash
# Verify environment configuration
node verify-production-env.js

# Test build environment
./test-build-env.sh

# Check runtime environment
node test-runtime-env.js
```

## 📚 **Complete Documentation Suite**

Our comprehensive documentation covers every aspect of development, deployment, and maintenance:

### **📖 Core Documentation**
| Guide | Purpose | Quick Access |
|-------|---------|--------------|
| **[Build Documentation](docs/01-BUILD-DOCUMENTATION.md)** | Complete build process and automation | `docs/01-BUILD-DOCUMENTATION.md` |
| **[QA Documentation](docs/02-QA-DOCUMENTATION.md)** | QA environment setup and testing procedures | `docs/02-QA-DOCUMENTATION.md` |
| **[Production Documentation](docs/03-PRODUCTION-DOCUMENTATION.md)** | Production deployment and maintenance | `docs/03-PRODUCTION-DOCUMENTATION.md` |
| **[CORS Documentation](docs/04-CORS-DOCUMENTATION.md)** | CORS configuration and troubleshooting | `docs/04-CORS-DOCUMENTATION.md` |
| **[Debugging Documentation](docs/05-DEBUGGING-DOCUMENTATION.md)** | Comprehensive troubleshooting guide | `docs/05-DEBUGGING-DOCUMENTATION.md` |

### **📋 Additional Resources**
- **[Documentation Index](docs/README.md)** - Complete documentation overview
- **[Environment Configuration](docs/ENVIRONMENT-CONFIGURATION-SUMMARY.md)** - Environment setup guide
- **[Complete Package](docs/COMPLETE-DOCUMENTATION-PACKAGE.md)** - All-in-one documentation
- **[Final Deployment](docs/FINAL-DEPLOYMENT-PACKAGE.md)** - Production deployment guide
- **[File Organization](docs/REORGANIZED-STRUCTURE.md)** - Project structure guide

## 🔧 **Automation Scripts**

Enterprise-grade automation tools for consistent deployments and maintenance:

### **🚀 Build & Deployment**
```bash
# Production build with validation
./docs/scripts/build-production.sh

# Deploy to production
./docs/scripts/deploy.sh

# Start production server
./docs/scripts/start-production.sh

# Force fresh deployment
./docs/scripts/force-fresh-deploy.sh
```

### **🔍 Environment & Health Monitoring**
```bash
# Comprehensive environment verification
./docs/scripts/verify-environment.sh

# Health check monitoring
./docs/scripts/health-check.sh

# Environment debugging
./docs/scripts/debug-environment.sh

# Build environment check
./docs/scripts/check-build-env.sh
```

### **🌐 CORS & API Testing**
```bash
# CORS testing suite
./docs/scripts/cors-test.sh

# Client environment check
open docs/scripts/check-client-env.html

# Test environment variables
node docs/scripts/test-env.js
```

### **🧹 Cache & Debugging**
```bash
# Debug deployment issues
./docs/scripts/debug-deployment.sh

# Clear all caches
./docs/scripts/nuclear-cache-clear.sh

# Debug cache issues
./docs/scripts/debug-cache-issues.sh

# Find Nginx configuration
./docs/scripts/find-nginx-config.sh
```

### **☸️ Infrastructure**
```bash
# Kubernetes setup
kubectl apply -f docs/scripts/k8s-demo-app-setup.yaml

# Domain setup
./docs/scripts/setup-demo-app-domain.sh

# Nginx configuration
# See: docs/scripts/nginx-cache-bust.conf
```

## 🌍 **Environment Configuration**

### **Development Environment**
```bash
# Local development with hot reload
npm run dev

# Development with specific port
PORT=3001 npm run dev

# Development with environment variables
cp .env.local.example .env.local
# Edit .env.local with your settings
npm run dev
```

### **QA Environment**
```bash
# Build for QA testing
NODE_ENV=development npm run build

# Start QA server
npm start

# QA environment verification
node verify-production-env.js
```

### **Production Environment**
```bash
# Production build with validation
./docs/scripts/build-production.sh

# Production environment setup
cp .env.production.example .env.production
# Configure production variables

# Start production server
./docs/scripts/start-production.sh
```

## 🔗 **API Configuration**

### **CORS Setup**
The application includes automatic CORS handling:

```typescript
// Automatic proxy for localhost development
// See: src/api/serviceCaller.ts
const useProxy = isLocalhost && process.env.NODE_ENV !== 'production';
const url = useProxy ? `/api/proxy${endpoint}` : `${HOST}${endpoint}`;
```

### **Environment Variables**
```bash
# Required environment variables
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
```

### **API Proxy**
For development CORS issues:
- **Proxy endpoint**: `/api/proxy/[...path]`
- **Configuration**: `src/pages/api/proxy/[...path].ts`
- **Testing**: `docs/scripts/cors-test.sh`

## 🏗️ **Project Structure**

```
tijarah-web/
├── 📁 docs/                          # Complete documentation suite
│   ├── 📄 01-BUILD-DOCUMENTATION.md   # Build process guide
│   ├── 📄 02-QA-DOCUMENTATION.md      # QA procedures
│   ├── 📄 03-PRODUCTION-DOCUMENTATION.md # Production deployment
│   ├── 📄 04-CORS-DOCUMENTATION.md    # CORS configuration
│   ├── 📄 05-DEBUGGING-DOCUMENTATION.md # Troubleshooting
│   └── 📁 scripts/                   # Automation scripts (16 files)
├── 📁 src/                           # Source code
│   ├── 📁 components/                # React components
│   ├── 📁 pages/                     # Next.js pages
│   ├── 📁 api/                       # API utilities
│   ├── 📁 utils/                     # Utility functions
│   └── 📁 types/                     # TypeScript types
├── 📁 public/                        # Static assets
├── 📄 .env.production                # Production environment
├── 📄 verify-production-env.js       # Environment verification
├── 📄 next.config.js                 # Next.js configuration
└── 📄 package.json                   # Dependencies
```

## 🚀 **Deployment Workflows**

### **Development to QA**
```bash
# 1. Develop and test locally
npm run dev

# 2. Build and verify
npm run build
npm start

# 3. Push to QA branch
git checkout qa
git merge your-feature-branch
git push origin qa
```

### **QA to Production**
```bash
# 1. Verify QA environment
./docs/scripts/verify-environment.sh

# 2. Run production build
./docs/scripts/build-production.sh

# 3. Deploy to production
./docs/scripts/deploy.sh

# 4. Monitor health
./docs/scripts/health-check.sh
```

## 🔧 **Development Commands**

### **Essential Commands**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

### **Testing Commands**
```bash
# Environment verification
node verify-production-env.js

# Build environment test
./test-build-env.sh

# Runtime environment test
node test-runtime-env.js

# CORS testing
./docs/scripts/cors-test.sh

# Health monitoring
./docs/scripts/health-check.sh
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **Build Failures**
```bash
# Clear cache and rebuild
rm -rf .next node_modules/.cache
npm install --legacy-peer-deps
npm run build
```

#### **CORS Issues**
```bash
# Test CORS configuration
./docs/scripts/cors-test.sh

# Check client environment
open docs/scripts/check-client-env.html

# Debug API connectivity
./docs/scripts/debug-environment.sh
```

#### **Environment Issues**
```bash
# Verify environment configuration
node verify-production-env.js

# Debug environment variables
./docs/scripts/debug-environment.sh

# Check build environment
./docs/scripts/check-build-env.sh
```

#### **Deployment Issues**
```bash
# Comprehensive deployment debugging
./docs/scripts/debug-deployment.sh

# Force fresh deployment
./docs/scripts/force-fresh-deploy.sh

# Clear all caches
./docs/scripts/nuclear-cache-clear.sh
```

### **Getting Help**
- **📖 Documentation**: Check `docs/` directory for comprehensive guides
- **🔧 Scripts**: Use automation scripts in `docs/scripts/` for common tasks
- **🐛 Debugging**: Follow `docs/05-DEBUGGING-DOCUMENTATION.md` for detailed troubleshooting

## 📊 **Performance & Monitoring**

### **Health Monitoring**
```bash
# Comprehensive health check
./docs/scripts/health-check.sh

# Environment monitoring
./docs/scripts/verify-environment.sh

# Cache monitoring
./docs/scripts/debug-cache-issues.sh
```

### **Performance Optimization**
- **Build optimization**: Configured in `next.config.js`
- **Cache management**: Automated cache busting
- **Environment-specific builds**: Development vs Production optimization

## 🔐 **Security**

### **Environment Security**
- **Environment variables**: Properly configured for each environment
- **API security**: CORS configuration and proxy setup
- **Build security**: Production builds exclude development tools

### **Best Practices**
- Never commit `.env.local` or sensitive environment files
- Use environment-specific configurations
- Follow the deployment guides for secure production setup

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Develop** using `npm run dev`
4. **Test** your changes: `npm run build && npm start`
5. **Commit** your changes: `git commit -m 'Add amazing feature'`
6. **Push** to branch: `git push origin feature/amazing-feature`
7. **Create** a Pull Request

### **Code Standards**
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting configured
- **Prettier**: Code formatting (if configured)
- **Testing**: Test your changes before submitting

### **Documentation**
- Update relevant documentation in `docs/` directory
- Add new scripts to `docs/scripts/` if needed
- Update this README for significant changes

## 📞 **Support & Resources**

### **Documentation Resources**
- **[Complete Documentation](docs/README.md)** - Full documentation index
- **[Build Guide](docs/01-BUILD-DOCUMENTATION.md)** - Detailed build instructions
- **[Production Guide](docs/03-PRODUCTION-DOCUMENTATION.md)** - Production deployment
- **[Troubleshooting](docs/05-DEBUGGING-DOCUMENTATION.md)** - Comprehensive debugging

### **Quick Reference**
- **Environment Setup**: `node verify-production-env.js`
- **Build Production**: `./docs/scripts/build-production.sh`
- **Health Check**: `./docs/scripts/health-check.sh`
- **Debug Issues**: `./docs/scripts/debug-deployment.sh`

### **Emergency Procedures**
- **Production Issues**: Follow `docs/03-PRODUCTION-DOCUMENTATION.md`
- **CORS Problems**: Use `docs/04-CORS-DOCUMENTATION.md`
- **Build Failures**: Check `docs/01-BUILD-DOCUMENTATION.md`

## 📄 **License**

This project is proprietary software developed for Tijarah360. All rights reserved.

## 🏆 **Acknowledgments**

- **Next.js Team** - For the amazing React framework
- **Material-UI Team** - For the comprehensive component library
- **Development Team** - For continuous improvements and features
- **DevOps Team** - For infrastructure and deployment support

---

**📝 Note**: This README provides a comprehensive overview. For detailed information on specific topics, please refer to the extensive documentation in the `docs/` directory.

**🚀 Ready to get started? Run `npm install --legacy-peer-deps && npm run dev` and visit [http://localhost:3000](http://localhost:3000)**
