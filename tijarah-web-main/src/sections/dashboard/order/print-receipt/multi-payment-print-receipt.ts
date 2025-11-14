import { format } from "date-fns";
import i18n from "src/i18n";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const MultiPayReceiptPrint = (
  user: any,
  order: any,
  template: any,
  phone?: any
) => {
  const currency = useCurrency();
  const itemHtml = order?.items
    ?.map((item: any) => {
      const modPrice = item?.modifiers?.reduce((pv: number, cv: any) => {
        return pv + Number(cv?.subTotal || 0);
      }, 0);

      const totalItemPrice =
        (item?.variant?.sellingPrice || item?.itemSubTotal) + modPrice;

      let modifierName = "";

      if (item?.modifiers || item?.modifiers?.length > 0) {
        item?.modifiers?.map((mod: any) => {
          modifierName += `${modifierName === "" ? "" : ", "}${mod.optionName}`;
        });
      }

      return ` 
      <tr>
      <td style="color: black;" colspan="2" class="t-left no-bold">
        ${item.name.en} 
        ${
          item?.hasMultipleVariants
            ? ` <br />- ${item?.variant?.name?.en || item?.variantNameEn}, `
            : ""
        } 
        ${
          item?.variant?.type === "box" || item?.type === "box"
            ? `<br /> (${i18n.t("Box")} - ${
                item?.variant?.unitCount || item.noOfUnits
              } Units)`
            : item?.variant?.type === "crate" || item?.type === "crate"
            ? `<br /> (${i18n.t("Crate")} - ${
                item?.variant?.unitCount || item.noOfUnits
              } Units)`
            : ``
        } <br />
        ${item.name.ar} 
         ${
           item?.hasMultipleVariants
             ? `<br/> - ${item?.variant?.name?.ar || item?.variantNameAr}, `
             : ""
         } 
        
        ${modifierName ? ` <br /> ${modifierName}` : ""} 
      </td>

      <td style="color: black;">${toFixedNumber(totalItemPrice)}</td>

      <td style="color: black;" >${item?.quantity || item?.qty}</td>


      <td style="color: black;" >
      ${
        item?.isFree
          ? `
        ${"Free"}
      ${` <br/> <small style="text-decoration: line-through;">
            ${currency} ${toFixedNumber(
        item?.billing?.discountedTotal || item?.discountedTotal
      )}
          </small>`}
        
        `
          : `
        ${currency} ${toFixedNumber(item?.billing?.total || item?.total)}
      ${
        item?.billing?.discountAmount > 0 || item?.discount > 0
          ? ` <br/> <small style="text-decoration: line-through;">
            ${currency} ${toFixedNumber(
              (item?.billing?.total || item?.total) +
                (item?.billing?.discountAmount || item?.discount)
            )}
          </small>`
          : ""
      }
        `
      }
      
      
      </td>
    </tr>`;
    })
    .join("");

  const methods = ["Cash", "Card", "Wallet", "Credit"];

  const totalPaid = order?.payment?.breakup?.reduce(
    (pv: number, cv: any) => pv + Number(cv.total),
    0
  );

  const payments = order?.payment?.breakup?.reduce((cv: any, pv: any) => {
    if (pv.providerName === "cash") return cv;

    const providerKey = `${capitalizeFirstLetter(pv.providerName)}`;

    if (!cv[providerKey]) {
      cv[providerKey] = 0;
    }

    cv[providerKey] += Number(pv.total);

    return cv;
  }, {});

  const paidWithCash = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === "cash")
    ?.reduce((pv: number, cv: any) => pv + Number(cv.total), 0);

  const change =
    Number(totalPaid?.toFixed(2)) - Number(order?.payment?.total?.toFixed(2));

  const tenderCash = Number(paidWithCash || 0);

  const freeItemsDiscount: any = order?.items?.reduce((prev: any, cur: any) => {
    if (cur?.isFree) return prev + Number(cur?.billing?.total || cur?.total);
    else return prev;
  }, 0);

  const freeQtyItemsDiscount: any = order?.items?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isQtyFree)
        return (
          prev + Number(cur?.billing?.discountAmount || cur?.discountedTotal)
        );
      else return prev;
    },
    0
  );

  const discount =
    Number(order.payment?.discountAmount || order.payment?.discount || 0) +
    Number(freeQtyItemsDiscount || 0) +
    Number(freeItemsDiscount || 0);

  return `<html>
  <head>
    <title>Billing Receipt -Cash Payment, No Customer added</title>
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
      template?.logo
        ? `
      <div class="logo">
        <img
          src=${template?.logo}
          alt=""
          width="80%"
        />
      </div>
      <div class="divider"></div>`
        : ``
    }
      <h4 style="color: black;">${template?.location?.name?.en}</h4>
      <h4 style="color: black;">${template?.location?.name?.ar}</h4>
      <p style="color: black;">VAT No/الرقم الضريبي</p>
		<p style="color: black;">${
      template?.location?.vat?.length > 0
        ? template?.location?.vat
        : "Not Applicable"
    }</p>
		<p style="color: black;">Ph. No./رقم الجوال</p>
		<p style="color: black;">${phone}</p>
      <p style="color: black;">${template?.location?.address}</p>
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
          <td style="color: black;">${
            order?.createdAt
              ? format(new Date(order.createdAt), "h:mma yyyy-MM-dd")
              : format(new Date(), "h:mma yyyy-MM-dd")
          }</td>
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
        template?.showToken ||
        template?.showOrderType ||
        order?.showToken ||
        order?.showOrderType
          ? `<div class="divider"></div>`
          : ``
      }
  
      ${
        template?.showToken || order?.showToken
          ? `
      <h2 style="color: black;">${
        order?.tokenNumber || order?.tokenNum || ""
      }</h2>
      `
          : ``
      }

      ${
        template?.showOrderType || order?.showOrderType
          ? `
      <p style="color: black;">${
        ChannelsName[order?.orderType] || order?.orderType || ""
      }</p>
      `
          : ``
      }


      <div class="divider"></div>
      <h4 style="color: black;">Simplified Tax Invoice</h4>
      <h4 style="color: black;">فاتورة ضريبية مبسطة</h4>
      <div class="divider"></div>
      <table>
        <tr class="divider-down">
          <td style="color: black;" class="t-left">Description <br> الوصف
          </td>
          <td></td>
          <td style="color: black;">Unit Price <br> سعر الوحدة</td>
          <td style="color: black;">Qty <br> الكمية</td>
          <td style="color: black;" class="t-right">Total <br> الإجمالي </td>
        </tr>
        ${itemHtml}
      </table>
      
      <div class="divider"></div>
      <table>



      ${
        discount > 0
          ? `
          
          <tr>
          <td style="color: black;" colspan="3" class="t-left">
            Items Total <br />إجمالي العناصر</td>
          <td style="color: black;" class="t-right">${currency} ${order.payment?.subTotalWithoutDiscount?.toFixed(
              2
            )} </td>
        </tr>
        <tr>
          <td style="color: black;" colspan="3" class="t-left">
            Total Savings/Discounts <br />
            إجمالي المدخرات / الخصومات
          </td>
          <td style="color: black;" class="t-right">${currency} -${discount?.toFixed(
              2
            )} </td>
        </tr>
       
        `
          : ``
      }
        <tr>
          <td style="color: black;" colspan="3" class="t-left">Total Taxable Amount (Excluding VAT)
					<br>الإجمالي الخاضع للضریبة (غیر شامل ضریبة)
				</td>
          <td style="color: black;" class="t-right">${currency} ${order?.payment?.subTotal?.toFixed(
    2
  )}</td>
        </tr>

        ${
          order?.payment?.charges?.length > 0
            ? order?.payment?.charges
                ?.map(
                  (charge: any) => ` <tr>
          <td style="color: black;" colspan="3" class="t-left">${
            charge?.name?.en
          } <br/> 
            ${charge?.name?.ar}
          </td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
                    charge?.total - charge?.vat
                  )}</td>
        </tr>`
                )
                .join("")
            : `<tr></tr>`
        }

        <tr>
          <td style="color: black;" colspan="3" class="t-left">Total VAT <br>قيمة الضريبة الكلية</td>
          <td style="color: black;" class="t-right">${currency} ${(
    order.payment?.vatAmount ||
    order.payment?.vat ||
    0.0
  )?.toFixed(2)}</td>
        </tr>
        
        
      </table>
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black;" colspan="3" class="t-left">
            Total Amount <br />
            المبلغ الإجمالي
          </td>
          <td style="color: black;" class="t-right">${currency} ${order.payment?.total?.toFixed(
    2
  )}</td>
        </tr>
      </table>
      
      <div class="divider"></div>
      <table>

        ${Object.keys(payments || {}).map((provider) => {
          return `<tr>
					<td style="color: black;" colspan="3" class="t-left">${provider}</td>
					<td style="color: black;" class="t-right">${currency} ${Number(
            payments[provider] || 0
          )?.toFixed(2)}</td>
				</tr>`;
        })}
     
      ${
        Number(paidWithCash || 0) > 0
          ? `
				<tr>
					<td style="color: black;" colspan="3" class="t-left">Cash</td>
					<td style="color: black;" class="t-right">${currency} ${(
              Number(paidWithCash || 0) - change
            )?.toFixed(2)}</td>
				</tr>
			`
          : ``
      }
      ${
        tenderCash > Number(order.payment?.total)
          ? `<tr>
          <td style="color: black;" colspan="3" class="t-left">Tendered Cash</td>
          <td style="color: black;" class="t-right">${currency} ${
              tenderCash ? tenderCash?.toFixed(2) : ""
            }</td>
        </tr>`
          : ``
      }
        ${
          change > 0
            ? `<tr>
          <td style="color: black;" colspan="3" class="t-left">Change</td>
          <td style="color: black;" class="t-right">- ${currency} ${change?.toFixed(
                2
              )}</td>
        </tr>`
            : ``
        }
      </table>
        ${order?.specialInstructions ? `<div class="divider"></div>` : ``}
      
        ${
          order?.specialInstructions
            ? `
        <p style="color: black; class="footer">Special Instructions</p>
        <p style="color: black; class="footer">تعليمات خاصة</p>
      <p style="color: black;">${order?.specialInstructions}</p>
          `
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
      <p style="color: black">Return Policy/سياسة الإسترجاع</p>
      <p class="t-left" style="padding: 6px;color: black">${
        template?.returnPolicy || ""
      }</p><div class="divider"></div>`
          : ``
      }
  
  
      ${
        template?.customText
          ? `
      <p class="t-left" style="padding: 6px; color: black">${
        template?.customText || ""
      }</p><div class="divider"></div>`
          : ``
      }
      ${
        template?.footer
          ? `  
    
          <div style="color: black; class="footer">
            <p>${template?.footer || ""}</p>
          </div><div class="divider"></div>`
          : ``
      }
    </div>
  </body>
</html>`;
};

export default MultiPayReceiptPrint;
