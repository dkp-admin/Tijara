import { format } from "date-fns";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { getCashierName } from "./order-details-card";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { useCurrency } from "src/utils/useCurrency";

const SalesSummaryReceiptPrint = (
  userObj: any,
  data: any,
  startDate: Date,
  endDate: Date,
  locationName: string,
  name: string
) => {
  const currency = useCurrency();

  return `<html>
  <head>
    <title>Sales summary report receipt</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        font-weight: 400;
        margin: 0;
        padding: 0;
      }

      .container {
        width: 384px;
        margin: 20px auto;
        text-align: center;
        padding: 30px 5px;
        font-weight: bold;
        font-size: 15px;
        line-height: 20px;
      }

      .logo {
        margin-bottom: 10px;
      }
      .t-left {
        text-align: left;
      }
      .t-right {
        text-align: right;
        vertical-align: baseline;
      }
      .t-center {
        text-align: center;
      }
      .fs-22 {
        font-size: 22px;
      }

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: bold;
      }

      p {
        margin: 0;
        font-size: 13px;
      }
      .no-bold {
        font-weight: normal;
      }
      .w-100 {
        width: 100%;
      }

      .divider {
        border-top: 1px dashed #000;
        margin: 10px 0;
      }
      .divider-down {
        border-bottom: 1px dashed #000;
        margin: 10px 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin: 6px 0;
      }

      th,
      td {
        padding: 6px;
      }

      .total-section {
        margin-top: 10px;
      }

      .qr-code {
        margin-top: 20px;
      }

      .bar-code {
        margin-top: 20px;
      }

      .footer {
        margin: 10px auto;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="container">
   
     
      
      <h4 style="color: black;">${userObj?.name?.en || userObj?.name}</h4>
    
      <h4 style="color: black;">${locationName}</h4>      
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black;" class="t-left">Sales Summary</td>
          <td style="color: black;"></td>
          <td style="color: black;" class="t-right no-bold">From: ${format(
            new Date(startDate || ""),
            "dd-MM-yy, h:mm a"
          )}<br> To: ${format(new Date(endDate || ""), "dd-MM-yy, h:mm a")}
          </td>
        </tr>
      </table>
      <div class="divider"></div>
      
      <table>
        <tr>
          <td style="color: black;" class="t-left">Order Details</td>
          <td style="color: black;"></td>
          <td style="color: black;" class="t-right no-bold">
          </td>
        </tr>
				<tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Total sales</td>
					<td style="color: black;" class="t-right no-bold">${currency} ${
    toFixedNumber(
      data?.netSales +
        data?.totalVat +
        data?.chargesWithoutVat -
        data?.refundedCharges
    ) || 0.0
  } </td>
				</tr>
				<tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Net sales</td>
					<td style="color: black;" class="t-right no-bold">${currency} ${
    toFixedNumber(
      data?.netSales +
        data?.chargesWithoutVat -
        data?.refundedCharges +
        data?.refundedVatOnCharge
    ) || 0.0
  }</td>
				</tr>

        <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Total Order</td>
					<td style="color: black;" class="t-right no-bold">${data?.totalOrder || 0}</td>
				</tr>

				<tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Total VAT</td>
					<td style="color: black;" class="t-right no-bold">${currency}${
    toFixedNumber(data?.totalVat - data?.refundedVatOnCharge) || 0
  }</td>
				</tr>
        
        <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Discount</td>
					<td style="color: black;" class="t-right no-bold">${currency}${
    data?.discount || 0
  }</td>
				</tr>
        
        <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Charges</td>
					<td style="color: black;" class="t-right no-bold">${currency}${
    toFixedNumber(data?.chargesWithoutVat) || 0
  }</td>
				</tr>

      

         <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Total Shift</td>
					<td style="color: black;" class="t-right no-bold"> ${data?.totalShift || 0}</td>
				</tr>
     
        <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Cashiers</td>
					<td style="color: black;" class="t-right no-bold"> ${
            getCashierName(data?.cashiers || []) || "-"
          }</td>
				</tr>
      </table>
      
        <div class="divider"></div>
      <table>
         <tr>
          <td style="color: black;" class="t-left ">Transaction Details</td>
          <td style="color: black;"></td>
          <td style="color: black;" class="t-right no-bold">
          </td>
        </tr>
        ${data?.txnStats?.map((txn: any) => {
          return `<tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">
              ${capitalizeFirstLetter(txn?.paymentName || "")} transaction
            </td>
            <td style="color: black;" class="t-right no-bold">
              ${currency} ${toFixedNumber(txn?.balanceAmount || 0)}, Count: ${
            txn?.noOfPayments || 0
          }
            </td>
          </tr>`;
        })}
      </table>
      
       <div class="divider"></div>
      <table>
      <tr>
          <td style="color: black;" class="t-left">Refund Details</td>
          <td style="color: black;"></td>
          <td style="color: black;" class="t-right no-bold">
          </td>
        </tr>
        
         ${data?.refundData?.map((d: any) => {
           return `<tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">
              ${capitalizeFirstLetter(d?.refundType)} refund
            </td>
            <td style="color: black;" class="t-right no-bold">
              ${currency} ${toFixedNumber(d?.totalRefund || 0.0)}, Count: ${
             d?.refundCount || 0
           }
            </td>
          </tr>`;
         })}
      </table>
     <div class="divider"></div> 
      <table>
        <tr>
          <td style="color: black;" class="t-left">Order Type</td>
          <td style="color: black;"></td>
          <td style="color: black;" class="t-right no-bold">
          </td>
        </tr>
          ${data?.orderTypes && data.orderTypes.length > 0
              ? data.orderTypes
                  .map((orderType: any) => {
                    return `<tr>
              <td style="color: black;" colspan="3" class="t-left no-bold">${capitalizeFirstLetter(
                orderType.name || orderType.key || ""
              )}</td>
              <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(orderType?.amount || 0.0)}, Count: ${
                      orderType?.count || 0
                    }</td>
            </tr>`;
                  })
                  .join("")
              : // Fallback to hardcoded order types if dynamic data is not available
                `<tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">Walkin</td>
            <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(data?.walkin?.amount || 0.0)}, Count: ${
                  data?.walkin?.count || 0
                }</td>
          </tr>
          <tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">Takeaway</td>
            <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(data?.takeaway?.amount || 0.0)}, Count: ${
                  data?.takeaway?.count || 0
                }</td>
          </tr>
          <tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">Delivery</td>
            <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(data?.delivery?.amount || 0.0)}, Count: ${
                  data?.delivery?.count || 0
                }</td>
          </tr>
          <tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">Dinein</td>
            <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(data?.["dine-in"]?.amount || 0.0)}, Count: ${
                  data?.["dine-in"]?.count || 0
                }</td>
          </tr>
          <tr>
            <td style="color: black;" colspan="3" class="t-left no-bold">Pickup</td>
            <td style="color: black;" class="t-right no-bold">${currency} ${toFixedNumber(data?.pickup?.amount || 0.0)}, Count: ${
                  data?.pickup?.count || 0
                }</td>
          </tr>`
          }
      </table>
<div class="divider"></div>
      <table>
       <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Printed on</td>
					<td style="color: black;" class="t-right no-bold">${format(
            new Date(),
            "dd-MM-yy , h:mm a"
          )}</td>
				</tr>
        <tr>
					<td style="color: black;" colspan="3" class="t-left no-bold">Printed by</td>
					<td style="color: black;text-transform: capitalize;" class="t-right no-bold">${name}</td>
				</tr>
      </table>
              
      <div class="divider"></div>
          <div class="footer">
            <p style="color: black;">Thank You</p>
          </div>
    </div>
  </body>
</html>`;
};

export default SalesSummaryReceiptPrint;
