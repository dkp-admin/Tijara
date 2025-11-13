import { baseUrl } from "./config.js";

const endpoints = {
  login: `${baseUrl}/authentication/login`,
  product: `${baseUrl}/product`,
  category: `${baseUrl}/category`,
  brand: { find: `${baseUrl}/brands` },
  tax: { find: `${baseUrl}/tax` },
  location: `${baseUrl}/location`,
  push: {
    orders: `${baseUrl}/push/orders`,
    category: `${baseUrl}/push/category`,
    products: `${baseUrl}/push/product`,
  },
  user: {
    user: `${baseUrl}/user`,
    fetchPosUser: `${baseUrl}/user/fetch-pos-user`,
  },
  company: { findOne: `${baseUrl}/company` },
  category: {
    find: `${baseUrl}/category`,
  },
};

export default endpoints;
