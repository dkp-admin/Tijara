import serviceCaller from "src/api/serviceCaller";
import { toFixedNumber } from "src/utils/toFixedNumber";

export const updateProductRefundRestock = async (data: any) => {
  const { restockProducts, boxProducts, crateProducts } =
    await getProductBoxCrateForRestock(data);

  if (restockProducts?.length > 0) {
    updateBatchShiftToDB(restockProducts, data);
  }

  if (boxProducts?.length > 0) {
    updateBatchShiftToDB(boxProducts, data);
  }

  if (crateProducts?.length > 0) {
    updateBatchShiftToDB(crateProducts, data);
  }
};

async function getProductBoxCrateForRestock(data: any) {
  let restockProducts: any[] = [];
  let boxProducts: any[] = [];
  let crateProducts: any[] = [];

  await Promise.all(
    data?.items?.map(async (item: any) => {
      const {
        type,
        sku,
        boxSku,
        boxRef,
        crateRef,
        parentSku,
        qty,
        unitCount,
        variantName,
      } = item;

      const idx = restockProducts?.findIndex(
        (data: any) => data?.sku === sku || data?.sku === parentSku
      );

      const boxIdx = boxProducts?.findIndex(
        (data: any) =>
          (data?.sku === sku || data?.sku === boxSku) && data?.boxRef === boxRef
      );

      let boxName: any;
      let crateQty = Number(qty) * Number(unitCount);

      if (type === "crate") {
        const box = await serviceCaller(`/boxes-crates/${boxRef}`, {
          method: "GET",
        });

        if (box) {
          boxName = box.name;
          crateQty *= Number(box.qty);
        }
      }

      if (idx !== -1) {
        const updatedQty =
          type === "crate"
            ? crateQty
            : type === "box"
            ? Number(qty) * Number(unitCount)
            : Number(qty);
        const quantity = Number(restockProducts[idx].qty) + updatedQty;
        restockProducts[idx].qty = quantity;
      } else {
        restockProducts.push({
          ...item,
          type: "item",
          unitCount: 1,
          sku: type === "box" || type === "crate" ? parentSku : sku,
          qty:
            type === "crate"
              ? crateQty
              : type === "box"
              ? Number(qty) * Number(unitCount)
              : Number(qty),
        });
      }

      if (boxIdx !== -1) {
        const updatedQty =
          type === "crate" ? Number(qty) * Number(unitCount) : Number(qty);
        const quantity = Number(boxProducts[idx].qty) + updatedQty;
        boxProducts[idx].qty = quantity;
      } else if (type === "box" || type === "crate") {
        const box = boxName
          ? { name: boxName }
          : await serviceCaller(`/boxes-crates/${boxRef}`, {
              method: "GET",
            });

        boxProducts.push({
          ...item,
          type: "box",
          variantName: {
            en: box?.name?.en || variantName.en,
            ar: box?.name?.ar || variantName.ar,
          },
          sku: type === "crate" ? boxSku : sku,
          qty: type === "crate" ? Number(qty) * Number(unitCount) : Number(qty),
        });
      }

      if (type === "crate") {
        const crate = await serviceCaller(`/boxes-crates/${crateRef}`, {
          method: "GET",
        });

        crateProducts.push({
          ...item,
          type: "crate",
          sku: sku,
          qty: Number(qty),
          variantName: {
            en: crate?.name?.en || variantName.en,
            ar: crate?.name?.ar || variantName.ar,
          },
        });
      }
    })
  );

  return { restockProducts, boxProducts, crateProducts };
}

async function updateBatchShiftToDB(cartProducts: any[], data: any) {
  await Promise.all(
    cartProducts?.map(async (item, index) => {
      const dataObj = {
        productRef: item.productRef,
        product: {
          name: {
            en: item.productName.en,
            ar: item.productName.ar,
          },
        },
        companyRef: data.companyRef,
        company: {
          name: data.company.name,
        },
        locationRef: data.locationRef,
        location: {
          name: data.location.name,
        },
        categoryRef: item.categoryRef,
        category: { name: item.category.name },
        ...(item.type !== "item"
          ? {
              boxCrateRef: item.type === "crate" ? item.crateRef : item.boxRef,
            }
          : {}),
        variant: {
          name: {
            en: item.variantName.en,
            ar: item.variantName.ar,
          },
          type: item.type,
          unit: item.unitCount,
          qty: Number(item.qty),
          sku:
            item.type === "box" || item.type === "crate"
              ? item.parentSku
              : item.sku,
          parentSku: item.parentSku,
          boxSku: item.boxSku,
          crateSku: item.crateSku,
          boxRef: item?.boxRef ? item.boxRef : null,
          crateRef: item?.crateRef ? item?.crateRef : null,
          sellingPrice: item.sellingPrice || 0,
          costPrice: Number(
            toFixedNumber(Number(item.costPrice) / Number(item.qty))
          ),
        },
        hasMultipleVariants: item.hasMultipleVariants,
        sku: item.sku,
        restockQty: Number(item.qty),
        action: "restock-return",
        price: Number(toFixedNumber(Number(item.costPrice) / Number(item.qty))),
        // count: stockCount[index] + Number(item.qty),
        // previousStockCount: stockCount[index],
      };

      await serviceCaller(`/stock-history`, {
        method: "POST",
        body: dataObj,
      });
    })
  );
}
