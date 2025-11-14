import { default as React, useCallback, useMemo } from "react";
import { Keyboard, Pressable, View } from "react-native";
import { t } from "../../../../../i18n";
import { checkDirection } from "../../../../hooks/check-direction";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { getUnitName } from "../../../../utils/constants";
import CurrencyView from "../../../modal/currency-view-modal";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";
import ImageView from "../catalogue/image-view";

interface ProductRowProps {
  data: {
    _id: string;
    name: { en: string; ar: string };
    localImage?: string;
    variants: {
      unit: string;
      status: string;
      prices: { price: string }[];
      stocks: {
        enabledAvailability: boolean;
        enabledTracking: boolean;
        stockCount: number;
        enabledLowStockAlert: boolean;
        lowStockCount: number;
      }[];
    }[];
    category: { name: string };
    status: string;
    modifiers: [];
  };
  // channel: string;
  negativeBilling: boolean;
  handleOnPress: (data: any) => void;
}

const CollectionProductRow: React.FC<ProductRowProps> = ({
  data,
  // channel,
  negativeBilling,
  handleOnPress,
}) => {
  const isRTL = checkDirection();
  const { wp, hp } = useResponsive();

  if (data?.variants?.length === 0) {
    return <></>;
  }

  const product = useMemo(() => {
    const stocks = data.variants[0].stocks?.[0];
    const available = stocks ? stocks.enabledAvailability : true;
    const tracking = stocks ? stocks.enabledTracking : false;
    const stockCount = stocks?.stockCount;
    const lowStockAlert = stocks ? stocks.enabledLowStockAlert : false;
    const lowStockCount = stocks?.lowStockCount;

    let availabilityText = "";
    let textColor = "text.primary";
    let notBillingProduct = false;
    let activeModifiers = false;

    if (!available || (tracking && stockCount <= 0)) {
      availabilityText = t("Out of Stock");
      textColor = "red.default";
      notBillingProduct = !negativeBilling;
    } else if (lowStockAlert && stockCount <= lowStockCount) {
      availabilityText = t("Running Low");
      textColor = "#F58634";
    }

    if (data.variants?.length === 1 && !negativeBilling) {
      notBillingProduct = !available || (tracking && stockCount <= 0);
    }

    const activeModifiersList = data?.modifiers?.filter(
      (modifier: any) => modifier.status === "active"
    );

    activeModifiers = activeModifiersList?.length > 0;

    return { availabilityText, textColor, notBillingProduct, activeModifiers };
  }, [data, negativeBilling]);

  return (
    <Pressable
      style={{
        paddingVertical: hp("2%"),
        paddingHorizontal: hp("2.25%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        borderStyle: "dashed",
      }}
      onPress={() => {
        if (product.notBillingProduct) {
          showToast("error", t("Looks like the item is out of stock"));
        } else {
          handleOnPress({ ...data, negativeBilling: negativeBilling });
        }
        Keyboard.dismiss();
      }}
    >
      <View
        style={{
          width: "65%",
          marginRight: "12%",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <ImageView data={data} />
        <View style={{ marginHorizontal: wp("1.35%") }}>
          <DefaultText fontSize="lg" fontWeight="medium">
            {isRTL ? data.name.ar : data.name.en}
          </DefaultText>

          {data.modifiers?.length > 0 && product.activeModifiers && (
            <DefaultText style={{ marginTop: 3, fontSize: 11 }}>
              {t("Customisable")}
            </DefaultText>
          )}

          {data.variants.length === 1 && product.availabilityText && (
            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="md"
              color={product.textColor}
            >
              {product.availabilityText}
            </DefaultText>
          )}
        </View>
      </View>

      <View style={{ width: "23%" }}>
        {data.variants?.length > 1 ? (
          <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
            {`${data.variants.length} ${t("Variants")}`}
          </DefaultText>
        ) : data.variants[0]?.prices?.[0]?.price ? (
          <View style={{ alignItems: "flex-end" }}>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <CurrencyView
                amount={Number(data.variants[0].prices[0].price)?.toFixed(2)}
              />

              <DefaultText fontSize="sm" fontWeight="medium">
                {getUnitName[data.variants[0].unit]}
              </DefaultText>
            </View>
          </View>
        ) : (
          <View style={{ alignSelf: "flex-end" }}>
            <View
              style={{
                flexDirection: isRTL ? "row-reverse" : "row",
                alignItems: "flex-end",
              }}
            >
              <DefaultText style={{ alignSelf: "flex-end" }} fontSize="2xl">
                {t("Custom")}
              </DefaultText>

              <DefaultText fontSize="sm" fontWeight="medium">
                {getUnitName[data?.variants?.[0]?.unit]}
              </DefaultText>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default CollectionProductRow;
