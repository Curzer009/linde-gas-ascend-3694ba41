
-- Remove client-side INSERT on transactions — now handled by edge function with service role
DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
