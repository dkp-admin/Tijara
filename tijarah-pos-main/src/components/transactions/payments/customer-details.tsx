import React, { useContext, useState } from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { PrimaryButton } from "../../buttons/primary-button";
import DefaultText from "../../text/Text";
import Label from "../../text/label";
import AddOrderCustomerModal from "./add-customer-modal";

export default function CustomerDetails({ data, setSelectedOrder }: any) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [visibleOrderCustomer, setVisibleOrderCustomer] = useState(false);

  return (
    <View style={{ marginTop: hp("5%") }}>
      <Label marginLeft={hp("2%")}>{t("CUSTOMER DETAILS")}</Label>

      <View
        style={{
          paddingVertical: hp("2%"),
          paddingHorizontal: hp("2%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <DefaultText>{t("Customer")}</DefaultText>

        {data.customer ? (
          <DefaultText
            fontWeight={"normal"}
            color={theme.colors.otherGrey[200]}
          >
            {data.customer}
          </DefaultText>
        ) : (
          <PrimaryButton
            style={{
              paddingHorizontal: 0,
              paddingVertical: 0,
              backgroundColor: "transparent",
            }}
            textStyle={{
              fontSize: 18,
              fontWeight: theme.fontWeights.semibold,
              color:
                data.order.refunds?.length === 0 &&
                authContext.permission["pos:order"]?.update
                  ? theme.colors.primary[1000]
                  : theme.colors.placeholder,
              fontFamily: theme.fonts.circulatStd,
            }}
            title={t("Add Customer")}
            onPress={() => {
              setVisibleOrderCustomer(true);
            }}
            disabled={
              data.order.refunds?.length > 0 ||
              !authContext.permission["pos:order"]?.update
            }
          />
        )}
      </View>

      <AddOrderCustomerModal
        order={data.order}
        orderId={data?.orderId}
        totalAmount={data?.totalAmount}
        customerRef={data?.customerRef}
        visible={visibleOrderCustomer}
        setSelectedOrder={setSelectedOrder}
        handleClose={() => {
          setVisibleOrderCustomer(false);
        }}
      />
    </View>
  );
}
