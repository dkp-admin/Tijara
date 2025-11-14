# 🌐 CORS Documentation - Tijarah Web

## 📋 **Overview**

Cross-Origin Resource Sharing (CORS) is a critical security mechanism that controls how web applications can access resources from different domains. This document provides comprehensive guidance for configuring and troubleshooting CORS issues in the Tijarah Web application.

## 🎯 **CORS Configuration**

### **Current Domain Setup**
- **Production Frontend**: `https://demo-app.tijarah360.com`
- **QA Frontend**: `https://tijarah-qa.vercel.app`
- **Development Frontend**: `http://localhost:3000`
- **API Backend**: `https://be.tijarah360.com`

### **CORS Requirements**
The backend API must allow requests from all frontend domains to ensure proper functionality across all environments.

## 🔧 **Frontend CORS Configuration**

### **Next.js Configuration**

In `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },

  // Proxy configuration for development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/proxy/:path*',
          destination: 'https://be.tijarah360.com/:path*',
        },
      ];
    }
    return [];
  },
};

module.exports = nextConfig;
```

### **API Proxy Implementation**

Create `src/pages/api/proxy/[...path].ts`:

```typescript
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const apiUrl = `https://be.tijarah360.com/${apiPath}`;
    
    const response = await fetch(apiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.authorization || '',
        ...req.headers,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy request failed' });
  }
}
```

## 🚀 **Kubernetes CORS Configuration**

### **Ingress CORS Headers**

In `k8s/ingress-production.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tijarah-web-ingress
  namespace: tijarah-web
  annotations:
    kubernetes.io/ingress.class: "nginx"
    # CORS Configuration
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://demo-app.tijarah360.com,https://tijarah-qa.vercel.app,http://localhost:3000"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization, X-Requested-With, X-CSRF-Token"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
    nginx.ingress.kubernetes.io/cors-max-age: "86400"
    # Handle preflight requests
    nginx.ingress.kubernetes.io/configuration-snippet: |
      if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' 86400 always;
        return 204;
      }
spec:
  rules:
  - host: demo-app.tijarah360.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: tijarah-web-service
            port:
              number: 80
```

### **Service Configuration**

In `k8s/production/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: tijarah-web-service
  namespace: tijarah-web
  annotations:
    # OCI Load Balancer CORS
    service.beta.kubernetes.io/oci-load-balancer-cors-allowed-origins: "https://demo-app.tijarah360.com,https://tijarah-qa.vercel.app"
    service.beta.kubernetes.io/oci-load-balancer-cors-allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
    service.beta.kubernetes.io/oci-load-balancer-cors-allowed-headers: "Content-Type,Authorization,X-Requested-With"
spec:
  selector:
    app: tijarah-web
    environment: production
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

## 🔍 **CORS Testing Scripts**

### **CORS Test Script**

Create `scripts/test-cors.sh`:

```bash
#!/bin/bash

echo "🌐 CORS Testing Suite"
echo "===================="

# Test domains
DOMAINS=(
    "https://demo-app.tijarah360.com"
    "https://tijarah-qa.vercel.app"
    "http://localhost:3000"
)

API_ENDPOINTS=(
    "/api/health"
    "/api/auth/status"
    "/api/user/profile"
)

# Function to test CORS
test_cors() {
    local origin=$1
    local endpoint=$2
    local target_url=$3
    
    echo "Testing CORS: $origin -> $target_url$endpoint"
    
    # Test preflight request
    preflight_response=$(curl -s -I -X OPTIONS \
        -H "Origin: $origin" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        "$target_url$endpoint")
    
    if echo "$preflight_response" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Preflight: PASS"
    else
        echo "❌ Preflight: FAIL"
        echo "$preflight_response"
    fi
    
    # Test actual request
    actual_response=$(curl -s -I -X GET \
        -H "Origin: $origin" \
        -H "Content-Type: application/json" \
        "$target_url$endpoint")
    
    if echo "$actual_response" | grep -q "200\|204"; then
        echo "✅ Request: PASS"
    else
        echo "❌ Request: FAIL"
        echo "$actual_response"
    fi
    
    echo "---"
}

# Test production domain
echo "🚀 Testing Production Domain"
for endpoint in "${API_ENDPOINTS[@]}"; do
    for origin in "${DOMAINS[@]}"; do
        test_cors "$origin" "$endpoint" "https://demo-app.tijarah360.com"
    done
done

# Test backend API directly
echo "🔌 Testing Backend API"
for endpoint in "${API_ENDPOINTS[@]}"; do
    for origin in "${DOMAINS[@]}"; do
        test_cors "$origin" "$endpoint" "https://be.tijarah360.com"
    done
done

echo "🌐 CORS testing complete"
```

