CREATE OR REPLACE FUNCTION public.lookup_referrer(p_code text)
RETURNS TABLE(full_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.full_name FROM public.profiles p
  WHERE p.referral_code IS NOT NULL
    AND upper(p.referral_code) = upper(btrim(p_code))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.register_referral(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_user uuid;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL OR p_code IS NULL OR btrim(p_code) = '' THEN
    RETURN false;
  END IF;

  SELECT p.user_id INTO ref_user FROM public.profiles p
    WHERE p.referral_code IS NOT NULL
      AND upper(p.referral_code) = upper(btrim(p_code))
    LIMIT 1;

  IF ref_user IS NULL OR ref_user = uid THEN
    RETURN false;
  END IF;

  IF EXISTS (SELECT 1 FROM public.referrals r WHERE r.referred_id = uid) THEN
    RETURN false;
  END IF;

  UPDATE public.profiles SET referred_by = ref_user, updated_at = now() WHERE user_id = uid;

  INSERT INTO public.referrals (referrer_id, referred_id, reward_amount, status)
  VALUES (ref_user, uid, 0, 'pending');

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_referrer(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_referral(text) TO authenticated;