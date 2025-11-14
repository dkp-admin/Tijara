import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import { queryClient } from "../../query-client";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { getErrorMsg } from "../../utils/common-error-msg";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import { PrimaryButton } from "../buttons/primary-button";
import AmountInput from "../input/amount-input";
import DefaultText from "../text/Text";
import showToast from "../toast";

export default function StartingCashModal({
  data,
  visible = false,
  handleClose,
  handleCashManagement,
  setSeed = () => {},
  seed = false,
}: {
  data: any;
  visible: boolean;
  handleClose?: any;
  handleCashManagement?: any;
  setSeed?: any;
  seed?: boolean;
}) {
  const theme = useTheme();
  const isKeyboardVisible = checkKeyboardState();

  const { hp, wp } = useResponsive();

  const [amount, setAmount] = useState<string>("0");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      await repo.billingSettings.update(
        { _id: data?._id },
        {
          ...data,
          cashManagement: true,
          defaultCash: Number(amount),
        }
      );
      debugLog(
        "Billing settings updated to db",
        {
          ...data,
          cashManagement: true,
          defaultCash: Number(amount),
        },
        "setting-billing-screen",
        "handleSubmitCashModal"
      );
      await queryClient.invalidateQueries("find-billing-settings");
      setSeed(!seed);

      MMKVDB.set(DBKeys.CASH_DRAWER, "open");

      handleCashManagement(Number(amount));
      showToast("success", t("Starting Cash Updated"));
    } catch (err: any) {
      errorLog(
        err?.message,
        data,
        "setting-billing-screen",
        "handleSubmitCashModal",
        err
      );
      showToast("error", getErrorMsg("billing-settings", "update"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAmount("0");
  }, [visible]);

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
          marginTop: isKeyboardVisible ? "-10%" : "0%",
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            overflow: "hidden",
            width: hp("42%"),
            borderRadius: 16,
            paddingVertical: hp("2%"),
            backgroundColor: theme.colors.white[1000],
          }}
        >
          <View
            style={{
              paddingHorizontal: hp("2%"),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <DefaultText style={{ fontSize: 20 }} fontWeight="medium">
              {t("Cash management")}
            </DefaultText>

            <TouchableOpacity
              onPress={() => {
                handleClose();
              }}
            >
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              marginTop: hp("1.25%"),
              marginBottom: hp("2%"),
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ marginTop: 3, paddingHorizontal: hp("2%") }}>
            <AmountInput
              containerStyle={{ backgroundColor: "#8A959E1A" }}
              style={{
                width: "100%",
                fontSize: theme.fontSizes["2xl"],
                fontWeight: theme.fontWeights.medium,
              }}
              label={`${t("STARTING CASH")} (${t("in")} ${t("SAR")})`}
              maxLength={18}
              placeholderText={"0.00"}
              values={amount}
              handleChange={(val: any) => {
                setAmount(val);
              }}
            />

            <View
              style={{
                overflow: "hidden",
                marginVertical: hp("2%"),
                marginHorizontal: -wp("5%"),
                height: 1,
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: "100%",
                alignSelf: "center",
                paddingVertical: hp("2.25%"),
                paddingHorizontal: wp("1.8%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              loading={loading}
              title={t("Submit")}
              onPress={() => {
                handleSubmit();
              }}
            />
          </View>
        </View>
      </View>

      <Toast />
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
