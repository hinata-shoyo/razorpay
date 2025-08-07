"use client";

import { useState } from "react";

function App() {
  const [loading, setLoading] = useState(false);
  function loadScript(src: string) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }

  async function displayRazorpay() {
    setLoading(true);
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js",
    );

    if (!res) {
      alert("Razropay failed to load!!");
      return;
    }
    //ideally should be get from the frontend/db
    const order = {
      vendor_id: "acc_R0UgKfghs9mU7k",
      amount: 2000 * 100, //actual amount times 100 to convert in paise
    };
    try {
      const data = await fetch("/api/order", {
        method: "POST",
        body: JSON.stringify(order),
      });
      const parsed = await data.json();
      const options = {
        key: "rzp_test_mXN0lilk076olv",
        amount: order.amount,
        currency: "INR",
        name: "Not shady website",
        description: "this website is not shady",
        order_id: parsed.order_id,
        theme: {
          color: "#3399cc",
        },
        handler: function (response: any) {
          fetch("/api/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.status === "ok") {
                alert("successfull :>");
              } else {
                alert("failed :<");
              }
            });
        },
      };
      setLoading(false);
      //@ts-expect-error
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  }

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="border flex flex-col p-12">
        <h1 className="pb-4">Pay for the space now</h1>
        <button
          onClick={displayRazorpay}
          disabled={loading ? true : false}
          className={`bg-amber-300 border cursor-pointer active:scale-95 disabled:bg-amber-500 disabled:cursor-not-allowed`}
        >
          {loading ? "wait" : "click here to pay"}
        </button>
      </div>
    </div>
  );
}

export default App;
