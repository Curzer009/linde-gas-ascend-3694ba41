CREATE OR REPLACE FUNCTION public.process_wallet_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_reference text,
  p_notes text DEFAULT 'Paystack deposit'
)
RETURNS TABLE(credited boolean, balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_id uuid;
  profile_balance numeric;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'Missing user id';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid deposit amount';
  END IF;

  IF p_reference IS NULL OR length(trim(p_reference)) = 0 THEN
    RAISE EXCEPTION 'Missing payment reference';
  END IF;

  INSERT INTO public.transactions (user_id, amount, type, status, reference, notes)
  VALUES (p_user_id, p_amount, 'deposit', 'completed', p_reference, p_notes)
  ON CONFLICT (reference) WHERE reference IS NOT NULL DO NOTHING
  RETURNING id INTO inserted_id;

  IF inserted_id IS NOT NULL THEN
    UPDATE public.profiles AS pr
    SET balance = pr.balance + p_amount,
        updated_at = now()
    WHERE pr.user_id = p_user_id
    RETURNING pr.balance INTO profile_balance;

    IF profile_balance IS NULL THEN
      RAISE EXCEPTION 'Profile not found for wallet deposit';
    END IF;

    RETURN QUERY SELECT true, profile_balance;
    RETURN;
  END IF;

  SELECT pr.balance INTO profile_balance
  FROM public.profiles AS pr
  WHERE pr.user_id = p_user_id;

  RETURN QUERY SELECT false, COALESCE(profile_balance, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) TO service_role;