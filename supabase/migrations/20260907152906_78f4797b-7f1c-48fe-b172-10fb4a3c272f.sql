CREATE POLICY "Users can delete their own tickets"
ON public.support_tickets
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

GRANT DELETE ON public.support_tickets TO authenticated;