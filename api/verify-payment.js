export default async function handler(req, res) {
  const { reference, email, amount } = req.body;

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const data = await response.json();

    if (data.data.status === "success") {

      // 🔥 FIX BALANCE HERE
      console.log(`Payment verified for ${email}: ${amount}`);

      return res.json({ success: true });
    }

    return res.json({ success: false });

  } catch (error) {
    console.error(error);
    return res.json({ success: false });
  }
}
