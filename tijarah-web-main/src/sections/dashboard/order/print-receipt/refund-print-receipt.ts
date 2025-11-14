import { format } from "date-fns";
import i18n from "src/i18n";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const RefundReceiptPrint = (
  userObj: any,
  order: any,
  template?: any,
  phone?: any
) => {
  const currency = useCurrency();
  const totalRefund = () =>
    order?.refunds[0]?.refundedTo?.reduce(
      (total: number, refunded: any) => total + Number(refunded.amount || 0),
      0
    );

  const itemHtml = order?.refunds?.[0]?.items
    ?.map((item: any) => {
      const orderItem = order.items.find((items: any) =>
        item.sku
          ? (items.productRef === item._id &&
              items.variant?.sku === item.sku) ||
            item.sku === "Open Item"
          : items.productRef === item._id
          ? item.sku === "Open Item"
          : true
          ? item.unit === "perItem" ||
            items.type === "box" ||
            items.type === "crate"
          : items.qty === item.qty
      );

      let modifierName = "";

      if (item?.modifiers || item?.modifiers?.length > 0) {
        item?.modifiers?.map((mod: any) => {
          modifierName += `${modifierName === "" ? "" : ","} ${mod.optionName}`;
        });
      }

      let itemHtml = `
      <tr>
        <td style="color: black;" colspan="2" class="t-left no-bold">
		${item.name.en} 
       
        ${
          orderItem && orderItem.variant.type === "box"
            ? `, <br /> (${i18n.t("Box")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : orderItem && orderItem.variant.type === "crate"
            ? `, <br /> (${i18n.t("Crate")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : ``
        } <br />
        ${item.name.ar} 
        
        ${
          orderItem && orderItem.variant.type === "box"
            ? `, <br/> (${i18n.t("Box")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : orderItem && orderItem.variant.type === "crate"
            ? `, <br/> (${i18n.t("Crate")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : ``
        }
        
          ${modifierName ? `<br /> ${modifierName}` : ``}
        </td>
			<td style="color: black;">${toFixedNumber(item?.amount - item?.vat)}</td>
			<td style="color: black;">${item.qty}</td>
			<td style="color: black;" >${toFixedNumber(item.amount)}</td>
		  </tr>
      `;

      return itemHtml;
    })
    .join("");

  const newRefunds = order?.refunds[0]?.refundedTo?.reduce(
    (cv: any, pv: any) => {
      if (!cv[pv.refundedTo]) {
        cv[pv.refundedTo] = 0;
      }
      cv[pv.refundedTo] += pv.amount;
      return cv;
    },
    {}
  );

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
      ? `<div class="logo">
			<img src=${template?.logo} alt="Logo" width="80%">
		</div>
		<div class="divider"></div>`
      : ``
  }
		<h4  style="color: black;">${template?.location?.name?.en}</h4>
		<h4  style="color: black;">${template?.location?.name?.ar}</h4>
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
				<td class="t-left" style="color: black;" class="t-left">Refund Receipt No.# <br> #رقم الفاتورة</td>
				<td class="t-right" style="color: black;">#${
          order?.refunds[0]?.referenceNumber || ""
        }</td>
			</tr>
			<tr>
				<td class="t-left" style="color: black;" class="t-left">Invoice Reference No.# <br> # رقم الإشارة للفاتورة </td>
				<td class="t-right" style="color: black;">#${order?.orderNum || ""}</td>
			</tr>
			<tr>
				<td class="t-left" style="color: black;">Time & Date <br> التاريخ والوقت</td>
				<td class="t-right" style="color: black;">${
          order?.refunds?.[0]?.date
            ? format(new Date(order?.refunds?.[0]?.date), "yyyy-MM-dd, h:mma")
            : ""
        }</td>
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
           template?.showToken || template?.showOrderType
             ? `<div class="divider"></div>`
             : ``
         }
  
      ${
        template?.showToken
          ? `
      <h2 style="color: black;">${
        order?.tokenNumber || order?.tokenNum || ""
      }</h2>
      `
          : ``
      }

      ${
        template?.showOrderType
          ? `
      <p style="color: black;">${
        ChannelsName[order?.orderType] || order?.orderType || ""
      }</p>
      `
          : ``
      }


		<div class="divider"></div>
		<!-- changed -->
		<h4 style="color: black;">Notice creditor / Refund Receipt</h4>
		<h4 style="color: black;">دائن الإشعار/إيصال الاسترداد</h4>
		<!-- end -->
		<div class="divider"></div>
		<table>
			<tr style="border-bottom: 1px dashed #000;">
				<td colspan="2" class="t-left" style="color: black;">Description <br> الوصف
				</td>
				<td style="color: black;">Unit Price <br> سعر الوحدة</td>
				<td style="color: black;">Qty <br> الكمية</td>
				<td class="t-right" style="color: black;">Total <br> الإجمالي </td>
			</tr>
			
					

			${itemHtml}
		</table>
		<div class="divider"></div>
		<table>
			<tr>
				<td colspan="3" class="t-left" style="color: black;">Total Taxable Amount (Excluding VAT)
					<br> الإجمالي الخاضع للضریبة (غیر شامل ضریبة) 
				</td>
				<td class="t-right" style="color: black;">${currency} ${(
    (order?.refunds[0]?.amount || 0) - (order?.refunds[0]?.vat || 0)
  ).toFixed(2)}</td>
			</tr>

					${
            order?.refunds[0]?.charges?.length > 0
              ? order?.refunds[0]?.charges
                  ?.map(
                    (charge: any) => ` <tr>
          <td style="color: black;" colspan="3" class="t-left">${
            charge?.name?.en
          } <br/> 
            ${charge?.name?.ar}
          </td>
          <td style="color: black;" class="t-right">${currency} ${toFixedNumber(
                      charge?.totalCharge - charge?.totalVatOnCharge
                    )}</td>
        </tr>`
                  )
                  .join("")
              : `<tr></tr>`
          }

			<tr>
				<td colspan="3" class="t-left" style="color: black;">VAT Refund<br>قيمة الضريبة الكلية </td>
				<td class="t-right" style="color: black;">${currency} ${toFixedNumber(
    order?.refunds[0]?.vat || 0
  )}</td>
			</tr>
			

		</table>
		<div class="divider"></div>
		<table>
			<tr>
				<td colspan="3" class="t-left" style="color: black;">Amount Refund<br>المبلغ الإجمالي</td>
				<td class="t-right fs-22" style="color: black;">${currency} ${toFixedNumber(
    totalRefund()
  )}</td>
			</tr>

		</table>
		<div class="divider"></div>
			<table>


			  ${Object.keys(newRefunds || {}).map((provider) => {
          return `<tr>
				<td style="color: black;" colspan="3" class="t-left">${capitalizeFirstLetter(
          provider
        )}</td>
				<td style="color: black;" class="t-right">${currency} ${newRefunds[
            provider
          ].toFixed(2)} </td>
			</tr>`;
        })}

			</table>
      
			
			${
        template?.returnPolicy || template?.customText || template?.footer
          ? `<div class="divider"></div>`
          : ``
      }
		${
      template?.returnPolicy
        ? `
		<p  style="padding: 6px; color: black;">Return Policy/سياسة الإسترجاع</p>
		<p class="t-left" style="padding: 6px; color: black;">${
      template?.returnPolicy || ""
    }</p><div class="divider"></div>`
        : ``
    }


		${
      template?.customText
        ? `
		<p style="padding: 6px; color: black;">${
      template?.customText || ""
    }</p><div class="divider"></div>`
        : ``
    }

		${
      Number(order?.payment?.discountAmount) > 0
        ? `<P class="t-left" style="padding: 6px; color: black;">Note: The item prices listed are after any discounts given during billing</P>`
        : ``
    }
	
	${
    template?.footer
      ? `  <div class="divider"></div>

		  <div class="footer">
			  <p style="color: black;">${template?.footer || ""}</p>
		  </div><div class="divider"></div>`
      : ``
  }

		
		


	</div>
</body>

</html>`;
};

export default RefundReceiptPrint;
