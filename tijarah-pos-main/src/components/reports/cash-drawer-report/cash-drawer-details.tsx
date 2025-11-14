import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function CashDrawerDetailsModal({
  data,
  visible = false,
  handleClose,
}: {
  data: any;
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp, wp, twoPaneView } = useResponsive();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}
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
            width: "90%",
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("1.5%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("Cash Drawer Details")}
            </DefaultText>

            <TouchableOpacity onPress={() => handleClose()}>
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              marginTop: hp("1.5%"),
              marginBottom: hp("2%"),
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ paddingHorizontal: hp("1.5%") }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("OPENING EXPECTED")}:- `}
              </DefaultText>

              <View>
                {data?.openExpected ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText fontSize="2xl" fontWeight="medium">
                      {data.openExpected?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: hp("1.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("OPENING ACTUAL")}:- `}
              </DefaultText>

              <View>
                {data?.openActual ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText fontSize="2xl" fontWeight="medium">
                      {data.openActual?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: hp("1.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("CLOSING EXPECTED")}:- `}
              </DefaultText>

              <View>
                {data?.closeExpected ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText fontSize="2xl" fontWeight="medium">
                      {data.closeExpected?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: hp("1.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("CLOSING ACTUAL")}:- `}
              </DefaultText>

              <View>
                {data?.closeActual ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText fontSize="2xl" fontWeight="medium">
                      {data.closeActual?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: hp("1.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText fontSize="lg" fontWeight="medium">{`${t(
                "Difference"
              )}:- `}</DefaultText>

              <View>
                {data?.close ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText
                      fontSize="md"
                      fontWeight="medium"
                      color={
                        data.closeDifference < 0
                          ? theme.colors.red.default
                          : theme.colors.text.primary
                      }
                    >
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText
                      fontSize="2xl"
                      fontWeight="medium"
                      color={
                        data.closeDifference < 0
                          ? theme.colors.red.default
                          : theme.colors.text.primary
                      }
                    >
                      {data.close.closeDifference?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>

            <View
              style={{
                marginTop: hp("1.5%"),
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <DefaultText
                style={{ textTransform: "capitalize" }}
                fontSize="lg"
                fontWeight="medium"
              >
                {`${t("TOTAL SALES")}:- `}
              </DefaultText>

              <View>
                {data?.totalSales ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                    }}
                  >
                    <DefaultText fontSize="md" fontWeight="medium">
                      {`${t("SAR")} `}
                    </DefaultText>

                    <DefaultText fontSize="2xl" fontWeight="medium">
                      {data.totalSales?.toFixed(2)}
                    </DefaultText>
                  </View>
                ) : (
                  <DefaultText fontSize="xl" fontWeight="medium">
                    {"NA"}
                  </DefaultText>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
});
