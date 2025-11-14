import {
  randomIntBetween,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import http from "k6/http";
import endpoints from "../api/endpoints.js";
import generatePushOrdersPayload from "./generator.js";
import queryBuilder from "../api/query-builder.js";
import { check, sleep } from "k6";

export default async function orderPush({
  token,
  companyRef,
  locationRef,
  location,
  deviceCode,
  deviceRef,
}) {
  const productsRequest = await http.asyncRequest(
    "GET",
    `${queryBuilder(endpoints.product, { companyRef })}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const cashierRequest = await http.asyncRequest(
    "GET",
    `${queryBuilder(endpoints.user.fetchPosUser, { locationRef })}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const cashiers = cashierRequest
    .json()
    .users.filter((user) => user.userType === "app:cashier");

  const cashier = randomItem(cashiers);

  const randomProducts = [];
  const products = productsRequest.json().results;

  for (let i = 0; i < randomIntBetween(1, 5); i++) {
    randomProducts.push(randomItem(products));
  }

  const items = randomProducts.map((product) => {
    const variant = randomItem(product.variants);
    const qty = randomIntBetween(1, 10);
    return {
      location,
      locationRef,
      device: { deviceCode },
      deviceRef,
      cashier: { name: cashier.name },
      cashierRef: cashier._id,
      companyRef: product.companyRef,
      company: product.company,
      categoryRef: product.categoryRef,
      productRef: product._id,
      name: product.name,
      variantNameEn: variant.name.en,
      variantNameAr: variant.name.ar,
      type: variant.type,
      sku: variant.sku,
      parentSku: variant.type === "box" ? variant.parentSku : "",
      qty,
      noOfUnits: qty,
      hasMultipleVariants: false,
      costPrice: variant.costPrice,
      unit: variant.unit,
      sellingPrice: variant.price,
    };
  });

  const bulkOp = generatePushOrdersPayload(items);

  const pushRes = http.post(endpoints.push.orders, JSON.stringify(bulkOp), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  check(pushRes, {
    accepted: (r) => r.status === 201,
  });
}
