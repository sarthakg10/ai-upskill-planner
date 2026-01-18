# 🔗 Shareable Plan Links - SQL Migration

## Overview

This migration adds secure token-based access to plans. Recipients can now open their plan from the email on any device using a unique shareable link.

## SQL Migration

Run this in your Supabase SQL Editor:

```sql
-- Add plan_token column to leads table
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS plan_token TEXT UNIQUE;

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS leads_plan_token_idx 
ON public.leads(plan_token);
```

**That's it!** The table now supports secure token-based plan access.

## What This Enables

✅ **Email contains a shareable link:** `https://yourapp.com/p/<token>`
✅ **Recipients can open plan from any device** without login
✅ **Unique token per lead** - secure and traceable
✅ **Automatic token generation** on lead capture
✅ **Plan data fetched from Supabase** - works offline

## How It Works

1. User submits email at `/convert`
2. App generates unique token: `a3f2b1c9e8d7f4a2b1c9e8d7f4a2b1c9`
3. Lead stored with token in Supabase
4. Email sent with link: `http://localhost:3000/p/a3f2b1c9e8d7f4a2b1c9e8d7f4a2b1c9`
5. Recipient clicks link → `/p/[token]` page fetches plan from `/api/plan/[token]`
6. Plan displays beautifully on any device

## New Files Created

- `lib/token.ts` - Token generation utility
- `app/api/plan/[token]/route.ts` - Fetch plan by token endpoint
- `app/p/[token]/page.tsx` - Shareable plan display page

## Updated Files

- `lib/emailService.ts` - Added plan link button to email
- `app/api/leads/route.ts` - Generate token, store in DB, send with email
- `.env.local.example` - Added `APP_BASE_URL` variable

## Environment Variable

Add to `.env.local`:

```env
APP_BASE_URL=http://localhost:3000
```

For production:
```env
APP_BASE_URL=https://yourapp.com
```

## Testing

1. Go to http://localhost:3000
2. Generate a plan
3. Enter email at `/convert`
4. Submit
5. Check email for "View your plan online" button
6. Click the link
7. Plan should load on `/p/<token>` without localStorage

## Security Notes

- Tokens are 32 random hex characters (128-bit entropy)
- Tokens are unique per lead
- Plan data is fetched from Supabase (not exposed in URLs)
- No authentication needed (shareable link model)
- Consider adding expiration in future if needed

## Database Schema

```sql
ALTER TABLE public.leads ADD COLUMN plan_token TEXT UNIQUE;
```

This adds:
- `plan_token` (TEXT, UNIQUE) - 32-char hex token
- Auto-indexed for fast lookups

## Verification

Check that the migration worked:

```sql
-- View the new column
SELECT * FROM leads LIMIT 1;
-- Should show: plan_token column

-- Check if index exists
SELECT * FROM pg_indexes 
WHERE tablename = 'leads' 
AND indexname = 'leads_plan_token_idx';
-- Should return 1 row
```

Done! 🎉
