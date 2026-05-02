-- Add phone column to profiles for future SMS OTP
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone text;

-- Audit log for admin actions (transparency & safety)
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());

-- Allow admins to update profiles.phone too (existing admin update policy already covers this)
-- Allow users to update their own phone via existing safe-update policy (balance/is_suspended locked, phone is fine)