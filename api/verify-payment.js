export default async function handler(req, res) {

  // ✅ Prevent crash on browser visit
  if (req.method !== "POST") {
    return res.status(200).json({ message: "API working" });
  }

  try {
    const { reference } = req.body;

    if (!reference) {
      return res.status(400).json({ success: false });
    }

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
      return res.json({
        success: true,
        amount: data.data.amount / 100
      });
    }

    return res.json({ success: false });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
}
