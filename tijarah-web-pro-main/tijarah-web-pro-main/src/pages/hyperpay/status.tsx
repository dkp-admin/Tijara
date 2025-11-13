/* eslint-disable @next/next/no-sync-scripts */
import { useRouter } from "next/router";
import { useState } from "react";

const PaymentStatusComponent = () => {
  const [status, setStatus] = useState("");
  const router = useRouter();
  console.log(router.query.id);

  // Function to handle the form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const response = await fetch("http://localhost:3001/payment/status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ checkoutId: router.query.id }),
    });

    const text = await response.json();
    setStatus(text.paymentStatus);
    console.log(text);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <button type="submit">Check Status</button>
        <h1>{status}</h1>
      </form>
    </div>
  );
};

export default PaymentStatusComponent;
