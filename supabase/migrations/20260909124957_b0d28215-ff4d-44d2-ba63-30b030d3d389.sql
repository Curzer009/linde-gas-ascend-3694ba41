CREATE OR REPLACE FUNCTION public.auto_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref public.referrals%ROWTYPE;
  reward numeric;
  new_code text;
BEGIN
  IF NEW.type <> 'purchase' OR NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO ref FROM public.referrals
    WHERE referred_id = NEW.user_id AND status <> 'paid'
    ORDER BY created_at ASC LIMIT 1;

  IF ref.id IS NULL THEN
    RETURN NEW;
  END IF;

  reward := CASE
    WHEN NEW.amount >= 900 THEN 45
    WHEN NEW.amount >= 500 THEN 40
    WHEN NEW.amount >= 300 THEN 30
    WHEN NEW.amount >= 150 THEN 20
    WHEN NEW.amount >= 80 THEN 15
    ELSE 0
  END;

  IF reward <= 0 THEN
    RETURN NEW;
  END IF;

  LOOP
    new_code := 'REF-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::text) FROM 1 FOR 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.referral_reward_codes r WHERE r.code = new_code);
  END LOOP;

  INSERT INTO public.referral_reward_codes (code, amount, assigned_to, issued_by, note)
  VALUES (new_code, reward, ref.referrer_id, ref.referrer_id,
          'Automatic referral reward for a product purchase');

  UPDATE public.referrals
    SET status = 'paid', reward_amount = reward, product_name = COALESCE(NEW.notes, product_name), updated_at = now()
    WHERE id = ref.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_referral_reward_trg ON public.transactions;
CREATE TRIGGER auto_referral_reward_trg
AFTER INSERT ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.auto_referral_reward();