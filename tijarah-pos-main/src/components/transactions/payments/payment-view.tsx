import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { ChannelsName, PROVIDER_NAME } from "../../../utils/constants";
import DefaultText from "../../text/Text";
import CommonRow from "../common-row";

export default function PaymentView({
  orderNum,
  tokenNum,
  orderType,
  cashier,
  device,
  totalAmount,
  breakup,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const paymentData = (data: any, index: number) => {
    if (data.providerName == PROVIDER_NAME.CASH) {
      return cashData(data);
    } else if (data.providerName == PROVIDER_NAME.CARD) {
      return cardData(data);
    } else if (data.providerName == PROVIDER_NAME.CREDIT) {
      return creditData(data);
    } else {
      return walletData(data);
    }
  };

  const cashData = (data: any) => {
    const cash =
      Number(data?.change || 0) > 0
        ? Number(data?.total) - Number(data?.change || 0)
        : Number(data?.total);

    const payment: any = [];

    if (Number(data?.change || 0) > 0) {
      payment.push({
        title: t("Tendered"),
        value: `${t("SAR")} ${Number(data?.total || 0)?.toFixed(2)}`,
      });

      payment.push({
        title: t("Change"),
        value: `${t("SAR")} ${Number(data?.change || 0)?.toFixed(2)}`,
      });
    }

    payment.push({
      title: t("Cash"),
      value: `${t("SAR")} ${Number(cash || 0)?.toFixed(2)}`,
    });

    payment.push({ title: t("Receipt/Order"), value: `#${orderNum || ""}` });

    if (tokenNum) {
      payment.push({ title: t("Token Number"), value: tokenNum });
    }

    if (orderType) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[orderType] || orderType,
      });
    }

    return payment;
  };

  const cardData = (data: any) => {
    const payment = [
      {
        title: `${t("Card")} - ${data.name}`,
        value: `${t("SAR")} ${Number(data?.total || 0)?.toFixed(2)}`,
      },
      { title: t("Receipt/Order"), value: `#${orderNum || ""}` },
    ];

    if (tokenNum) {
      payment.push({ title: t("Token Number"), value: tokenNum });
    }

    if (orderType) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[orderType] || orderType,
      });
    }

    return payment;
  };

  const walletData = (data: any) => {
    const payment = [
      {
        title: t("Wallet"),
        value: `${t("SAR")} ${Number(data?.total || 0)?.toFixed(2)}`,
      },
      { title: t("Receipt/Order"), value: `#${orderNum || ""}` },
    ];

    if (tokenNum) {
      payment.push({ title: t("Token Number"), value: tokenNum });
    }

    if (orderType) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[orderType] || orderType,
      });
    }

    return payment;
  };

  const creditData = (data: any) => {
    const payment = [
      {
        title: t("Credit"),
        value: `${t("SAR")} ${Number(data?.total || 0)?.toFixed(2)}`,
      },
      { title: t("Receipt/Order"), value: `#${orderNum || ""}` },
    ];

    if (tokenNum) {
      payment.push({ title: t("Token Number"), value: tokenNum });
    }

    if (orderType) {
      payment.push({
        title: t("Order Type"),
        value: ChannelsName[orderType] || orderType,
      });
    }

    return payment;
  };

  return breakup?.map((data: any, idx: number) => {
    return (
      <View key={idx}>
        <View
          style={{
            marginBottom: 6,
            marginTop: hp("5%"),
            paddingHorizontal: hp("2%"),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText
            fontSize="md"
            fontWeight="medium"
            color={theme.colors.text.primary}
          >
            {t("PAYMENT")}
          </DefaultText>

          <DefaultText
            style={{ maxWidth: "70%", textAlign: "right" }}
            fontSize="md"
            color={theme.colors.otherGrey[200]}
          >
            {`${cashier} (${device}), ${format(
              new Date(data.createdAt),
              "dd/MM/yyyy, hh:mma"
            )}`}
          </DefaultText>
        </View>

        {paymentData(data, idx)?.map((data: any) => {
          return (
            <CommonRow
              key={data.title}
              data={data}
              styleTitle={{ textTransform: "capitalize" }}
              valueColor={theme.colors.otherGrey[200]}
            />
          );
        })}
      </View>
    );
  });
}
