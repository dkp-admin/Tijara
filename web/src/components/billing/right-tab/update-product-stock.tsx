import serviceCaller from "src/api/serviceCaller";
import { toFixedNumber } from "src/utils/toFixedNumber";

export const updateProductStock = async (data: any) => {
  const { cartProducts, boxProducts, crateProducts } =
    await getProductBoxCrateFromCart(data);

  const { stockCount, batching, products } = await getUpdatedProduct(
    cartProducts,
    data?.locationRef
  );
  const { boxName, boxStockCount, boxBatching, boxes } = await getUpdatedBoxes(
    boxProducts,
    products,
    data?.locationRef
  );
  const { crateName, crateStockCount, crateBatching, crates } =
    await getUpdatedCrates(crateProducts, products, data?.locationRef);

  if (products?.length > 0) {
    updateProductToDB(products);
    updateBatchToDB(cartProducts, batching, stockCount, data);
  }

  if (boxes?.length > 0) {
    updateBoxToDB(boxes);
    updateBatchToDB(boxProducts, boxBatching, boxStockCount, data, boxName);
  }

  if (crates?.length > 0) {
    updateCrateToDB(crates);
    updateBatchToDB(
      crateProducts,
      crateBatching,
      crateStockCount,
      data,
      crateName
    );
  }
};

