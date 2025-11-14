# 🔍 Debugging Documentation - Tijarah Web

## 📋 **Overview**

This comprehensive debugging guide provides step-by-step troubleshooting procedures for common issues in the Tijarah Web application across all environments.

## 🎯 **Quick Diagnostic Commands**

### **Environment Check**
```bash
# Check current environment
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
node verify-production-env.js

# Check running processes
ps aux | grep node
netstat -tulpn | grep 3000
```

### **Application Health**
```bash
# Test application endpoints
curl http://localhost:3000
curl http://localhost:3000/api/health
curl https://demo-app.tijarah360.com

# Check application logs
kubectl logs -n tijarah-web -l app=tijarah-web --tail=50
```

## 🚨 **Common Issues & Solutions**

### **1. Environment Variable Issues**

#### **Problem**: Wrong environment URLs (QA instead of production)
```
Error: Application redirecting to qa.vercel.app
```

**Diagnosis**:
```bash
# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_APP_ENV)"
node verify-production-env.js

# Check build environment
grep -r "qa.vercel.app" .next/static/chunks/
```

**Solution**:
```bash
# Stop application
pkill -f "npm start"

# Set correct environment
export NODE_ENV=production
export NEXT_PUBLIC_APP_ENV=production
export NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com

# Rebuild and restart
rm -rf .next
npm run build
npm start
```

#### **Problem**: Environment variables not loading
```
Error: process.env.NEXT_PUBLIC_APP_ENV is undefined
```

**Diagnosis**:
```bash
# Check environment files
ls -la .env*
cat .env.production

# Test environment loading
export $(cat .env.production | grep -v '^#' | xargs)
echo $NEXT_PUBLIC_APP_ENV
```

**Solution**:
```bash
# Create missing environment file
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_FRONTEND_URL=https://demo-app.tijarah360.com
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
EOF

# Start with explicit environment
NODE_ENV=production NEXT_PUBLIC_APP_ENV=production npm start
```

### **2. Build Issues**

#### **Problem**: Build failing with dependency errors
```
Error: peer dependency warnings
Error: Cannot resolve dependency
```

**Diagnosis**:
```bash
# Check npm version
npm --version

# Check package.json
cat package.json | grep dependencies -A 20

# Check for conflicts
npm ls --depth=0
```

**Solution**:
```bash
# Clean install with legacy peer deps
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Alternative: Use npm ci
npm ci --legacy-peer-deps
```

#### **Problem**: Out of memory during build
```
Error: JavaScript heap out of memory
```

**Solution**:
```bash
# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Or use build script with memory settings
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### **3. CORS Issues**

#### **Problem**: CORS policy blocking requests
```
Error: Access to fetch at 'https://be.tijarah360.com' has been blocked by CORS policy
```

**Diagnosis**:
```bash
# Test CORS headers
curl -I -X OPTIONS \
    -H "Origin: https://demo-app.tijarah360.com" \
    https://be.tijarah360.com/api/health

# Check ingress configuration
kubectl get ingress tijarah-web-ingress -n tijarah-web -o yaml | grep cors
```

**Solution**:
```bash
# Quick fix: Enable proxy
# Edit src/config.ts to use proxy for production

# Kubernetes fix: Update ingress
kubectl patch ingress tijarah-web-ingress -n tijarah-web -p '
{
  "metadata": {
    "annotations": {
      "nginx.ingress.kubernetes.io/enable-cors": "true",
      "nginx.ingress.kubernetes.io/cors-allow-origin": "*"
    }
  }
}'
```

### **4. Kubernetes Issues**

#### **Problem**: Pods not starting
```
Error: CrashLoopBackOff
Error: ImagePullBackOff
```

**Diagnosis**:
```bash
# Check pod status
kubectl get pods -n tijarah-web -l app=tijarah-web

# Check pod logs
kubectl logs -n tijarah-web -l app=tijarah-web --tail=50

# Describe pod for events
kubectl describe pod -n tijarah-web -l app=tijarah-web
```

**Solution**:
```bash
# Check image availability
docker images | grep tijarah-web

# Restart deployment
kubectl rollout restart deployment/tijarah-web-production -n tijarah-web

# Check resource limits
kubectl describe deployment tijarah-web-production -n tijarah-web
```

#### **Problem**: Service not accessible
```
Error: Connection refused
Error: Service unavailable
```

**Diagnosis**:
```bash
# Check service
kubectl get service tijarah-web-service -n tijarah-web

# Check endpoints
kubectl get endpoints tijarah-web-service -n tijarah-web

# Test service connectivity
kubectl port-forward service/tijarah-web-service 8080:80 -n tijarah-web
curl http://localhost:8080
```

## 🔧 **Debugging Scripts**

### **Comprehensive Debug Script**

Create `scripts/debug-all.sh`:

```bash
#!/bin/bash

echo "🔍 Comprehensive Debugging - Tijarah Web"
echo "========================================"

