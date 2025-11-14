# 🔧 CORS Setup for Localhost → Production

## 🎯 **Problem**
When running the Tijarah Web app locally (`localhost:3000`) and trying to connect to the production API (`https://be.tijarah360.com`), browsers block the requests due to CORS (Cross-Origin Resource Sharing) policy.

## ✅ **Solution Implemented**

### **1. Next.js API Proxy Route**
- **File**: `src/pages/api/proxy/[...path].ts`
- **Purpose**: Acts as a server-side proxy to forward requests to production API
- **How it works**: 
  - Localhost requests go to `/api/proxy/*` 
  - Proxy forwards to `https://be.tijarah360.com/*`
  - Returns response with proper CORS headers

### **2. Smart serviceCaller Detection**
- **File**: `src/api/serviceCaller.ts` (Lines 60-68)
- **Purpose**: Automatically detects localhost and uses proxy
- **Logic**:
  ```typescript
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || 
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'));
  
  let url = isLocalhost 
    ? `/api/proxy${endpoint}` 
    : `${HOST}${endpoint}`;
  ```

### **3. Configuration Updates**
- **File**: `src/config.ts` (Lines 25-45, 118-120)
- **Purpose**: Environment-aware HOST configuration
- **Features**:
  - Localhost detection
  - Automatic proxy routing for development
  - Production URLs for deployed environments

### **4. Next.js CORS Headers**
- **File**: `next.config.js` (Lines 18-30)
- **Purpose**: Adds CORS headers to all API routes
- **Headers**:
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type, Authorization`

## 🚀 **How to Use**

### **Development (Localhost)**
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `http://localhost:3000`

3. **All API calls will automatically:**
   - Be detected as localhost
   - Route through `/api/proxy/*`
   - Forward to production API
   - Return with proper CORS headers

### **Production Deployment (demo-app.tijarah360.com)**
- Proxy automatically disabled in production
- Direct API calls to `https://be.tijarah360.com`
- CORS headers configured for `demo-app.tijarah360.com`
- No proxy overhead in production

## 🔍 **Testing the Setup**

### **1. Check Proxy Endpoint**
Visit: `http://localhost:3000/api/proxy/health` (if health endpoint exists)

### **2. Check Browser Network Tab**
- Localhost requests should go to `/api/proxy/*`
- No CORS errors in console
- Successful API responses

### **3. Check Server Logs**
Look for proxy logs: `[PROXY] GET /api/proxy/...`

## 🛠️ **Alternative Solutions**

### **Option A: Browser CORS Disable (Quick Fix)**
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome-dev"

# Mac
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_test" --disable-web-security

# Linux
google-chrome --disable-web-security --user-data-dir="/tmp/chrome-dev"
```

### **Option B: CORS Browser Extension**
1. Install "CORS Unblock" extension
2. Enable for localhost development
3. Disable for normal browsing

### **Option C: Environment Variables**
Create `.env.local`:
```env
NEXT_PUBLIC_APP_ENV=local
NEXT_PUBLIC_PRODUCTION_API_URL=https://be.tijarah360.com
```

## ⚠️ **Important Notes**

1. **Security**: Proxy only works in development (localhost)
2. **Performance**: No proxy overhead in production
3. **Debugging**: Check browser console and server logs
4. **Environment**: Automatically detects localhost vs production

## 🔧 **Troubleshooting**

### **CORS Errors Still Appearing**
1. Clear browser cache
2. Check if running on `localhost` (not `127.0.0.1`)
3. Verify proxy endpoint exists: `/api/proxy/[...path].ts`

### **Proxy Not Working**
1. Check server logs for `[PROXY]` messages
2. Verify `serviceCaller.ts` localhost detection
3. Test proxy directly: `http://localhost:3000/api/proxy/health`

### **Production API Issues**
1. Verify production API is accessible
2. Check API authentication/authorization
3. Confirm endpoint paths are correct

## ✅ **Status**
- ✅ Proxy route created
- ✅ serviceCaller updated
- ✅ Configuration updated
- ✅ CORS headers added
- ✅ Localhost detection implemented
- ✅ Ready for development!
