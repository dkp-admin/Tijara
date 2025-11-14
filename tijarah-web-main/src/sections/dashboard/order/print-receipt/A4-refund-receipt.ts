import { format } from "date-fns";
import i18n from "src/i18n";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const A4RefundReceiptPrint = (
  user: any,
  order: any,
  template: any,
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
          modifierName += `${modifierName === "" ? " +" : "<br/> +"}${
            mod.optionName
          }`;
        });
      }

      return ` 
       <tr>
                    <td
                      class="text-left text-dark px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100 font-regular"
                    >

                      <h1 class="text-left text-sm font-regular">   ${
                        item.name.en
                      }  
        
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
            ? `,<br/> (${i18n.t("Box")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : orderItem && orderItem.variant.type === "crate"
            ? `,<br/> (${i18n.t("Crate")} - ${
                orderItem.variant.unitCount
              } ${i18n.t("Units")})`
            : ``
        }
        ${modifierName ? `<br/> ${modifierName}` : ``}
        </h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm font-regular">${currency} ${toFixedNumber(
        item?.amount - item?.vat
      )}</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base  px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm font-regular ">${item.qty}</h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm text-right font-regular">${currency}
                     ${toFixedNumber(item.amount)}
                      </h1>
                    </td>
                  </tr>`;
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

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";

    // Ensure phone number starts with country code
    if (!phone.startsWith("+")) {
      // Add default country code +966 if missing
      return "+966" + phone.trim();
    }

    return phone.trim();
  };

  return `<html lang="en">
  <head>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
      rel="stylesheet"
    />
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://cdn.tailwindcss.com"></script>
    <title>Invoice</title>
    <style>
      @page {
        size: A4;
        margin: 0.25in;
      }

      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }

        /* Add padding to top of new pages */
        .page-break-padding {
          padding-top: 2rem;
          page-break-before: always;
        }

        /* Ensure table rows don't break awkwardly */
        tbody tr {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Add top padding for continuation pages */
        .table-continuation {
          margin-top: 2rem;
        }
      }

      body {
        max-width: 100%;
        font-family: "Cairo", sans-serif;
        padding: 1%;
        margin: 0;
        line-height: 1.3;
      }

      /* Page break utilities */
      .page-break-padding {
        padding-top: 2rem;
      }

      .table-continuation {
        margin-top: 2rem;
      }

      .flex { display: flex; }
      .flex-row { flex-direction: row; }
      .flex-col { flex-direction: column; }
      .justify-between { justify-content: space-between; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      .mt-4 { margin-top: 0.5rem; }
      .mt-3 { margin-top: 0.25rem; }
      .mt-2 { margin-top: 0.25rem; }
      .mb-2 { margin-bottom: 0.25rem; }
      .mb-4 { margin-bottom: 0.25rem; }
      .items-start { align-items: flex-start; }
      .items-center { align-items: center; }
      .text-xs { font-size: 0.65rem; }
      .text-sm { font-size: 0.7rem; }
      .text-md { font-size: 0.8rem; }
      .text-lg { font-size: 0.9rem; }
      .text-base { font-size: 0.7rem; }
      .font-bold { font-weight: bold; }
      .font-regular { font-weight: 400; }
      .my-2 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
      .px-4 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .py-4 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
      .py-3 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .px-0.5 { padding-left: 0.05rem; padding-right: 0.05rem; }
      .p-4 { padding: 0.25rem; }
      .container { width: 100%; margin-left: auto; margin-right: auto; }
      .flex-wrap { flex-wrap: wrap; }
      .w-full { width: 100%; }
      .max-w-full { max-width: 100%; }

      .table-auto {
        width: 100%;
        margin: 0;
        border-collapse: collapse;
      }

      .table-auto td,
      .table-auto th {
        border: 1px solid #e2e8f0;
        padding: 0.2rem;
        vertical-align: top;
      }

      .text-dark { color: #333; }
      .bg-[#FFFFFF] { background-color: #fff; }
      .border-b-2 { border-bottom-width: 1px; }
      .border-l-2 { border-left-width: 1px; }
      .border-r-2 { border-right-width: 1px; }
      .border-gray-100 { border-color: #e2e8f0; }
      .uppercase { text-transform: uppercase; }
      .mx-2 { margin-left: 0.25rem; margin-right: 0.25rem; }
      .mx-5 { margin-left: 0.5rem; margin-right: 0.5rem; }
      .mx-12 { margin-left: 1rem; margin-right: 1rem; }
      .mx-20 { margin-left: 2rem; margin-right: 2rem; }
      .visible { visibility: visible; }
      .invisible { visibility: hidden; }
      .bg-[#14b8a6] { background-color: rgba(20, 184, 166, 0.15); }
      .bg-[#eff8fe] { background-color: rgba(239, 248, 254, 1); }
      .bg-green-500 { background-color: transparent; }
      .height-60 { height: 30px; }
      .margin-bottom-130 { margin-bottom: 50px; }
    </style>
  </head>
  <body style="margin: 1% ">
  <div class="flex flex-col">

   



    <!-- Refund Details and Customer Information -->
    <div class="flex flex-row justify-between mb-2" >
        <!-- Left Side - Refund Details -->
        <div class="text-left">
            <h1 class="text-xs text-dark">Refund receipt No. / رقم إيصال الاسترداد #${
              order?.refunds[0]?.referenceNumber
            }</h1>
            <h1 class="text-xs text-dark">Invoice Reference No. / رقم مرجع الفاتورة #${
              order?.orderNum
            }</h1>
            ${
              template?.showToken
                ? `
      <h3 class="text-xs text-dark">Token No. / رقم الرمز المميز: ${
        order?.tokenNumber || order?.tokenNum || ""
      }</h3>
      `
                : ``
            }

               ${
                 template?.showOrderType
                   ? `
      <p class="text-xs text-dark">Order type / نوع الطلب: ${
        ChannelsName[order?.orderType] || order?.orderType || ""
      }</p>
      `
                   : ``
               }

                <div class="mb-2 text-left">
                    <h2 class="text-xs text-dark font-regular"> Date and time: ${format(
                      new Date(order?.createdAt || "") || new Date(),
                      "h:mmaa yyyy-MM-dd"
                    )} - تاریخ والوقت </h2>
                </div>
        </div>

        <!-- Right Side - Customer Information -->
        <div class="text-right">
                ${
                  order?.customer?.name
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer Name/اسم العميل: ${
                        order?.customer?.name || ""
                      } </h2>
                </div>`
                    : ``
                }

                ${
                  order?.customer?.phone
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer Phone/هاتف العميل: </h2>
                      <p class="text-xs text-dark font-regular">
                      ${formatPhoneNumber(order?.customer?.phone || "")}</p>
                </div>`
                    : ``
                }

                ${
                  order?.customer?.email
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer Email/بريد العميل: ${
                        order?.customer?.email || ""
                      } </h2>
                </div>`
                    : ``
                }

                ${
                  order?.customer?.vat
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer VAT/الرقم الضريبي للعميل: ${
                        order?.customer?.vat || "-"
                      } </h2>
                </div>`
                    : ``
                }

                ${
                  order?.customer?.address
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer Address/عنوان العميل: ${
                        order?.customer?.address?.fullAddress || "-"
                      } </h2>
                </div>`
                    : ``
                }
        </div>
    </div>

    <section class="max-w-full mt-4">
      <div>
     
          <div class="w-full">
            <div class="max-w-full">
              <table class="table-auto max-w-full">
                <thead>
                  <tr
                    class="text-center"
                    style="
                      background-color: rgba(20, 184, 166, 0.15);
                      height: 60px;
                    "
                  >
                    <th>
                      <div class="flex flex-col items-start ">
                        <h1 class="uppercase text-sm text-dark"> الوصف
				</h1>
                        <h1 class="uppercase text-sm text-dark">Description</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-sm text-dark"> سعر الوحدة</h1>
                        <h1 class="uppercase text-sm text-dark">Unit Price</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-sm text-dark "> الكمية</h1>
                        <h1 class="uppercase text-sm text-dark">Quantity</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-sm text-dark"> الإجمالي </h1>
                        <h1 class="uppercase text-sm text-dark">Total</h1>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  ${itemHtml}

                   <tr>
                    <td
                      class="py-3 text-dark px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-sm font-regular text-left">Total Taxable Amount (Excluding VAT)/الإجمالي الخاضع للضریبة (غیر شامل ضریبة)</h1>
                    </td>
                    <td
                      class="py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-sm "></h1>
                    </td>
                    <td
                      class="py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-sm ">
				</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm text-right font-regular">${currency} ${(
    (order?.refunds[0]?.amount || 0) - (order?.refunds[0]?.vat || 0)
  ).toFixed(2)}</h1>
                    </td>
                        </tr>  

                        ${
                          order?.refunds[0]?.charges?.length > 0
                            ? order?.refunds[0]?.charges
                                ?.map(
                                  (charge: any) => `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100 font-regular"
                    >
                      <h1 class="text-sm font-regular text-left">${
                        charge?.name?.en
                      }/${charge?.name?.ar}</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm "></h1>
                    </td><td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm "></h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm text-right font-regular">
                      ${currency} ${toFixedNumber(
                                    charge?.totalCharge -
                                      charge?.totalVatOnCharge
                                  )}
                      </h1>
                    </td>

                    </tr>`
                                )
                                .join("")
                            : ``
                        }

                        <tr>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm font-regular text-left">
                      VAT Refund/استرداد الضريبة </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm text-right font-regular">
                      ${currency} ${toFixedNumber(order?.refunds[0]?.vat || 0)}
                      </h1>
                    </td>
                    </tr>

                    <tr>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-sm font-regular text-left">
            Amount Refund <br />المبلغ الإجمالي</h1>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-sm text-right">${currency} ${toFixedNumber(
    totalRefund()
  )}
                      </h1>
                    </td>
                    </tr>                  
                  </tbody>
              </table>
            </div>
          </div>
      
      </div>
    </section>

    <section class="mt-4">
      <div >
        <div class="flex flex-wrap ">
          <div class="w-full">
            <div class="max-w-full">
              <table class="table-auto w-full">
                <thead>
                  <tr
                    class="text-center"
                    style="
                      background-color: rgba(239, 248, 254, 1);
                      height: 60px;
                    "
                  >
                    <th>
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="uppercase text-sm text-dark">ملخص الفاتورة</h1>
                        <h1 class="uppercase text-sm text-dark">Payment SUMMARY</h1>
                      </div>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                ${Object.keys(newRefunds || {}).map((provider) => {
                  return `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"  
                    >
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="text-sm font-regular text-left">${capitalizeFirstLetter(
                          provider
                        )}</h1>
                      </div>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1
                        class="flex flex-col items-end text-sm font-bold mx-5 text-right font-regular"
                      >
                     ${currency} ${newRefunds[provider]}
                      </h1>
                    </td>
                  </tr>`;
                })}

                 
               
                  
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="mt-2 flex flex-row justify-between items-center">
    
   
    <div></div>
  </div>

    <div class="mt-2 text-center">
      <div class="text-center">
         <p class="font-regular text-center text-sm text-dark">
        ${template?.returnPolicy ? `Return Policy/سياسة الإسترجاع` : ``}
        </p>

        <p class="font-regular text-center text-sm text-dark">
         ${template?.returnPolicy ? `${template?.returnPolicy || ""}` : ``}

           ${template?.returnPolicy ? `<div class="divider"></div>` : ``}

      
        </p>
         <p class="font-regular text-center text-sm text-dark">

        ${template?.customText ? `${template?.customText || ""}` : ``}
</p>
        <p class="text-center">
        <br/>
        ${
          Number(order?.payment?.discountAmount) > 0
            ? "Note: The item prices listed are after any discounts given during billing"
            : ""
        }
        </p>
      </div>
    </div>

    <footer>
       <h5 class="text-center text-dark font-small text-base py-3 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100">
       <br/>
         ${template?.footer ? `${template?.footer || ""}` : ``}
       </h5>
    </footer>
    </div>
  </body>
</html>`;
};

export default A4RefundReceiptPrint;