async function getProductBoxCrateFromCart(data: any) {
  let cartProducts: any[] = [];
  let boxProducts: any[] = [];
  let crateProducts: any[] = [];

  if (data?.qrOrdering || data?.onlineOrdering) {
    await Promise.all(
      data?.items?.map(async (item: any) => {
        const {
          name,
          productRef,
          categoryRef,
          category,
          quantity,
          variant,
          hasMultipleVariants,
        } = item;
        const {
          name: varName,
          stock,
          type,
          sku,
          boxSku,
          boxRef,
          crateSku,
          crateRef,
          parentSku,
          unitCount,
          costPrice,
        } = variant;

        if (stock?.tracking) {
          const idx = cartProducts?.findIndex(
            (data: any) => data?.sku === sku || data?.sku === parentSku
          );

          const boxIdx = boxProducts?.findIndex(
            (data: any) =>
              (data?.sku === sku || data?.sku === boxSku) &&
              data?.boxRef === boxRef
          );

          let crateQty = quantity * unitCount;

          if (type === "crate") {
            const box = await serviceCaller(`/boxes-crates/${boxRef}`, {
              method: "GET",
            });

            if (box) {
              crateQty *= box.qty;
            }
          }

          if (idx !== -1) {
            cartProducts[idx].qty +=
              type === "crate"
                ? crateQty
                : type === "box"
                ? quantity * unitCount
                : quantity;
          } else {
            cartProducts.push({
              name: name,
              productRef: productRef,
              categoryRef: categoryRef,
              category: { name: category.name },
              variantNameEn: varName.en,
              variantNameAr: varName.ar,
              type: "item",
              noOfUnits: 1,
              parentSku: parentSku,
              boxSku: boxSku,
              boxRef: boxRef,
              crateSku: crateSku,
              crateRef: crateRef,
              costPrice: costPrice,
              hasMultipleVariants: hasMultipleVariants,
              sku: type === "box" || type === "crate" ? parentSku : sku,
              qty:
                type === "crate"
                  ? crateQty
                  : type === "box"
                  ? quantity * unitCount
                  : quantity,
            });
          }

          if (boxIdx !== -1) {
            boxProducts[idx].qty +=
              type === "crate" ? quantity * unitCount : quantity;
          } else if (type === "box" || type === "crate") {
            boxProducts.push({
              name: name,
              productRef: productRef,
              categoryRef: categoryRef,
              category: { name: category.name },
              variantNameEn: varName.en,
              variantNameAr: varName.ar,
              type: "box",
              noOfUnits: unitCount,
              parentSku: parentSku,
              boxSku: boxSku,
              boxRef: boxRef,
              crateSku: crateSku,
              crateRef: crateRef,
              costPrice: costPrice,
              hasMultipleVariants: hasMultipleVariants,
              sku: type === "crate" ? boxSku : sku,
              qty: type === "crate" ? quantity * unitCount : quantity,
            });
          }

          if (type === "crate") {
            crateProducts.push({
              name: name,
              parentSku: parentSku,
              boxSku: boxSku,
              boxRef: boxRef,
              crateSku: crateSku,
              crateRef: crateRef,
              productRef: productRef,
              categoryRef: categoryRef,
              category: { name: category.name },
              variantNameEn: varName.en,
              variantNameAr: varName.ar,
              type: "crate",
              noOfUnits: unitCount,
              costPrice: costPrice,
              hasMultipleVariants: hasMultipleVariants,
              sku: sku,
              qty: quantity,
            });
          }
        }
      })
    );
  } else {
    await Promise.all(
      data?.items?.map(async (item: any) => {
        const {
          tracking,
          type,
          sku,
          boxSku,
          boxRef,
          parentSku,
          qty,
          noOfUnits,
        } = item;

        if (sku !== "Open Item" && tracking) {
          const idx = cartProducts?.findIndex(
            (data: any) => data?.sku === sku || data?.sku === parentSku
          );

          const boxIdx = boxProducts?.findIndex(
            (data: any) =>
              (data?.sku === sku || data?.sku === boxSku) &&
              data?.boxRef === boxRef
          );

          let crateQty = qty * noOfUnits;

          if (type === "crate") {
            const box = await serviceCaller(`/boxes-crates/${boxRef}`, {
              method: "GET",
            });

            if (box) {
              crateQty *= box.qty;
            }
          }

          if (idx !== -1) {
            cartProducts[idx].qty +=
              type === "crate"
                ? crateQty
                : type === "box"
                ? qty * noOfUnits
                : qty;
          } else {
            cartProducts.push({
              ...item,
              type: "item",
              noOfUnits: 1,
              sku: type === "box" || type === "crate" ? parentSku : sku,
              qty:
                type === "crate"
                  ? crateQty
                  : type === "box"
                  ? qty * noOfUnits
                  : qty,
            });
          }

          if (boxIdx !== -1) {
            boxProducts[idx].qty += type === "crate" ? qty * noOfUnits : qty;
          } else if (type === "box" || type === "crate") {
            boxProducts.push({
              ...item,
              type: "box",
              sku: type === "crate" ? boxSku : sku,
              qty: type === "crate" ? qty * noOfUnits : qty,
            });
          }

          if (type === "crate") {
            crateProducts.push({
              ...item,
              type: "crate",
              sku: sku,
              qty: qty,
            });
          }
        }
      })
    );
  }

  return { cartProducts, boxProducts, crateProducts };
}

