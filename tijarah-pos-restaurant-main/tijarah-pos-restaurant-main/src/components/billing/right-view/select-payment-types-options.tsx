import React, { useMemo, useRef } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { Menu, MenuItem } from "react-native-material-menu";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import useCommonApis from "../../../hooks/useCommonApis";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";

export default function SelectPaymentTypesOptions({ onChange }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const menu = useRef<any>();
  const { wp, hp, twoPaneView } = useResponsive();
  const { billingSettings, businessData: businessDetails } = useCommonApis();

  useMemo(() => {
    if (billingSettings && businessDetails?.company?.enableStcPay) {
      billingSettings?.paymentTypes?.push({
        _id: 12,
        name: "STC Pay",
        status: true,
      });
    }

    if (businessDetails?.company?.nearpay && billingSettings?.terminalId) {
      billingSettings?.paymentTypes?.push({
        _id: 13,
        name: "Nearpay",
        status: true,
      });
    }
  }, [billingSettings, businessDetails]);

  return (
    <>
      {billingSettings?.paymentTypes
        ?.filter((p: any) => p?.status)
        ?.slice(0)
        ?.filter(
          (payment: any, index: number, self: any[]) =>
            index === self.findIndex((p: any) => p.name === payment.name)
        )?.length <= 0 ? (
        <></>
      ) : (
        <>
          <Menu
            ref={menu}
            style={{
              marginTop: -hp("5%"),
              marginLeft: wp("1%"),
              borderRadius: 16,
              height:
                billingSettings?.paymentTypes
                  ?.slice(0)
                  ?.filter((p: any) => p?.status)

                  ?.filter(
                    (payment: any, index: number, self: any[]) =>
                      index ===
                      self.findIndex((p: any) => p.name === payment.name)
                  )?.length <= 6
                  ? billingSettings?.paymentTypes
                      ?.slice(0)
                      ?.filter((p: any) => p?.status)
                      ?.filter(
                        (payment: any, index: number, self: any[]) =>
                          index ===
                          self.findIndex((p: any) => p.name === payment.name)
                      )?.length * hp("6%")
                  : hp("40%"),
              justifyContent: "flex-end",
              backgroundColor: "#CCE2D7",
            }}
            anchor={
              <TouchableOpacity
                style={{
                  padding: 10,
                  paddingLeft: isRTL ? wp("0.5") : wp("1.4"),
                }}
                onPress={() => {
                  menu.current.show();
                }}
              >
                <ICONS.MoreIcon color={theme.colors.primary[1000]} />
              </TouchableOpacity>
            }
            onRequestClose={() => {
              menu.current.hide();
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {billingSettings?.paymentTypes
                ?.filter((p: any) => p?.status)
                ?.slice(0)
                ?.filter(
                  (payment: any, index: number, self: any[]) =>
                    index ===
                    self.findIndex((p: any) => p.name === payment.name)
                )
                ?.map((payment: any, index: number) => {
                  return (
                    <MenuItem
                      style={{
                        height: hp("6%"),
                        paddingVertical: 10,
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                      onPress={async () => {
                        onChange(payment?.name);
                        menu.current.hide();
                      }}
                      key={index}
                    >
                      <DefaultText
                        style={{ marginLeft: 12 }}
                        fontSize={twoPaneView ? "lg" : "md"}
                        fontWeight="medium"
                        color="primary.1000"
                      >
                        {t(payment?.name)}
                      </DefaultText>
                    </MenuItem>
                  );
                })}
            </ScrollView>
          </Menu>
        </>
      )}
    </>
  );
}
