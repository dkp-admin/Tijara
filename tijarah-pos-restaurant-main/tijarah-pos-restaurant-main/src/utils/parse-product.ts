import { ProductModel } from "../database/product/product";

// Define a method to dynamically map keys and parse them into a model instance
const mapKeysAndParse = (sourceObject: any) => {
  const productModel = new ProductModel();

  for (const key in sourceObject) {
    // Check if the key exists in the ProductModel
    if (productModel.hasOwnProperty(key)) {
      //@ts-ignore
      productModel[key] = sourceObject[key];
    }
  }

  return productModel;
};

export default mapKeysAndParse;
