# Better Auth Migration Guide

This document outlines the environment variable changes required after migrating from NextAuth.js to Better Auth.

## Environment Variables to Update

### ✅ **New Required Variables**

Add these to your `.env` file:

```env
# Better Auth Secret (replaces NEXTAUTH_SECRET)
BETTER_AUTH_SECRET=<generate-new-64-char-hex-string>

# Better Auth Base URL (replaces NEXTAUTH_URL)
BETTER_AUTH_URL="http://localhost:3000"

# Client-side Better Auth URL (must be prefixed with NEXT_PUBLIC_)
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```

**Generate BETTER_AUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 🔄 **Keep Existing (Still Used)**

These variables are **still required** for token encryption:

```env
# Used for AES-256-GCM encryption of OAuth tokens
AUTH_SECRET=<your-existing-64-char-hex-string>

# MongoDB connection
MONGODB_URI=<your-mongodb-connection-string>
MONGO_CLIENT=<your-database-name>

# Google OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# AI Processing
GEMINI_API_KEY=<your-gemini-api-key>
```

### ❌ **Deprecated (Can Remove)**

These variables are no longer used but won't break anything if left in:

```env
NEXTAUTH_SECRET=  # Replaced by BETTER_AUTH_SECRET
NEXTAUTH_URL=     # Replaced by BETTER_AUTH_URL
AUTH_URL=         # No longer needed
ENCRYPTION_IV=    # No longer used
ENCRYPTION_KEY=   # No longer used
```

## Google Cloud Console Changes

### Update OAuth Callback URL

In your Google Cloud Console project:

1. Go to **APIs & Services** > **Credentials**
2. Edit your OAuth 2.0 Client ID
3. Update **Authorized redirect URIs**:

**Previous (NextAuth):**
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

**New (Better Auth):**
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google
```

**Note:** The callback URL format remains the same! No changes needed in Google Cloud Console.

## Summary of Changes

| Variable | Status | Purpose |
|----------|--------|---------|
| `BETTER_AUTH_SECRET` | ✅ **NEW REQUIRED** | Better Auth encryption & hashing |
| `BETTER_AUTH_URL` | ✅ **NEW REQUIRED** | Base URL for Better Auth |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ **NEW REQUIRED** | Client-side base URL |
| `AUTH_SECRET` | 🔄 **KEEP** | OAuth token encryption (AES-256-GCM) |
| `MONGODB_URI` | 🔄 **KEEP** | Database connection |
| `MONGO_CLIENT` | 🔄 **KEEP** | Database name |
| `GOOGLE_CLIENT_ID` | 🔄 **KEEP** | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | 🔄 **KEEP** | Google OAuth |
| `GEMINI_API_KEY` | 🔄 **KEEP** | AI processing |
| `NEXTAUTH_SECRET` | ❌ **DEPRECATED** | Replaced by BETTER_AUTH_SECRET |
| `NEXTAUTH_URL` | ❌ **DEPRECATED** | Replaced by BETTER_AUTH_URL |
| `AUTH_URL` | ❌ **DEPRECATED** | No longer used |
| `ENCRYPTION_IV` | ❌ **DEPRECATED** | No longer used |
| `ENCRYPTION_KEY` | ❌ **DEPRECATED** | No longer used |

## Migration Checklist

- [ ] Generate new `BETTER_AUTH_SECRET` value
- [ ] Add `BETTER_AUTH_URL` to `.env`
- [ ] Add `NEXT_PUBLIC_BETTER_AUTH_URL` to `.env`
- [ ] Verify `AUTH_SECRET` exists (for token encryption)
- [ ] Verify all other existing variables are present
- [ ] Remove deprecated variables (optional)
- [ ] Test login flow with Google OAuth
- [ ] Verify Gmail API access still works
- [ ] Test session persistence across page refreshes

## Production Deployment

When deploying to production, ensure you update:

1. **Environment Variables** in your hosting platform (Vercel, Railway, etc.)
2. **Google OAuth Redirect URIs** to include production domain
3. **BETTER_AUTH_URL** to production domain (e.g., `https://yourdomain.com`)
4. **NEXT_PUBLIC_BETTER_AUTH_URL** to production domain

## Troubleshooting

### "Invalid session" errors
- Check that `BETTER_AUTH_SECRET` is set and is a 64-character hex string
- Verify `BETTER_AUTH_URL` matches your application's base URL

### OAuth callback errors
- Ensure Google Cloud Console has correct callback URL: `{BASE_URL}/api/auth/callback/google`
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct

### Token encryption errors
- Verify `AUTH_SECRET` is still present in `.env` (required for encrypting OAuth tokens)
- Check that `AUTH_SECRET` is a 64-character hex string

### Database connection errors
- Confirm `MONGODB_URI` and `MONGO_CLIENT` are correct
- Test database connection independently

## Related Files Modified

- `src/lib/auth.ts` - Better Auth server configuration
- `src/lib/auth-client.ts` - Better Auth React client
- `src/app/api/auth/[...all]/route.ts` - Better Auth API handler
- All API routes in `src/app/api/**` - Session validation updated
- All client components using auth - Hook API updated

## Reference

- Better Auth Documentation: https://www.better-auth.com/docs
- GitHub Issue: #46 - Migrate from NextAuth to Better Auth
- Branch: `feature/migrate-to-better-auth`
