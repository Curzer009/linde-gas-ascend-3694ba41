
-- Allow authenticated users to call the admin RPCs (the function still checks has_role internally)
GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(uuid, uuid, numeric, text, text) TO authenticated;

-- Admin suspension RPC (bypasses owner-restricted RLS WITH CHECK by running as security definer)
CREATE OR REPLACE FUNCTION public.admin_set_suspension(
  p_admin_id uuid,
  p_user_id uuid,
  p_suspended boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.profiles
    SET is_suspended = p_suspended, updated_at = now()
    WHERE user_id = p_user_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (p_admin_id, CASE WHEN p_suspended THEN 'suspend_user' ELSE 'unsuspend_user' END, p_user_id, jsonb_build_object('suspended', p_suspended));

  RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_suspension(uuid, uuid, boolean) TO authenticated;

-- Withdrawal mobile money details
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS phone_number text,
  ADD COLUMN IF NOT EXISTS network_provider text;
