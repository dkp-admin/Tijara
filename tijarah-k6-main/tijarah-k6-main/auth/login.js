import http from "k6/http";
import endpoints from "../api/endpoints.js";
import { check } from "k6";

export const options = {
  vus: 1,
  duration: "300000s",
};

export default async function DeviceLogin({ deviceCode, devicePassword }) {
  const requestBody = {
    email: `${deviceCode}@posApp`,
    password: devicePassword,
    authType: "email",
  };

  const url = endpoints.login;

  const response = http.post(url, requestBody);

  check(response, {
    "logged in successfully": (r) => r.status === 201,
  });

  return response;
}
