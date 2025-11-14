import { format } from "date-fns";
import i18n from "src/i18n";
import { ChannelsName } from "src/utils/constants";

const KOTReceiptPrint = (data: any) => {
  const itemHtml = data?.items
    ?.map((item: any) => {
      let modifierName = "";

      if (item?.modifiers || item?.modifiers?.length > 0) {
        item?.modifiers?.map((mod: any) => {
          modifierName += `${modifierName === "" ? "" : ","} ${mod.optionName}`;
        });
      }

      return ` 
      <tr>
      <td style="color: black;" colspan="2" class="t-left no-bold">
        ${item.name.en} 
        ${
          item?.hasMultipleVariants
            ? ` <br /> - ${item?.variant?.name?.en || item?.variantNameEn}, `
            : ""
        } 
        ${
          item?.variant?.type === "box" || item?.type === "box"
            ? `<br /> (${i18n.t("Box")} - ${
                item?.variant?.unitCount || item?.noOfUnits
              } Units)`
            : item?.variant?.type === "crate" || item?.type === "crate"
            ? `<br /> (${i18n.t("Crate")} - ${
                item?.variant?.unitCount || item?.noOfUnits
              } Units)`
            : ``
        } <br />
        ${item.name.ar} 
         ${
           item?.hasMultipleVariants
             ? `<br/> - ${item?.variant?.name?.ar || item?.variantNameAr}, `
             : ""
         } 
        ${
          item?.variant?.type === "box" || item?.type === "box"
            ? `<br /> (${i18n.t("Box")} - ${
                item?.variant?.unitCount || item?.noOfUnits
              } Units)`
            : item?.variant?.type === "crate" || item?.type === "crate"
            ? `<br /> (${i18n.t("Crate")} - ${
                item?.variant?.unitCount || item?.noOfUnits
              } Units)`
            : ``
        }
        ${modifierName ? ` <br /> ${modifierName}` : ""} 
      </td>
      <td style="color: black;"  class="t-right">${
        item?.quantity || item?.qty
      }</td>
    </tr>`;
    })
    .join("");

  const totalQTY = data?.items?.reduce(
    (pv: any, cv: any) => pv + (cv?.quantity || cv?.qty),
    0
  );

  return `<html>
  <head>
    <title>KOT Receipt</title>
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
      <h4 style="color: black">${data?.location?.en}</h4>
      <h4 style="color: black">${data?.location?.ar}</h4>
      <p style="color: black">${data?.address}</p>
      <div class="divider"></div>
      <table>
        <tr>
          <td style="color: black" colspan="3" class="t-left">
            Invoice# <br />
            رقم الفاتورة#
          </td>
          <td style="color: black" class="t-right">#${data?.orderNum || ""}</td>
        </tr>
        <tr>
          <td style="color: black" colspan="3" class="t-left">
            Date & time <br />
            التاريخ والوقت
          </td>
          <td style="color: black" class="t-right">
            ${
              data?.createdAt
                ? format(new Date(data.createdAt), "yyyy-MM-dd, hh:mm:ssa")
                : format(new Date(), "yyyy-MM-dd, hh:mm:ssa")
            }
          </td>
        </tr>
      </table>

      ${
        data?.showToken || data?.showOrderType
          ? `
      <div class="divider"></div>
      `
          : ``
      } ${
    data?.showToken
      ? `
      <h2 style="color: black">${data?.tokenNum || ""}</h2>
      `
      : ``
  } ${
    data?.showOrderType
      ? `
      <p style="color: black">${
        ChannelsName[data?.orderType] || data?.orderType || ""
      }</p>
      `
      : ``
  }

      <div class="divider"></div>
      <h4 style="color: black">KOT</h4>
      <div class="divider"></div>
      <table>
        <tr class="divider-down">
          <td style="color: black" class="t-left">
            Description <br />
            الوصف
          </td>
          <td></td>
          <td style="color: black">
            Qty <br />
            الكمية
          </td>
        </tr>
        ${itemHtml}
      </table>

      <div class="divider"></div>

      <table>
        <tr>
          <td style="color: black" colspan="3" class="t-left">
            Total QTY <br />
            إجمالي الكمية
          </td>
          <td style="color: black" class="t-right">${totalQTY || 0}</td>
        </tr>
      </table>


      ${data?.specialInstructions ? ` <div class="divider"></div>` : ``}
      
       ${
         data?.specialInstructions
           ? `
        <p style="color: black; class="footer">Special Instructions</p>
        <p style="color: black; class="footer">تعليمات خاصة</p>
      <p style="color: black;">${data?.specialInstructions}</p>
          `
           : ``
       }

    </div>
  </body>
</html>`;
};

export default KOTReceiptPrint;