### **Browser CORS Test**

Create `scripts/browser-cors-test.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CORS Test</title>
</head>
<body>
    <h1>CORS Test Suite</h1>
    <div id="results"></div>
    
    <script>
        const results = document.getElementById('results');
        
        async function testCORS(url, method = 'GET') {
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                
                return {
                    status: response.status,
                    ok: response.ok,
                    headers: Object.fromEntries(response.headers.entries())
                };
            } catch (error) {
                return {
                    error: error.message
                };
            }
        }
        
        async function runTests() {
            const tests = [
                { url: 'https://demo-app.tijarah360.com/api/health', name: 'Production Health' },
                { url: 'https://be.tijarah360.com/api/health', name: 'Backend Health' },
                { url: 'https://demo-app.tijarah360.com/api/auth/status', name: 'Auth Status' },
            ];
            
            results.innerHTML = '<h2>Running CORS Tests...</h2>';
            
            for (const test of tests) {
                const result = await testCORS(test.url);
                const div = document.createElement('div');
                div.innerHTML = `
                    <h3>${test.name}</h3>
                    <p>URL: ${test.url}</p>
                    <p>Status: ${result.status || 'Error'}</p>
                    <p>Success: ${result.ok ? '✅' : '❌'}</p>
                    <p>Error: ${result.error || 'None'}</p>
                    <hr>
                `;
                results.appendChild(div);
            }
        }
        
        // Run tests when page loads
        window.onload = runTests;
    </script>
</body>
</html>
```

## 🚨 **CORS Troubleshooting**

### **Common CORS Errors**

#### **1. "Access to fetch at '...' has been blocked by CORS policy"**

**Cause**: Backend not configured to allow frontend domain

**Solution**:
```bash
# Check if domain is in backend CORS configuration
curl -I -X OPTIONS \
    -H "Origin: https://demo-app.tijarah360.com" \
    https://be.tijarah360.com/api/health
```

#### **2. "Preflight request doesn't pass access control check"**

**Cause**: OPTIONS request not handled properly

**Solution**:
```javascript
// Ensure OPTIONS method is handled
if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.status(200).end();
    return;
}
```

#### **3. "Credentials include but Access-Control-Allow-Credentials is false"**

**Cause**: Credentials not allowed in CORS configuration

**Solution**:
```bash
# Add credentials support
nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
```

### **CORS Debugging Script**

Create `scripts/debug-cors.sh`:

```bash
#!/bin/bash

echo "🔍 CORS Debugging"
echo "================="

DOMAIN="https://demo-app.tijarah360.com"
ORIGIN="https://demo-app.tijarah360.com"

# Check preflight request
echo "🔍 Testing preflight request..."
curl -v -X OPTIONS \
    -H "Origin: $ORIGIN" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    "$DOMAIN/api/health"

echo ""
echo "🔍 Testing actual request..."
curl -v -X GET \
    -H "Origin: $ORIGIN" \
    -H "Content-Type: application/json" \
    "$DOMAIN/api/health"

echo ""
echo "🔍 Checking ingress configuration..."
kubectl get ingress tijarah-web-ingress -n tijarah-web -o yaml | grep -A 10 cors

echo ""
echo "🔍 Checking service annotations..."
kubectl get service tijarah-web-service -n tijarah-web -o yaml | grep -A 5 cors
```

### **Quick CORS Fixes**

#### **1. Temporary Browser Fix**
```bash
# Disable CORS in Chrome (development only)
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

#### **2. Proxy Fix**
```javascript
// Use proxy for API calls
const API_BASE = process.env.NODE_ENV === 'development' 
    ? '/api/proxy' 
    : 'https://be.tijarah360.com';
```

#### **3. Ingress Update**
```bash
# Update ingress with CORS headers
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

## 📝 **CORS Checklist**

### **Frontend Configuration**
- [ ] Next.js CORS headers configured
- [ ] API proxy implemented for development
- [ ] Environment-specific API endpoints configured
- [ ] Credentials handling implemented

### **Backend Configuration**
- [ ] CORS middleware configured
- [ ] All frontend domains added to allowed origins
- [ ] Preflight requests handled
- [ ] Credentials support enabled

### **Kubernetes Configuration**
- [ ] Ingress CORS annotations added
- [ ] Service CORS annotations configured
- [ ] Load balancer CORS settings applied
- [ ] SSL/TLS certificates valid

### **Testing**
- [ ] Preflight requests working
- [ ] Actual requests working
- [ ] All environments tested
- [ ] Browser compatibility verified

---

**📞 Support**: For CORS issues, run the debugging scripts or contact the backend team to verify API CORS configuration.
