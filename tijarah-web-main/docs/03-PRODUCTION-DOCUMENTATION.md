# 🚀 Production Documentation - Tijarah Web

## 📋 **Overview**

This document provides comprehensive instructions for deploying, managing, and maintaining the Tijarah Web application in production environment.

## 🎯 **Production Environment**

### **Environment Details**
- **Domain**: `https://demo-app.tijarah360.com`
- **API Backend**: `https://be.tijarah360.com`
- **Environment**: `production`
- **Platform**: Kubernetes on Oracle Cloud Infrastructure (OCI)
- **Port**: 3000 (internal)
- **SSL**: Managed by OCI Load Balancer

### **Infrastructure Components**
- **Kubernetes Cluster**: OCI Container Engine for Kubernetes (OKE)
- **Load Balancer**: OCI Load Balancer with SSL termination
- **DNS**: Managed through domain provider
- **Monitoring**: OCI Monitoring and Logging
- **Storage**: OCI Object Storage for static assets

## 🔧 **Production Deployment**

### **Pre-Deployment Checklist**
- [ ] QA testing completed and signed off
- [ ] Environment variables verified
- [ ] Build tested locally
- [ ] Database migrations ready (if applicable)
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Team notified of deployment

### **Production Deployment Script**

Create `scripts/deploy-production.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Production Deployment - Tijarah Web"
echo "======================================"

# Deployment configuration
NAMESPACE="tijarah-web"
DEPLOYMENT_NAME="tijarah-web-production"
IMAGE_TAG="latest"
DOMAIN="demo-app.tijarah360.com"

# Pre-deployment validation
echo "🔍 Pre-deployment validation..."

# Check kubectl access
kubectl cluster-info > /dev/null 2>&1 || {
    echo "❌ kubectl not configured or cluster not accessible"
    exit 1
}

# Check namespace
kubectl get namespace $NAMESPACE > /dev/null 2>&1 || {
    echo "📁 Creating namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE
}

# Validate environment variables
if [ ! -f .env.production ]; then
    echo "❌ .env.production file not found"
    exit 1
fi

# Load and validate environment
export $(cat .env.production | grep -v '^#' | xargs)

if [ "$NEXT_PUBLIC_APP_ENV" != "production" ]; then
    echo "❌ NEXT_PUBLIC_APP_ENV must be 'production'"
    exit 1
fi

echo "✅ Pre-deployment validation complete"

# Build production image
echo "🔨 Building production image..."
docker build -t tijarah-web:$IMAGE_TAG .

# Deploy to Kubernetes
echo "🚀 Deploying to Kubernetes..."

# Apply ConfigMap for environment variables
kubectl create configmap tijarah-web-config \
    --from-env-file=.env.production \
    --namespace=$NAMESPACE \
    --dry-run=client -o yaml | kubectl apply -f -

# Apply deployment
kubectl apply -f k8s/production/ --namespace=$NAMESPACE

# Wait for deployment to be ready
echo "⏳ Waiting for deployment to be ready..."
kubectl rollout status deployment/$DEPLOYMENT_NAME --namespace=$NAMESPACE --timeout=300s

# Verify deployment
echo "🔍 Verifying deployment..."
kubectl get pods --namespace=$NAMESPACE -l app=tijarah-web

# Health check
echo "🏥 Running health check..."
sleep 30
kubectl port-forward service/tijarah-web-service 8080:80 --namespace=$NAMESPACE &
PORT_FORWARD_PID=$!

sleep 5
curl -f http://localhost:8080/api/health || {
    echo "❌ Health check failed"
    kill $PORT_FORWARD_PID
    exit 1
}

kill $PORT_FORWARD_PID
echo "✅ Health check passed"

# Update ingress
echo "🌐 Updating ingress configuration..."
kubectl apply -f k8s/ingress-production.yaml --namespace=$NAMESPACE

echo "🎉 Production deployment complete!"
echo "🌐 Application available at: https://$DOMAIN"
echo "📊 Monitor deployment: kubectl get pods -n $NAMESPACE"
```

### **Kubernetes Configuration Files**

Create `k8s/production/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tijarah-web-production
  namespace: tijarah-web
  labels:
    app: tijarah-web
    environment: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: tijarah-web
      environment: production
  template:
    metadata:
      labels:
        app: tijarah-web
        environment: production
    spec:
      containers:
      - name: tijarah-web
        image: tijarah-web:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: NEXT_PUBLIC_APP_ENV
          value: "production"
        - name: NEXT_PUBLIC_FRONTEND_URL
          value: "https://demo-app.tijarah360.com"
        - name: NEXT_PUBLIC_PRODUCTION_API_URL
          value: "https://be.tijarah360.com"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: tijarah-web-service
  namespace: tijarah-web
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

Create `k8s/ingress-production.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tijarah-web-ingress
  namespace: tijarah-web
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
    nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, OPTIONS"
    nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization, X-Requested-With"
    nginx.ingress.kubernetes.io/cors-allow-credentials: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    service.beta.kubernetes.io/oci-load-balancer-shape: "flexible"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-min: "10"
    service.beta.kubernetes.io/oci-load-balancer-shape-flex-max: "100"
