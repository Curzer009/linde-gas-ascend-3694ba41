
DROP POLICY "Service role can insert referrals" ON public.referrals;
CREATE POLICY "Authenticated users can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id OR auth.uid() = referred_id);
