CREATE UNIQUE INDEX IF NOT EXISTS transactions_reference_unique_idx
ON public.transactions (reference)
WHERE reference IS NOT NULL;

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
  current_balance numeric;
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
    UPDATE public.profiles
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE user_id = p_user_id
    RETURNING profiles.balance INTO current_balance;

    IF current_balance IS NULL THEN
      RAISE EXCEPTION 'Profile not found for wallet deposit';
    END IF;

    RETURN QUERY SELECT true, current_balance;
    RETURN;
  END IF;

  SELECT p.balance INTO current_balance
  FROM public.profiles p
  WHERE p.user_id = p_user_id;

  RETURN QUERY SELECT false, COALESCE(current_balance, 0);
END;
$$;