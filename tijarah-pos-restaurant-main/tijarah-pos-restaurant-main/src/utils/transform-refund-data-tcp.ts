import { format } from "date-fns";
import { createQRData } from "../components/zatca";
import { ChannelsName, PROVIDER_NAME } from "./constants";

interface Item {
  productRef: string;
  categoryRef: string;
  name: Name;
  contains: string;
  category: { name: string };
  image: string;
  quantity: number;
  hasMultipleVariants: boolean;
  modifiers: any[];
  promotionsData: any[];
  unitPrice: string;
  billing: Billing;
  variant: Variant;
  modifierName?: string;
}

interface Name {
  en: string;
  ar: string;
}

interface Stock {
  availability: boolean;
  count: number;
  tracking: boolean;
}

interface Variant {
  name: Name;
  stock: Stock;
  sku: string;
  parentSku: string;
  type: string;
  unit: string;
  unitCount: number;
  costPrice: string;
  sellingPrice: string;
}

interface Billing {
  total: string;
  subTotal: string;
  vatAmount: string;
  vatPercentage: string;
  discountAmount: string;
  discountPercentage: string;
  promotionRefs: string[];
}

interface Breakup {
  name: string;
  total: string;
  refId: string;
  providerName: string;
  change: string;
  _id: string;
}

interface Charge {
  name: Name;
  total: string;
  vat: string;
  type: string;
  chargeType: string;
  value: string;
  chargeId: string;
}

interface Payment {
  total: string;
  subTotal: string;
  vatAmount: string;
  vatPercentage: string;
  discountCode: string;
  discountAmount: string;
  discountPercentage: string;
  breakup: Breakup[];
  charges: Charge[];
  subTotalWithoutDiscount: string;
  vatWithoutDiscount: string;
}

interface RefundItems {
  name: Name;
  amount: string;
  _id: string;
  categoryRef: string;
  qty: number;
  vat: string;
  unit: string;
  sku: string;
  parentSku: string;
}

interface RefundCharges {
  chargeId: string;
  name: Name;
  totalCharge: string;
  totalVatOnCharge: string;
}

interface RefundedTo {
  value: string;
  text: string;
}

interface Refunds {
  amount: string;
  vat: string;
  subTotal: string;
  items: RefundItems[];
  charges: RefundCharges[];
  refundedTo: RefundedTo[];
  deviceRef: string;
  device: {
    deviceCode: string;
  };
  cashier: {
    name: string;
  };
  cashierRef: string;
  date: string;
  reason: string;
  referenceNumber: string;
}

interface Order {
  _id: string;
  qr: string;
  specialInstructions: string;
  company: {
    name: string;
  };
  orderNum: string;
  refundReceiptNo: string;
  tokenNumber: string;
  orderType: string;
  showToken: boolean;
  showOrderType: boolean;
  deviceRef: string;
  device: {
    deviceCode: string;
  };
  cashier: {
    name: string;
  };
  cashierRef: string;
  companyRef: string;
  locationRef: string;
  location: {
    name: Name;
    vat: string;
    phone: string;
    address: string;
    invoiceFooter: string;
    customText: string;
    returnPolicy: string;
    noteTitle: string;
    note: string;
  };
  customer: {
    name: string;
    vat: string;
  };
  items: Item[];
  payment: Payment;
  refunds: Refunds[];
  createdAt: string;
  time: string;
  updatedAt: string;
}

