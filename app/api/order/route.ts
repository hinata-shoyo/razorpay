import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
const instance = new Razorpay({
  key_id: process.env.KEY_ID!,
  key_secret: process.env.KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  if (req.method !== "POST") return NextResponse.json({ msg: "no pls" });
  const data = await req.json();
  const options = {
    amount: data.amount,
    currency: "INR",
    receipt: "order_rcptid_11",
    payment_capture: 1,
    transfers: [
      {
        account: data.vendor_id, // vendor account
        currency: "INR",
        amount: (data.amount * 0.8),
      },
      {
        account: "acc_R1glvOKft1I9pj", //admin account
        currency: "INR",
        amount: (data.amount * 0.2),
      }
    ],
  };
  try {
    const order = await new Promise((resolve, reject) => {
      instance.orders.create(options, function (err, order) {
        if (err) reject(err);
        else resolve(order);
      });
    });
    //add the order/transaction to the db with status "pending"

    return NextResponse.json({ order_id: (order as any).id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Order creation failed" },
      { status: 500 },
    );
  }
}