# System information
echo "📊 System Information:"
echo "OS: $(uname -a)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "kubectl: $(kubectl version --client --short 2>/dev/null || echo 'Not available')"

# Environment check
echo ""
echo "🌐 Environment Check:"
echo "NODE_ENV: $NODE_ENV"
echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"

# File system check
echo ""
echo "📁 File System Check:"
echo "Current directory: $(pwd)"
echo "Environment files:"
ls -la .env* 2>/dev/null || echo "No .env files found"
echo "Build directory:"
ls -la .next 2>/dev/null || echo "No .next directory found"

# Process check
echo ""
echo "🔄 Process Check:"
echo "Node processes:"
ps aux | grep node | grep -v grep || echo "No node processes"
echo "Port 3000 usage:"
netstat -tulpn | grep 3000 || echo "Port 3000 free"

# Application test
echo ""
echo "🧪 Application Test:"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Local application accessible"
    echo "Response time: $(curl -s -o /dev/null -w '%{time_total}s' http://localhost:3000)"
else
    echo "❌ Local application not accessible"
fi

# Kubernetes check
echo ""
echo "🐳 Kubernetes Check:"
if kubectl cluster-info > /dev/null 2>&1; then
    echo "✅ Kubernetes cluster accessible"
    echo "Pods:"
    kubectl get pods -n tijarah-web -l app=tijarah-web 2>/dev/null || echo "No pods found"
    echo "Services:"
    kubectl get services -n tijarah-web 2>/dev/null || echo "No services found"
    echo "Ingress:"
    kubectl get ingress -n tijarah-web 2>/dev/null || echo "No ingress found"
else
    echo "❌ Kubernetes cluster not accessible"
fi

# External connectivity
echo ""
echo "🌐 External Connectivity:"
if curl -s https://demo-app.tijarah360.com > /dev/null 2>&1; then
    echo "✅ Production domain accessible"
else
    echo "❌ Production domain not accessible"
fi

if curl -s https://be.tijarah360.com/health > /dev/null 2>&1; then
    echo "✅ Backend API accessible"
else
    echo "❌ Backend API not accessible"
fi

echo ""
echo "========================================"
echo "🔍 Debug complete"
echo "========================================"
```

### **Environment Debug Script**

Create `scripts/debug-environment.sh`:

```bash
#!/bin/bash

echo "🌐 Environment Debugging"
echo "======================="

# Load environment files
for env_file in .env.production .env.local .env; do
    if [ -f "$env_file" ]; then
        echo "📄 Found $env_file:"
        cat "$env_file"
        echo ""
    fi
done

# Test environment loading
echo "🧪 Testing environment loading:"
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
    echo "Loaded from .env.production:"
    echo "NODE_ENV: $NODE_ENV"
    echo "NEXT_PUBLIC_APP_ENV: $NEXT_PUBLIC_APP_ENV"
    echo "NEXT_PUBLIC_FRONTEND_URL: $NEXT_PUBLIC_FRONTEND_URL"
fi

# Validate environment
echo ""
echo "🔍 Environment validation:"
node verify-production-env.js 2>/dev/null || echo "❌ Environment validation failed"

# Check build environment
echo ""
echo "🔨 Build environment check:"
if [ -d .next ]; then
    echo "Checking for environment variables in build..."
    grep -r "demo-app.tijarah360.com" .next/static/chunks/ | head -3 || echo "No demo-app URLs found"
    grep -r "qa.vercel.app" .next/static/chunks/ | head -3 || echo "No QA URLs found"
else
    echo "❌ No .next directory found - application not built"
fi
```

### **Performance Debug Script**

Create `scripts/debug-performance.sh`:

```bash
#!/bin/bash

echo "⚡ Performance Debugging"
echo "======================="

DOMAIN="https://demo-app.tijarah360.com"

# Test response times
echo "🕐 Response time testing:"
for i in {1..5}; do
    time=$(curl -s -o /dev/null -w '%{time_total}' $DOMAIN)
    echo "Request $i: ${time}s"
done

# Test different endpoints
echo ""
echo "🔌 Endpoint testing:"
endpoints=("/" "/api/health" "/api/auth/status")
for endpoint in "${endpoints[@]}"; do
    time=$(curl -s -o /dev/null -w '%{time_total}' $DOMAIN$endpoint)
    status=$(curl -s -o /dev/null -w '%{http_code}' $DOMAIN$endpoint)
    echo "$endpoint: ${time}s (HTTP $status)"
done

# Memory usage
echo ""
echo "💾 Memory usage:"
if command -v free > /dev/null; then
    free -h
fi

# Disk usage
echo ""
echo "💿 Disk usage:"
df -h . 2>/dev/null || echo "Disk usage not available"