async function getUpdatedProduct(cartProducts: any[], locationRef: string) {
  const stockCount: number[] = [];
  const batching: boolean[] = [];
  const products: any[] = [];

  await Promise.all(
    cartProducts?.map(async (item) => {
      const { sku, qty, productRef } = item;

      const prod = await serviceCaller(`/product/${productRef}`, {
        method: "GET",
      });

      if (prod) {
        const idx = products?.findIndex((data) => data._id === prod._id);

        if (idx !== -1) {
          let count = 0;

          const variants = products[idx].variants.map((variant: any) => {
            if (variant.sku === sku) {
              const stockConfiguration = variant.stockConfiguration?.map(
                (stock: any) => {
                  if (stock.locationRef === locationRef) {
                    count = Number(stock.count);

                    return {
                      availability: stock.availability,
                      tracking: stock.tracking,
                      count: Number(stock.count) - Number(qty),
                      lowStockAlert: stock.lowStockAlert,
                      lowStockCount: stock.lowStockCount,
                      locationRef: stock.locationRef,
                      location: stock.location,
                    };
                  } else {
                    return stock;
                  }
                }
              );
              return {
                ...variant,
                stockConfiguration: stockConfiguration,
              };
            } else {
              return variant;
            }
          });

          stockCount.push(count);
          batching.push(products[idx].batching);
          products[idx].variants = variants;
        } else {
          let count = 0;

          const variants = prod.variants.map((variant: any) => {
            if (variant.sku === sku) {
              const stockConfiguration = variant.stockConfiguration?.map(
                (stock: any) => {
                  if (stock.locationRef === locationRef) {
                    count = Number(stock.count);

                    return {
                      availability: stock.availability,
                      tracking: stock.tracking,
                      count: Number(stock.count) - Number(qty),
                      lowStockAlert: stock.lowStockAlert,
                      lowStockCount: stock.lowStockCount,
                      locationRef: stock.locationRef,
                      location: stock.location,
                    };
                  } else {
                    return stock;
                  }
                }
              );

              return {
                ...variant,
                stockConfiguration: stockConfiguration,
              };
            } else {
              return variant;
            }
          });

          stockCount.push(count);
          batching.push(prod.batching);
          products.push({
            ...prod,
            variants: variants,
          });
        }
      }
    })
  );

  return { stockCount, batching, products };
}

async function getUpdatedBoxes(
  boxProducts: any[],
  products: any[],
  locationRef: string
) {
  const boxes: any[] = [];
  const boxName: any[] = [];
  const boxBatching: boolean[] = [];
  const boxStockCount: number[] = [];

  await Promise.all(
    boxProducts?.map(async (item) => {
      const { qty, boxRef } = item;

      const box = await serviceCaller(`/boxes-crates/${boxRef}`, {
        method: "GET",
      });

      if (box) {
        const idx = boxes?.findIndex((data) => data._id === box._id);
        const prod = products?.find(
          (data: any) => data._id === box.product.productRef
        );

        if (idx !== -1) {
          let count = 0;

          const stockConfiguration = boxes[idx].stockConfiguration.map(
            (stock: any) => {
              if (stock.locationRef === locationRef) {
                count = Number(stock.count);

                return {
                  availability: stock.availability,
                  tracking: stock.tracking,
                  count: Number(stock.count) - Number(qty),
                  lowStockAlert: stock.lowStockAlert,
                  lowStockCount: stock.lowStockCount,
                  locationRef: stock.locationRef,
                  location: stock.location,
                };
              } else {
                return stock;
              }
            }
          );

          boxName.push({
            en: boxes[idx].name.en,
            ar: boxes[idx].name.ar,
          });
          boxStockCount.push(count);
          boxBatching.push(prod.batching);
          boxes[idx].stockConfiguration = stockConfiguration;
        } else {
          let count = 0;

          const stockConfiguration = box.stockConfiguration?.map(
            (stock: any) => {
              if (stock.locationRef === locationRef) {
                count = Number(stock.count);

                return {
                  availability: stock.availability,
                  tracking: stock.tracking,
                  count: Number(stock.count) - Number(qty),
                  lowStockAlert: stock.lowStockAlert,
                  lowStockCount: stock.lowStockCount,
                  locationRef: stock.locationRef,
                  location: stock.location,
                };
              } else {
                return stock;
              }
            }
          );

          boxName.push({
            en: box.name.en,
            ar: box.name.ar,
          });
          boxStockCount.push(count);
          boxBatching.push(prod.batching);
          boxes.push({
            ...box,
            stockConfiguration: stockConfiguration,
          });
        }
      }
    })
  );

  return { boxName, boxStockCount, boxBatching, boxes };
}

