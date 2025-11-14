import logToAxiom from "../../../utils/log-to-axiom";
import { constructDBVariant } from "../../../utils/construct-db-variant";
import { queryClient } from "../../../query-client";
import { Product } from "../../../db/schema/product/product";
import repository from "../../../db/repository";

const updateLocalProduct = async (
  res: any,
  values: any,
  product: any,
  variants: any
) => {
  try {
    const variantsList = variants.map((val: any) => constructDBVariant(val));

    logToAxiom({
      context: "updateLocalProduct",
      message: `Constructed DB variants: ${JSON.stringify(variantsList)}`,
      type: "info",
    });

    const productData: Product = {
      _id: product?._id || res._id,
      parent: product?.parent || "",
      name: {
        en: values.en_name?.trim() || res.name.en?.trim(),
        ar: values.ar_name?.trim() || res.name.ar?.trim(),
      },
      kitchenFacingName: {
        en:
          values.kitchenFacingNameEn?.trim() ||
          res?.kitchenFacingName?.en?.trim(),
        ar:
          values.kitchenFacingNameAr?.trim() ||
          res?.kitchenFacingName?.ar?.trim(),
      },
      contains: values.contains || res.contains,
      image: values.localImage || res.image,
      localImage: values.localImage || res.image,
      companyRef: res.companyRef,
      company: { name: res.company.name },
      categoryRef: values.category.key || res.categoryRef,
      category: { name: values.category.value || res.category.name },
      kitchenRefs: values.kitchenRefs || res.kitchenRefs,
      kitchens: (values.kitchens || res.kitchens)?.map((kitchen: any) => ({
        name: kitchen,
      })),
      restaurantCategoryRefs:
        values.restaurantCategoryRefs || res.restaurantCategoryRefs,
      restaurantCategories:
        values.restaurantCategories || res.restaurantCategories,
      collectionsRefs: values.collectionRefs || res.collectionRefs,
      collections: (values.collections || res.collections)?.map(
        (coll: any) => ({ name: coll })
      ),
      description: values.description || res.description,
      brandRef: values.brand.key || res.brandRef,
      brand: { name: values.brand.value || res.brand.name },
      taxRef: values.tax.key || res.taxRef,
      tax: { percentage: values.tax.value || res.tax.percentage },
      status: values.status || res.status,
      source: "server",
      enabledBatching: values.enabledBatching || res.batching,
      bestSeller: values.bestSeller || res.bestSeller,
      channels: values.channels || res.channel,
      selfOrdering: values.selfOrdering || res.selfOrdering,
      onlineOrdering: values.onlineOrdering || res.onlineOrdering,
      variants: variantsList,
      otherVariants: product?.otherVariants || [],
      boxes: product?.boxes || [],
      otherBoxes: product?.otherBoxes || [],
      nutritionalInformation:
        values.nutritionalInformation || res.nutritionalInformation,
      modifiers: values.modifiers || res.modifiers,
      sortOrder: product?.sortOrder || 0,
      sku: [values.sku],
      code: [values?.code || ""],
      boxRefs: product?.boxRefs || [],
      crateRefs: product?.crateRefs || [],
    };

    logToAxiom({
      context: "updateLocalProduct",
      message: `Constructed product data: ${JSON.stringify(productData)}`,
      type: "info",
    });

    let result;
    if (product?._id) {
      result = await repository.productRepository.update(
        product._id,
        productData
      );
      logToAxiom({
        context: "updateLocalProduct",
        message: `Local product update response: ${JSON.stringify(result)}`,
        type: "info",
      });
    } else {
      result = await repository.productRepository.create(productData);
      logToAxiom({
        context: "updateLocalProduct",
        message: `Local product create response: ${JSON.stringify(result)}`,
        type: "info",
      });
    }

    await queryClient.invalidateQueries("find-product");

    return result;
  } catch (error: any) {
    logToAxiom({
      context: "updateLocalProduct",
      message: `Error in updateLocalProduct: ${error.message}`,
      type: "error",
    });

    // Throw a more informative error
    throw new Error(`Failed to update local product: ${error.message}`);
  }
};

export default updateLocalProduct;
