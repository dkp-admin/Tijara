import { URLSearchParams } from "https://jslib.k6.io/url/1.0.0/index.js";

export default function queryBuilder(endpoint, queryObj) {
  const searchParams = new URLSearchParams();
  Object.keys(queryObj).forEach((key) =>
    searchParams.append(key, queryObj[key])
  );
  return `${endpoint}?activeTab=all&page=0&limit=100&sort=desc&${searchParams}`;
}
