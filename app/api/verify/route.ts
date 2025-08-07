import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.json({ msg: "no pls" });

  const data = await req.json();
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = data;

  const secret = process.env.KEY_SECRET!;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");
    if (razorpay_signature === expectedSignature) {
      console.log("Payment verification successful");
      // subscribe to the razorpay webhook and when  the "paid" event gets fired
      // Update the transaction state in db as successfull

      return NextResponse.json({ status: "ok" });
    } else {
      return NextResponse.json({ status: "verification_failed" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: "error",
      message: "Error verifying payment",
    });
  }
}
