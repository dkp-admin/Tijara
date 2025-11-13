import { FormikProps, useFormik } from "formik";
import React, { useContext, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import Toast from "react-native-toast-message";
import * as Yup from "yup";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import { PrimaryButton } from "../buttons/primary-button";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import showToast from "../toast";
import repository from "../../db/repository";
import { CashDrawerTransaction } from "../../db/schema/cashdrawer-txn";

type CancelOnlineProps = {
  openOrders: boolean;
  otherOrders: boolean;
};

export default function CancelOnlineOrder({
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
  const authContext = useContext(AuthContext) as any;
  const deviceContext = useContext(DeviceContext) as any;

  const formik: FormikProps<CancelOnlineProps> = useFormik<CancelOnlineProps>({
    initialValues: {
      openOrders: false,
      otherOrders: false,
    },

    onSubmit: async (values) => {
      if (values.openOrders || values.otherOrders) {
        const openOrderIds = data?.openOrders?.map((order: any) => {
          return order._id;
        });

        const otherOrderIds = data?.otherOrders?.map((order: any) => {
          return order._id;
        });

        const dataObj =
          values.openOrders && values.otherOrders
            ? [...openOrderIds, ...otherOrderIds]
            : values.openOrders
            ? openOrderIds
            : otherOrderIds;

        await serviceCaller(endpoint.onlineOrderingCancel.path, {
          method: endpoint.onlineOrderingCancel.method,
          body: { refs: dataObj },
        });
      }

      const cashDrawerTxn: any =
        await repository.cashDrawerTxnRepository.findLatestByCompanyRef(
          deviceContext.user.companyRef
        );

      const businessData: any = await repository.business.findByLocationId(
        deviceContext?.user?.locationRef
      );

      const salesRefundedAmount = Number(
        MMKVDB.get(DBKeys.SALES_REFUNDED_AMOUNT) || "0"
      );

      try {
        const cashDrawerData: CashDrawerTransaction = {
          _id: objectId(),
          userRef: authContext.user._id,
          user: { name: authContext.user.name },
          location: { name: businessData.location.name.en },
          locationRef: businessData.location._id,
          company: { name: businessData.company.name.en },
          companyRef: businessData.company._id,
          openingActual: undefined,
          openingExpected: undefined,
          closingActual: undefined,
          closingExpected: undefined,
          difference: undefined,
          totalSales: data.sales - salesRefundedAmount,
          transactionType: "close",
          description: "Cash Drawer Close",
          shiftIn: false,
          dayEnd: true,
          started: cashDrawerTxn?.started || new Date(),
          ended: new Date(),
          source: "local",
        };

        await repository.cashDrawerTxnRepository.create(cashDrawerData);

        // const dataObj = {
        //   name: { en: "Shift end sales", ar: "Shift end sales" },
        //   date: new Date()?.toISOString(),
        //   reason: "sales",
        //   companyRef: authContext.user.companyRef,
        //   company: { name: authContext.user.company.name },
        //   locationRef: authContext.user.locationRef,
        //   location: { name: authContext.user.location.name },
        //   transactionType: "credit",
        //   userRef: authContext.user._id,
        //   user: {
        //     name: authContext.user.name,
        //     type: authContext.user.userType,
        //   },
        //   deviceRef: deviceContext.user.deviceRef,
        //   device: { deviceCode: deviceContext.user.phone },
        //   referenceNumber: "",
        //   fileUrl: [],
        //   transactions: [
        //     {
        //       paymentMethod: "all",
        //       amount: data.sales - salesRefundedAmount,
        //     },
        //   ],
        //   description: "",
        //   paymentDate: new Date()?.toISOString(),
        //   status: "received",
        // };

        // try {
        //   const res = await serviceCaller(endpoint.miscExpensesCreate.path, {
        //     method: endpoint.miscExpensesCreate.method,
        //     body: { ...dataObj },
        //   });

        //   if (res !== null || res?.code === "success") {

        //   }
        // } catch (err: any) {

        // }

        const printTemplate =
          await repository.printTemplateRepository.findByLocation(
            deviceContext?.user?.locationRef
          );

        if (printTemplate?.[0]?.resetCounterDaily) {
          MMKVDB.set(DBKeys.ORDER_TOKEN, `1`);
        }

        MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");

        handleLogout();
      } catch (error: any) {}
    },

    validationSchema: Yup.object({}),
  });

  const handleLogout = async () => {
    MMKVDB.remove(DBKeys.USER);
    MMKVDB.remove(DBKeys.USERTYPE);
    MMKVDB.remove(DBKeys.USER_PERMISSIONS);

    authContext.logout();

    showToast("success", t("Logout successfully!"));
  };

  const getOpenOrderNumber = () => {
    const orderNum = data?.openOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  const getOtherOrderNumber = () => {
    const orderNum = data?.otherOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  useEffect(() => {
    formik.resetForm();
  }, [visible]);

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
            title={t("Day End")}
            rightBtnText={""}
            handleLeftBtn={() => {
              formik.resetForm();
              handleClose();
            }}
            permission={true}
          />

          <KeyboardAvoidingView
            enabled={true}
            behavior={"height"}
            keyboardVerticalOffset={Platform.OS == "ios" ? 50 : 20}
          >
            <ScrollView
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingVertical: hp("3%"),
                paddingHorizontal: hp("2.5%"),
              }}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color={theme.colors.otherGrey[100]}
              >
                {`${t("Note")}: ${t(
                  "Please choose the order option(s) to cancel the orders within it before day end"
                )}.`}
              </DefaultText>

              {data?.openOrders?.length > 0 && (
                <View style={{ marginTop: hp("4%") }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      formik.setFieldValue(
                        "openOrders",
                        !formik.values.openOrders
                      )
                    }
                  >
                    <Checkbox
                      isChecked={formik.values.openOrders}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.openOrders ? (
                          <ICONS.TickFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.TickEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {t("Open Orders: All the open orders are listed here")}
                    </DefaultText>
                  </TouchableOpacity>

                  <View
                    style={{
                      borderRadius: 8,
                      marginTop: hp("2.5%"),
                      paddingVertical: hp("2%"),
                      paddingHorizontal: hp("1.75%"),
                      backgroundColor: theme.colors.bgColor2,
                    }}
                  >
                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {getOpenOrderNumber()}
                    </DefaultText>
                  </View>
                </View>
              )}

              {data?.otherOrders?.length > 0 && (
                <View style={{ marginTop: hp("4%") }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() =>
                      formik.setFieldValue(
                        "otherOrders",
                        !formik.values.otherOrders
                      )
                    }
                  >
                    <Checkbox
                      isChecked={formik.values.otherOrders}
                      fillColor={theme.colors.white[1000]}
                      unfillColor={theme.colors.white[1000]}
                      iconComponent={
                        formik.values.otherOrders ? (
                          <ICONS.TickFilledIcon
                            color={theme.colors.primary[1000]}
                          />
                        ) : (
                          <ICONS.TickEmptyIcon
                            color={theme.colors.primary[1000]}
                          />
                        )
                      }
                      disableBuiltInState
                      disabled
                    />

                    <DefaultText
                      style={{ marginLeft: wp("0.5%") }}
                      fontSize="xl"
                    >
                      {t(
                        "Ongoing Orders: All the ongoing orders are listed here"
                      )}
                    </DefaultText>
                  </TouchableOpacity>

                  <View
                    style={{
                      borderRadius: 8,
                      marginTop: hp("2.5%"),
                      paddingVertical: hp("2%"),
                      paddingHorizontal: hp("1.75%"),
                      backgroundColor: theme.colors.bgColor2,
                    }}
                  >
                    <DefaultText fontSize="xl">
                      {getOtherOrderNumber()}
                    </DefaultText>
                  </View>
                </View>
              )}

              {formik.values.openOrders && formik.values.otherOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the open & ongoing orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : formik.values.openOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the open orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : formik.values.otherOrders ? (
                <DefaultText
                  style={{ marginTop: hp("4%") }}
                  fontSize="lg"
                  fontWeight="medium"
                  color={theme.colors.otherGrey[100]}
                >
                  {`${t("Note")}: ${t(
                    "All the ongoing orders would be cancelled"
                  )}.`}
                </DefaultText>
              ) : (
                <></>
              )}

              <Spacer space={hp("15%")} />
            </ScrollView>
          </KeyboardAvoidingView>

          <View
            style={{
              bottom: 0,
              width: "100%",
              position: "absolute",
              paddingBottom: hp("2.5%"),
              backgroundColor: theme.colors.bgColor,
            }}
          >
            <View
              style={{
                overflow: "hidden",
                marginTop: hp("0.5%"),
                marginBottom: hp("2%"),
                marginHorizontal: -wp("5%"),
                height: 1,
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />

            <PrimaryButton
              style={{
                width: twoPaneView ? "50%" : "90%",
                alignSelf: "center",
                paddingVertical: hp("2.25%"),
                paddingHorizontal: wp("1.5%"),
              }}
              textStyle={{
                fontSize: 16,
                fontWeight: theme.fontWeights.medium,
                fontFamily: theme.fonts.circulatStd,
              }}
              loading={formik.isSubmitting}
              title={
                data.isEndShift
                  ? t("End Shift and logout")
                  : t("Day end and logout")
              }
              onPress={() => {
                formik.handleSubmit();
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
  container: { overflow: "hidden", height: "100%" },
});
