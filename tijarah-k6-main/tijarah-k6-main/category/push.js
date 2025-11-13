import http from "k6/http";
import ObjectID from "../utils/bson-objectid.js";
import { generateCategory } from "./generator.js";
import {
  randomIntBetween,
  randomItem,
} from "https://jslib.k6.io/k6-utils/1.2.0/index.js";
import endpoints from "../api/endpoints.js";
import { check, sleep } from "k6";

export default async function categoryPush({
  token,
  companyRef,
  locationRef,
  location,
  deviceCode,
  deviceRef,
  company,
}) {
  const operations = [];

  for (let i = 0; i < randomIntBetween(1, 5); i++) {
    const id = ObjectID();
    const category = generateCategory({ company, companyRef });
    operations.push({
      id: randomIntBetween(1, 10),
      requestId: id,
      data: JSON.stringify({
        insertOne: {
          document: {
            _id: id,
            name: category.name,
            image: category.image,
            company: category.company,
            companyRef: category.companyRef,
            description: category.description,
            status: category.status,
          },
        },
      }),
    });
  }

  const bulkOp = {
    requestId: "",
    operations,
  };

  const pushRes = http.post(endpoints.push.category, JSON.stringify(bulkOp), {
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
