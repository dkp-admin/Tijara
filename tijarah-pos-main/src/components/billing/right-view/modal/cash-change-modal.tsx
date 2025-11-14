import React, { useContext, useMemo, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { t } from "../../../../../i18n";
import AuthContext from "../../../../context/auth-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import usePrinterStatus from "../../../../hooks/use-printer-status";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import useCartStore from "../../../../store/cart-item";
import { AuthType } from "../../../../types/auth-types";
import ICONS from "../../../../utils/icons";
import ActionSheetHeader from "../../../action-sheet/action-sheet-header";
import { PrimaryButton } from "../../../buttons/primary-button";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import PrintPreviewModal from "../../print-preview/print-preview";
import SendReceiptModal from "../../send-receipt/send-receipt";

export default function CashChangeModal({
  data,
  visible = false,
  handleClose,
  handleSendReceipt,
  handlePrintReceipt,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleSendReceipt?: any;
  handlePrintReceipt?: any;
}) {
  const theme = useTheme();
  const isConnected = checkInternet();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);
  const { isConnected: isPrinterConnected } = usePrinterStatus();
  const [showWebView, setShowWebView] = useState(false);
  const [showSendReceipt, setShowSendReceipt] = useState(false);
  const [previewData] = useState<any>(null);

  const totalPaid = useMemo(
    () =>
      data?.payment?.breakup?.reduce(
        (prev: number, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const totalCharges = useMemo(
    () =>
      data?.payment?.charges?.reduce(
        (prev: number, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const total = useMemo(() => {
    if (data?.items?.length > 0) {
      return data.items.reduce((prev: number, cur: any) => {
        if (!cur?.isFree) {
          return Number(
            prev +
              Number(Number(cur?.discountedTotal || cur.total || 0)?.toFixed(2))
          );
        }
      }, 0);
    }
    return 0;
  }, [data]);

  const { setOrder, setLastOrder } = useCartStore();

  useMemo(() => {
    if (data) {
      setLastOrder(data);
    }
  }, [data]);

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
            title={""}
            handleLeftBtn={() => {
              setOrder({});
              handleClose();
            }}
            isDivider={false}
          />

          <View
            style={{
              paddingVertical: hp("3%"),
              paddingHorizontal: hp("2.5%"),
            }}
          >
            <DefaultText
              style={{ textAlign: "center" }}
              fontSize="lg"
              fontWeight="normal"
              color={"otherGrey.100"}
            >
              {"#" + data?.orderNum}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: 12,
                fontSize: 22,
                marginBottom: hp("11%"),
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {t("Completed")}
            </DefaultText>

            <DefaultText
              style={{
                fontSize: 40,
                textAlign: "center",
              }}
              fontWeight="medium"
            >
              {Number(totalPaid) - Number((total + totalCharges)?.toFixed(2))
                ? `${t("SAR")} ${(totalPaid - (total + totalCharges)).toFixed(
                    2
                  )} ${t("Change")}`
                : t("No Change")}
            </DefaultText>

            <DefaultText
              style={{
                marginTop: hp("4%"),
                fontSize: 24,
                marginBottom: hp("20.75%"),
                textAlign: "center",
              }}
              fontWeight="normal"
            >
              {`${t("out of")} ${t("SAR")} ${totalPaid?.toFixed(2)}`}
            </DefaultText>

            <PrimaryButton
              style={{
                paddingVertical: hp("2.25%"),
              }}
              textStyle={{
                fontSize: 20,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              title={t("New Sale")}
              onPress={() => {
                EventRegister.emit("cart-refresh", []);
                setOrder({});
                handleClose();
              }}
            />

            <View
              style={{
                marginTop: hp("3.75%"),
                flexDirection: "row",
              }}
            >
              <View style={{ flex: 1 }}>
                <PrimaryButton
                  reverse
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.["send-receipt"] &&
                      isConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  leftIcon={
                    <ICONS.SendReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.["send-receipt"] &&
                        isConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Send Receipt")}
                  onPress={() => {
                    setShowSendReceipt(true);
                  }}
                  disabled={
                    !authContext.permission["pos:order"]?.["send-receipt"] ||
                    !isConnected
                  }
                />
              </View>

              <Spacer space={wp("2.5%")} />

              <View style={{ flex: 1 }}>
                <PrimaryButton
                  disabled={
                    !authContext.permission["pos:order"]?.print ||
                    !isPrinterConnected
                  }
                  reverse
                  textStyle={{
                    fontSize: 20,
                    marginLeft: 12,
                    fontWeight: theme.fontWeights.medium,
                    fontFamily: theme.fonts.circulatStd,
                    color:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[1000]
                        : theme.colors.otherGrey[200],
                  }}
                  style={{
                    paddingVertical: hp("1.5%"),
                    backgroundColor:
                      authContext.permission["pos:order"]?.print &&
                      isPrinterConnected
                        ? theme.colors.primary[200]
                        : theme.colors.dividerColor.main,
                  }}
                  leftIcon={
                    <ICONS.ReprintReceiptIcon
                      color={
                        authContext.permission["pos:order"]?.print &&
                        isPrinterConnected
                          ? theme.colors.primary[1000]
                          : theme.colors.otherGrey[200]
                      }
                    />
                  }
                  title={t("Reprint Receipt")}
                  onPress={() => {
                    handlePrintReceipt({
                      ...data,
                    });
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <PrintPreviewModal
        data={previewData}
        visible={showWebView}
        handleClose={() => setShowWebView(false)}
      />

      {/*TODO: Get These values from order */}

      <SendReceiptModal
        data={data}
        customer={{}}
        visible={showSendReceipt}
        handleClose={() => setShowSendReceipt(false)}
      />

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
