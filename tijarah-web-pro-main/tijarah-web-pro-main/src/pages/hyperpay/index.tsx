/* eslint-disable @next/next/no-sync-scripts */
import { useState } from "react";

const PaymentComponent = () => {
  const [html, setHtml] = useState("");

  // Function to handle the form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Make a POST request to http://localhost:3001/payment
    const response = await fetch("http://localhost:3001/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Add any necessary payload or authentication headers
      body: JSON.stringify({ amount: 100 }),
    });

    const text = await response.text();
    document.open();
    document.write(text);
    document.close();
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Add your form fields here if needed */}
        <button type="submit">Submit Payment</button>
      </form>

      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </div>
  );
};

export default PaymentComponent;
