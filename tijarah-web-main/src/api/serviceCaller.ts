import { t } from "i18next";
import qs from "qs";
import { HOST } from "src/config";
import { trigger } from "src/utils/custom-event";

type Options = {
  query?: any;
  body?: any;
  headers?: RequestInit["headers"];
  method?: RequestInit["method"];
  auth?: boolean;
  params?: any;
};

export class ResponseError {
  public message: string;
  public code: number;
  public _err: any;
  public error: any;
  //
  constructor(errorData: {
    code: number;
    message?: string;
    field?: string;
    value?: string;
  }) {
    this.message = t(`${errorData.code}_message`, errorData);
    this.code = errorData.code;
    this._err = errorData;
    this.error = this._err;
  }
}

export default async function serviceCaller(
  endpoint: string,
  options: Options = { headers: {}, auth: true }
): Promise<any> {
  const token = localStorage.getItem("accessToken") || "";
  const deviceToken = localStorage.getItem("accessDeviceToken") || "";

  const fetchUser = endpoint?.split("?");

  const opt: any = {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${
        endpoint === "/push/orders" || fetchUser?.[0] === "/user/fetch-pos-user"
          ? deviceToken
          : token
      }`,
      ...options.headers,
    },
  };

  if (!options.auth) {
    delete opt.Authorization;
  }

  // Use proxy for localhost development to avoid CORS
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.hostname.includes('localhost'));

  // Only use proxy in development and on localhost
  const useProxy = isLocalhost && process.env.NODE_ENV !== 'production';

  let url = useProxy
    ? `/api/proxy${endpoint}`
    : `${HOST}${endpoint}`;

  if (options.query) {
    url += `?${qs.stringify(options.query)}`;
  }

  if (options.body) {
    opt.body = JSON.stringify(options.body);
  }

  if (options.params) {
    Object.keys(options.params).forEach((key) => {
      url = url.replace(`:${key}`, options.params[key]);
    });
  }

  try {
    const response = await fetch(url, opt);
    let jsonResponse;
    const contentType = response.headers.get("content-type");

    if (contentType.includes("application/json")) {
      jsonResponse = await response.json();
    } else if (contentType.includes("text/csv")) {
      jsonResponse = await response.blob();
    } else {
      jsonResponse = await response.text();
    }

    if (response.ok) {
      return jsonResponse;
    }

    if (
      jsonResponse.code == "logged_out" ||
      jsonResponse.code == "user_inactive" ||
      (jsonResponse.code == "not_found" &&
        jsonResponse.context == "authentication") ||
      jsonResponse.statusCode == 401
    ) {
      trigger("logout", null, null, null, null);
    }

    throw new ResponseError(jsonResponse);
  } catch (error) {
    throw error instanceof ResponseError
      ? error
      : new ResponseError({ code: 500 });
  }
}
