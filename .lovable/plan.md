

# Paystack Payment Integration Plan

## Overview
Add a full Paystack payment flow: checkout initialization, webhook handling, premium subscription tracking, and a "Pay Now" button in the UI.

## Database Changes

**New `premium_subscriptions` table** (via migration):
- `id` (uuid, PK)
- `user_id` (uuid, not null, unique)
- `is_active` (boolean, default false)
- `paystack_reference` (text, nullable)
- `paid_at` (timestamptz, nullable)
- `created_at` / `updated_at` (timestamptz, defaults)

RLS policies:
- Users can SELECT their own row (`auth.uid() = user_id`)
- Users can INSERT their own row (`auth.uid() = user_id`)
- Admins can do ALL (via `has_role`)
- No direct user UPDATE (webhook handles activation server-side)

## Edge Functions

### 1. `paystack-checkout` (POST)
- Validates JWT via `getClaims()` to get user ID and email
- Calls Paystack `https://api.paystack.co/transaction/initialize` with the user's email, amount (you'll need to decide on a price — I'll use the product price or a fixed premium amount), and a generated reference
- Inserts a row into `premium_subscriptions` with `is_active = false` and the reference
- Returns the Paystack `authorization_url` to the frontend
- Uses `PAYSTACK_SECRET_KEY` from secrets

### 2. `paystack-webhook` (POST)
- No JWT verification (Paystack calls this)
- Validates the webhook signature using Paystack's `x-paystack-signature` header (HMAC SHA-512)
- On `charge.success` event, extracts the reference
- Updates `premium_subscriptions` set `is_active = true`, `paid_at = now()` where `paystack_reference` matches
- Returns 200

## Frontend Changes

### Products page (`src/pages/Products.tsx` or `ProductsSection.tsx`)
- Add a "Pay Now" / "Go Premium" button
- On click: call `supabase.functions.invoke('paystack-checkout', { body: { amount, email } })`
- Redirect to the returned Paystack checkout URL via `window.location.href`

### Premium status display
- Query `premium_subscriptions` to show active/inactive badge on the profile or products page

## Technical Details

- **Paystack API**: `POST https://api.paystack.co/transaction/initialize` with `Authorization: Bearer sk_...`
- **Webhook signature**: HMAC SHA-512 of request body using `PAYSTACK_SECRET_KEY`, compared to `x-paystack-signature` header
- **Amount**: Paystack expects amount in kobo (pesewas for GHS), so multiply cedis by 100
- Both edge functions include CORS headers
- The webhook function config in `supabase/config.toml` will set `verify_jwt = false` explicitly since it receives external calls

## Files to Create/Modify
1. **Migration SQL** — create `premium_subscriptions` table + RLS
2. **`supabase/functions/paystack-checkout/index.ts`** — initialize transaction
3. **`supabase/functions/paystack-webhook/index.ts`** — handle charge.success
4. **`supabase/config.toml`** — add webhook function config
5. **`src/pages/Products.tsx`** — add Pay Now button
6. **`src/App.tsx`** — no route changes needed (button is on existing page)

