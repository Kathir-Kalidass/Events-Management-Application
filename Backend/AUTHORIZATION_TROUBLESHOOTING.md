# Authorization Troubleshooting Guide

## Current Status Analysis

Based on the logs provided, the authorization system is working correctly for authenticated requests:

### ✅ **Working Correctly:**
- Token validation and decoding
- User authentication and role assignment
- Role-based authorization checks
- JWT secret validation

### ⚠️ **Issues Identified:**
- Some requests are missing authorization headers entirely
- This suggests frontend requests aren't including tokens properly

## Log Analysis

### Successful Authentication Examples:
```
🔐 Token received: eyJhbGciOi...TYLB61UevM
✅ Token decoded successfully for user: 687115799ffa65b3e50bc98f
👤 User authenticated: Raju (kathirkalidass005@outlook.com)
✅ Role authorization passed for user: Raju (hod)
```

### Problem Pattern:
```
❌ No authorization header found
```

## Debugging Tools Added

### 1. Enhanced Auth Middleware
- Added detailed request logging
- Better error messages with error codes
- More specific token validation

### 2. Debug Endpoints
Access these endpoints to troubleshoot:

#### Check Auth Status
```
GET /api/debug/auth-status
```
Returns current authentication status and user info.

#### Health Check
```
GET /api/debug/health
```
Server health check (no auth required).

#### Test Auth Scenarios
```
GET /api/debug/test-auth
```
Tests different authentication scenarios.

## Common Issues & Solutions

### 1. **Missing Authorization Headers**

**Symptoms:**
```
❌ No authorization header found for GET /api/coordinator/programmes
```

**Possible Causes:**
- Frontend not including Authorization header
- Token not stored in localStorage/sessionStorage
- Axios/fetch requests missing headers
- CORS issues preventing headers

**Solutions:**
```javascript
// Frontend: Ensure token is included in requests
const token = localStorage.getItem('token');
const config = {
  headers: {
    'Authorization': `Bearer ${token}`
  }
};

// Axios example
axios.get('/api/coordinator/programmes', config);

// Fetch example
fetch('/api/coordinator/programmes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 2. **Token Format Issues**

**Symptoms:**
```
❌ Invalid token after split: "undefined"
```

**Solutions:**
- Check token storage: `console.log(localStorage.getItem('token'))`
- Ensure token doesn't have quotes: `"eyJhbGciOi..."` should be `eyJhbGciOi...`
- Validate token before sending

### 3. **CORS Configuration**

**Current CORS Setup:**
```javascript
app.use(cors());
```

**Enhanced CORS (if needed):**
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URLs
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Frontend Debugging Checklist

### 1. **Check Token Storage**
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
console.log('Token type:', typeof localStorage.getItem('token'));
```

### 2. **Verify Request Headers**
```javascript
// In browser dev tools > Network tab
// Check if Authorization header is present in requests
```

### 3. **Test Auth Status**
```javascript
// Test the debug endpoint
fetch('/api/debug/auth-status', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(res => res.json())
.then(data => console.log('Auth Status:', data));
```

## Backend Debugging Steps

### 1. **Monitor Logs**
Watch for these patterns:
- `🌐 GET /api/... - Auth check` - Request received
- `🔐 Token received: ...` - Token found
- `👤 User authenticated: ...` - Success
- `❌ No authorization header found` - Missing token

### 2. **Check Environment**
```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET
```

### 3. **Database Connection**
Ensure users exist and are properly formatted:
```javascript
// In MongoDB or your database tool
db.users.find({}, {password: 0}).pretty()
```

## Quick Fixes

### 1. **Frontend Token Management**
```javascript
// Create an axios interceptor to automatically add tokens
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.response?.data?.clearToken) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 2. **Backend Request Logging**
The enhanced auth middleware now logs:
- Request method and URL
- Available headers
- Authorization header value
- Detailed error information

## Testing Commands

### 1. **Test with cURL**
```bash
# Test without token (should fail)
curl -X GET http://localhost:5050/api/coordinator/programmes

# Test with token (should succeed)
curl -X GET http://localhost:5050/api/coordinator/programmes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test debug endpoint
curl -X GET http://localhost:5050/api/debug/auth-status \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. **Test with Postman**
1. Create a new request
2. Set URL to `http://localhost:5050/api/debug/auth-status`
3. Add Authorization header: `Bearer YOUR_TOKEN`
4. Send request and check response

## Monitoring & Alerts

### 1. **Log Patterns to Watch**
- High frequency of "No authorization header found"
- Token verification failures
- User not found errors

### 2. **Performance Metrics**
- Authentication success rate
- Token validation time
- Database query performance for user lookup

## Next Steps

1. **Immediate Actions:**
   - Check frontend code for missing Authorization headers
   - Test debug endpoints to verify auth status
   - Monitor logs for patterns

2. **Medium Term:**
   - Implement token refresh mechanism
   - Add rate limiting for auth endpoints
   - Enhance error reporting

3. **Long Term:**
   - Consider implementing session management
   - Add audit logging for security events
   - Implement automated token cleanup

## Support Information

If issues persist:
1. Check the debug endpoints: `/api/debug/auth-status`
2. Review browser network tab for missing headers
3. Verify token storage in browser dev tools
4. Check server logs for detailed error messages

The authorization system is fundamentally working correctly - the issue appears to be frontend requests not including the required Authorization headers.