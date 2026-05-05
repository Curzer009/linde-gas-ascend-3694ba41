REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM anon;
REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) TO service_role;