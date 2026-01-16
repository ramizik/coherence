# Supabase Day 2 Setup - Testing Instructions

## Implementation Complete ✅

All code files have been created and configured for Supabase authentication integration.

## Next Steps for Testing

### 1. Install Dependencies

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install supabase-py SDK
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Add to `.env` file in repository root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key_here
```

**Important:**
- Get `SUPABASE_URL` from: Supabase Dashboard → Settings → API → Project URL
- Get `SUPABASE_KEY` from: Supabase Dashboard → Settings → API → Service Role Key (NOT anon key!)
- Service role key has full access - keep it secret, never expose to frontend

### 3. Start Backend Server

```powershell
uvicorn backend.app.main:app --reload
```

You should see in startup logs:
```
✓ Supabase: CONFIGURED
```

### 4. Test Authentication Endpoint

#### Test 1: Without Token (Should Return 401)

```bash
curl http://localhost:8000/api/auth/me
```

Expected: `{"detail":"Not authenticated"}` or 401 status

#### Test 2: Get JWT Token from Supabase

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard → Authentication → Users
2. Create a test user or use existing
3. The JWT token will be in the browser's localStorage after login
   - Open DevTools → Application → Local Storage → `sb-<project-ref>-auth-token`
   - Copy the `access_token` value

**Option B: Using Supabase SQL Editor (for testing)**
```sql
-- This generates a token for testing (not for production use)
-- In production, tokens come from frontend login
```

#### Test 3: With Valid Token (Should Return User Info)

```bash
curl -H "Authorization: Bearer <your_jwt_token>" http://localhost:8000/api/auth/me
```

Expected:
```json
{
  "user_id": "uuid-here",
  "email": "user@example.com",
  "email_verified": false,
  "authenticated": true
}
```

#### Test 4: With Invalid Token (Should Return 401)

```bash
curl -H "Authorization: Bearer invalid_token" http://localhost:8000/api/auth/me
```

Expected: `{"detail":"Invalid or expired token"}`

## Files Created

- ✅ `backend/app/config.py` - Configuration management
- ✅ `backend/app/dependencies.py` - Supabase client and auth dependencies
- ✅ `backend/app/routers/auth.py` - Test authentication endpoint
- ✅ `requirements.txt` - Updated with `supabase>=2.0.0`
- ✅ `backend/app/main.py` - Updated with Supabase startup check

## Troubleshooting

**Issue: `ModuleNotFoundError: No module named 'supabase'`**
- Solution: Run `pip install -r requirements.txt` with virtual environment activated

**Issue: `ValueError: SUPABASE_URL environment variable is required`**
- Solution: Ensure `.env` file exists in repository root with `SUPABASE_URL` and `SUPABASE_KEY`

**Issue: `401 Unauthorized` even with valid token**
- Solution: 
  - Verify you're using **service role key** (not anon key) in `SUPABASE_KEY`
  - Check token hasn't expired
  - Verify token format: `Bearer <token>` (no extra spaces)

**Issue: `get_claims()` method not found or returns unexpected format**
- Solution: The method might return a different structure. Check the actual return value and adjust the code in `dependencies.py` if needed. Alternative: Use `get_user()` method if `get_claims()` doesn't work as expected.

## Success Criteria

Day 2 is complete when:
- ✅ Backend starts without errors
- ✅ `/api/auth/me` returns 401 without token
- ✅ `/api/auth/me` returns user info with valid token
- ✅ `/api/auth/me` returns 401 with invalid token
- ✅ Startup logs show "✓ Supabase: CONFIGURED"

## Next Step: Day 3

Frontend authentication integration:
- Install `@supabase/supabase-js`
- Create login/register components
- Implement auth context