async function getUpdatedCrates(
  crateProducts: any[],
  products: any[],
  locationRef: string
) {
  const crates: any[] = [];
  const crateName: any[] = [];
  const crateBatching: boolean[] = [];
  const crateStockCount: number[] = [];

  await Promise.all(
    crateProducts?.map(async (item) => {
      const { qty, crateRef } = item;

      const crate = await serviceCaller(`/boxes-crates/${crateRef}`, {
        method: "GET",
      });

      if (crate) {
        const prod = products?.find(
          (data: any) => data._id === crate.product.productRef
        );

        let count = 0;

        const stockConfiguration = crate.stockConfiguration?.map(
          (stock: any) => {
            if (stock.locationRef === locationRef) {
              count = Number(stock.count);

              return {
                availability: stock.availability,
                tracking: stock.tracking,
                count: Number(stock.count) - Number(qty),
                lowStockAlert: stock.lowStockAlert,
                lowStockCount: stock.lowStockCount,
                locationRef: stock.locationRef,
                location: stock.location,
              };
            } else {
              return stock;
            }
          }
        );

        crateName.push({
          en: crate.name.en,
          ar: crate.name.ar,
        });
        crateStockCount.push(count);
        crateBatching.push(prod.batching);
        crates.push({
          ...crate,
          stockConfiguration: stockConfiguration,
        });
      }
    })
  );

  return { crateName, crateStockCount, crateBatching, crates };
}

async function updateProductToDB(products: any[]) {
  await Promise.all(
    products.map(async (product) => {
      await serviceCaller(`/product/${product._id}`, {
        method: "PATCH",
        body: {
          variants: product.variants,
        },
      });
    })
  );
}

async function updateBoxToDB(boxes: any[]) {
  await Promise.all(
    boxes.map(async (box) => {
      await serviceCaller(`/boxes-crates/${box._id}`, {
        method: "PATCH",
        body: {
          stockConfiguration: box.stockConfiguration,
        },
      });
    })
  );
}

async function updateCrateToDB(crates: any[]) {
  await Promise.all(
    crates.map(async (crate) => {
      await serviceCaller(`/boxes-crates/${crate._id}`, {
        method: "PATCH",
        body: {
          stockConfiguration: crate.stockConfiguration,
        },
      });
    })
  );
}

async function updateBatchToDB(
  cartProducts: any[],
  batching: boolean[],
  stockCount: number[],
  data: any,
  name?: any[]
) {
  await Promise.all(
    cartProducts?.map(async (item, index) => {
      if (batching[index]) {
        const batches = await serviceCaller(`/batch`, {
          method: "GET",
          query: {
            page: 0,
            limit: 10,
            sort: "asc",
            sku: item.sku,
            activeTab: "available",
            companyRef: data.companyRef,
          },
        });

        if (batches?.results?.length > 0) {
          let stockCount = Number(item.qty);

          await Promise.all(
            batches.results.map(async (batch: any) => {
              const quantity =
                Number(batch?.available || 0) > stockCount
                  ? stockCount
                  : Number(batch.available) || 0;

              stockCount -= quantity;

              await serviceCaller(`/batch/${batch._id}`, {
                method: "PATCH",
                body: {
                  available: Number(batch.available || 0) - Number(quantity),
                },
              });

              if (stockCount <= 0) {
                return;
              }
            })
          );
        }
      }

      const dataObj = {
        productRef: item.productRef,
        product: {
          name: {
            en: item.name.en,
            ar: item.name.ar,
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
        variant: {
          name: {
            en:
              item.type === "box" || item.type === "crate"
                ? name[index].en
                : item.variantNameEn,
            ar:
              item.type === "box" || item.type === "crate"
                ? name[index].ar
                : item.variantNameAr,
          },
          type: item.type,
          unit: item.noOfUnits,
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
        action: "billing",
        price: Number(toFixedNumber(Number(item.costPrice) / Number(item.qty))),
        count: stockCount[index] - Number(item.qty),
        previousStockCount: stockCount[index],
      };

      await serviceCaller(`/stock-history`, {
        method: "POST",
        body: dataObj,
      });
    })
  );
}
