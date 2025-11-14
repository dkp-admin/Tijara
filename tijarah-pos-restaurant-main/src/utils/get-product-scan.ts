import repository from "../db/repository";

async function fetchProducts(finalSku: string) {
  return repository.productRepository.findBySku(finalSku);
}

async function fetchBoxesCrates(finalSku: string) {
  return repository.boxCratesRepository.findBySku(finalSku);
}

async function fetchProductsAndBoxCrates(finalSku: string) {
  const productPromise = fetchProducts(finalSku);
  const boxCratePromise = fetchBoxesCrates(finalSku);

  // Run both queries in parallel
  const [product, boxCrate] = await Promise.all([
    productPromise,
    boxCratePromise,
  ]);

  if (product) {
    const variantDoc = product.variants.find((variant: any) => {
      return variant.sku === finalSku;
    });

    return {
      ...product,
      variants: [variantDoc],
      multiVariants: product.variants.length > 1,
    };
  } else if (boxCrate) {
    if (
      boxCrate.boxSku === finalSku &&
      boxCrate.type === "box" &&
      boxCrate.status === "active" &&
      !boxCrate.nonSaleable
    ) {
      const prod = await repository.productRepository.findBySku(
        boxCrate?.productSku
      );

      if (prod) {
        const variantDoc = prod.variants.find((variant: any) => {
          return variant.sku === boxCrate.productSku;
        });

        const boxCrateDoc = {
          ...boxCrate,
          unit: "perItem",
          name: variantDoc?.name,
          localImage: variantDoc?.localImage,
          noOfUnits: boxCrate.qty,
          parentSku: boxCrate.productSku,
          boxSku: boxCrate.boxSku,
          crateSku: "",
          boxRef: boxCrate._id,
          crateRef: "",
          sku: boxCrate.boxSku,
        };

        return {
          ...prod,
          variants: [boxCrateDoc],
          multiVariants: prod.variants.length > 1,
        };
      } else {
        return null;
      }
    } else if (
      boxCrate.crateSku === finalSku &&
      boxCrate.type === "crate" &&
      boxCrate.status === "active" &&
      !boxCrate.nonSaleable
    ) {
      const prod = await repository.productRepository.findBySku(
        boxCrate?.productSku
      );

      if (prod) {
        const variantDoc = prod.variants.find((variant: any) => {
          return variant.sku === boxCrate.productSku;
        });

        const boxCrateDoc = {
          ...boxCrate,
          unit: "perItem",
          name: variantDoc?.name,
          localImage: variantDoc?.localImage,
          noOfUnits: boxCrate.qty,
          parentSku: boxCrate.productSku,
          boxSku: boxCrate.boxSku,
          crateSku: boxCrate.crateSku,
          boxRef: boxCrate.boxRef,
          crateRef: boxCrate._id,
          sku: boxCrate.crateSku,
        };

        return {
          ...prod,
          variants: [boxCrateDoc],
          multiVariants: prod.variants.length > 1,
        };
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

const getProductScanBySku = async (finalSku: string) => {
  try {
    return await fetchProductsAndBoxCrates(finalSku);
  } catch (error) {
    console.log("product scan error", error);
    return null;
  }
};

export default getProductScanBySku;
