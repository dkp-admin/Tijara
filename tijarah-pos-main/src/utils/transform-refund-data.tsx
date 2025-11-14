import { format } from "date-fns";
import { createQRData } from "../components/zatca";
import { ChannelsName, PROVIDER_NAME } from "./constants";
import * as Device from "expo-device";

type OrderData = {
  _id: string;
  qr: string;
  company: {
    name: string;
  };
  orderNum: string;
  refundReceiptNo: string;
  tokenNumber: string;
  orderType: string;
  showToken: boolean;
  showOrderType: boolean;
  specialInstructions: string;
  deviceRef: string;
  device: {
    deviceCode: string;
  };
  customer: {
    name: string;
    vat: string;
  };
  cashier: {
    name: string;
  };
  cashierRef: string;
  companyRef: string;
  locationRef: string;
  location: {
    name: {
      en: string;
      ar: string;
    };
    vat: string;
    phone: string;
    address: string;
    invoiceFooter: string;
    customText: string;
    returnPolicy: string;
    noteTitle: string;
    note: string;
  };
  items: [
    {
      productRef: string;
      categoryRef: string;
      name: {
        en: string;
        ar: string;
      };
      contains: string;
      category: { name: string };
      image: string;
      quantity: number;
      hasMultipleVariants: boolean;
      modifiers: any[];
      promotionsData: any[];
      billing: {
        total: string;
        subTotal: string;
        vatAmount: string;
        vatPercentage: string;
        discountAmount: string;
        discountPercentage: string;
        promotionRefs: string[];
      };
      variant: {
        name: {
          en: string;
          ar: string;
        };
        stock: {
          availability: boolean;
          count: number;
          tracking: boolean;
        };
        sku: string;
        parentSku: string;
        type: string;
        unit: string;
        unitCount: number;
        costPrice: string;
        sellingPrice: string;
      };
    }
  ];
  payment: {
    total: string;
    subTotal: string;
    vatAmount: string;
    vatPercentage: string;
    discountCode: string;
    discountAmount: string;
    discountPercentage: string;
    subTotalWithoutDiscount: string;
    vatWithoutDiscount: string;
    breakup: [
      {
        name: string;
        total: string;
        refId: string;
        providerName: string;
        change: string;
        _id: string;
      }
    ];
    charges: [
      {
        name: { en: string; ar: string };
        total: string;
        vat: string;
        type: string;
        chargeType: string;
        value: string;
        chargeId: string;
      }
    ];
  };
  refunds: [
    {
      amount: string;
      vat: string;
      subTotal: string;
      items: [
        {
          name: {
            en: string;
            ar: string;
          };
          amount: string;
          _id: string;
          categoryRef: string;
          qty: number;
          vat: string;
          unit: string;
          sku: string;
          parentSku: string;
        }
      ];
      charges: [
        {
          chargeId: string;
          name: { en: string; ar: string };
          totalCharge: string;
          totalVatOnCharge: string;
        }
      ];
      refundedTo: [
        {
          value: string;
          text: string;
        }
      ];
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
  ];
  createdAt: string;
  time: string;
  updatedAt: string;
};

export const transformRefundData = (order: any) => {
  const orderData: OrderData = {
    _id: order._id,
    qr: getQRData(order),
    company: {
      name: order.company.en,
    },
    orderNum: order?.orderNum || "NA",
    refundReceiptNo: order.refunds[0]?.referenceNumber
      ? order.refunds[0].referenceNumber
      : "",
    tokenNumber: order.showToken ? order.tokenNum : "",
    orderType: order.showOrderType
      ? ChannelsName[order.orderType] || order.orderType
      : "",
    showToken: order.showToken,
    showOrderType: order.showOrderType,
    specialInstructions: order?.specialInstructions
      ? order.specialInstructions
      : "",
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
        unitPrice: item.sellingPrice.toFixed(2),
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
          total: item.total.toFixed(2),
          subTotal: (Number(item.total) - Number(item.vat)).toFixed(2),
          vatAmount: item.vat.toFixed(2),
          vatPercentage: item.vatPercentage.toFixed(2),
          discountAmount: item.discount.toFixed(2),
          discountPercentage: Number(item.discountPercentage.toFixed(2)),
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
      total: order.payment.total?.toFixed(2),
      subTotal: (
        (order.refunds[0]?.amount || 0) - (order.refunds[0]?.vat || 0)
      )?.toFixed(2),
      vatAmount: order.payment.vat?.toFixed(2),
      vatPercentage: order.payment.vatPercentage,
      discountCode: order.payment.discountCode,
      discountAmount: order.payment.discount?.toFixed(2),
      discountPercentage: order.payment.discountPercentage,
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
              ? item.unit === "perItem" ||
                items.type === "box" ||
                items.type === "crate"
              : items.qty === item.qty
          );

          const boxNameEn =
            orderItem?.type === "box"
              ? `, (Box - ${orderItem?.noOfUnits} Units)`
              : orderItem?.type === "crate"
              ? `, (Crate - ${orderItem?.noOfUnits} Units)`
              : "";
          const boxNameAr =
            orderItem?.type === "box"
              ? `, (القطع ${orderItem?.noOfUnits} - صندوق)`
              : orderItem?.type === "crate"
              ? `, (القطع ${orderItem?.noOfUnits} - قفص)`
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
            boxSku: item.boxSku,
            crateSku: item.crateSku,
            boxRef: item.boxRef,
            crateRef: item.crateRef,
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
    (pv: number, cv: any) => pv + Number(cv.total),
    0
  );

  const change = Number(totalPaid) - Number(order?.payment?.total);

  const payment: any = [];

  const paidWithCard = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CARD)
    ?.reduce((pv: number, cv: any) => pv + Number(cv.total), 0);

  if (Number(paidWithCard) > 0) {
    payment.push({
      name: "Card",
      total: Number(paidWithCard).toFixed(2),
      refId: "Card",
      providerName: Device.brand === "qcom" ? "card" : "Card",
      change: "0.00",
      _id: "0",
    });
  }

  const paidWithWallet = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.WALLET)
    ?.reduce((pv: number, cv: any) => pv + Number(cv.total), 0);

  if (Number(paidWithWallet) > 0) {
    payment.push({
      name: "Wallet",
      total: Number(paidWithWallet).toFixed(2),
      refId: "Wallet",
      providerName: Device.brand === "qcom" ? "wallet" : "Wallet",
      change: "0.00",
      _id: "1",
    });
  }

  const paidWithCredit = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CREDIT)
    ?.reduce((pv: number, cv: any) => pv + Number(cv.total), 0);

  if (Number(paidWithCredit) > 0) {
    payment.push({
      name: "Credit",
      total: Number(paidWithCredit).toFixed(2),
      refId: "Credit",
      providerName: Device.brand === "qcom" ? "credit" : "Credit",
      change: "0.00",
      _id: "2",
    });
  }

  const paidWithCash = order?.payment?.breakup
    ?.filter((p: any) => p.providerName === PROVIDER_NAME.CASH)
    ?.reduce((pv: number, cv: any) => pv + Number(cv.total), 0);

  if (Number(paidWithCash) > 0) {
    payment.push({
      name: "Cash",
      total: (Number(paidWithCash) - change).toFixed(2),
      refId: "Cash",
      providerName: Device.brand === "qcom" ? "cash" : "Cash",
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
      providerName: Device.brand === "qcom" ? "tendered-cash" : "Tendered Cash",
      change: "0.00",
      _id: "4",
    });

    payment.push({
      name: "Change",
      total: change.toFixed(2),
      refId: "Change",
      providerName: Device.brand === "qcom" ? "change" : "Change",
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
    ?.reduce((pv: number, cv: any) => pv + Number(cv.amount), 0);

  if (Number(cashRefund) > 0) {
    refundTo.push({
      text: Device.brand === "qcom" ? "cash" : "Cash",
      value: Number(cashRefund || 0).toFixed(2),
    });
  }

  const cardRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.CARD)
    ?.reduce((pv: number, cv: any) => pv + Number(cv.amount), 0);

  if (Number(cardRefund) > 0) {
    refundTo.push({
      text: Device.brand === "qcom" ? "card" : "Card",
      value: Number(cardRefund || 0).toFixed(2),
    });
  }

  const walletRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.WALLET)
    ?.reduce((pv: any, cv: any) => pv + Number(cv.amount), 0);

  if (Number(walletRefund) > 0) {
    refundTo.push({
      text: Device.brand === "qcom" ? "wallet" : "Wallet",
      value: Number(walletRefund || 0).toFixed(2),
    });
  }

  const creditRefund = order.refunds?.[0]?.refundedTo
    ?.filter((p: any) => p.refundTo === PROVIDER_NAME.CREDIT)
    ?.reduce((pv: any, cv: any) => pv + Number(cv.amount), 0);

  if (Number(creditRefund) > 0) {
    refundTo.push({
      text: Device.brand === "qcom" ? "credit" : "Credit",
      value: Number(creditRefund || 0).toFixed(2),
    });
  }

  return refundTo;
};