export const transformRefundDataTcp = (order: any) => {
  const orderData: Order = {
    _id: order._id,
    qr: getQRData(order),
    company: {
      name: order.company.en,
    },
    orderNum: order.orderNum,
    refundReceiptNo: order.refunds[0]?.referenceNumber
      ? order.refunds[0].referenceNumber
      : "",
    tokenNumber: order.showToken ? order.tokenNum : "",
    orderType: order.showOrderType ? ChannelsName[order.orderType] : "",
    showToken: order.showToken,
    showOrderType: order.showOrderType,
    specialInstructions: "",
    deviceRef: order.deviceRef,
    device: {
      deviceCode: order.device.deviceCode,
    },
    customer: {
      name: order.customer?.name || "NA",
      vat: order.customer?.vat || "",
    },
    cashier: {
      name: order.cashier.name,
    },
    cashierRef: order.cashierRef,
    companyRef: order.companyRef,
    locationRef: order.locationRef,
    location: {
      name: {
        en: order.location.en,
        ar: order.location.ar,
      },
      vat: order.vat,
      phone: order.phone,
      address: order.address,
      invoiceFooter: order?.footer || "",
      customText: order?.customText || "",
      returnPolicy: order?.returnPolicy || "",
      noteTitle: order.noteTitle,
      note: order.note,
    },
    items: order.items.map((item: any) => {
      return {
        productRef: item.productRef,
        categoryRef: item.categoryRef,
        name: {
          en: item.name.en,
          ar: item.name.ar,
        },
        unitPrice: Number(item?.sellingPrice || 0).toFixed(2),
        modifierName: getModifierName(item),
        image: item.image,
        quantity: item.qty,
        contains: item?.contains || "",
        category: { name: item?.category?.name || "" },
        modifiers: item?.modifiers || [],
        promotionsData:
          item?.promotionsData?.length > 0 ? item?.promotionsData : [],
        hasMultipleVariants: item.hasMultipleVariants,
        billing: {
          total: Number(item?.total || 0).toFixed(2),
          subTotal: (Number(item?.total || 0) - Number(item?.vat || 0)).toFixed(
            2
          ),
          vatAmount: Number(item?.vat || 0).toFixed(2),
          vatPercentage: Number(item?.vatPercentage || 0).toFixed(2),
          discountAmount: Number(item?.discount || 0).toFixed(2),
          discountPercentage: Number(item?.discountPercentage || 0).toFixed(2),
        },
        variant: {
          name: {
            en: item.variantNameEn,
            ar: item.variantNameAr,
          },
          stock: {
            availability: item.availability,
            count: item.stockCount,
            tracking: item.tracking,
          },
          sku: item.sku,
          parentSku: item.parentSku,
          type: item.type,
          unit: item.unit,
          unitCount: item.noOfUnits,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
        },
      };
    }),
    payment: {
      total: Number(order.payment.total)?.toFixed(2),
      subTotal: (
        (order.refunds[0]?.amount || 0) - (order.refunds[0]?.vat || 0)
      )?.toFixed(2),
      vatAmount: order.payment.vat?.toFixed(2),
      vatPercentage: Number(order?.payment?.vatPercentage || 0)?.toFixed(2),
      discountCode: order.payment.discountCode,
      discountAmount: order.payment.discount?.toFixed(2),
      discountPercentage: order.payment.discountPercentage?.toFixed(2),
      vatWithoutDiscount: order?.payment?.vatWithoutDiscount?.toFixed(2),
      subTotalWithoutDiscount:
        order?.payment?.subTotalWithoutDiscount?.toFixed(2),
      breakup: paymentBreakups(order),
      charges: order?.payment?.charges?.map((charge: any) => {
        return {
          name: { en: charge.name.en, ar: charge.name.ar },
          total: (Number(charge.total) - Number(charge.vat))?.toFixed(2),
          vat: charge.vat?.toFixed(2),
          type: charge.type,
          chargeType: charge.chargeType,
          value: charge.value,
          chargeId: charge.chargeId,
        };
      }),
    },
    refunds: [
      {
        amount: (order.refunds[0]?.amount || 0)?.toFixed(2),
        vat: (order.refunds[0].vat || 0)?.toFixed(2),
        subTotal: subTotal(order)?.toFixed(2),
        items: order.refunds[0].items.map((item: any) => {
          const orderItem = order.items?.find((items: any) =>
            item.sku
              ? items.productRef === item._id && items.sku === item.sku
              : items.productRef === item._id
              ? item.unit === "perItem" || items.type === "box"
              : items.qty === item.qty
          );

          const boxNameEn =
            orderItem?.type === "box"
              ? `, (Box ${orderItem?.noOfUnits} Units)`
              : "";
          const boxNameAr =
            orderItem?.type === "box"
              ? `, (القطع ${orderItem?.noOfUnits} صندوق)`
              : "";

          const nameEn = item.nameEn + boxNameEn;
          const nameAr = item.nameAr + boxNameAr;

          let modifierName = "";

          orderItem?.modifiers?.map((mod: any) => {
            modifierName += `${modifierName === "" ? "" : ", "}${
              mod.optionName
            }`;
          });

          return {
            name: { en: nameEn, ar: nameAr },
            modifierName: modifierName,
            amount: item.amount?.toFixed(2),
            _id: item._id,
            categoryRef: item.categoryRef,
            qty: item.qty,
            vat: item.vat?.toFixed(2),
            unit: item.unit,
            sku: item.sku,
            parentSku: item.parentSku,
            unitPrice: (item.amount - item?.vat)?.toFixed(2),
          };
        }),
        charges: order.refunds[0]?.charges?.map((charge: any) => {
          return {
            chargeId: charge.chargeId,
            name: { en: charge.name.en, ar: charge.name.ar },
            totalCharge: (
              Number(charge.totalCharge) - Number(charge.totalVatOnCharge)
            )?.toFixed(2),
            totalVatOnCharge: charge.totalVatOnCharge?.toFixed(2),
          };
        }),
        refundedTo: refundBreakups(order),
        deviceRef: order.refunds[0].deviceRef,
        device: {
          deviceCode: order.refunds[0].device.deviceCode,
        },
        cashier: {
          name: order.refunds[0].cashier.name,
        },
        cashierRef: order.refunds[0].cashierRef,
        date: new Date(order.refunds[0].date).toISOString(),
        reason: order.refunds[0].reason,
        referenceNumber: order.refunds[0]?.referenceNumber
          ? order.refunds[0].referenceNumber
          : "",
      },
    ],
    createdAt: format(new Date(order.refunds[0].date), "yyyy-MM-dd, hh:mm:ssa"),
    time: format(new Date(order.refunds[0].date), "hh:mm:ssa"),
    updatedAt: order.createdAt,
  };

  return orderData;
};

