import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EventRegister } from "react-native-event-listeners";
import BillingLeftTabView from "../../components/billing/billing-left-tab-view";
import BillingRightOrderView from "../../components/billing/billing-right-order-view";
import CustomHeader from "../../components/common/custom-header";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import StartShiftModal from "../../components/modal/start-shift-modal";
import AuthContext from "../../context/auth-context";
import { CartContextProvider } from "../../context/cart-context";
import { useTheme } from "../../context/theme-context";
import MMKVDB from "../../utils/DB-MMKV";
import { DBKeys } from "../../utils/DBKeys";
import { objectId } from "../../utils/bsonObjectIdTransformer";
import cart from "../../utils/cart";
import { repo } from "../../utils/createDatabaseConnection";
import { debugLog } from "../../utils/log-patch";

const BillingComponent = () => {
  useEffect(() => {
    MMKVDB.set("activeTableDineIn", null);
  }, []);

  return (
    <View style={styles.container}>
      <CartContextProvider>
        <BillingLeftTabView />
        <SeparatorVerticalView />
        <BillingRightOrderView />
      </CartContextProvider>
    </View>
  );
};

const BillingHome = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const authContext = useContext(AuthContext) as any;

  const [defaultCash, setDefaultCash] = React.useState(0);
  const [openStartShift, setOpenStartShift] = useState(false);

  useEffect(() => {
    const itemsArray = MMKVDB.get("cartItems");

    if (itemsArray?.length > 0) {
      cart.addItemsToCart(itemsArray, (itm: any) => {
        debugLog(
          "Item added to cart",
          itm,
          "billing-screen",
          "itemAddedUseEffect"
        );
        EventRegister.emit("itemAdded", itm);
      });
    }
  }, []);

  useMemo(() => {
    (async () => {
      const openDrawer = MMKVDB.get(DBKeys.CASH_DRAWER) || "";

      if (openDrawer === "open") {
        const billingData = await repo.billingSettings.find({});

        setDefaultCash(billingData[0]?.defaultCash);
        setOpenStartShift(billingData[0]?.cashManagement);

        if (!billingData[0]?.cashManagement) {
          const businessDetails: any = await repo.business.findOne({
            where: { _id: authContext?.user?.locationRef },
          });

          const cashDrawerTxn: any = await repo.cashDrawerTxn.findOne({
            where: { companyRef: authContext?.user?.companyRef },
            order: { _id: "DESC" },
          });

          if (
            authContext &&
            businessDetails &&
            cashDrawerTxn?.transactionType !== "open"
          ) {
            const cashTxnData = {
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

            await repo.cashDrawerTxn.insert(cashTxnData as any);

            MMKVDB.set(DBKeys.SALES_REFUNDED_AMOUNT, "0");

            debugLog(
              "Cash drawer txn created",
              cashTxnData,
              "billing-screen",
              "useMemoFUnction"
            );
          }
        }
      }
    })();
  }, []);

  useEffect(() => {
    MMKVDB.remove("activeTableDineIn");
  }, [isFocused]);

  return (
    <>
      <CustomHeader />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor,
        }}
      >
        <TouchableOpacity
          style={{ position: "absolute", left: 100000 }}
          onPress={(e) => {
            e.preventDefault();
          }}
        >
          <Text>PRESS</Text>
        </TouchableOpacity>

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
