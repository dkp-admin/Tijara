import { format } from "date-fns";
import i18n from "src/i18n";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { ChannelsName } from "src/utils/constants";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const A4ReceiptPrint = (user: any, order: any, template: any, phone: any) => {
  const currency = useCurrency();
  const itemHtml = order?.items
    ?.map((item: any) => {
      console.log(item, "ASDMADSKMDAS<D ASMD");

      let modifierName = "";

      const modPrice = item?.modifiers?.reduce((pv: number, cv: any) => {
        return pv + Number(cv?.subTotal || 0);
      }, 0);

      const totalItemPrice =
        (item?.variant?.sellingPrice ||
          item?.itemSubTotal ||
          item?.billing?.total / item?.quantity) + modPrice;

      if (item?.modifiers?.length > 0) {
        item.modifiers.forEach((mod: any) => {
          modifierName += `${modifierName ? "<br/> +" : " +"}${mod.optionName}`;
        });
      }
      return `
       <tr>
                    <td
                      class="text-left text-dark px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100 font-regular py-1"
                    >

                      <h1 class="text-left text-xs font-regular">   ${
                        item.name.en
                      }
        ${
          item?.hasMultipleVariants
            ? ` - ${item?.variant?.name?.en || item?.variantNameEn},`
            : ""
        }
        ${
          item?.variant?.type === "box" || item?.type === "box"
            ? ` (${i18n.t("Box")} - ${
                item?.variant?.unitCount || item.noOfUnits
              } Units)`
            : item?.variant?.type === "crate" || item?.type === "crate"
            ? ` (${i18n.t("Crate")} - ${
                item?.variant?.unitCount || item.noOfUnits
              } Units)`
            : ``
        } <br />
        ${item.name.ar}
         ${
           item?.hasMultipleVariants
             ? ` - ${item?.variant?.name?.ar || item?.variantNameAr},`
             : ""
         }

          ${modifierName ? `<br/>${modifierName}` : ``}
        </h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100 py-1"
                    >
                      <h1 class="text-xs font-regular">${toFixedNumber(
                        totalItemPrice
                      )}</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base  px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100 py-1"
                    >
                      <h1 class="text-xs font-regular ">${
                        item?.quantity || item?.qty
                      }</h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100 py-1"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right font-regular">
                      ${
                        item?.isFree
                          ? `
                        ${"Free / مجاني"}
                          ${` <small style="text-decoration: line-through; font-size: 0.6rem;">
                            ${currency} ${toFixedNumber(
                            item?.billing?.discountedTotal
                          )}
                          </small>`}
                        `
                          : `

                        ${
                          item?.billing?.discountAmount > 0 ||
                          item?.discount > 0
                            ? `<small style="text-decoration: line-through; font-size: 0.6rem;">
                            ${currency} ${toFixedNumber(
                                (item?.billing?.total || item?.total) +
                                  (item?.billing?.discountAmount ||
                                    item?.discount)
                              )}
                          </small> `
                            : ""
                        }
                     ${currency} ${toFixedNumber(
                              item?.billing?.total || item?.total
                            )}
                        `
                      }

                      </h1>
                    </td>
                  </tr>`;
    })
    .join("");

  const totalPaid = order?.payment?.breakup?.reduce(
    (pv: number, cv: any) => pv + Number(cv.total),
    0
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

  const tenderCash = Number(paidWithCash);

  const freeItemsDiscount: any = order?.items?.reduce((prev: any, cur: any) => {
    if (cur?.isFree) return prev + Number(cur?.billing?.total || cur?.total);
    else return prev;
  }, 0);

  const freeQtyItemsDiscount: any = order?.items?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isQtyFree)
        return prev + Number(cur?.billing?.discountAmount || cur?.discount);
      else return prev;
    },
    0
  );

  const discount =
    Number(order?.payment?.discountAmount || order?.payment?.discount || 0) +
    Number(freeQtyItemsDiscount || 0) +
    Number(freeItemsDiscount || 0);

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
      .py-1 { padding-top: 0.05rem; padding-bottom: 0.05rem; }
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

   
   

    <!-- Invoice Details and Customer Information -->
    <div class="flex flex-row justify-between mb-2" >
        <!-- Left Side - Invoice Details -->
        <div class="text-left">
            <h2 class="text-xs font-regular text-dark">Invoice No. / رقم الفاتورة #${
              order?.orderNum
            }</h2>

               ${
                 template?.showToken
                   ? `
      <h2 class="text-xs font-regular text-dark">Token No. / رقم الرمز المميز: ${
        order?.tokenNumber || order?.tokenNum || ""
      }</h2>
      `
                   : ``
               }

               ${
                 template?.showOrderType
                   ? `
      <h2 class="text-xs font-regular text-dark">Order Type / نوع الطلب: ${
        ChannelsName[order?.orderType] || order?.orderType || ""
      }</h2>
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
                  order?.customer?.fullAddress
                    ? `<div class="mb-2">
                      <h2 class="text-xs text-dark font-regular">Customer Address/عنوان العميل: ${
                        order?.customer?.address?.fullAddress || "-"
                      } </h2>
                </div>`
                    : ``
                }
        </div>
    </div>

    <section class="px-1 max-w-full mt-2" >
      <div >

          <div class="w-full">
            <div class="max-w-full">
              <table class="table-auto max-w-full">
                <thead>
                  <tr
                    class="text-center"
                    style="
                      background-color: rgba(20, 184, 166, 0.15);
                      height: 25px;
                    "
                  >
                    <th>
                      <div class="flex flex-col items-start ">
                        <h1 class="uppercase text-xs text-dark">DESCRIPTION/الوصف</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-xs text-dark">UNIT PRICE/سعر الوحدة</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-xs text-dark">QUANTITY/الكمية</h1>
                      </div>
                    </th>
                    <th>
                      <div class="flex flex-col items-center">
                        <h1 class="uppercase text-xs text-dark">TOTAL/الإجمالي</h1>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody style="padding:0px">
                  ${itemHtml}

                  ${
                    discount > 0
                      ? `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs font-regular text-left">
            Items Total/إجمالي العناصر</h1>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right font-regular">${currency} ${order.payment?.subTotalWithoutDiscount?.toFixed(
                          2
                        )}
                      </h1>
                    </td>


                    </tr>`
                      : ``
                  }

                  ${
                    discount > 0
                      ? `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs font-regular text-left">
            Total Savings/Discounts/إجمالي المدخرات والخصومات
          </h1>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right font-regular">${currency} -${discount?.toFixed(
                          2
                        )}
                      </h1>
                    </td>


                    </tr>`
                      : ``
                  }

                   <tr>
                    <td
                      class="py-1 text-dark px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-xs font-regular text-left">Total Taxable Amount (Excluding VAT)/الإجمالي الخاضع للضریبة (غیر شامل ضریبة)</h1>
                    </td>
                    <td
                      class="py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-xs "></h1>
                    </td>
                    <td
                      class="py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >

                      <h1 class="text-xs ">
				</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs text-right font-regular">${currency} ${order.payment.subTotal?.toFixed(
    2
  )}</h1>
                    </td>
                        </tr>
                        ${
                          order?.payment?.charges?.length > 0
                            ? order?.payment?.charges
                                ?.map(
                                  (charge: any) => `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100 font-regular"
                    >
                      <h1 class="text-xs font-regular text-left">${
                        charge?.name?.en
                      }/${charge?.name?.ar}</h1>
                    </td>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs "></h1>
                    </td><td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs "></h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right font-regular">
                      ${currency} ${toFixedNumber(charge?.total - charge?.vat)}
                      </h1>
                    </td>

                    </tr>`
                                )
                                .join("")
                            : ``
                        }

                        <tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs font-regular text-left">
                      Total VAT/قيمة الضريبة الكلية
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right font-regular">
                      ${currency} ${(
    order.payment?.vatAmount ||
    order.payment?.vat ||
    0.0
  )?.toFixed(2)}
                      </h1>
                    </td>
                    </tr>





                    <tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100"
                    >
                      <h1 class="text-xs font-regular text-left">
            Total Amount/المبلغ الإجمالي
          </h1>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs ">
                      </h1>
                    </td>
                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1 class="flex flex-col items-end text-xs text-right">${currency} ${order.payment.total?.toFixed(
    2
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

    <section>
      <div class="mt-2">
        <div class="flex flex-wrap ">
          <div class="w-full">
            <div class="max-w-full">
              <table class="table-auto w-full">
                <thead>
                  <tr
                    class="text-center"
                    style="
                      background-color: rgba(239, 248, 254, 1);
                    "
                  >
                    <th>
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="uppercase text-xs text-dark">PAYMENT SUMMARY/ملخص الدفع</h1>
                      </div>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                   ${Object.keys(payments || {}).map((provider) => {
                     return `<tr>
                    <td
                      class="text-center text-dark font-small text-base px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100 py-1"
                    >
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="text-xs font-regular text-left">${capitalizeFirstLetter(
                          provider
                        )}</h1>
                      </div>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1
                        class="flex flex-col items-end text-xs font-bold mx-5 text-right font-regular"
                      >
                       ${currency} ${Number(payments[provider] || 0)?.toFixed(
                       2
                     )}
                      </h1>
                    </td>
                  </tr>`;
                   })}



                ${
                  Number(paidWithCash || 0) > 0
                    ? `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="text-xs text-dark font-regular text-left">Cash / نقدي</h1>
                      </div>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1
                        class="flex flex-col items-end text-xs text-dark font-bold mx-5 text-right font-regular"
                      >
                       ${currency} ${(
                        Number(paidWithCash || 0) - change
                      )?.toFixed(2)}
                      </h1>
                    </td>
                  </tr>`
                    : ``
                }

                ${
                  tenderCash > Number(order.payment?.total)
                    ? `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="text-xs text-dark font-regular text-left">Tendered Cash / النقد المقدم</h1>
                      </div>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1
                        class="flex flex-col items-end text-xs font-bold mx-5 text-dark text-right font-regular"
                      >
                       ${currency} ${Number(tenderCash || 0)?.toFixed(2)}
                      </h1>
                    </td>
                  </tr>`
                    : ``
                }

                ${
                  change > 0
                    ? `<tr>
                    <td
                      class="text-center text-dark font-small text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-l-2 border-gray-100"
                    >
                      <div class="flex flex-col items-start mx-5">
                        <h1 class="text-xs text-dark font-regular text-left">Change / الباقي</h1>
                      </div>
                    </td>

                    <td
                      class="text-center text-dark font-medium text-base py-1 px-0.5 bg-[#FFFFFF] border-b-2 border-r-2 border-gray-100"
                    >
                      <h1
                        class="flex flex-col items-end text-xs font-bold mx-5 text-dark text-right font-regular"
                      >
                       - ${currency} ${change?.toFixed(2)}
                      </h1>
                    </td>
                  </tr>`
                    : ``
                }

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="mt-1 flex flex-col justify-between items-center">

      <div>

        <p class="font-regular text-xs text-dark">
        ${template?.returnPolicy ? `Return Policy/سياسة الإسترجاع` : ``}
        </p>
        <p class="font-regular text-xs text-dark">
        ${template?.returnPolicy ? `${template?.returnPolicy || ""}` : ``}
        </p>
        <p class="font-regular text-xs text-dark">
         ${template?.customText ? `${template?.customText || ""}` : ``}
         </p>
      </div>

      <div>
      <p class="text-center text-dark font-small text-base px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100">
      ${order?.specialInstructions ? `Special Instructions/تعليمات خاصة` : ``}
      </p>
      <p class="font-regular text-xs text-dark">
      ${order?.specialInstructions ? `${order?.specialInstructions || ""}` : ``}
      </p>
    </div>
    </div>

    <footer>
       <h5 class="text-center text-dark font-small text-xs px-0.5 bg-[#FFFFFF] border-b-2 border-gray-100">
         ${template?.footer ? `${template?.footer || ""}` : ``}
       </h5>
    </footer>
    </div>
  </body>
</html>`;
};

export default A4ReceiptPrint;