spec:
  tls:
  - hosts:
    - demo-app.tijarah360.com
    secretName: tijarah-web-tls
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

## 📊 **Production Monitoring**

### **Health Check Script**

Create `scripts/production-health-check.sh`:

```bash
#!/bin/bash

echo "🏥 Production Health Check"
echo "========================="

DOMAIN="https://demo-app.tijarah360.com"
NAMESPACE="tijarah-web"

# Check domain accessibility
echo "🌐 Checking domain accessibility..."
status=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN)
if [ "$status" = "200" ]; then
    echo "✅ Domain accessible ($status)"
else
    echo "❌ Domain not accessible ($status)"
fi

# Check API health
echo "🔌 Checking API health..."
api_status=$(curl -s -o /dev/null -w "%{http_code}" $DOMAIN/api/health)
if [ "$api_status" = "200" ]; then
    echo "✅ API healthy ($api_status)"
else
    echo "❌ API unhealthy ($api_status)"
fi

# Check Kubernetes pods
echo "🐳 Checking Kubernetes pods..."
kubectl get pods -n $NAMESPACE -l app=tijarah-web

# Check pod health
echo "🔍 Pod health status..."
kubectl get pods -n $NAMESPACE -l app=tijarah-web -o jsonpath='{.items[*].status.conditions[?(@.type=="Ready")].status}'

# Check resource usage
echo "📊 Resource usage..."
kubectl top pods -n $NAMESPACE -l app=tijarah-web

# Check ingress status
echo "🌐 Ingress status..."
kubectl get ingress -n $NAMESPACE

echo "🏥 Health check complete"
```

### **Production Monitoring Dashboard**

Key metrics to monitor:
- **Application Health**: HTTP status codes, response times
- **Pod Health**: Pod status, restart counts, resource usage
- **Traffic**: Request volume, error rates
- **Performance**: Response times, throughput
- **Infrastructure**: CPU, memory, disk usage

## 🔄 **Production Maintenance**

### **Rolling Updates**

```bash
# Update deployment with new image
kubectl set image deployment/tijarah-web-production \
    tijarah-web=tijarah-web:new-tag \
    --namespace=tijarah-web

# Monitor rollout
kubectl rollout status deployment/tijarah-web-production \
    --namespace=tijarah-web
```

### **Scaling**

```bash
# Scale up for high traffic
kubectl scale deployment tijarah-web-production \
    --replicas=5 \
    --namespace=tijarah-web

# Scale down during low traffic
kubectl scale deployment tijarah-web-production \
    --replicas=2 \
    --namespace=tijarah-web
```

### **Rollback Procedure**

```bash
# Check rollout history
kubectl rollout history deployment/tijarah-web-production \
    --namespace=tijarah-web

# Rollback to previous version
kubectl rollout undo deployment/tijarah-web-production \
    --namespace=tijarah-web

# Rollback to specific revision
kubectl rollout undo deployment/tijarah-web-production \
    --to-revision=2 \
    --namespace=tijarah-web
```

## 🚨 **Emergency Procedures**

### **Emergency Rollback**

Create `scripts/emergency-rollback.sh`:

```bash
#!/bin/bash
set -e

echo "🚨 EMERGENCY ROLLBACK"
echo "===================="

NAMESPACE="tijarah-web"
DEPLOYMENT="tijarah-web-production"

# Immediate rollback
echo "⏪ Rolling back to previous version..."
kubectl rollout undo deployment/$DEPLOYMENT --namespace=$NAMESPACE

# Wait for rollback
echo "⏳ Waiting for rollback to complete..."
kubectl rollout status deployment/$DEPLOYMENT --namespace=$NAMESPACE

# Verify rollback
echo "🔍 Verifying rollback..."
kubectl get pods -n $NAMESPACE -l app=tijarah-web

# Health check
echo "🏥 Health check after rollback..."
sleep 30
curl -f https://demo-app.tijarah360.com/api/health

echo "✅ Emergency rollback complete"
```

### **Incident Response**

1. **Immediate Response**
   - Run health check script
   - Check application logs
   - Verify infrastructure status

2. **Assessment**
   - Identify root cause
   - Assess impact scope
   - Determine fix timeline

3. **Resolution**
   - Apply hotfix or rollback
   - Monitor application recovery
   - Verify full functionality

4. **Post-Incident**
   - Document incident details
   - Conduct post-mortem
   - Implement preventive measures

## 📝 **Production Checklist**

### **Pre-Deployment**
- [ ] QA sign-off received
- [ ] Environment variables verified
- [ ] Build tested and validated
- [ ] Rollback plan prepared
- [ ] Team notified

### **Deployment**
- [ ] Pre-deployment validation passed
- [ ] Kubernetes deployment successful
- [ ] Health checks passing
- [ ] Ingress configuration updated
- [ ] SSL certificate valid

### **Post-Deployment**
- [ ] Application accessible via domain
- [ ] All features functioning correctly
- [ ] Performance within acceptable limits
- [ ] Monitoring alerts configured
- [ ] Documentation updated

---

**📞 Emergency Contact**: For production issues, contact [Emergency Contact] or refer to [Debugging Documentation](05-DEBUGGING-DOCUMENTATION.md).
