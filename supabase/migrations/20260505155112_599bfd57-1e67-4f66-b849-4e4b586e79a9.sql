CREATE OR REPLACE FUNCTION public.process_wallet_deposit(
  p_user_id uuid,
  p_amount numeric,
  p_reference text,
  p_notes text DEFAULT 'Paystack deposit'::text
)
RETURNS TABLE(credited boolean, balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
  IF p_reference IS NULL OR length(trim(p_reference)) = 0 THEN
    RAISE EXCEPTION 'Missing payment reference';
  END IF;

  INSERT INTO public.transactions (user_id, amount, type, status, reference, notes)
  VALUES (p_user_id, p_amount, 'deposit', 'completed', p_reference, p_notes)
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
$function$;