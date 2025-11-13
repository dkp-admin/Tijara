import { format } from "date-fns";
import { ChannelsName } from "./constants";

type KOTData = {
  _id: string;
  orderNum: string;
  tokenNumber: string;
  orderType: string;
  showToken: boolean;
  showOrderType: boolean;
  specialInstructions: string;
  locationRef: string;
  location: {
    name: {
      en: string;
      ar: string;
    };
    address: string;
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
  totalOrderQty: number;
  createdAt: string;
};

export const transformKOTData = (order: any) => {
  const orderData: KOTData = {
    _id: order._id,
    orderNum: order.orderNum,
    tokenNumber: order.showToken ? order.tokenNum : "",
    orderType: order.showOrderType
      ? ChannelsName[order.orderType] || order.orderType
      : "",
    showToken: order.showToken,
    showOrderType: order.showOrderType,
    specialInstructions: order?.specialInstructions
      ? order.specialInstructions
      : "",
    locationRef: order.locationRef,
    location: {
      name: {
        en: order.location.en,
        ar: order.location.ar,
      },
      address: order.address,
    },
    items: order.items.map((item: any) => {
      return {
        productRef: item.productRef,
        categoryRef: item.categoryRef,
        name: {
          en: item.name.en,
          ar: item.name.ar,
        },
        image: item.image,
        quantity: item.qty,
        contains: item?.contains || "",
        category: { name: item?.category?.name || "" },
        modifiers: item?.modifiers || [],
        promotionsData: item?.promotionsData || [],
        hasMultipleVariants: item.hasMultipleVariants,
        billing: {
          total: item.total.toFixed(2),
          subTotal: (Number(item.total) - Number(item.vat)).toFixed(2),
          vatAmount: item.vat.toFixed(2),
          vatPercentage: item.vatPercentage.toFixed(2),
          discountAmount: item.discount.toFixed(2),
          discountPercentage: item.discountPercentage.toFixed(2),
          promotionRefs: item?.promotionRefs || [],
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
    totalOrderQty: totalQTY(order),
    createdAt: format(new Date(order.createdAt), "yyyy-MM-dd, hh:mm:ssa"),
  };

  return orderData;
};

const totalQTY = (order: any) =>
  order?.items?.reduce((pv: any, cv: any) => pv + cv.qty, 0);
