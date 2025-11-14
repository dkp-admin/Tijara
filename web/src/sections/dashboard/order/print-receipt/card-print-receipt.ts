import { format } from "date-fns";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const CardReceiptPrint = (userObj: any, order: any, template: any) => {
  const currency = useCurrency();

  const itemHtml = order?.items?.map((item: any) => {
    let html = `
      <tr>
        <td style="color: black;" colspan="2" class="t-left no-bold">
          ${item.name.en} - ${item?.variant?.name?.en} <br />
          ${item.name.ar} - ${item?.variant?.name?.ar}<br/> <small>${
      item?.modifiers?.[0]?.optionName
    }</small>
        </td>
      </tr>
		  <tr>
			<td></td>
			<td style="color: black;">${toFixedNumber(item.billing.subTotal)}</td>
			<td style="color: black;">${item.quantity}</td>
			<td style="color: black;" class="t-right">${toFixedNumber(
        item.billing.total
      )}</td>
		  </tr>
      `;

    return html;
  });

  let tenderCash = 0;

  order.payment.breakup?.map((brakup: any) => {
    tenderCash += brakup.total;
  });

  const change = tenderCash - order.payment.total;

  return `<html>
  <head>
    <title>Card Payment Receipt</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
      }
  
      .container {
        width: 400px;
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
    ${
      userObj.company?.logo
        ? `
      <div class="logo">
        <img
          src=${userObj.company?.logo}
          alt="Logo"
          width="80%"
        />
      </div>
      <div class="divider"></div>`
        : ``
    }
      <h4 style="color: black;">${order.location.name}</h4>
      <p style="color: black;">VAT No/الرقم الضريبي</p>
		<p style="color: black;">${userObj.company.vat.docNumber}</p>
		<p style="color: black;">Ph. No./رقم الجوال</p>
		<p style="color: black;">${userObj.phone}</p>
      <p style="color: black;">${userObj.company?.address?.address1}, ${
    userObj.company?.address?.city
  }</p>
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black;" class="t-left">Invoice No.</td>
          <td style="color: black;">#${order?.orderNum || ""}</td>
          <td style="color: black;" class="t-right">رقم الفاتورة
          </td>
        </tr>
        <tr>
          <td style="color: black;" class="t-left">Time & Date</td>
          <td style="color: black;">${format(
            new Date(order.createdAt),
            "h:mm:ss yyyy-MM-dd"
          )}</td>
          <td style="color: black;" class="t-right">تاریخ والوقت</td>
        </tr>
        ${
          order?.customer?.name
            ? `<tr>
        <td style="color: black;" class="t-left">Customer</td>
        <td style="color: black;">${order?.customer?.name || ""}</td>
        <td style="color: black;" class="t-right">العميل</td>
      </tr>`
            : ``
        }
        ${
          order?.customer?.vat
            ? `<tr>
        <td style="color: black;" class="t-left">Customer VAT</td>
        <td style="color: black;">${order?.customer?.vat || ""}</td>
        <td style="color: black;" class="t-right">VAT العميل</td>
      </tr>`
            : ``
        }
        
        
      </table>
      ${
        order?.tokenNumber || order?.orderType
          ? `<div class="divider"></div>`
          : ``
      }
  
      ${
        order?.tokenNumber
          ? `
      <h2 style="color: black;">${order?.tokenNumber || ""}</h2>
      `
          : ``
      }

      ${
        order?.orderType
          ? `
      <p style="color: black;">${
        ChannelsName[order?.orderType] || order?.orderType || ""
      }</p>
      `
          : ``
      }

      <div class="divider"></div>
      <h4 style="color: black;">Tax Invoice</h4>
      <h4 style="color: black;">فاتورة ضريبية</h4>
      <div class="divider"></div>
      <table>
        <tr class="divider-down">
          <td style="color: black;" class="t-left">Description <br> الوصف
          </td>
          <td style="color: black;">Unit Price <br> سعر الوحدة</td>
          <td style="color: black;">Qty <br> الكمية</td>
          <td style="color: black;" class="t-right">Total <br> الإجمالي </td>
        </tr>
        
        ${itemHtml}
      </table>
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black;" colspan="3" class="t-left">Total Taxable Amount (Excluding VAT)
					<br>الإجمالي الخاضع للضریبة (غیر شامل ضریبة) 
				</td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
    order.payment.subTotal
  )}</td>
        </tr>
        <tr>
          <td style="color: black;" colspan="3" class="t-left">Total VAT <br>قيمة الضريبة الكلية</td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
    order.payment.vatAmount
  )}</td>
        </tr>
        ${
          order.payment.discountAmount > 0
            ? `<tr>
          <td style="color: black;" colspan="3" class="t-left">
            Total Savings/Discounts <br />
            إجمالي المدخرات / الخصومات
          </td>
          <td style="color: black;" class="t-right">${currency} -${toFixedNumber(
                order.payment.discountAmount
              )}</td>
        </tr>`
            : ``
        }
      </table>
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black;" colspan="3" class="t-left">
            Total Amount <br />
            المبلغ الإجمالي
          </td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
    order.payment.total
  )}</td>
        </tr>
      </table>
      <div class="divider"></div>
      <table>
      ${
        tenderCash > 0
          ? `<tr>
          <td style="color: black;" colspan="3" class="t-left">Tendered Cash</td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
              tenderCash
            )}</td>
        </tr>`
          : ``
      }
        ${
          change > 0
            ? `
        <tr>
          <td style="color: black;" colspan="3" class="t-left">Change</td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
                change
              )}</td>
        </tr>
        `
            : ``
        }
      </table>
      ${order?.specialInstructions ? `<div class="divider"></div>` : ``}
      ${
        order?.specialInstructions
          ? `
      <p style="color: black">Special Instructions</p>
      <p class="t-left" style="padding: 6px;color: black">${
        order?.specialInstructions || ""
      }</p>`
          : ``
      }

      ${
        template?.returnPolicy || template?.customText || template?.footer
          ? `<div class="divider"></div>`
          : ``
      }
     
      ${
        template?.returnPolicy
          ? `
      <p>Return Policy/سياسة الإسترجاع</p>
      <p class="t-left" style="padding: 6px;">${
        template?.returnPolicy || ""
      }</p>  <div class="divider"></div>`
          : ``
      }
  
  
      ${
        template?.customText
          ? `
      <p class="t-left" style="padding: 6px;">${
        template?.customText || ""
      }</p> <div class="divider"></div>`
          : ``
      }
      ${
        template?.footer
          ? `  
    
          <div class="footer">
            <p>${template?.footer || ""}</p>
          </div> <div class="divider"></div>`
          : ``
      }
      </div>
  </body>
  </html>
     `;
};

export default CardReceiptPrint;
