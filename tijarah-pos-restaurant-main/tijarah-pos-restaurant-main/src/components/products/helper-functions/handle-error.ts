import { t } from "../../../../i18n";

import logToAxiom from "../../../utils/log-to-axiom";
import showToast from "../../toast";

const handleError = async (error: any, values: any) => {
  logToAxiom({
    context: "addProduct",
    message: `Add product error: ${JSON.stringify(error)}`,
    type: "error",
  });

  if (error?.err?.code === 408) {
    showToast("error", error?._err?.message);
  } else if (error?.code === "sku_exists") {
    showToast("error", t("SKU already exists"));
  } else {
    showToast(
      "error",
      error?._err?.message ||
        error?.code ||
        error?.message ||
        t("An unknown error occurred")
    );
  }

  console.error("Error in product submission:", error);
};

export default handleError;
