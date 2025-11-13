import {
  randomIntBetween,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import { check, sleep } from "k6";
import http from "k6/http";
import endpoints from "../api/endpoints.js";
import queryBuilder from "../api/query-builder.js";
import ObjectID from "../utils/bson-objectid.js";
import { generateProduct } from "./generator.js";
export default async function productPush({
  token,
  companyRef,
  locationRef,
  location,
  deviceCode,
  deviceRef,
  company,
}) {
  const operations = [];
  const categoriesRequest = await http.asyncRequest(
    "GET",
    `${queryBuilder(endpoints.category.find, { companyRef })}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const categories = categoriesRequest.json().results;

  const category = randomItem(categories);

  const brandsRequest = await http.asyncRequest(
    "GET",
    `${queryBuilder(endpoints.brand.find, {})}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const brands = brandsRequest.json().results;

  const brand = randomItem(brands);
  const taxRequest = await http.asyncRequest(
    "GET",
    `${queryBuilder(endpoints.tax.find, {})}`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const taxes = taxRequest.json().results;

  const tax = randomItem(taxes);

  for (let i = 0; i < randomIntBetween(1, 5); i++) {
    const id = ObjectID();
    const product = generateProduct({
      companyRef,
      company,
      locationRef,
      location,
      category,
      brand,
      tax,
    });
    operations.push({
      id: randomIntBetween(1, 10),
      requestId: id,
      data: JSON.stringify({
        insertOne: {
          document: product,
        },
      }),
    });
  }
  const bulkOp = {
    requestId: "",
    operations,
  };

  const pushRes = http.post(endpoints.push.products, JSON.stringify(bulkOp), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  check(pushRes, {
    accepted: (r) => r.status === 201,
  });

  sleep(1);
}
