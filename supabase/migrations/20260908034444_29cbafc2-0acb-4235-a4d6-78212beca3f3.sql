CREATE TABLE public.referral_reward_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  amount numeric NOT NULL CHECK (amount > 0),
  assigned_to uuid NOT NULL,
  issued_by uuid NOT NULL,
  note text,
  claimed_by uuid,
  claimed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.referral_reward_codes TO authenticated;
GRANT ALL ON public.referral_reward_codes TO service_role;

ALTER TABLE public.referral_reward_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage referral codes"
  ON public.referral_reward_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view their own referral codes"
  ON public.referral_reward_codes FOR SELECT TO authenticated
  USING (assigned_to = auth.uid());

CREATE TRIGGER update_referral_reward_codes_updated_at
  BEFORE UPDATE ON public.referral_reward_codes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.admin_create_referral_code(
  p_admin_id uuid, p_user_id uuid, p_amount numeric, p_note text DEFAULT NULL
) RETURNS TABLE(code text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  new_code text;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = p_user_id) THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  LOOP
    new_code := 'REF-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_reward_codes r WHERE r.code = new_code);
  END LOOP;

  INSERT INTO public.referral_reward_codes (code, amount, assigned_to, issued_by, note)
  VALUES (new_code, p_amount, p_user_id, p_admin_id, p_note);

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, 'issue_referral_code', p_user_id,
    jsonb_build_object('code', new_code, 'amount', p_amount, 'note', p_note));

  RETURN QUERY SELECT new_code;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_referral_code(p_code text)
RETURNS TABLE(amount numeric, balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  rec public.referral_reward_codes%ROWTYPE;
  new_balance numeric;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_code IS NULL OR btrim(p_code) = '' THEN
    RAISE EXCEPTION 'Claim code is required.';
  END IF;

  SELECT * INTO rec FROM public.referral_reward_codes
    WHERE upper(code) = upper(btrim(p_code)) FOR UPDATE;

  IF rec.id IS NULL THEN
    RAISE EXCEPTION 'Invalid claim code.';
  END IF;
  IF rec.claimed_at IS NOT NULL THEN
    RAISE EXCEPTION 'This claim code has already been used.';
  END IF;
  IF rec.assigned_to <> uid THEN
    RAISE EXCEPTION 'This claim code does not belong to your account.';
  END IF;

  UPDATE public.referral_reward_codes
    SET claimed_by = uid, claimed_at = now(), updated_at = now()
    WHERE id = rec.id;

  UPDATE public.profiles pr
    SET balance = pr.balance + rec.amount, updated_at = now()
    WHERE pr.user_id = uid
    RETURNING pr.balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  INSERT INTO public.transactions (user_id, amount, type, status, notes, reference)
  VALUES (uid, rec.amount, 'referral_reward', 'completed',
    'Referral prize claim ' || rec.code, 'refclaim_' || rec.id::text);

  RETURN QUERY SELECT rec.amount, new_balance;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_referral_code(uuid, uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_referral_code(text) TO authenticated;