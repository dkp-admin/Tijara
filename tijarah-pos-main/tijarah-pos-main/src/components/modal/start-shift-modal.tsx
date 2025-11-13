import React, { useContext, useEffect, useState } from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { t } from "../../../i18n";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkKeyboardState } from "../../hooks/use-keyboard-state";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import { getErrorMsg } from "../../utils/common-error-msg";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import { PrimaryButton } from "../buttons/primary-button";
import AmountInput from "../input/amount-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";

export default function StartShiftModal({
  defaultCash = 0,
  visible = false,
  handleClose,
}: {
  defaultCash: number;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isKeyboardVisible = checkKeyboardState();
  const authContext = useContext(AuthContext) as any;

  const { hp, wp } = useResponsive();

  const [amount, setAmount] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [difference, setDifference] = useState(0);
  const [availableSystemAmount, setAvailableSystemAmount] = useState("0");

  const handleSubmit = async () => {
    if (amount == -1) {
      showToast("error", t("Please enter actual cash available"));
      return;
    }

    setLoading(true);

    try {
      const businessDetails: any = await repo.business.findOne({
        where: { _id: authContext.user.locationRef },
      });

      debugLog(
        "Create cash drawer txn",
        {},
        "start-shift-modal",
        "handleSubmitFunction"
      );

      const cashDrawerTxn: any = await repo.cashDrawerTxn.findOne({
        where: { companyRef: authContext.user.companyRef },
        order: { _id: "DESC" },
      });

      const cashTxnData = {
        _id: objectId(),
        userRef: authContext.user._id,
        user: { name: authContext.user.name },
        location: { name: businessDetails.location.name.en },
        locationRef: businessDetails.location._id,
        company: { name: businessDetails.company.name.en },
        companyRef: businessDetails.company._id,
        openingActual: amount,
        openingExpected: Number(availableSystemAmount),
        closingActual: undefined,
        closingExpected: undefined,
        totalSales: undefined,
        difference: difference,
        transactionType: "open",
        description: "Cash Drawer Open",
        shiftIn: true,
        dayEnd: false,
        started: new Date(),
        ended: cashDrawerTxn?.ended || new Date(),
        source: "local",
      };

      await repo.cashDrawerTxn.insert(cashTxnData as any);

      debugLog(
        "Cash drawer txn created",
        cashTxnData,
        "start-shift-modal",
        "handleSubmitFunction"
      );

      MMKVDB.set(DBKeys.CASH_DRAWER, "close");
      MMKVDB.set(DBKeys.TOTAL_REFUNDED_AMOUNT, "0");
      MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");

      handleClose();
      showToast("success", t("Shift Started"));
    } catch (err) {
      debugLog(
        "Cash drawer txn creation failed",
        err,
        "start-shift-modal",
        "handleSubmitFunction"
      );
      showToast("error", getErrorMsg("cash-drawer-txn", "create"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    debugLog(
      "User logout",
      authContext.user,
      "start-shift-modal",
      "handleLogoutFunction"
    );

    MMKVDB.remove(DBKeys.USER);
    MMKVDB.remove(DBKeys.USERTYPE);
    MMKVDB.remove(DBKeys.USER_PERMISSIONS);

    authContext.logout();

    showToast("success", t("Logout successfully!"));
  };

  useEffect(() => {
    const systemCash = MMKVDB.get(DBKeys.SYSTEM_AVAILABLE_CASH);

    setAmount(-1);
    setAvailableSystemAmount(Number(systemCash || defaultCash)?.toFixed(2));
  }, [visible, defaultCash]);

  useEffect(() => {
    const diff = amount - Number(availableSystemAmount);

    setDifference(diff);
  }, [amount, availableSystemAmount]);

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
          marginTop: isKeyboardVisible ? "-12%" : "0%",
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
            <DefaultText
              style={{ fontSize: 20, maxWidth: "80%" }}
              fontWeight="medium"
            >
              {t("Shift in - Start Cash Drawer")}
            </DefaultText>

            <TouchableOpacity
              onPress={() => {
                handleClose();
                handleLogout();
              }}
            >
              <ICONS.ClosedFilledIcon />
            </TouchableOpacity>
          </View>

          <View
            style={{
              height: 1,
              marginVertical: hp("1.5%"),
              backgroundColor: theme.colors.dividerColor.main,
            }}
          />

          <View style={{ marginTop: 3, paddingHorizontal: hp("2%") }}>
            <DefaultText fontSize="lg" fontWeight="medium">
              {`${t("Available as per system")}.`}
            </DefaultText>

            <View
              style={{
                marginTop: 5,
                flexDirection: "row",
                alignItems: "baseline",
              }}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="otherGrey.100"
              >
                {t("SAR")}
              </DefaultText>

              <Spacer space={5} />

              <DefaultText fontSize="2xl" fontWeight="medium">
                {availableSystemAmount}
              </DefaultText>
            </View>

            <ItemDivider
              style={{
                margin: 0,
                borderWidth: 0,
                marginVertical: hp("1.75%"),
                borderColor: "#C2C2C2",
              }}
            />

            <AmountInput
              containerStyle={{ backgroundColor: "#8A959E1A" }}
              style={{
                width: "100%",
                fontSize: theme.fontSizes["2xl"],
                fontWeight: theme.fontWeights.medium,
              }}
              label={`${t("ACTUAL CASH AVAILABLE")} (${t("in")} ${t("SAR")})`}
              maxLength={18}
              placeholderText={"0.00"}
              values={amount == -1 ? "" : `${amount}`}
              handleChange={(val: any) => {
                setAmount(val);
              }}
            />

            {amount >= 0 && (
              <>
                <ItemDivider
                  style={{
                    margin: 0,
                    borderWidth: 0,
                    marginTop: hp("2.25%"),
                    marginBottom: hp("1.5%"),
                    borderColor: "#C2C2C2",
                  }}
                />

                <DefaultText fontSize="lg" fontWeight="medium">
                  {t("Difference")}
                </DefaultText>

                <View
                  style={{
                    marginTop: 5,
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <DefaultText
                    fontSize="lg"
                    fontWeight="medium"
                    color="otherGrey.100"
                  >
                    {t("SAR")}
                  </DefaultText>

                  <Spacer space={5} />

                  <DefaultText
                    fontSize="2xl"
                    fontWeight="medium"
                    color={
                      difference == 0
                        ? theme.colors.otherGrey[100]
                        : difference > 0
                        ? theme.colors.primary[1000]
                        : theme.colors.red.default
                    }
                  >
                    {difference == 0
                      ? difference?.toFixed(2)
                      : difference > 0
                      ? `+${difference.toFixed(2)}`
                      : `${difference.toFixed(2)}`}
                  </DefaultText>
                </View>
              </>
            )}

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
              title={t("Start")}
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
