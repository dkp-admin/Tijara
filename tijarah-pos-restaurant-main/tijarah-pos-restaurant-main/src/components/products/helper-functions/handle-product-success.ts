import { t } from "../../../../i18n";
import logToAxiom from "../../../utils/log-to-axiom";
import showToast from "../../toast";

const handleProductSuccess = async (
  values: any,
  product: any,
  data: any,
  handleClose: any,
  handleSaveProduct: any
) => {
  try {
    logToAxiom({
      context: "handleProductSuccess",
      message: `Handling success for ${product ? "updated" : "new"} product`,
      type: "info",
    });

    if (values.stockUpdate) {
      logToAxiom({
        context: "handleProductSuccess",
        message: "Stock update detected, calling handleSaveProduct",
        type: "info",
      });

      await handleSaveProduct(
        product,
        data.product
          ? t("Product Updated Successfully")
          : t("Product Added Successfully")
      );
    } else {
      logToAxiom({
        context: "handleProductSuccess",
        message: "Closing form and showing success toast",
        type: "info",
      });

      handleClose();
      showToast(
        "success",
        data.product
          ? t("Product Updated Successfully")
          : t("Product Added Successfully")
      );
    }

    logToAxiom({
      context: "handleProductSuccess",
      message: "Product success handling completed",
      type: "info",
    });
  } catch (error: any) {
    logToAxiom({
      context: "handleProductSuccess",
      message: `Error in handleProductSuccess: ${error.message}`,
      type: "error",
    });

    // Even if there's an error, we still want to show a success message to the user
    // because the product operation itself was successful
    showToast(
      "success",
      data.product
        ? t("Product Updated Successfully")
        : t("Product Added Successfully")
    );

    // Re-throw the error for the main error handler to catch
    throw new Error(`Error in success handling: ${error.message}`);
  }
};

export default handleProductSuccess;
