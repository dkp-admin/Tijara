import { format } from "date-fns";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const POPrintReceipt = (vendor: any, billTo: any, shipTo: any, data: any) => {
  const currency = useCurrency();
  const itemHtml = data?.items?.map((item: any) => {
    let html = `
    <tr>
          <td>
          
          ${
            item?.type === "item"
              ? `${item?.name?.en} ${
                  item.hasMultipleVariants ? item?.variant?.en : ""
                }, ${item.sku}`
              : `${item?.name?.en} ${
                  item.hasMultipleVariants ? item?.variant?.en : ""
                }, [Box - ${item?.unitCount} Unit(s)] `
          }
          
          </td>
          <td>${item?.quantity}</td>
          <td>${currency} ${item?.cost?.toFixed(2)}</td>
          <td>${currency} ${item?.discount?.toFixed(2)}</td>
          <td>${item?.vat}%</td>
          <td>${currency} ${item?.total?.toFixed(2)}</td>
        </tr>
		  `;

    return html;
  });

  const formattedDate = data?.orderDate
    ? format(new Date(data.orderDate), "dd/MM/yyyy")
    : "";

  let totalAmount = 0;
  let totalDiscount = 0;

  data?.items?.forEach((item: any) => {
    totalAmount += Number(item.total);
    totalDiscount += Number(item.discount);
  });

  if (data?.billing?.discountType === "percentage") {
    const discount =
      (totalAmount * Number(data?.billing?.discountAmount)) / 100;
    totalDiscount += discount;
  } else {
    totalDiscount += Number(data?.billing?.discountAmount);
  }

  return `
<html lang="en">

<head>
  <meta charset="UTF-8">
  
  <title>PO GRN Template</title>
  <style>
    .body {
      font-family: 'Arial', sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }

    .card {
      max-width: 700px;
      margin: 20px auto;
      padding: 20px;
     
      background-color: #fff;
      border-radius: 8px;
    }

    .stack {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
    }

    .stack div p {
      margin: 4px;
    }

    .logo {
      display: inline-flex;
      height: 24px;
      width: 24px;
      background-color: #ccc;
      /* Placeholder color */
    }

    h4 {
      margin: 0;
    }

    .subtitle2 {
      font-size: 1rem;
      font-weight: bold;
    }

    . class="table" {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    .table th,
    .table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    .table th {
      background-color: #f2f2f2;
    }

    .billing {
      display: flex;
      flex-direction: column;
      margin-top: 10px;
      text-align: right;
    }

    .billing p {
      margin: 4px;
    }

    .notes {
      margin-top: 20px;
    }

    /* Add styles for grid layout */
    .grid-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      margin-top: 20px;
    }

    .grid-item {
      flex: 0 1 calc(33.3333% - 10px);
      margin-bottom: 20px;
    }
  </style>
</head>

<body class="body">
  <div class="card">
    <div class="stack">
      <div>
        <p>Purchase Order</p>
        <p class="subtitle2">#${data?.orderNum || "-"}</p>
      </div>
      <div>
        <p>Payment Status: <strong>${
          data?.billing?.paymentStatus === "paid" ? "Paid" : "Unpaid"
        }</strong></p>
        <p>Order Date: ${formattedDate} </p>
        <p style="
        text-transform: capitalize;">Delivery Status: ${
          data?.status || "-"
        } </p>
      </div>
    </div>

   
    <div class="grid-container">
      <div class="grid-item">
        <p>Ship To:<br>${data?.shipTo?.name?.en || "-"}<br>Address: ${
    shipTo?.address?.address1 || "-"
  }, ${shipTo?.address?.city || "-"}, ${
    shipTo?.address?.country || "-"
  } <br> Phone: ${shipTo?.phone || "-"}<br> Email: ${shipTo?.email || "-"}</p>
      </div>
      <div class="grid-item">
        <p>Bill To: <br>${data?.billTo?.name?.en || "-"}<br>Address: ${
    billTo?.address?.address1 || "-"
  }, ${billTo?.address?.city || "-"}, ${
    billTo?.address?.country || "-"
  } <br> Phone: ${billTo?.phone || "-"}<br> Email: ${billTo?.email || "-"}</p>
      </div>
      <div class="grid-item">
      <p>Vendor:<br>${data?.vendor?.name || "-"}<br> Phone: ${
    vendor?.phone || "-"
  }<br> Email: ${vendor?.email || "-"}</p>
    </div>
    </div>

    <table class="table">
      <thead>
        <tr>

          <th>Product</th>
          <th>Qty</th>
          <th>Unit Cost</th>
          <th>Discount</th>
          <th>Total VAT%</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
      ${itemHtml}

      </tbody>
    </ class="table">
    <div class="billing">
    <p>
      Fee: ${currency} ${toFixedNumber(data?.billing?.freight) || "0.00"}</p>
    <p> Freight: ${currency} ${
    toFixedNumber(data?.billing?.freight) || "0.00"
  }</p>
    <p> Subtotal: ${currency} ${
    toFixedNumber(data?.billing?.subTotal) || "0.00"
  }</p>
    <p> Discount:  ${currency} ${toFixedNumber(totalDiscount) || "0.00"}</p>
    <p>VAT: ${currency} ${toFixedNumber(data?.billing?.vatAmount) || "-"}</p>
    <strong>Total : ${currency} ${
    toFixedNumber(data?.billing?.total) || "-"
  }</strong><br>

    </p>
  </div>
    <div class="notes">

      <p><b>Note:</b>${data?.message || "-"}</p>
    </div>
  </div>
</body>

</html>
  `;
};

export default POPrintReceipt;
