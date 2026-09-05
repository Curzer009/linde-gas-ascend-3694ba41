CREATE OR REPLACE FUNCTION public.admin_settle_withdrawal(
  p_admin_id uuid,
  p_transaction_id uuid,
  p_approve boolean,
  p_notes text DEFAULT NULL
)
RETURNS TABLE(status text, refunded numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tx public.transactions%ROWTYPE;
  new_status text;
  refund numeric := 0;
BEGIN
  IF NOT public.has_role(p_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT * INTO tx FROM public.transactions WHERE id = p_transaction_id FOR UPDATE;
  IF tx.id IS NULL THEN
    RAISE EXCEPTION 'Transaction not found';
  END IF;
  IF tx.type <> 'withdrawal' THEN
    RAISE EXCEPTION 'Not a withdrawal';
  END IF;
  IF tx.status <> 'pending' THEN
    RAISE EXCEPTION 'Withdrawal already settled';
  END IF;

  IF p_approve THEN
    new_status := 'completed';
  ELSE
    new_status := 'rejected';
    refund := tx.amount;
    UPDATE public.profiles
      SET balance = balance + refund, updated_at = now()
      WHERE user_id = tx.user_id;
  END IF;

  UPDATE public.transactions
    SET status = new_status,
        notes = COALESCE(p_notes, notes),
        updated_at = now()
    WHERE id = p_transaction_id;

  INSERT INTO public.admin_audit_log (admin_id, action, target_user_id, details)
  VALUES (
    p_admin_id,
    CASE WHEN p_approve THEN 'approve_withdrawal' ELSE 'reject_withdrawal' END,
    tx.user_id,
    jsonb_build_object('transaction_id', p_transaction_id, 'amount', tx.amount, 'refunded', refund)
  );

  RETURN QUERY SELECT new_status, refund;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_settle_withdrawal(uuid, uuid, boolean, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_settle_withdrawal(uuid, uuid, boolean, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_credit_wallet(uuid, uuid, numeric, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_credit_wallet(uuid, uuid, numeric, text, text) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_set_suspension(uuid, uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_suspension(uuid, uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_wallet_deposit(uuid, numeric, text, text) TO service_role;