# Network connectivity
echo ""
echo "🌐 Network connectivity:"
ping -c 3 google.com > /dev/null 2>&1 && echo "✅ Internet connectivity" || echo "❌ No internet connectivity"
```

## 🔍 **Browser Debugging**

### **Developer Tools Checklist**

#### **Console Errors**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Check for CORS errors
5. Verify environment variables

#### **Network Tab Analysis**
1. Open Network tab
2. Reload page
3. Check for failed requests (red status)
4. Verify API endpoints
5. Check response headers for CORS

#### **Application Tab**
1. Check Local Storage for user data
2. Verify Session Storage
3. Check Cookies
4. Clear storage if needed

### **Browser Debug Commands**

```javascript
// Check environment in browser console
console.log('Environment:', process.env.NEXT_PUBLIC_APP_ENV);
console.log('Frontend URL:', process.env.NEXT_PUBLIC_FRONTEND_URL);

// Check API connectivity
fetch('/api/health')
  .then(response => response.json())
  .then(data => console.log('API Health:', data))
  .catch(error => console.error('API Error:', error));

// Check CORS
fetch('https://be.tijarah360.com/api/health', {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
})
.then(response => console.log('CORS Test:', response.status))
.catch(error => console.error('CORS Error:', error));
```

## 📊 **Log Analysis**

### **Application Logs**
```bash
# Local application logs
npm start 2>&1 | tee app.log

# Kubernetes application logs
kubectl logs -n tijarah-web -l app=tijarah-web --tail=100 -f

# Filter for errors
kubectl logs -n tijarah-web -l app=tijarah-web | grep -i error
```

### **System Logs**
```bash
# System logs (Linux)
journalctl -u nginx -f
journalctl -u docker -f

# Check disk space
df -h
du -sh .next node_modules

# Check memory usage
free -h
top -p $(pgrep node)
```

## 🎯 **Troubleshooting Flowchart**

### **Application Not Loading**
1. ✅ Check if process is running: `ps aux | grep node`
2. ✅ Check port availability: `netstat -tulpn | grep 3000`
3. ✅ Check environment variables: `node verify-production-env.js`
4. ✅ Check build directory: `ls -la .next`
5. ✅ Restart application: `npm start`

### **CORS Errors**
1. ✅ Check browser console for CORS errors
2. ✅ Test preflight request: `curl -I -X OPTIONS -H "Origin: https://demo-app.tijarah360.com" https://be.tijarah360.com/api/health`
3. ✅ Check ingress configuration: `kubectl get ingress -o yaml`
4. ✅ Enable proxy temporarily
5. ✅ Contact backend team

### **Build Failures**
1. ✅ Check Node.js version: `node --version`
2. ✅ Clear cache: `rm -rf node_modules .next`
3. ✅ Install with legacy peer deps: `npm install --legacy-peer-deps`
4. ✅ Increase memory: `export NODE_OPTIONS="--max-old-space-size=4096"`
5. ✅ Rebuild: `npm run build`

### **Kubernetes Issues**
1. ✅ Check cluster connectivity: `kubectl cluster-info`
2. ✅ Check pod status: `kubectl get pods -n tijarah-web`
3. ✅ Check logs: `kubectl logs -n tijarah-web -l app=tijarah-web`
4. ✅ Check service: `kubectl get service -n tijarah-web`
5. ✅ Check ingress: `kubectl get ingress -n tijarah-web`

## 📝 **Debug Checklist**

### **Environment Issues**
- [ ] Environment files exist and are valid
- [ ] Environment variables loaded correctly
- [ ] Build includes correct environment
- [ ] Application using production URLs

### **Build Issues**
- [ ] Node.js version compatible
- [ ] Dependencies installed correctly
- [ ] Build completes without errors
- [ ] Build directory exists

### **Runtime Issues**
- [ ] Application starts successfully
- [ ] Port 3000 accessible
- [ ] API endpoints responding
- [ ] No JavaScript errors in console

### **Kubernetes Issues**
- [ ] Cluster accessible
- [ ] Pods running correctly
- [ ] Services configured properly
- [ ] Ingress routing correctly

### **CORS Issues**
- [ ] Preflight requests working
- [ ] Backend allows frontend domain
- [ ] Ingress CORS headers configured
- [ ] Browser not blocking requests

## 📞 **Escalation Procedures**

### **Level 1: Self-Service**
1. Run debug scripts
2. Check documentation
3. Review logs
4. Try common solutions

### **Level 2: Team Support**
1. Contact development team
2. Provide debug script output
3. Share error logs
4. Describe steps taken

### **Level 3: Infrastructure**
1. Contact DevOps team
2. Escalate Kubernetes issues
3. Report infrastructure problems
4. Request emergency support

### **Emergency Contacts**
- **Development Team**: [Dev Team Contact]
- **DevOps Team**: [DevOps Contact]
- **Emergency Escalation**: [Emergency Contact]

---

**📝 Note**: Always run the debug scripts first and gather information before escalating issues. This helps provide context and speeds up resolution.
