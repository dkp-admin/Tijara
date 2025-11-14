import React, { useMemo, useState } from "react";
import {
  Keyboard,
  Platform,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { getUnitName } from "../../utils/constants";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import ImageView from "../billing/left-view/catalogue/image-view";
import CurrencyView from "../modal/currency-view-modal";
import DefaultText from "../text/Text";
import showToast from "../toast";
import AddEditProductModal from "./add-product-modal";

interface ProductRowProps {
  data: {
    _id: string;
    name: {
      en: string;
      ar: string;
    };
    localImage?: string;
    variants: {
      unit: string;
      status: string;
      prices: { price: string }[];
      stocks: { enabledTracking: boolean; stockCount: number }[];
    }[];
    category: {
      name: string;
    };
    status: string;
  };
}

const ProductRow: React.FC<ProductRowProps> = ({ data }) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();

  if (data?.variants?.length === 0) {
    return <></>;
  }

  const [visibleProduct, setVisibleProduct] = useState(false);

  const getTotalStockCount = useMemo(() => {
    let count = "-";

    if (data.variants?.length > 1) {
      const stockCount = data.variants.reduce((prev: number, variant: any) => {
        if (variant?.stocks?.length === 0) return;
        if (!variant?.stocks?.[0]?.enabledTracking) return prev;

        return (
          prev +
          variant?.stocks.reduce(
            (acc: number, stock: any) => acc + Number(stock.stockCount),
            0
          )
        );
      }, 0);

      count = stockCount ? `${stockCount}` : "-";
    } else {
      const stock = data.variants[0]?.stocks?.[0];
      count =
        stock?.enabledTracking && stock?.stockCount
          ? `${stock.stockCount}`
          : "-";
    }

    return count;
  }, [data]);

  return (
    <>
      <TouchableOpacity
        style={{
          padding: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
          borderStyle: "dashed",
        }}
        onPress={() => {
          debugLog(
            "Add product modal opened",
            data,
            "catalogue-products-screen",
            "handleEditProduct"
          );
          setVisibleProduct(true);
          Keyboard.dismiss();
        }}
      >
        <View
          style={{
            width: twoPaneView ? "48%" : "63%",
            marginRight: "7%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <ImageView data={data} />

          <View style={{ marginHorizontal: hp("1.5%") }}>
            <DefaultText fontSize="lg">{data.name.en}</DefaultText>

            <DefaultText
              style={{ marginTop: 5 }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.name.ar}
            </DefaultText>
          </View>
        </View>

        {twoPaneView && (
          <>
            <DefaultText
              style={{ width: "8%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="medium"
            >
              {getTotalStockCount}
            </DefaultText>

            <View style={{ width: "6%", marginRight: "2%" }}>
              <Switch
                style={{
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                      : [{ scaleX: 1 }, { scaleY: 1 }],
                  height: hp("5%"),
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: "#34C759",
                }}
                thumbColor={theme.colors.white[1000]}
                value={data.status === "active"}
                onValueChange={() => {
                  showToast("info", t("Manage this from merchant panel"));
                }}
              />
            </View>
          </>
        )}

        <View style={{ width: twoPaneView ? "20%" : "23%" }}>
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
                  amount={Number(data.variants[0].prices?.[0]?.price)?.toFixed(
                    2
                  )}
                />

                <DefaultText fontSize="sm" fontWeight="medium">
                  {getUnitName[data?.variants?.[0]?.unit]}
                </DefaultText>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: "flex-end" }}>
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
                  {getUnitName[data.variants?.[0]?.unit]}
                </DefaultText>
              </View>
            </View>
          )}
        </View>

        <View
          style={{
            width: "7%",
            marginLeft: wp("2.5%"),
            marginRight: wp("2%"),
            alignItems: isRTL ? "flex-end" : "flex-start",
            transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
          }}
        >
          <ICONS.RightArrowBoldIcon />
        </View>
      </TouchableOpacity>

      {visibleProduct && (
        <AddEditProductModal
          data={{
            title: isRTL ? data.name.ar : data.name.en,
            product: data,
          }}
          visible={visibleProduct}
          key="edit-product"
          handleSaveProduct={() => {
            debugLog(
              "Add product modal closed",
              {},
              "catalogue-products-screen",
              "handleClose"
            );
            setVisibleProduct(false);
          }}
          handleClose={() => {
            debugLog(
              "Add product modal closed",
              {},
              "catalogue-products-screen",
              "handleClose"
            );
            setVisibleProduct(false);
          }}
        />
      )}
    </>
  );
};

export default React.memo(ProductRow);
