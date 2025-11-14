import { toBase64, toTLV } from "./utils/fieldUtil";

/**
 * Generates data string to generate qr from
 * Usage
 * ```js
 * const qrData = createQRData({
 *  sellerName: '',
 *  vatNumber: '',
 *  timestamp: '',
 *  total: '100.00',
 *  vatTotal: '15.00'
 * })
 * ```
 */

export function createQRData({
  sellerName,
  vatNumber,
  timestamp,
  total,
  vatTotal,
}) {
  const fields = [
    [1, sellerName],
    [2, vatNumber],
    [3, timestamp],
    [4, total],
    [5, vatTotal],
  ];

  const qrData = fields.reduce(
    (qrDataStr, [tag, value]) => qrDataStr + toTLV(tag, value),
    ""
  );

  const b64 = toBase64(qrData);

  return b64;
}
