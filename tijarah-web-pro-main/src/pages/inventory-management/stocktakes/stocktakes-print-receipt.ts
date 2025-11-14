import { format } from "date-fns";

const POPrintReceipt = (data: any) => {
  const itemHtml = data?.items?.map((item: any) => {
    let html = `
    <tr>
          <td>
          
          ${`${item?.name?.en} ${
            item.hasMultipleVariants ? item?.variant?.en : ""
          }, ${item.sku}`}
          
          </td>
          <td>${item?.expected}</td>
          <td>${item?.discrepancy}</td>
          <td>${item?.actual}</td>
          <td>${item?.category?.name}</td>
          <td>${item?.note}</td>
        </tr>
		  `;

    return html;
  });

  const formattedDate = data?.dueDate
    ? format(new Date(data.dueDate), "dd/MM/yyyy")
    : "";

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
        <p>Stocktake</p>
        <p class="subtitle2">#${data?.orderNum || "-"}</p>
      </div>
      <div>
       
        <p>Due Date: ${formattedDate} </p>
        <p style="
        text-transform: capitalize;">Delivery Status: ${
          data?.status || "-"
        } </p>
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>

          <th>Product</th>
          <th>Expected</th>
          <th>Discrepancy</th>
          <th>Actual</th>
          <th>Category</th>
          <th>Note</th>
        </tr>
      </thead>
      <tbody>
      ${itemHtml}

      </tbody>
    </ class="table">
 
    <div class="notes">

      <p><b>Reason: </b>${data?.reason || "-"}</p>
    </div>
  </div>
</body>

</html>
  `;
};

export default POPrintReceipt;
