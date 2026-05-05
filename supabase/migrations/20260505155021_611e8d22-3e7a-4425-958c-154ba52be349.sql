-- 1. Add bonus_balance to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bonus_balance numeric NOT NULL DEFAULT 0;

-- 2. Tighten user self-update RLS to also lock bonus_balance
DROP POLICY IF EXISTS "Users can update own profile safely" ON public.profiles;
CREATE POLICY "Users can update own profile safely"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND balance = (SELECT p.balance FROM public.profiles p WHERE p.user_id = auth.uid())
  AND bonus_balance = (SELECT p.bonus_balance FROM public.profiles p WHERE p.user_id = auth.uid())
  AND is_suspended = (SELECT p.is_suspended FROM public.profiles p WHERE p.user_id = auth.uid())
);

-- 3. Admin credit function (admin role required)
CREATE OR REPLACE FUNCTION public.admin_credit_wallet(
  p_admin_id uuid,
  p_user_id uuid,
  p_amount numeric,
  p_account text,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(balance numeric, bonus_balance numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance numeric;
  new_bonus numeric;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF p_account NOT IN ('available', 'bonus') THEN
    RAISE EXCEPTION 'Invalid account type';
  END IF;

  IF p_account = 'available' THEN
    UPDATE public.profiles
      SET balance = balance + p_amount, updated_at = now()
      WHERE user_id = p_user_id
      RETURNING balance, bonus_balance INTO new_balance, new_bonus;
  ELSE
    UPDATE public.profiles
      SET bonus_balance = bonus_balance + p_amount, updated_at = now()
      WHERE user_id = p_user_id
      RETURNING balance, bonus_balance INTO new_balance, new_bonus;
  END IF;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.transactions (user_id, amount, type, status, notes, reference)
  VALUES (
    p_user_id,
    p_amount,
    CASE WHEN p_account = 'bonus' THEN 'bonus_credit' ELSE 'admin_credit' END,
    'completed',
    COALESCE(p_notes, 'Admin credit'),
    'admin_' || p_admin_id::text || '_' || extract(epoch from now())::bigint
  );

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    p_admin_id,
    'credit_wallet',
    p_user_id,
    jsonb_build_object('amount', p_amount, 'account', p_account, 'notes', p_notes)
  );

  RETURN QUERY SELECT new_balance, new_bonus;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_credit_wallet(uuid, uuid, numeric, text, text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(uuid, uuid, numeric, text, text) TO authenticated;
