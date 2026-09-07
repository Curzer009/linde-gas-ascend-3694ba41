// Paystack Ghana mobile money processing rate.
// Deposits are grossed up so the business receives the full requested amount.
export const PAYSTACK_RATE = 0.0195;

export function grossUp(amount: number): number {
  if (!amount || amount <= 0) return 0;
  return Math.ceil((amount / (1 - PAYSTACK_RATE)) * 100) / 100;
}

export function paystackFee(amount: number): number {
  return Math.round((grossUp(amount) - amount) * 100) / 100;
}
