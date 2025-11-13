import React from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import { useTheme } from "../../../../context/theme-context";
import { checkDirection } from "../../../../hooks/check-direction";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { PRODUCT_PLACEHOLDER, getUnitName } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import CurrencyView from "../../../modal/currency-view-modal";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";

export default function ProductDetailsModal({
  data,
  visible = false,
  handleClose,
  dinein = false,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
  dinein?: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const { hp, twoPaneView } = useResponsive();

  const getPreferenceName = () => {
    let name = "";

    data?.nutritionalInformation?.preference?.map((preference: any) => {
      name += `${name === "" ? "" : ","} ${preference}`;
    });

    return name;
  };

  const getContainsName = () => {
    let name = "";

    data?.nutritionalInformation?.contains?.map((contain: any) => {
      name += `${name === "" ? "" : ","} ${contain}`;
    });

    return name;
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Product Details")}
            handleLeftBtn={() => {
              handleClose();
            }}
          />

          <KeyboardAvoidingView enabled={true}>
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("2.25%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              {!twoPaneView &&
                isConnected &&
                (data?.localImage || data?.image) && (
                  <View style={{ alignItems: "center" }}>
                    <View
                      style={{
                        width: hp("60%"),
                        height: hp("45%"),
                        borderRadius: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <Image
                        resizeMode="cover"
                        style={{
                          width: hp("60%"),
                          height: hp("45%"),
                          borderRadius: 5,
                        }}
                        source={{
                          uri: data?.localImage || data?.image,
                        }}
                      />
                    </View>
                  </View>
                )}

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    width:
                      isConnected &&
                      twoPaneView &&
                      (data?.localImage || data?.image)
                        ? "60%"
                        : "100%",
                  }}
                >
                  {(data.contains || data.bestSeller) && (
                    <View
                      style={{
                        marginTop: twoPaneView ? 0 : hp("4%"),
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      {data.contains === "egg" ? (
                        <ICONS.EggIcon />
                      ) : data.contains === "non-veg" ? (
                        <ICONS.NonVegIcon />
                      ) : data.contains === "veg" ? (
                        <ICONS.VegIcon />
                      ) : (
                        <></>
                      )}

                      {data.bestSeller && (
                        <DefaultText
                          style={{
                            marginLeft: data.contains ? 8 : 0,
                          }}
                          fontSize="lg"
                          fontWeight="medium"
                          color="red.default"
                        >
                          {t("Bestseller")}
                        </DefaultText>
                      )}
                    </View>
                  )}

                  <DefaultText
                    style={{ marginTop: hp("1.5%") }}
                    fontSize="4xl"
                    fontWeight="medium"
                  >
                    {isRTL ? data.name.ar : data.name.en}
                  </DefaultText>

                  <View style={{ marginTop: hp("2%") }}>
                    {data.variants?.length > 1 ? (
                      <DefaultText fontSize="3xl" fontWeight="medium">
                        {`${data.variants.length} ${t("Variants")}`}
                      </DefaultText>
                    ) : Number(data.variants[0]?.prices?.[0]?.price) ? (
                      <View
                        style={{
                          alignItems: "baseline",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <CurrencyView
                          amount={Number(
                            data.variants[0].prices[0].price
                          )?.toFixed(2)}
                          symbolFontsize={18}
                          amountFontsize={26}
                          decimalFontsize={20}
                          symbolFontweight="medium"
                          amountFontweight="medium"
                          decimalFontweight="medium"
                        />

                        <DefaultText fontSize="md" fontWeight="medium">
                          {getUnitName[data.variants[0].unit]}
                        </DefaultText>
                      </View>
                    ) : (
                      <View
                        style={{
                          alignItems: "baseline",
                          flexDirection: isRTL ? "row-reverse" : "row",
                        }}
                      >
                        <DefaultText fontSize="3xl" fontWeight="medium">
                          {t("Custom")}
                        </DefaultText>

                        <DefaultText fontSize="md" fontWeight="medium">
                          {getUnitName[data?.variants?.[0]?.unit]}
                        </DefaultText>
                      </View>
                    )}

                    {data?.description && (
                      <DefaultText
                        style={{ marginTop: hp("3%") }}
                        fontSize="xl"
                      >
                        {data.description}
                      </DefaultText>
                    )}
                  </View>
                </View>

                {twoPaneView &&
                  isConnected &&
                  (data?.localImage || data?.image) && (
                    <View
                      style={{
                        width: hp("35%"),
                        height: hp("30%"),
                        borderRadius: 5,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <Image
                        resizeMode="cover"
                        style={{
                          width: hp("35%"),
                          height: hp("30%"),
                          borderRadius: 5,
                        }}
                        source={{
                          uri: data?.localImage || data?.image,
                        }}
                      />
                    </View>
                  )}
              </View>

              {(data?.nutritionalInformation?.calorieCount !== null ||
                data?.nutritionalInformation?.preference?.length > 0 ||
                data?.nutritionalInformation?.contains?.length > 0) && (
                <View style={{ marginTop: hp("5%") }}>
                  <DefaultText fontSize="3xl" fontWeight="medium">
                    {t("Nutritional Information")}
                  </DefaultText>

                  {data?.nutritionalInformation?.calorieCount !== null && (
                    <View
                      style={{
                        ...styles.view,
                        padding: hp("2%"),
                        marginTop: hp("2.5%"),
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText fontSize={twoPaneView ? "xl" : "lg"}>
                        {t("Calorie Count")}
                      </DefaultText>

                      <DefaultText
                        style={{ maxWidth: "65%" }}
                        fontSize={twoPaneView ? "2xl" : "xl"}
                        fontWeight="medium"
                      >
                        {`${data?.nutritionalInformation?.calorieCount} ${t(
                          "calories"
                        )}`}
                      </DefaultText>
                    </View>
                  )}

                  {data?.nutritionalInformation?.preference?.length > 0 && (
                    <View
                      style={{
                        ...styles.view,
                        padding: hp("2%"),
                        marginTop: hp("3%"),
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText
                        style={{ maxWidth: twoPaneView ? "30%" : "30%" }}
                        fontSize={twoPaneView ? "xl" : "lg"}
                      >
                        {t("Dietary Preferences")}
                      </DefaultText>

                      <DefaultText
                        style={{ maxWidth: twoPaneView ? "65%" : "65%" }}
                        fontSize={twoPaneView ? "2xl" : "xl"}
                        fontWeight="medium"
                      >
                        {getPreferenceName()}
                      </DefaultText>
                    </View>
                  )}

                  {data?.nutritionalInformation?.contains?.length > 0 && (
                    <View
                      style={{
                        ...styles.view,
                        padding: hp("2%"),
                        marginTop: hp("3%"),
                        backgroundColor: theme.colors.white[1000],
                      }}
                    >
                      <DefaultText
                        style={{ maxWidth: twoPaneView ? "30%" : "30%" }}
                        fontSize={twoPaneView ? "xl" : "lg"}
                      >
                        {t("Item Contains")}
                      </DefaultText>

                      <DefaultText
                        style={{ maxWidth: twoPaneView ? "65%" : "65%" }}
                        fontSize={twoPaneView ? "2xl" : "xl"}
                        fontWeight="medium"
                      >
                        {getContainsName()}
                      </DefaultText>
                    </View>
                  )}
                </View>
              )}

              <Spacer space={hp("10%")} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  view: {
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
