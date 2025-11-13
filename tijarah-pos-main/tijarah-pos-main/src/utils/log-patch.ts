import * as FS from "expo-file-system";
import {
  consoleTransport,
  logger,
  transportFunctionType,
} from "react-native-logs";
import { serializeError } from "serialize-error";
import { LOG_TOPIC } from "../../config";
import MMKVDB from "./DB-MMKV";
import { DBKeys } from "./DBKeys";

const url = `https://api.openobserve.ai/api/tijarah_yLTff09XxN9GEJT/${LOG_TOPIC}/_json`;
const basicAuth = `bmVvLnhhY3RvckBnbWFpbC5jb206NjEydjBiMzRXRmM4TXk5N0lTYTU=`;

const customTransport: transportFunctionType = async (props: any) => {
  const logs = [];

  logs.push({
    level: props.level.text,
    msg: props.rawMsg[0],
    raw: props.rawMsg,
  });

  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(logs),
  })
    .then((res) => {
      return res.text();
    })
    .then((t) => {
      // console.log("log sent", t);
    })
    .catch((err) => {
      console.log(err);
    });
};

var LOG = logger.createLogger({
  transport: [consoleTransport, customTransport],
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
    FS,
  },
});

export { LOG };

let metadata: any;

const getMetaData = async () => {
  try {
    if (metadata) return metadata;

    const authUser = MMKVDB.get(DBKeys.USER);
    const deviceUser = MMKVDB.get(DBKeys.DEVICE);

    metadata = {
      companyRef: deviceUser?.companyRef,
      locationRef: deviceUser?.locationRef,
      deviceCode: deviceUser?.phone,
      deviceRef: deviceUser?.deviceRef,
      userRef: authUser?._id,
      userName: authUser?.name,
      userPhone: authUser?.phone,
    };

    return metadata;
  } catch (error) {
    return {
      metadata: "Metadata could not be fetched due to an error",
      error: serializeError(error),
    };
  }
};

export const debugLog = async (
  message: string,
  data: any,
  context: string,
  action: string
) => {
  const metaData = await getMetaData();

  LOG.debug(message, {
    data,
    context: context,
    action: action,
    error: {},
    meta: metaData,
  });
};

export const errorLog = async (
  message: string,
  data: any,
  context: string,
  action: string,
  error: any
) => {
  const metaData = await getMetaData();

  LOG.error(message, {
    data,
    context: context,
    action: action,
    error: serializeError(error),
    meta: metaData,
  });
};

export const infoLog = async (
  message: string,
  data: any,
  context: string,
  action: string
) => {
  const metaData = await getMetaData();

  LOG.info(message, {
    data,
    context: context,
    action: action,
    error: {},
    meta: metaData,
  });
};
