import { EventRegister } from "react-native-event-listeners";
import { t } from "../../i18n";
import showToast from "../components/toast";
import MMKVDB from "./DB-MMKV";
import cart from "./cart";
import { repo } from "./createDatabaseConnection";
import { getItemVAT } from "./get-price";
import { debugLog } from "./log-patch";

export const autoApplyCustomCharges = async (
  channel: string,
  totalAmount: number,
  subTotalWithoutDiscount: number
) => {
  const chargeData = MMKVDB.get("chargesApplied");

  const customCharges = await repo.customCharge.find({
    where: {
      status: "active",
      applyAutoChargeOnOrders: true,
    },
  });

  const chagresList = customCharges?.filter(
    (charge: any) => charge.channel === "all" || charge.channel === channel
  );

  const chargesData: any[] = [];

  chagresList?.forEach((charge: any) => {
    const idx = chargeData?.findIndex(
      (applied: any) => applied?.chargeId === charge?._id
    );

    if (idx === -1) {
      let applyAutoCharges = false;

      if (!charge.skipIfOrderValueIsAbove) {
        applyAutoCharges = true;
      } else if (
        charge.skipIfOrderValueIsAbove &&
        (charge.orderValue || 0) >= totalAmount
      ) {
        applyAutoCharges = true;
      }

      if (applyAutoCharges) {
        const price =
          charge.type === "percentage"
            ? (subTotalWithoutDiscount * charge.value) / 100
            : charge.value;

        chargesData.push({
          name: { en: charge.name.en, ar: charge.name.ar },
          total: Number(price?.toFixed(2)),
          vat: getItemVAT(price, charge.tax?.percentage || 0),
          type: charge.type,
          chargeType: charge.chargeType,
          value: charge.value,
          chargeId: charge._id,
        });
      }
    } else if (
      idx !== -1 &&
      charge.skipIfOrderValueIsAbove &&
      (charge.orderValue || 0) < totalAmount
    ) {
      const index = chargeData?.findIndex(
        (data: any) => data?.chargeId === charge?._id
      );

      cart.removeCharges(index, (charges: any) => {
        debugLog(
          "Auto charge remove from orders",
          charge,
          "billing-screen",
          "autoApplyCustomCharges"
        );
        EventRegister.emit("chargeRemoved", charges);
      });

      showToast("success", t("Auto Charges Removed From Orders"));
    }
  });

  if (chargesData?.length > 0) {
    chargesData?.forEach((data: any) => {
      cart.applyCharges(data, (charges: any) => {
        debugLog(
          "Auto charge applied on orders",
          charges,
          "billing-screen",
          "autoApplyCustomCharges"
        );
        EventRegister.emit("chargeApplied", charges);
      });
    });

    showToast("success", t("Auto Charges Applied On Orders"));
  }
};
