import serviceCaller from "../../../api";
import endpoint from "../../../api/endpoints";
import logToAxiom from "../../../utils/log-to-axiom";
import upload, { FileUploadNamespace } from "../../../utils/uploadToS3";

const handleProductSubmission = async (dataObj: any, product: any) => {
  try {
    let res;
    const isNewProduct = !product;
    const endpointInfo = isNewProduct
      ? endpoint.createProduct
      : endpoint.updateProduct;
    const url = isNewProduct
      ? endpointInfo.path
      : `${endpointInfo.path}/${product._id}`;

    const pattern = /^file:\/\//;

    if (pattern.test(dataObj?.image)) {
      const imageUrl = await upload(
        dataObj?.image,
        FileUploadNamespace["product-images"]
      );
      dataObj.image = imageUrl;
    }

    logToAxiom({
      context: "handleProductSubmission",
      message: `Attempting to ${isNewProduct ? "create" : "update"} product`,
      type: "info",
    });

   

    res = await serviceCaller(url, {
      method: endpointInfo.method,
      body: { ...dataObj },
    });


    if (!res) {
      throw new Error("Empty response received from server");
    }

    logToAxiom({
      context: "handleProductSubmission",
      message: `Product ${
        isNewProduct ? "creation" : "update"
      } response: ${JSON.stringify(res)}`,
      type: "info",
    });

    return res;
  } catch (error: any) {
    logToAxiom({
      context: "handleProductSubmission",
      message: `Error in handleProductSubmission: ${error.message}`,
      type: "error",
    });

    // Log additional details if available
    if (error.response) {
      logToAxiom({
        context: "handleProductSubmission",
        message: `Server responded with status ${
          error.response.status
        }: ${JSON.stringify(error.response.data)}`,
        type: "error",
      });
    }

    // Throw a more informative error
    throw new Error(
      `Failed to ${product ? "update" : "create"} product: ${error.message}`
    );
  }
};

export default handleProductSubmission;
