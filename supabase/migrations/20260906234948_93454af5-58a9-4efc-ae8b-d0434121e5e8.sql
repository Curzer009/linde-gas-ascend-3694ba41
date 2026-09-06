ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS txid text,
  ADD COLUMN IF NOT EXISTS deposit_account text,
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'GHS',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_data jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS transactions_txid_unique_idx
  ON public.transactions (lower(btrim(txid)))
  WHERE txid IS NOT NULL AND btrim(txid) <> '';

CREATE OR REPLACE FUNCTION public.enforce_deposit_txid()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type = 'deposit' THEN
    IF NEW.txid IS NULL OR btrim(NEW.txid) = '' THEN
      RAISE EXCEPTION 'Transaction ID is required.';
    END IF;
    NEW.txid := btrim(NEW.txid);

    IF TG_OP = 'INSERT' THEN
      IF NEW.status IN ('completed', 'approved') AND NEW.verified_at IS NULL THEN
        RAISE EXCEPTION 'Transaction could not be verified.';
      END IF;
      IF NEW.status NOT IN ('completed', 'approved') THEN
        NEW.status := 'pending';
      END IF;
    ELSE
      IF NEW.status IN ('completed', 'approved') AND NEW.verified_at IS NULL THEN
        RAISE EXCEPTION 'Transaction could not be verified.';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_deposit_txid_trg ON public.transactions;
CREATE TRIGGER enforce_deposit_txid_trg
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.enforce_deposit_txid();

CREATE OR REPLACE FUNCTION public.process_wallet_deposit(p_user_id uuid, p_amount numeric, p_reference text, p_notes text DEFAULT 'Paystack deposit'::text)
RETURNS TABLE(credited boolean, balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  inserted_id uuid;
  bonus_after numeric;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid deposit amount';
  END IF;
  IF p_reference IS NULL OR length(btrim(p_reference)) = 0 THEN
    RAISE EXCEPTION 'Transaction ID is required.';
  END IF;

  INSERT INTO public.transactions (user_id, amount, type, status, reference, txid, verified_at, notes)
  VALUES (p_user_id, p_amount, 'deposit', 'completed', btrim(p_reference), btrim(p_reference), now(), p_notes)
  ON CONFLICT (reference) WHERE reference IS NOT NULL DO NOTHING
  RETURNING id INTO inserted_id;

  IF inserted_id IS NOT NULL THEN
    UPDATE public.profiles AS pr
    SET bonus_balance = pr.bonus_balance + p_amount,
        updated_at = now()
    WHERE pr.user_id = p_user_id
    RETURNING pr.bonus_balance INTO bonus_after;

    IF bonus_after IS NULL THEN
      RAISE EXCEPTION 'Profile not found for wallet deposit';
    END IF;

    RETURN QUERY SELECT true, bonus_after;
    RETURN;
  END IF;

  SELECT pr.bonus_balance INTO bonus_after
  FROM public.profiles AS pr
  WHERE pr.user_id = p_user_id;

  RETURN QUERY SELECT false, COALESCE(bonus_after, 0);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_deposit(
  p_admin_id uuid,
  p_transaction_id uuid,
  p_verification jsonb
)
RETURNS TABLE(credited boolean, bonus_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tx public.transactions%ROWTYPE;
  bonus_after numeric;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_verification IS NULL OR (p_verification->>'verified') IS DISTINCT FROM 'true' THEN
    RAISE EXCEPTION 'Transaction could not be verified.';
  END IF;

  SELECT * INTO tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
  IF tx.id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  IF tx.type <> 'deposit' THEN
    RAISE EXCEPTION 'Not a deposit';
  END IF;
  IF tx.txid IS NULL OR btrim(tx.txid) = '' THEN
    RAISE EXCEPTION 'Transaction ID is required.';
  END IF;
  IF tx.status IN ('completed', 'approved') THEN
    SELECT pr.bonus_balance INTO bonus_after FROM public.profiles pr WHERE pr.user_id = tx.user_id;
    RETURN QUERY SELECT false, COALESCE(bonus_after, 0);
    RETURN;
  END IF;
  IF tx.status <> 'pending' THEN
    RAISE EXCEPTION 'Deposit already settled';
  END IF;

  UPDATE public.transactions
    SET status = 'completed',
        verified_at = now(),
        verification_data = p_verification,
        updated_at = now()
    WHERE id = p_transaction_id;

  UPDATE public.profiles pr
    SET bonus_balance = pr.bonus_balance + tx.amount,
        updated_at = now()
    WHERE pr.user_id = tx.user_id
    RETURNING pr.bonus_balance INTO bonus_after;

  IF bonus_after IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'approve_deposit', tx.user_id,
    jsonb_build_object('transaction_id', p_transaction_id, 'amount', tx.amount, 'txid', tx.txid, 'verification', p_verification));

  RETURN QUERY SELECT true, bonus_after;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_deposit(
  p_admin_id uuid,
  p_transaction_id uuid,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tx public.transactions%ROWTYPE;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
  IF tx.id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  IF tx.type <> 'deposit' THEN
    RAISE EXCEPTION 'Not a deposit';
  END IF;
  IF tx.status <> 'pending' THEN
    RAISE EXCEPTION 'Deposit already settled';
  END IF;

  UPDATE public.transactions
    SET status = 'rejected',
        notes = COALESCE(p_reason, notes),
        updated_at = now()
    WHERE id = p_transaction_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'reject_deposit', tx.user_id,
    jsonb_build_object('transaction_id', p_transaction_id, 'amount', tx.amount, 'txid', tx.txid, 'reason', p_reason));

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_approve_deposit(uuid, uuid, jsonb) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_approve_deposit(uuid, uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_reject_deposit(uuid, uuid, text) TO authenticated, service_role;