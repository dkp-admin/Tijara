import { HOST } from "../../config";
import MMKVDB from "../utils/DB-MMKV";
import { DBKeys } from "../utils/DBKeys";

export function fetchPaymentStatusStc(
  refNum: any,
  stcData: any,
  controller: any,
  handleSuccess: (result: any) => void,
  handleError: (error: any) => void,
  clear: () => void
) {
  const token = MMKVDB.get(DBKeys.TOKEN);
  const user = MMKVDB.get(DBKeys.USER);

  const opt: any = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token || ""}`,
      "X-USER-ID": `${user?._id || ""}`,
    },
  };

  fetch(
    `${HOST}/order/payment-status?refNum=${refNum}&type=success&deviceCode=${stcData?.deviceCode}`,
    { ...opt, signal: controller.signal }
  )
    .then((res) => res.json())
    .then((result) => {
      handleSuccess(result);
    })
    .catch((error) => {
      handleError(error);
    })
    .finally(() => {
      clear();
    });
}
