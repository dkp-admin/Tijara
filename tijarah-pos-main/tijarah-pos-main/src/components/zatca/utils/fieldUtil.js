import { Buffer } from "@craftzdog/react-native-buffer";

export function toHex(value) {
  let hex = value.toString(16);
  if (hex.length % 2 > 0) {
    hex = "0" + hex;
  }
  return Buffer.from(hex, "hex").toString("utf-8");
}

export const byteLength = (value) => Buffer.byteLength(value);

export const toBase64 = (value) => {
  return Buffer.from(value).toString("base64");
};

export const toTLV = (tag, value) => {
  return toHex(tag) + toHex(byteLength(value)) + value;
};
