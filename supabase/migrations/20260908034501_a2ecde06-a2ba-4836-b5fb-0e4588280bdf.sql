REVOKE EXECUTE ON FUNCTION public.admin_create_referral_code(uuid, uuid, numeric, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_referral_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_create_referral_code(uuid, uuid, numeric, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.claim_referral_code(text) TO authenticated, service_role;