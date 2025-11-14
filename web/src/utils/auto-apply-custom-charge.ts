import toast from "react-hot-toast";
import i18n from "src/i18n";
import cart from "./cart";
import { trigger } from "./custom-event";
import { getItemVAT } from "./get-price";

export const autoApplyCustomCharges = async (
  totalAmount: number,
  customCharges: any[],
  chargesApplied: any[],
  subTotalWithoutDiscount: number
) => {
  const chargesData: any[] = [];

  customCharges?.forEach((charge: any) => {
    const idx = chargesApplied?.findIndex(
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
      const chargeData = cart.getChargesApplied();
      const index = chargeData?.findIndex(
        (data: any) => data?.chargeId === charge?._id
      );

      cart.removeCharges(index, (charges: any) => {
        trigger("chargeRemoved", null, charges, null, null);
      });

      toast.success(i18n.t("Auto charges removed from orders"));
    }
  });

  if (chargesData?.length > 0) {
    chargesData?.forEach((data: any) => {
      cart.applyCharges(data, (charges: any) => {
        trigger("chargeApplied", null, charges, null, null);
      });
    });

    toast.success(i18n.t("Auto charges applied on orders"));
  }
};
