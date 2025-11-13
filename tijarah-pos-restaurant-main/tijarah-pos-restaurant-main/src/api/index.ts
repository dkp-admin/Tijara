import qs from "qs";
import { EventRegister } from "react-native-event-listeners";
import { HOST } from "../../config";
import i18n from "../../i18n";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";

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

  constructor(errorData: {
    code: number;
    message?: string;
    field?: string;
    value?: string;
  }) {
    this.message = i18n.t(`${errorData.code}_message`, errorData);
    this.code = errorData.code;
    this._err = errorData;
  }
}

const requestTimeout = (ms: number) =>
  new Promise<any>((_, reject) =>
    setTimeout(
      () =>
        reject(new ResponseError({ code: 408, message: "Request timed out" })),
      ms
    )
  );

export default async function serviceCaller(
  endpoint: string,
  options: Options = { headers: {}, auth: true }
): Promise<any> {
  const token = MMKVDB.get(DBKeys.TOKEN);
  const user = MMKVDB.get(DBKeys.USER);

  const opt: any = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      "X-USER-ID": `${user?._id || ""}`,
      ...options.headers,
    },
  };

  if (!options.auth) {
    delete opt.Authorization;
  }

  let url = `${HOST}${endpoint}`;

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

  console.log("URL", url);

  try {
    const response = await Promise.race([
      fetch(url, opt),
      requestTimeout(2 * 60000),
    ]);

    let jsonResponse;
    const contentType = response.headers.get("content-type");

    if (contentType!.includes("application/json")) {
      jsonResponse = await response.json();
    } else if (contentType!.includes("text/csv")) {
      jsonResponse = await response.blob();
    } else {
      jsonResponse = await response.text();
    }

    if (response.ok) {
      return jsonResponse;
    }

    //@ts-ignorec
    if (
      jsonResponse?.code == "logged_out" ||
      (jsonResponse?.code == "not_found" &&
        jsonResponse?.context == "authentication")
    ) {
      EventRegister.emit("logged_out");
    }

    throw new ResponseError(jsonResponse);
  } catch (error) {
    //@ts-ignore
    if (error?._err?.code == "logged_out") {
      EventRegister.emit("logged_out");
    }

    throw error instanceof ResponseError
      ? error
      : new ResponseError({ code: 500 });
  }
}
