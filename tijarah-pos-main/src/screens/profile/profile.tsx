import { format } from "date-fns";
import * as Constants from "expo-constants";
import { default as React, useContext, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Between } from "typeorm";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { PrimaryButton } from "../../components/buttons/primary-button";
import CustomHeader from "../../components/common/custom-header";
import ProfilePicUploader from "../../components/profile-pic-uploader";
import EditProfile from "../../components/profile/edit-profile";
import EndShift from "../../components/profile/end-shift";
import ProfileDataRow from "../../components/profile/profile-row";
import Spacer from "../../components/spacer";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import DeviceContext from "../../context/device-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCartStore from "../../store/cart-item";
import { AuthType } from "../../types/auth-types";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import calculateCart from "../../utils/calculate-cart";
import cart from "../../utils/cart";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog, errorLog, infoLog } from "../../utils/log-patch";

const Profile = () => {
  const theme = useTheme();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);
  const deviceContext = useContext(DeviceContext) as any;
  const [cashDrawerTxn, setCashDrawerTxn] = useState() as any;

  const { hp, twoPaneView } = useResponsive();

  const { setCustomer, setCustomerRef } = useCartStore();

  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEndShift, setOpenEndShift] = useState(false);

  const updateProfilePic = async (uri: string) => {
    if (isConnected) {
      if (uri && uri != authContext.user.profilePicture) {
        try {
          const res = await serviceCaller(
            `${endpoint.updateUser.path}/${authContext.user._id}`,
            {
              method: endpoint.updateUser.method,
              body: {
                profilePicture: uri,
              },
            }
          );

          if (res) {
            debugLog(
              "Profile Picture Updated",
              res,
              "profile-screen",
              "updateProfilePicFunction"
            );
            MMKVDB.remove(DBKeys.USER);
            MMKVDB.set(DBKeys.USER, res);
            await repo.user.update(
              { _id: authContext.user._id },
              { profilePicture: uri, _id: authContext.user._id }
            );

            debugLog(
              "Updated user profile to db",
              { profilePicture: uri, _id: authContext.user._id },
              "profile-screen",
              "updateProfilePicFunction"
            );
            authContext.login({
              ...authContext.user,
              profilePicture: res.profilePicture,
            });

            showToast("success", t("Profile Picture Updated"));
          }
        } catch (error: any) {
          errorLog(
            error?.message,
            authContext.user,
            "profile-screen",
            "updateProfilePicFunction",
            error
          );
          showToast("error", error.message);
        }
      }
    } else {
      infoLog(
        "Internet not connected",
        { profilePicture: uri },
        "profile-screen",
        "updateProfilePicFunction"
      );
      showToast("info", t("Please connect with internet"));
    }
  };

  const handleLogout = async () => {
    debugLog(
      "User logout",
      authContext.user,
      "profile-screen",
      "handleLogoutFunction"
    );

    MMKVDB.remove(DBKeys.USER);
    MMKVDB.remove(DBKeys.USERTYPE);
    MMKVDB.remove(DBKeys.USER_PERMISSIONS);

    authContext.logout();

    showToast("success", t("Logout successfully!"));
  };

  const handleClearItems = () => {
    Alert.alert(
      t("Confirmation"),
      `${t("There is an open order in the cart")}. ${t(
        "Do you still want to shift end?"
      )}`,
      [
        {
          text: t("No"),
          onPress: () => {},
          style: "destructive",
        },
        {
          text: t("Yes"),
          onPress: async () => {
            debugLog(
              "Clear cart items",
              {},
              "profile-screen",
              "clearCartItemsAlert"
            );
            cart.clearCart();
            calculateCart();
            setCustomer({});
            setCustomerRef("");
            checkUpdateCashDrawer();
          },
        },
      ]
    );
  };

  const checkUpdateCashDrawer = async () => {
    const businessDetails: any = await repo.business.findOne({
      where: { _id: authContext.user.locationRef },
    });

    const openDrawer = MMKVDB.get(DBKeys.CASH_DRAWER) || "";

    if (openDrawer !== "close") {
      setLoading(true);

      let salesAmount = 0;

      const cashDrawerTxn: any = await repo.cashDrawerTxn.findOne({
        where: { companyRef: deviceContext.user.companyRef },
        order: { _id: "DESC" },
      });

      if (cashDrawerTxn) {
        const startDate = new Date(cashDrawerTxn.started);
        const endDate = new Date();

        const orders: any[] = await repo.order.find({
          where: [
            {
              deviceRef: deviceContext.user.deviceRef,
              createdAt: Between(startDate, endDate),
            },
            {
              deviceRef: deviceContext.user.deviceRef,
              acceptedAt: Between(startDate, endDate),
            },
          ],
        });

        salesAmount +=
          orders?.reduce((amount: number, order: any) => {
            return amount + calculatePaymentTotal(order.payment.breakup);
          }, 0) || 0;
      }

      const salesRefundedAmount = Number(
        MMKVDB.get(DBKeys.SALES_REFUNDED_AMOUNT) || "0"
      );

      try {
        const cashDrawerData = {
          _id: objectId(),
          userRef: authContext.user._id,
          user: { name: authContext.user.name },
          location: { name: businessDetails.location.name.en },
          locationRef: businessDetails.location._id,
          company: { name: businessDetails.company.name.en },
          companyRef: businessDetails.company._id,
          openingActual: undefined,
          openingExpected: undefined,
          closingActual: undefined,
          closingExpected: undefined,
          difference: undefined,
          totalSales: salesAmount - salesRefundedAmount,
          transactionType: "close",
          description: "Cash Drawer Close",
          shiftIn: false,
          dayEnd: false,
          started: cashDrawerTxn?.started || new Date(),
          ended: new Date(),
          source: "local",
        };

        await repo.cashDrawerTxn.insert(cashDrawerData as any);

        debugLog(
          "Cash drawer txn created",
          cashDrawerData,
          "profile-screen",
          "updateCashDrawerFunction"
        );

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
        //       amount: salesAmount - salesRefundedAmount,
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
        //     debugLog(
        //       "Shift end sales updated to server",
        //       res,
        //       "more-tab-screen",
        //       "updateCashDrawerFunction"
        //     );
        //   }
        // } catch (err: any) {
        //   errorLog(
        //     err?.code,
        //     dataObj,
        //     "more-tab-screen",
        //     "updateCashDrawerFunction",
        //     err
        //   );
        // }

        MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");

        handleLogout();
      } catch (error: any) {
        debugLog(
          "Cash drawer txn creation failed",
          error,
          "profile-screen",
          "updateCashDrawerFunction"
        );
      } finally {
        setLoading(false);
      }
    } else {
      setOpenEndShift(true);
    }
  };

  function calculatePaymentTotal(breakup: any): number {
    return breakup.reduce((total: number, payment: any) => {
      const change = Math.max(payment.change || 0, 0);
      return total + Number(payment.total || 0) - change || 0;
    }, 0);
  }

  useEffect(() => {
    repo.cashDrawerTxn
      .find({
        where: { companyRef: authContext.user.companyRef },
        order: { _id: "DESC" },
      })
      .then((cashDrawerTxnDoc) => {
        setCashDrawerTxn(cashDrawerTxnDoc?.[0]);
      });
  }, []);

  if (!authContext.user) {
    return <></>;
  }

  return (
    <>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <ScrollView
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            width: "100%",
            paddingHorizontal: twoPaneView ? "20%" : "7.5%",
            alignItems: "flex-start",
          }}
        >
          <View
            style={{
              marginTop: hp("6%"),
              alignSelf: "center",
            }}
          >
            <ProfilePicUploader
              uploadedImage={authContext.user.profilePicture}
              handleImageChange={(uri: string) => updateProfilePic(uri)}
            />

            <DefaultText
              style={{
                textAlign: "center",
                marginTop: hp("4%"),
                fontSize: 28,
              }}
              fontWeight="medium"
            >
              {authContext.user.name}
            </DefaultText>
          </View>

          <PrimaryButton
            style={{
              position: "absolute",
              top: hp("7%"),
              right: twoPaneView ? "35%" : "15%",
              paddingHorizontal: 0,
              paddingVertical: hp("1%"),
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 20,
              fontWeight: theme.fontWeights.medium,
              color: authContext.permission["pos:user"]?.update
                ? theme.colors.primary[1000]
                : theme.colors.placeholder,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Edit")}
            onPress={() => {
              setOpenEdit(true);
            }}
            disabled={!authContext.permission["pos:user"]?.update}
          />

          <Spacer space={hp("4%")} />

          <ProfileDataRow />

          <Spacer space={hp("4%")} />

          {cashDrawerTxn?.started && (
            <DefaultText fontSize="lg" color="otherGrey.100">
              {`${t("Shift started at")} ${format(
                new Date(cashDrawerTxn.started),
                "dd/MM/yyyy"
              )}, ${format(new Date(cashDrawerTxn.started), "hh:mma")}`}
            </DefaultText>
          )}

          <PrimaryButton
            style={{
              paddingHorizontal: 0,
              paddingVertical: hp("1%"),
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 20,
              fontWeight: theme.fontWeights.medium,
              color: theme.colors.primary[1000],
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("End shift")}
            loading={loading}
            onPress={() => {
              if (!isConnected) {
                showToast("info", t("Please connect with internet"));
                return;
              }

              if (cart.getCartItems().length > 0) {
                handleClearItems();
              } else {
                checkUpdateCashDrawer();
              }
            }}
          />

          <View style={{ alignSelf: "center", paddingTop: 10 }}>
            {Constants.default.expoConfig && (
              <DefaultText>{`Version ${Constants.default.expoConfig.version}`}</DefaultText>
            )}
          </View>

          <Spacer space={hp("12%")} />
        </ScrollView>

        <EditProfile
          visible={openEdit}
          handleClose={() => setOpenEdit(false)}
        />

        <EndShift
          data={{ isEndShift: true }}
          visible={openEndShift}
          handleClose={() => setOpenEndShift(false)}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Profile;