const getModifierName = (item: any) => {
  let modifierName = "";

  item?.modifiers?.map((mod: any) => {
    modifierName += `${modifierName === "" ? "" : ", "}${mod.optionName}`;
  });

  return modifierName;
};

const getQRData = (order: any) => {
  const testData = {
    sellerName: order.company.en,
    vatNumber: order.vat,
    timestamp: order?.createdAt
      ? new Date(order.createdAt).toISOString()
      : "2022-01-02 10:30",
    total: `${order?.payment?.total}`,
    vatTotal: `${order?.payment?.vat}`,
  };

  const data = createQRData(testData);

  return data;
};

const subTotal = (order: any) => {
  const chargesSubTotal = order.refunds[0]?.charges?.reduce(
    (subtotal: number, charge: any) =>
      subtotal + Number(charge.totalCharge) - Number(charge.totalVatOnCharge),
    0
  );

  return (
    Number(
      (order.refunds[0]?.amount || 0) -
        (order.refunds[0]?.vat || 0) -
        Number(chargesSubTotal)
    ) || 0
  );
};

const paymentBreakups = (order: any) => {
  const totalPaid = order?.payment?.breakup?.reduce(
    (pv: any, cv: any) => pv + cv.total,
    0
  );

  const change = totalPaid - Number(order?.payment?.total);

  const payment: any = [];

  const paidWithCard = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CARD)
    ?.reduce((pv: any, cv: any) => pv + (Number(cv?.total) || 0), 0);

  if (paidWithCard) {
    payment.push({
      name: "Card",
      total: paidWithCard?.toFixed(2),
      refId: "Card",
      providerName: "card",
      change: "0.00",
      _id: "0",
    });
  }

  const paidWithWallet = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
    ?.reduce((pv: any, cv: any) => pv + (Number(cv.total) || 0), 0);

  if (paidWithWallet) {
    payment.push({
      name: "Wallet",
      total: paidWithWallet.toFixed(2),
      refId: "Wallet",
      providerName: "wallet",
      change: "0.00",
      _id: "1",
    });
  }

  const paidWithCredit = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
    ?.reduce((pv: any, cv: any) => pv + (Number(cv.total) || 0), 0);

  if (paidWithCredit) {
    payment.push({
      name: "Credit",
      total: paidWithCredit.toFixed(2),
      refId: "Credit",
      providerName: "credit",
      change: "0.00",
      _id: "2",
    });
  }

  const paidWithCash = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CASH)
    ?.reduce((pv: any, cv: any) => pv + Number(cv.total || 0), 0);

  if (paidWithCash) {
    payment.push({
      name: "Cash",
      total: (paidWithCash - change).toFixed(2),
      refId: "Cash",
      providerName: "cash",
      change: change?.toFixed(2) || "0.00",
      _id: "3",
    });
  }

  if (change > 0) {
    const tenderCash = order?.payment?.breakup
      ?.reverse()
      ?.find((p: any) => p.providerName === PROVIDER_NAME.CASH);

    payment.push({
      name: "Tendered Cash",
      total: Number(tenderCash?.total || 0).toFixed(2),
      refId: "Tendered Cash",
      providerName: "tendered-cash",
      change: "0.00",
      _id: "4",
    });

    payment.push({
      name: "Change",
      total: change.toFixed(2),
      refId: "Change",
      providerName: "change",
      change: "0.00",
      _id: "5",
    });
  }
  return payment;
};

const refundBreakups = (order: any) => {
  const refundTo: any = [];

  const cashRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.CASH)
    ?.reduce((pv: any, cv: any) => pv + cv.amount, 0);

  const nearpayRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.Nearpay)
    ?.reduce((pv: any, cv: any) => pv + cv.amount, 0);

  if (Number(cashRefund) > 0) {
    refundTo.push({
      text: "Cash",
      value: Number(cashRefund || 0).toFixed(2),
    });
  }

  if (Number(nearpayRefund) > 0) {
    refundTo.push({
      text: "Nearpay",
      value: Number(nearpayRefund || 0).toFixed(2),
    });
  }

  const cardRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.CARD)
    ?.reduce((pv: any, cv: any) => pv + cv.amount, 0);

  if (Number(cardRefund) > 0) {
    refundTo.push({
      text: "Card",
      value: Number(cardRefund || 0).toFixed(2),
    });
  }

  const walletRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.WALLET)
    ?.reduce((pv: any, cv: any) => pv + cv.amount, 0);

  if (Number(walletRefund) > 0) {
    refundTo.push({
      text: "Wallet",
      value: Number(walletRefund || 0).toFixed(2),
    });
  }

  const creditRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.CREDIT)
    ?.reduce((pv: any, cv: any) => pv + cv.amount, 0);

  if (Number(creditRefund) > 0) {
    refundTo.push({
      text: "Credit",
      value: Number(creditRefund || 0).toFixed(2),
    });
  }

  return refundTo;
};
