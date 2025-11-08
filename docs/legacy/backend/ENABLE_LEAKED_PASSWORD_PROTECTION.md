# Enable Leaked Password Protection

## Overview

Leaked Password Protection is a Supabase Auth feature that prevents users from using passwords that have been found in data breaches. It checks passwords against the HaveIBeenPwned.org database.

## Current Status

⚠️ **Warning:** Leaked Password Protection is currently disabled

## How to Enable

### Step 1: Navigate to Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bdsepglppqbnazfepvmi
2. Or go to: https://supabase.com/dashboard → Select your project

### Step 2: Go to Authentication Settings

1. In the left sidebar, click **"Authentication"**
2. Click **"Settings"** (or go directly to Authentication → Settings)

### Step 3: Find Password Security Section

1. Scroll down to find **"Password Security"** section
2. Look for **"Leaked Password Protection"** option

### Step 4: Enable the Feature

1. Toggle **"Leaked Password Protection"** to **ON**
2. Click **"Save"** or **"Update"** to save changes

## What This Does

### Benefits

1. **Prevents Compromised Passwords**: Users cannot use passwords found in data breaches
2. **Enhanced Security**: Reduces risk of account compromise
3. **Privacy-Preserving**: Uses k-anonymity protocol (password is hashed before checking)
4. **No User Data Sent**: Only password hash prefix is sent to HaveIBeenPwned.org

### How It Works

1. When a user signs up or changes password, Supabase:
   - Hashes the password using SHA-1
   - Sends only the first 5 characters of the hash to HaveIBeenPwned.org
   - Receives a list of matching hash suffixes
   - Checks if the full hash matches any compromised password

2. If password is found in breach:
   - Sign up/password change is rejected
   - User sees error message asking them to choose a different password

### Privacy & Security

- **No Full Passwords Sent**: Only hash prefix is sent
- **k-Anonymity**: HaveIBeenPwned.org cannot identify which password is being checked
- **Secure Protocol**: Uses HTTPS for all communications
- **No User Data**: No personal information is sent

## Verification

After enabling:

1. **Check Security Advisor**:
   - Go to Database → Advisors → Security
   - Warning should disappear or show as resolved

2. **Test the Feature**:
   - Try to sign up with a known compromised password
   - Should be rejected with appropriate error message

## Alternative: Enable via Supabase CLI (If Available)

If Supabase CLI supports this in the future:

```bash
# This may not be available yet, but check:
supabase auth settings update --leaked-password-protection=true
```

## Documentation

- **Supabase Docs**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **HaveIBeenPwned**: https://haveibeenpwned.com/API/v3#SearchingPwnedPasswordsByRange

## Summary

✅ **Feature**: Leaked Password Protection  
⚠️ **Status**: Currently disabled  
📝 **Action Required**: Enable in Supabase Dashboard  
🔒 **Security Impact**: High (recommended to enable)  
⏱️ **Time to Enable**: ~2 minutes  

**Note:** This is the only remaining security warning. All other security issues have been resolved!

