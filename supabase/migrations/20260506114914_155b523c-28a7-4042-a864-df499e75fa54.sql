-- Drop overly restrictive CHECK constraints that block deposits and admin credits
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add updated CHECK constraints covering all transaction types/statuses used by the app
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('deposit', 'withdrawal', 'purchase', 'admin_credit', 'bonus_credit'));

ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_status_check
  CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed'));

-- Ensure idempotency for Paystack deposits (ON CONFLICT in process_wallet_deposit needs this)
CREATE UNIQUE INDEX IF NOT EXISTS transactions_reference_unique_idx
  ON public.transactions (reference)
  WHERE reference IS NOT NULL;