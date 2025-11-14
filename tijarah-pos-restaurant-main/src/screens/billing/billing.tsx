import { useIsFocused } from "@react-navigation/core";
import { t } from "i18n-js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import BillingNew from "../../components/billing/billing-new";
import CustomHeader from "../../components/common/custom-header";
import StartShiftModal from "../../components/modal/start-shift-modal";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import repository from "../../db/repository";
import { CashDrawerTransaction } from "../../db/schema/cashdrawer-txn";
import { useSubscription } from "../../store/subscription-store";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import cart from "../../utils/cart";
import Loader from "../../components/loader";
import { useResponsive } from "../../hooks/use-responsiveness";

const BillingComponent = () => {
  useEffect(() => {
    MMKVDB.set("activeTableDineIn", null);
  }, []);

  return <BillingNew />;
};

const BillingHome = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const authContext = useContext(AuthContext) as any;
  const [defaultCash, setDefaultCash] = React.useState(0);
  const [openStartShift, setOpenStartShift] = useState(false);
  const { hasPermission } = useSubscription();
  const canAccessBilling = hasPermission("billing");
  const [isLoading, setIsLoading] = useState(true);
  const { hp } = useResponsive();

  useEffect(() => {
    const itemsArray = MMKVDB.get("cartItems");

    if (itemsArray?.length > 0) {
      cart.addItemsToCart(itemsArray, (itm: any) => {
        EventRegister.emit("itemAdded", itm);
      });
    }
  }, []);

  useMemo(() => {
    (async () => {
      const openDrawer = MMKVDB.get(DBKeys.CASH_DRAWER) || "";

      if (openDrawer === "open") {
        const billingData = await repository.billing.findAll();

        setDefaultCash(billingData[0]?.defaultCash);
        setOpenStartShift(billingData[0]?.cashManagement);

        if (!billingData[0]?.cashManagement) {
          const businessDetails: any = await repository.business.findById(
            authContext?.user?.locationRef
          );

          const cashDrawerTxn: any =
            await repository.cashDrawerTxnRepository.findLatestByCompanyRef(
              authContext?.user?.companyRef
            );

          if (
            authContext &&
            businessDetails &&
            cashDrawerTxn?.transactionType !== "open"
          ) {
            const cashTxnData: CashDrawerTransaction = {
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
              totalSales: undefined,
              transactionType: "open",
              description: "Cash Drawer Open",
              shiftIn: true,
              dayEnd: false,
              started: new Date(),
              ended: cashDrawerTxn?.ended || new Date(),
              source: "local",
            };

            await repository.cashDrawerTxnRepository.create(cashTxnData);

            MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");
          }
        }
      }
    })();
  }, []);

  // useEffect(() => {
  //   MMKVDB.remove("activeTableDineIn");
  // }, [isFocused]);

  useEffect(() => {
    if (canAccessBilling !== undefined) {
      setIsLoading(false);
    }
  }, [canAccessBilling]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.bgColor }}>
        <Loader marginTop={hp("35%")} />
      </View>
    );
  }

  if (!canAccessBilling) {
    return (
      <PermissionPlaceholderComponent
        title={t("You don't have permission to view this screen")}
        marginTop="-25%"
      />
    );
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
        <BillingComponent />

        {openStartShift && (
          <StartShiftModal
            defaultCash={defaultCash}
            visible={openStartShift}
            handleClose={() => setOpenStartShift(false)}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default BillingHome;
