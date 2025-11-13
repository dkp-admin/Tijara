import { format } from "date-fns";
import * as Device from "expo-device";
import { createQRData } from "../components/zatca";
import { ChannelsName, PROVIDER_NAME } from "./constants";

type OrderData = {
  _id: string;
  qr: string;
  company: {
    name: string;
  };
  orderNum: string;
  tokenNumber: string;
  orderType: string;
  showToken: boolean;
  showOrderType: boolean;
  specialInstructions: string;
  kotId: string;
  table: string;
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
  refunds: [];
  createdAt: string;
  time: string;
  updatedAt: string;
};

export const transformOrderData = (order: any) => {
  const freeItemsDiscount: any = order?.items?.reduce((prev: any, cur: any) => {
    if (cur?.isFree) return prev + Number(cur?.total);
    else return prev;
  }, 0);

  const freeQtyItemsDiscount: any = order?.items?.reduce(
    (prev: any, cur: any) => {
      if (cur?.isQtyFree) return prev + Number(cur?.discount);
      else return prev;
    },
    0
  );

  const orderData: OrderData = {
    _id: order?._id,
    qr: getQRData(order),
    company: {
      name: order?.company?.en,
    },
    orderNum: order?.orderNum || "NA",
    tokenNumber: order?.showToken ? order.tokenNum : "",
    orderType: order.showOrderType
      ? ChannelsName[order.orderType] || order.orderType
      : "",
    showToken: order.showToken,
    showOrderType: order.showOrderType,
    specialInstructions: order?.specialInstructions
      ? order.specialInstructions
      : "",
    deviceRef: order?.deviceRef,
    device: {
      deviceCode: order?.device?.deviceCode,
    },
    customer: {
      name: (order.customer?.name || "NA").substring(0, 35).padEnd(35),
      vat: order.customer?.vat || "",
    },
    cashier: {
      name: order?.cashier?.name,
    },
    cashierRef: order.cashierRef,
    companyRef: order.companyRef,
    locationRef: order.locationRef,
    kotId: order?.kotId || "",
    table: order?.table || "",
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
    },
    items: order.items.map((item: any) => {
      const boxNameEn =
        item.type === "box"
          ? `, (Box - ${item.noOfUnits} Units)`
          : item.type === "crate"
          ? `, (Crate - ${item.noOfUnits} Units)`
          : "";
      const boxNameAr =
        item.type === "box"
          ? `, (القطع ${item.noOfUnits} - صندوق)`
          : item.type === "crate"
          ? `, (القطع ${item.noOfUnits} - قفص)`
          : "";

      const variantNameEn = item.hasMultipleVariants
        ? ` - ${item.variantNameEn}`
        : "";
      const variantNameAr = item.hasMultipleVariants
        ? ` - ${item.variantNameAr}`
        : "";

      const itemNameEn = `${item.name.en}${variantNameEn}${boxNameEn}`;
      const itemNameAr = `${item.name.ar}${variantNameAr}${boxNameAr}`;

      let modifierName = "";

      if (item?.modifiers || item?.modifiers?.length > 0) {
        item?.modifiers?.map((mod: any) => {
          modifierName += `${modifierName === "" ? "" : ", "}${mod.optionName}`;
        });
      }

      return {
        productRef: item.productRef,
        categoryRef: item.categoryRef,
        name: {
          en: itemNameEn,
          ar: itemNameAr,
        },
        unitPrice: (item.sellingPrice || 0).toFixed(2),
        modifierName: modifierName,
        image: item.image,
        quantity: item.qty,
        ...(item?.kitchenRef ? { kitchenRef: item.kitchenRef } : {}),
        ...(item?.kitchenRefs ? { kitchenRefs: item.kitchenRefs } : []),
        contains: item?.contains || "",
        category: { name: item?.category?.name || "" },
        modifiers: item?.modifiers || [],
        promotionsData:
          item?.promotionsData?.length > 0 ? item?.promotionsData : [],
        hasMultipleVariants: item.hasMultipleVariants,
        billing: {
          total: (item?.total || 0).toFixed(2),
          exactTotal: Number(item?.total + item?.discount)?.toFixed(2) || 0,
          subTotal: (Number(item?.total || 0) - Number(item.vat || 0)).toFixed(
            2
          ),
          vatAmount: item.vat.toFixed(2),
          vatPercentage: item.vatPercentage.toFixed(2),
          discountAmount: item.discount.toFixed(2),
          discountPercentage: item.discountPercentage.toFixed(2),
          promotionRefs: item?.promotionRefs || [],
        },
        isFree: item?.isFree,
        note: item?.note,
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
          boxSku: item.boxSku,
          crateSku: item.crateSku,
          boxRef: item.boxRef,
          crateRef: item.crateRef,
          type: item.type,
          unit: item.unit,
          unitCount: item.noOfUnits,
          costPrice: item.costPrice,
          sellingPrice: item.sellingPrice,
        },
      };
    }),
    payment: {
      total: order.payment?.total?.toFixed(2),
      subTotal: order.payment?.subTotal?.toFixed(2),
      vatAmount: order.payment?.vat?.toFixed(2),
      vatPercentage: order.payment?.vatPercentage,
      discountCode: order.payment?.discountCode,
      discountAmount: Number(
        Number(order.payment?.discount) +
          freeItemsDiscount +
          freeQtyItemsDiscount
      ).toFixed(2),
      discountPercentage: order.payment?.discountPercentage,
      vatWithoutDiscount: order?.payment?.vatWithoutDiscount?.toFixed(2),
      subTotalWithoutDiscount:
        order?.payment?.subTotalWithoutDiscount?.toFixed(2),
      breakup: paymentBreakups(order),
      charges: order?.payment?.charges?.map((charge: any) => {
        return {
          name: { en: charge.name.en, ar: charge.name.ar },
          total: (Number(charge?.total) - Number(charge?.vat))?.toFixed(2),
          vat: charge.vat?.toFixed(2),
          type: charge.type,
          chargeType: charge.chargeType,
          value: charge.value,
          chargeId: charge.chargeId,
        };
      }),
    },
    refunds: [],
    createdAt: format(new Date(order.createdAt), "yyyy-MM-dd, hh:mm:ssa"),
    time: format(new Date(order.createdAt), "hh:mm:ssa"),
    updatedAt: order.createdAt,
  };

  return orderData;
};

const getQRData = (order: any) => {
  const testData = {
    sellerName: order?.company?.en,
    vatNumber: order?.vat || "0",
    timestamp: order?.createdAt
      ? new Date(order?.createdAt).toISOString()
      : "2022-01-02 10:30",
    total: `${order?.payment?.total || 0}`,
    vatTotal: `${order?.payment?.vat || 0}`,
  };

  const data = createQRData(testData);

  return data;
};

const paymentBreakups = (order: any) => {
  const methods = ["cash", "card", "wallet", "credit"];

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

  const paidWithOther = order?.payment?.breakup
    ?.filter((p: any) => !methods.includes(p.providerName))
    ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

  if (Number(paidWithOther) > 0) {
    const paidWithOtherName = order?.payment?.breakup?.filter(
      (p: any) => !methods.includes(p.providerName)
    );
    payment.push({
      name: paidWithOtherName[0].name,
      total: Number(paidWithOther).toFixed(2),
      refId: paidWithOtherName[0].name,
      providerName: paidWithOtherName[0].name,
      change: "0.00",
      _id: "5",
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
