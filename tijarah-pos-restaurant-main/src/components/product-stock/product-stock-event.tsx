import { useEffect } from "react";
import { EventRegister } from "react-native-event-listeners";
import repository from "../../db/repository";
import { BoxCrates } from "../../db/schema/box-crates";
import { Product } from "../../db/schema/product/product";
import { StockHistory } from "../../db/schema/stock-history";
import { queryClient } from "../../query-client";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import { OrderItem } from "../../db/schema/order/order-items";
import React from "react";

export default function ProductStocktEventListener() {
  const updateProductStock = async (data: any) => {
    const { cartProducts, boxProducts, crateProducts } =
      await getProductBoxCrateFromCart(data);

    const { stockdata, products } = await getUpdatedProduct(cartProducts);
    const { boxStockdata, boxes } = await getUpdatedBoxes(
      boxProducts,
      stockdata
    );
    const { crateStockdata, crates } = await getUpdatedCrates(
      crateProducts,
      stockdata
    );

    if (products?.length > 0) {
      updateProductToDB(products);
      updateBatchToDB(cartProducts, stockdata);
    }

    if (boxes?.length > 0) {
      updateBoxToDB(boxes);
      updateBatchToDB(boxProducts, boxStockdata);
    }

    if (crates?.length > 0) {
      updateCrateToDB(crates);
      updateBatchToDB(crateProducts, crateStockdata);
    }
  };

  async function getProductBoxCrateFromCart(data: any) {
    let cartProducts: OrderItem[] = [];
    let boxProducts: OrderItem[] = [];
    let crateProducts: OrderItem[] = [];

    if (data?.qrOrdering || data?.onlineOrdering) {
      await Promise.all(
        data?.items?.map(async (item: any) => {
          const { name, productRef, quantity, variant, hasMultipleVariants } =
            item;
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
              const box = await repository.boxCratesRepository.findById(boxRef);

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
                ...item,
                name: name,
                productRef: productRef,
                variantNameEn: varName.en,
                variantNameAr: varName.ar,
                type: "item",
                noOfUnits: 1,
                boxSku: boxSku,
                boxRef: boxRef,
                crateSku: crateSku,
                crateRef: crateRef,
                parentSku: parentSku,
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
                ...item,
                name: name,
                productRef: productRef,
                variantNameEn: varName.en,
                variantNameAr: varName.ar,
                type: "box",
                noOfUnits: unitCount,
                boxSku: boxSku,
                boxRef: boxRef,
                crateSku: crateSku,
                crateRef: crateRef,
                parentSku: parentSku,
                costPrice: costPrice,
                hasMultipleVariants: hasMultipleVariants,
                sku: type === "crate" ? boxSku : sku,
                qty: type === "crate" ? quantity * unitCount : quantity,
              });
            }

            if (type === "crate") {
              crateProducts.push({
                ...item,
                name: name,
                productRef: productRef,
                variantNameEn: varName.en,
                variantNameAr: varName.ar,
                type: "crate",
                noOfUnits: unitCount,
                boxSku: boxSku,
                boxRef: boxRef,
                crateSku: crateSku,
                crateRef: crateRef,
                parentSku: parentSku,
                costPrice: costPrice,
                sku: sku,
                qty: quantity,
              });
            }
          }
        })
      );
    } else {
      await Promise.all(
        data?.items?.map(async (item: OrderItem) => {
          const {
            tracking,
            type,
            sku,
            boxSku,
            boxRef,
            parentSku,
            qty,
            noOfUnits,
          }: any = item;

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
              const box = await repository.boxCratesRepository.findById(boxRef);

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

  async function getUpdatedProduct(cartProducts: OrderItem[]) {
    const stockdata: any[] = [];
    const products: Product[] = [];

    await Promise.all(
      cartProducts?.map(async (item) => {
        const { sku, qty, productRef } = item;
        if (!productRef) return;

        const prod: Product = await repository.productRepository.findById(
          productRef
        );

        if (prod) {
          const idx = products?.findIndex((data) => data._id === prod._id);

          if (idx !== -1) {
            const variants = products[idx].variants.map((variant: any) => {
              if (variant.sku === sku) {
                variant.skuToUpdate = sku;
                stockdata.push({
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
                      stockCount: Number(variant.stocks[0].stockCount) - qty,
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
                stockdata.push({
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
                      stockCount: Number(variant.stocks[0].stockCount) - qty,
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

    return { stockdata, products };
  }

  async function getUpdatedBoxes(boxProducts: OrderItem[], stockdata: any[]) {
    const boxes: any[] = [];
    const boxStockdata: any[] = [];

    await Promise.all(
      boxProducts?.map(async (item) => {
        const { qty, boxRef }: any = item;

        const box = await repository.boxCratesRepository.findById(boxRef);

        if (box) {
          const idx = boxes?.findIndex((data) => data.boxSku === box.boxSku);
          const prod = stockdata?.find(
            (data: any) => data.productRef === box.product.productRef
          );

          if (idx !== -1) {
            const stocksData = [
              {
                enabledAvailability: boxes[idx].stocks[0]?.enabledAvailability,
                enabledTracking: boxes[idx].stocks[0]?.enabledTracking,
                stockCount: Number(boxes[idx].stocks[0].stockCount) - qty,
                enabledLowStockAlert:
                  boxes[idx].stocks[0]?.enabledLowStockAlert,
                lowStockCount: boxes[idx].stocks[0]?.lowStockCount,
                locationRef: boxes[idx].stocks[0]?.locationRef,
                location: boxes[idx].stocks[0]?.location,
              },
            ];

            boxStockdata.push({
              batching: prod.batching,
              companyRef: prod.companyRef,
              company: { name: prod.company.name },
              productRef: prod.productRef,
              product: {
                name: {
                  en: prod.product.name.en,
                  ar: prod.product.name.ar,
                },
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
              count: Number(boxes[idx].stocks[0].stockCount || 0),
            });

            boxes[idx].stocks = stocksData;
          } else {
            const stocksData = box?.stocks
              ? [
                  {
                    enabledAvailability: box.stocks[0]?.enabledAvailability,
                    enabledTracking: box.stocks[0]?.enabledTracking,
                    stockCount: Number(box.stocks[0].stockCount) - qty,
                    enabledLowStockAlert: box.stocks[0]?.enabledLowStockAlert,
                    lowStockCount: box.stocks[0]?.lowStockCount,
                    locationRef: box.stocks[0]?.locationRef,
                    location: box.stocks[0]?.location,
                  },
                ]
              : [];

            boxStockdata.push({
              batching: prod.batching,
              companyRef: prod.companyRef,
              company: { name: prod.company.name },
              productRef: prod.productRef,
              product: {
                name: {
                  en: prod.product.name.en,
                  ar: prod.product.name.ar,
                },
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

    return { boxStockdata, boxes };
  }

  async function getUpdatedCrates(
    crateProducts: OrderItem[],
    stockdata: any[]
  ) {
    const crates: BoxCrates[] = [];
    const crateStockdata: any[] = [];

    await Promise.all(
      crateProducts?.map(async (item) => {
        const { qty, crateRef }: any = item;

        const crate = await repository.boxCratesRepository.findById(crateRef);

        if (crate) {
          const prod = stockdata?.find(
            (data: any) => data.productRef === crate.product.productRef
          );

          const stocksData = crate?.stocks
            ? [
                {
                  enabledAvailability: crate.stocks[0]?.enabledAvailability,
                  enabledTracking: crate.stocks[0]?.enabledTracking,
                  stockCount: Number(crate.stocks[0].stockCount) - qty,
                  enabledLowStockAlert: crate.stocks[0]?.enabledLowStockAlert,
                  lowStockCount: crate.stocks[0]?.lowStockCount,
                  locationRef: crate.stocks[0]?.locationRef,
                  location: crate.stocks[0]?.location,
                },
              ]
            : [];

          crateStockdata.push({
            batching: prod.batching,
            companyRef: prod.companyRef,
            company: { name: prod.company.name },
            productRef: prod.productRef,
            product: {
              name: {
                en: prod.product.name.en,
                ar: prod.product.name.ar,
              },
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

    return { crateStockdata, crates };
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
      if (!box._id) return;
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

  async function updateBatchToDB(cartProducts: OrderItem[], stockdata: any[]) {
    cartProducts?.map(async (item, index) => {
      const data = stockdata[index];

      if (data?.batching) {
        const batches = await repository.batchRepository.find({
          where: {
            productRef: item.productRef,
            variant: item.sku,
            status: "active",
          },
          order: { expiry: "ASC" },
        });

        if (batches?.length > 0) {
          let stockCount = item.qty;

          batches.map(async (batch) => {
            if (!batch._id) return;
            const quantity =
              (batch?.available || 0) > stockCount
                ? stockCount
                : batch.available || 0;

            stockCount -= quantity;

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
              available: (batch.available || 0) - quantity,
              expiry: batch.expiry,
              createdAt: batch.createdAt,
              status: batch.status,
              source: "server",
            });

            if (stockCount <= 0) {
              return;
            }
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
        categoryRef: data?.categoryRef,
        category: { name: data?.category?.name },
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
        price: item?.costPrice || 0,
        previousStockCount: Number(data.count),
        stockCount: Number(item.qty),
        stockAction: "billing",
        auto: false,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
        source: "server",
      };

      await repository.stockHistoryRepository.create(stockData as any);

      await queryClient.invalidateQueries("find-stock-history");
    });
  }

  useEffect(() => {
    const listener = EventRegister.addEventListener(
      "update-product-stock",
      (eventData) => {
        updateProductStock({ ...eventData });
      }
    );
    return () => {
      EventRegister.removeEventListener(listener as string);
    };
  }, []);

  return <></>;
}
