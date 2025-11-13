import { Like } from "typeorm";
import { BoxCratesModel } from "../database/box-crates/box-crates";
import { ProductModel } from "../database/product/product";
import { db } from "./createDatabaseConnection";

async function fetchProducts(finalSku: string) {
  const repo = db.getRepository(ProductModel);

  const queryBuilder = repo
    .createQueryBuilder("products")
    .where("products.variants LIKE :variantSku", {
      variants: "sku",
      variantSku: `%${finalSku}%`,
    })
    .orWhere("products.boxes LIKE :boxSku", {
      boxes: "sku",
      boxSku: `%${finalSku}%`,
    });

  return queryBuilder.getOne();
}

async function fetchBoxesCrates(finalSku: string) {
  const repo = db.getRepository(BoxCratesModel);

  return repo.findOne({
    where: [
      { boxSku: Like(`%${finalSku}%`) },
      { crateSku: Like(`%${finalSku}%`) },
    ],
  });
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
      const repo = db.getRepository(ProductModel);

      const prod = await repo
        .createQueryBuilder("products")
        .where("products.variants LIKE :variantSku", {
          variants: "sku",
          variantSku: `%${boxCrate.productSku}%`,
        })
        .getOne();

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
      const repo = db.getRepository(ProductModel);

      const prod = await repo
        .createQueryBuilder("products")
        .where("products.variants LIKE :variantSku", {
          variants: "sku",
          variantSku: `%${boxCrate.productSku}%`,
        })
        .getOne();

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
    return null;
  }
};

export default getProductScanBySku;
