import http from "k6/http";
import { check, sleep } from "k6";
import { baseUrl } from "../constants.js";
import { orderPayload } from "../payload/orderPayload.js";

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: "constant-arrival-rate",
      rate: 500,
      timeUnit: "60s",
      duration: "30s",
      preAllocatedVUs: 1,
      maxVUs: 1,
    },
  },
};

let authToken;

export function setup() {
  const res = http.post(`${baseUrl}/authentication/login`, {
    email: "96MHS7YM@posApp",
    password: "CAMMPM",
    authType: "email",
  });

  check(res, {
    "logged in successfully": (r) => r.status === 200,
  });

  authToken = res.json().token;
  return authToken;
}

export default function (authToken) {
  const ordPayload = JSON.stringify(orderPayload);

  const headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };

  const res = http.post(`${baseUrl}/push/orders`, ordPayload, headers);

  check(res, {
    "Order created successfully": (r) => r.status === 201,
  });

  sleep(1);
}
