import React, { useEffect } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import { BoxCrates } from "../../db/schema/box-crates";
import { Product } from "../../db/schema/product/product";
import { StockHistory } from "../../db/schema/stock-history";
import { queryClient } from "../../query-client";
import { objectId } from "../../utils/bsonObjectIdTransformer";

export default function ProductRestocktEventListener() {
  const updateProductRestock = async (data: any) => {
    const { restockProducts, boxProducts, crateProducts } =
      await getProductBoxCrateForRestock(data);

    const { restockdata, products } = await getUpdatedProduct(restockProducts);

    const { boxRestockdata, boxes } = await getUpdatedBoxes(
      boxProducts,
      restockdata
    );
    const { crateRestockdata, crates } = await getUpdatedCrates(
      crateProducts,
      restockdata
    );

    if (products?.length > 0) {
      updateProductToDB(products);
      updateBatchShiftToDB(restockProducts, restockdata);
    }

    if (boxes?.length > 0) {
      updateBoxToDB(boxes);
      updateBatchShiftToDB(boxProducts, boxRestockdata);
    }

    if (crates?.length > 0) {
      updateCrateToDB(crates);
      updateBatchShiftToDB(crateProducts, crateRestockdata);
    }
  };

  async function getProductBoxCrateForRestock(data: any) {
    let restockProducts: any[] = [];
    let boxProducts: any[] = [];
    let crateProducts: any[] = [];

    await Promise.all(
      data?.map(async (item: any) => {
        const { type, sku, boxSku, boxRef, parentSku, qty, noOfUnits } = item;

        const idx = restockProducts?.findIndex(
          (data: any) => data.sku === sku || data.sku === parentSku
        );

        const boxIdx = boxProducts?.findIndex(
          (data: any) =>
            (data.sku === sku || data.sku === boxSku) && data?.boxRef === boxRef
        );

        let crateQty = 0;

        if (type === "crate") {
          const box = await repository.boxCratesRepository.findById(boxRef);

          if (box) {
            crateQty = Number(qty) * Number(noOfUnits) * box.qty;
          }
        }

        if (idx !== -1) {
          const updatedQty =
            type === "crate"
              ? crateQty
              : type === "box"
              ? Number(qty) * Number(noOfUnits)
              : Number(qty);
          const quantity = Number(restockProducts[idx].qty) + updatedQty;
          restockProducts[idx].qty = quantity;
        } else {
          restockProducts.push({
            ...item,
            type: "item",
            noOfUnits: 1,
            sku: type === "box" || type === "crate" ? parentSku : sku,
            qty:
              type === "crate"
                ? crateQty
                : type === "box"
                ? Number(qty) * Number(noOfUnits)
                : Number(qty),
          });
        }

        if (boxIdx !== -1) {
          const updatedQty =
            type === "crate" ? Number(qty) * Number(noOfUnits) : Number(qty);
          const quantity = Number(boxProducts[idx].qty) + updatedQty;
          boxProducts[idx].qty = quantity;
        } else if (type === "box" || type === "crate") {
          boxProducts.push({
            ...item,
            type: "box",
            sku: type === "crate" ? boxSku : sku,
            qty:
              type === "crate" ? Number(qty) * Number(noOfUnits) : Number(qty),
          });
        }

        if (type === "crate") {
          crateProducts.push({
            ...item,
            type: "crate",
            sku: sku,
            qty: Number(qty),
          });
        }
      })
    );

    return { restockProducts, boxProducts, crateProducts };
  }

  async function getUpdatedProduct(restockProducts: any[]) {
    const restockdata: any[] = [];
    const products: Product[] = [];

    await Promise.all(
      restockProducts?.map(async (item) => {
        const { sku, qty, productRef } = item;

        const prod = await repository.productRepository.findById(productRef);

        if (prod) {
          const idx = products?.findIndex((data) => data._id === prod._id);

          if (idx !== -1) {
            const variants = products[idx].variants.map((variant: any) => {
              if (variant.sku === sku) {
                variant.skuToUpdate = sku;
                restockdata.push({
                  batching: products[idx].enabledBatching,
                  companyRef: products[idx].companyRef,
                  company: { name: products[idx].company.name },
                  productRef: products[idx]._id,
                  product: {
                    name: {
                      en: products[idx].name.en,
                      ar: products[idx].name.ar,
                    },
                  },
                  locationRef: variant.prices[0].locationRef,
                  location: { name: variant.prices[0].location.name },
                  categoryRef: products[idx].categoryRef,
                  category: { name: products[idx].category.name },
                  name: {
                    en: variant.name.en,
                    ar: variant.name.ar,
                  },
                  hasMultipleVariants: products[idx].variants?.length > 1,
                  count: Number(variant.stocks[0].stockCount || 0),
                });

                return {
                  ...variant,
                  stocks: [
                    {
                      enabledAvailability:
                        variant.stocks[0]?.enabledAvailability,
                      enabledTracking: variant.stocks[0]?.enabledTracking,
                      stockCount:
                        Number(variant.stocks[0].stockCount) + Number(qty),
                      enabledLowStockAlert:
                        variant.stocks[0]?.enabledLowStockAlert,
                      lowStockCount: variant.stocks[0]?.lowStockCount,
                      locationRef: variant.stocks[0]?.locationRef,
                      location: variant.stocks[0]?.location,
                    },
                  ],
                };
              } else {
                return variant;
              }
            });

            products[idx].variants = variants;
          } else {
            const variants = prod.variants.map((variant: any) => {
              if (variant.sku === sku) {
                variant.skuToUpdate = sku;
                restockdata.push({
                  batching: prod.enabledBatching,
                  companyRef: prod.companyRef,
                  company: { name: prod.company.name },
                  productRef: prod._id,
                  product: { name: { en: prod.name.en, ar: prod.name.ar } },
                  locationRef: variant.prices[0].locationRef,
                  location: { name: variant.prices[0].location.name },
                  categoryRef: prod.categoryRef,
                  category: { name: prod.category.name },
                  name: {
                    en: variant.name.en,
                    ar: variant.name.ar,
                  },
                  hasMultipleVariants: prod.variants?.length > 1,
                  count: Number(variant.stocks[0].stockCount || 0),
                });

                return {
                  ...variant,
                  stocks: [
                    {
                      enabledAvailability:
                        variant.stocks[0]?.enabledAvailability,
                      enabledTracking: variant.stocks[0]?.enabledTracking,
                      stockCount:
                        Number(variant.stocks[0].stockCount) + Number(qty),
                      enabledLowStockAlert:
                        variant.stocks[0]?.enabledLowStockAlert,
                      lowStockCount: variant.stocks[0]?.lowStockCount,
                      locationRef: variant.stocks[0]?.locationRef,
                      location: variant.stocks[0]?.location,
                    },
                  ],
                };
              } else {
                return variant;
              }
            });

            products.push({
              ...prod,
              variants: variants,
            });
          }
        }
      })
    );

    return { restockdata, products };
  }

  async function getUpdatedBoxes(boxProducts: any[], restockdata: any[]) {
    const boxes: any[] = [];
    const boxRestockdata: any[] = [];

    await Promise.all(
      boxProducts?.map(async (item) => {
        const { qty, boxRef } = item;

        const box = await repository.boxCratesRepository.findById(boxRef);

        if (box) {
          const idx = boxes?.findIndex((data) => data.boxSku === box.boxSku);
          const prod = restockdata?.find(
            (data: any) => data.productRef === box.product.productRef
          );

          if (idx !== -1) {
            const stocksData = [
              {
                enabledAvailability: boxes[idx].stocks[0]?.enabledAvailability,
                enabledTracking: boxes[idx].stocks[0]?.enabledTracking,
                stockCount:
                  Number(boxes[idx].stocks[0].stockCount) + Number(qty),
                enabledLowStockAlert:
                  boxes[idx].stocks[0]?.enabledLowStockAlert,
                lowStockCount: boxes[idx].stocks[0]?.lowStockCount,
                locationRef: boxes[idx].stocks[0]?.locationRef,
                location: boxes[idx].stocks[0]?.location,
              },
            ];

            boxRestockdata.push({
              batching: prod.batching,
              companyRef: prod.companyRef,
              company: { name: prod.company.name },
              productRef: prod.productRef,
              product: {
                name: { en: prod.product.name.en, ar: prod.product.name.ar },
              },
              locationRef: prod.locationRef,
              location: { name: prod.location.name },
              categoryRef: prod.categoryRef,
              category: { name: prod.category.name },
              name: {
                en: boxes[idx].name.en,
                ar: boxes[idx].name.ar,
              },
              hasMultipleVariants: prod.hasMultipleVariants,
              count: Number(boxes[idx].stocks[0].stockCount),
            });

            boxes[idx].stocks = stocksData;
          } else {
            const stocksData = box?.stocks
              ? [
                  {
                    enabledAvailability: box.stocks[0]?.enabledAvailability,
                    enabledTracking: box.stocks[0]?.enabledTracking,
                    stockCount: Number(box.stocks[0].stockCount) + Number(qty),
                    enabledLowStockAlert: box.stocks[0]?.enabledLowStockAlert,
                    lowStockCount: box.stocks[0]?.lowStockCount,
                    locationRef: box.stocks[0]?.locationRef,
                    location: box.stocks[0]?.location,
                  },
                ]
              : [];

            boxRestockdata.push({
              batching: prod.batching,
              companyRef: prod.companyRef,
              company: { name: prod.company.name },
              productRef: prod.productRef,
              product: {
                name: { en: prod.product.name.en, ar: prod.product.name.ar },
              },
              locationRef: prod.locationRef,
              location: { name: prod.location.name },
              categoryRef: prod.categoryRef,
              category: { name: prod.category.name },
              name: {
                en: box.name.en,
                ar: box.name.ar,
              },
              hasMultipleVariants: prod.hasMultipleVariants,
              count: Number(box?.stocks ? box.stocks[0].stockCount || 0 : 0),
            });

            boxes.push({ ...box, stocks: stocksData });
          }
        }
      })
    );

    return { boxRestockdata, boxes };
  }

  async function getUpdatedCrates(crateProducts: any[], restockdata: any[]) {
    const crates: BoxCrates[] = [];
    const crateRestockdata: any[] = [];

    await Promise.all(
      crateProducts?.map(async (item) => {
        const { qty, crateRef } = item;

        const crate = await repository.boxCratesRepository.findById(crateRef);

        if (crate) {
          const prod = restockdata?.find(
            (data: any) => data.productRef === crate.product.productRef
          );

          const stocksData = crate?.stocks
            ? [
                {
                  enabledAvailability: crate.stocks[0]?.enabledAvailability,
                  enabledTracking: crate.stocks[0]?.enabledTracking,
                  stockCount: Number(crate.stocks[0].stockCount) + Number(qty),
                  enabledLowStockAlert: crate.stocks[0]?.enabledLowStockAlert,
                  lowStockCount: crate.stocks[0]?.lowStockCount,
                  locationRef: crate.stocks[0]?.locationRef,
                  location: crate.stocks[0]?.location,
                },
              ]
            : [];

          crateRestockdata.push({
            batching: prod.batching,
            companyRef: prod.companyRef,
            company: { name: prod.company.name },
            productRef: prod.productRef,
            product: {
              name: { en: prod.product.name.en, ar: prod.product.name.ar },
            },
            locationRef: prod.locationRef,
            location: { name: prod.location.name },
            categoryRef: prod.categoryRef,
            category: { name: prod.category.name },
            name: {
              en: crate.name.en,
              ar: crate.name.ar,
            },
            hasMultipleVariants: prod.hasMultipleVariants,
            count: Number(crate?.stocks ? crate.stocks[0].stockCount || 0 : 0),
          });

          crates.push({ ...crate, stocks: stocksData });
        }
      })
    );

    return { crateRestockdata, crates };
  }

  async function updateProductToDB(products: Product[]) {
    products.map(async (product) => {
      if (!product?._id) return;
      await repository.productRepository.update(product._id, {
        _id: product._id,
        parent: product.parent,
        name: { en: product.name.en, ar: product.name.ar },
        contains: product?.contains || "",
        image: product.image,
        localImage: product.localImage,
        companyRef: product.companyRef,
        company: { name: product.company.name },
        categoryRef: product.categoryRef,
        category: { name: product.category.name },
        restaurantCategoryRefs: product?.restaurantCategoryRefs || [],
        restaurantCategories: product?.restaurantCategories || [],
        collectionsRefs: product?.collectionsRefs || [],
        collections: product?.collections || [],
        description: product.description,
        brandRef: product.brandRef,
        brand: { name: product.brand.name },
        taxRef: product.taxRef,
        tax: { percentage: product.tax.percentage },
        status: product.status,
        source: "server",
        enabledBatching: product.enabledBatching,
        bestSeller: product?.bestSeller || false,
        channels: product?.channels || [],
        selfOrdering: product?.selfOrdering || true,
        onlineOrdering: product?.onlineOrdering || true,
        variants: product.variants,
        otherVariants: product?.otherVariants || [],
        boxes: product.boxes,
        otherBoxes: product?.otherBoxes || [],
        nutritionalInformation: product?.nutritionalInformation,
        modifiers: product?.modifiers || [],
        sku: product.sku,
        code: product?.code || [],
        boxRefs: product?.boxRefs || [],
        crateRefs: product?.crateRefs || [],
        kitchenFacingName: product?.kitchenFacingName,
        kitchenRefs: product.kitchenRefs || [],
        kitchens: product?.kitchens || [],
        sortOrder: product?.sortOrder,
      });

      await queryClient.invalidateQueries("find-product");
    });
  }

  async function updateBoxToDB(boxes: BoxCrates[]) {
    boxes.map(async (box) => {
      if (!box?._id) return;
      await repository.boxCratesRepository.update(box._id, {
        _id: box._id,
        name: { en: box.name.en, ar: box.name.ar },
        company: { name: box.company.name },
        companyRef: box.companyRef,
        type: box.type,
        qty: box.qty,
        code: box.code,
        costPrice: box.costPrice,
        price: box.price,
        box: box.box,
        boxName: box.boxName,
        boxSku: box.boxSku,
        boxRef: box.boxRef,
        crateSku: box.crateSku,
        productSku: box.productSku,
        description: box.description,
        nonSaleable: box.nonSaleable,
        product: box.product,
        locations: box.locations,
        locationRefs: box.locationRefs,
        prices: box.prices,
        otherPrices: box.otherPrices,
        stocks: box.stocks,
        otherStocks: box.otherStocks,
        status: box.status,
        source: "server",
      });

      await queryClient.invalidateQueries("find-box-crates");
    });
  }

  async function updateCrateToDB(crates: BoxCrates[]) {
    crates.map(async (crate) => {
      if (!crate._id) return;
      await repository.boxCratesRepository.update(crate._id, {
        _id: crate._id,
        name: { en: crate.name.en, ar: crate.name.ar },
        company: { name: crate.company.name },
        companyRef: crate.companyRef,
        type: crate.type,
        qty: crate.qty,
        code: crate.code,
        costPrice: crate.costPrice,
        price: crate.price,
        box: crate.box,
        boxName: crate.boxName,
        boxSku: crate.boxSku,
        boxRef: crate.boxRef,
        crateSku: crate.crateSku,
        productSku: crate.productSku,
        description: crate.description,
        nonSaleable: crate.nonSaleable,
        product: crate.product,
        locations: crate.locations,
        locationRefs: crate.locationRefs,
        prices: crate.prices,
        otherPrices: crate.otherPrices,
        stocks: crate.stocks,
        otherStocks: crate.otherStocks,
        status: crate.status,
        source: "server",
      });

      await queryClient.invalidateQueries("find-box-crates");
    });
  }

  async function updateBatchShiftToDB(
    restockProducts: any[],
    restockdata: any[]
  ) {
    restockProducts?.map(async (item, index) => {
      const data = restockdata[index];

      if (data.batching) {
        const batches = await repository.batchRepository.find({
          where: {
            productRef: item.productRef,
            variant: item.sku,
            status: "active",
          },
          order: { expiry: "DESC" },
        });

        const batch = batches?.[0];

        if (batch && batch?._id) {
          await repository.batchRepository.update(batch._id, {
            _id: batch._id,
            companyRef: batch.companyRef,
            company: { name: batch.company.name },
            locationRef: batch.locationRef,
            location: { name: batch.location.name },
            vendorRef: batch?.vendorRef || "",
            vendor: { name: batch?.vendor?.name || "" },
            productRef: batch.productRef,
            product: {
              name: {
                en: batch.product.name.en,
                ar: batch.product.name.ar,
              },
            },
            hasMultipleVariants: data.hasMultipleVariants,
            variant: {
              name: {
                en: batch.variant.name.en,
                ar: batch.variant.name.ar,
              },
              type: batch.variant.type,
              qty: batch.variant.qty,
              unit: batch.variant.unit,
              sku: batch.variant.sku,
              costPrice: batch.variant.costPrice,
              sellingPrice: batch.variant.sellingPrice,
            },
            sku: batch.sku,
            received: batch.received,
            transfer: batch.transfer,
            available: (batch.available || 0) + Number(item.qty),
            expiry: batch.expiry,
            createdAt: batch.createdAt,
            status: batch?.status || "active",
            source: "server",
          });

          await queryClient.invalidateQueries("find-batch");
        }
      }

      const stockData: StockHistory = {
        _id: objectId(),
        companyRef: data.companyRef,
        company: { name: data.company.name },
        locationRef: data.locationRef,
        location: { name: data.location.name },
        vendorRef: "",
        vendor: { name: "" },
        categoryRef: data.categoryRef,
        category: { name: data.category.name },
        productRef: data.productRef,
        product: {
          name: { en: data.product.name.en, ar: data.product.name.ar },
        },
        hasMultipleVariants: data.hasMultipleVariants,
        variant: {
          name: {
            en: data.name.en,
            ar: data.name.ar,
          },
          type: item.type,
          qty: item.qty,
          unit: item.noOfUnits,
          sku:
            item.type === "box" || item.type === "crate"
              ? item.parentSku
              : item.sku,
          costPrice: item?.costPrice || 0,
          sellingPrice: item?.sellingPrice || 0,
        },
        sku: item.sku,
        price: 0,
        previousStockCount: Number(data.count),
        stockCount: Number(item.qty),
        stockAction: "restock-return",
        auto: false,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
        source: "server",
      };

      await repository.stockHistoryRepository.create(stockData);

      await queryClient.invalidateQueries("find-stock-history");
    });
  }

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "restock-product",
      (eventData) => {
        const data = JSON.parse(eventData);
        updateProductRestock(data);
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  return <></>;
}
