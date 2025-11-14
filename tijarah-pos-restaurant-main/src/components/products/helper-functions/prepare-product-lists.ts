import { constructBox } from "../../../utils/construct-box";
import { constructVariant } from "../../../utils/construct-variant";
import logToAxiom from "../../../utils/log-to-axiom";

const prepareProductLists = async (
  values: any,
  variants: any,
  product: any
) => {
  try {
    const variantsList = variants?.map(constructVariant) || [];
    logToAxiom({
      context: "prepareProductLists",
      message: `Variant list: ${JSON.stringify(variantsList)}`,
      type: "info",
    });

    const otherVariantsList =
      product?.otherVariants?.map(constructVariant) || [];
    logToAxiom({
      context: "prepareProductLists",
      message: `Other variants list: ${JSON.stringify(otherVariantsList)}`,
      type: "info",
    });

    const boxesList = values.boxes?.map(constructBox) || [];
    logToAxiom({
      context: "prepareProductLists",
      message: `Box list: ${JSON.stringify(boxesList)}`,
      type: "info",
    });

    const otherBoxesList = product?.otherBoxes?.map(constructBox) || [];
    logToAxiom({
      context: "prepareProductLists",
      message: `Other box list: ${JSON.stringify(otherBoxesList)}`,
      type: "info",
    });

    return {
      variantsList,
      otherVariantsList,
      boxesList,
      otherBoxesList,
    };
  } catch (error: any) {
    logToAxiom({
      context: "prepareProductLists",
      message: `Error in prepareProductLists: ${error.message}`,
      type: "error",
    });
    throw error; // Re-throw the error to be handled by the caller
  }
};

export default prepareProductLists;
