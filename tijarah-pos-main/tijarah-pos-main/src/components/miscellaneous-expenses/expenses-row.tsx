import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import DefaultText from "../text/Text";

const ReasonName: any = {
  administrative: "Administrative",
  vendorPayments: "Vendor Payments",
  purchase: "Purchase",
  medical: "Medical",
  marketing: "Marketing",
  rental: "Rental",
  taxes: "Taxes",
  other: "Other",
};

const getPaymentMethod = (payments: any[]) => {
  const paymentMethodsStr: string = payments
    .map((method) => method.paymentMethod)
    .join(", ");

  return paymentMethodsStr;
};

const getAmount = (payments: any[]) => {
  const totalAmount = payments?.reduce(
    (acc: number, current: any) => acc + Number(current.amount),
    0
  );

  return totalAmount || 0;
};

export default function ExpensesRow({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <TouchableOpacity
      style={{
        opacity: data.status === "paid" ? 0.6 : 1,
        paddingVertical: hp("1.75%"),
        paddingHorizontal: hp("2%"),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        borderStyle: "dashed",
        backgroundColor: theme.colors.bgColor2,
      }}
      onPress={() => {
        handleOnPress(data);
      }}
      disabled={data.status === "paid"}
    >
      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "16%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="normal"
          >
            {data.name?.en || "-"}
          </DefaultText>

          <DefaultText
            style={{ width: "16%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="normal"
          >
            {ReasonName[data.reason] || ""}
          </DefaultText>

          <View style={{ width: "13%", marginRight: "2%" }}>
            <DefaultText fontSize="lg" fontWeight="normal">
              {data?.user?.name || "-"}
            </DefaultText>

            <DefaultText fontSize="lg" fontWeight="normal">
              {data?.device?.deviceCode || "-"}
            </DefaultText>
          </View>

          <DefaultText
            style={{
              width: "13%",
              marginRight: "2%",
              textTransform: "capitalize",
            }}
            fontSize="lg"
            fontWeight="normal"
          >
            {getPaymentMethod(data?.transactions) || "-"}
          </DefaultText>

          <DefaultText
            style={{ width: "10%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="normal"
          >
            {data?.transactions?.length > 0
              ? `${t("SAR")} ${getAmount(data.transactions)?.toFixed(2)}`
              : "-"}
          </DefaultText>

          <View style={{ width: "10%", marginRight: "2%" }}>
            <DefaultText fontSize="lg" fontWeight="normal">
              {data.status === "paid" && data?.paymentDate
                ? format(new Date(data.paymentDate), "dd/MM/yyyy")
                : "-"}
            </DefaultText>

            <DefaultText fontSize="lg" fontWeight="normal">
              {data.status == "paid"
                ? "-"
                : format(new Date(data.date), "dd/MM/yyyy")}
            </DefaultText>
          </View>

          <DefaultText
            style={{ width: "10%", textAlign: "right" }}
            fontSize="lg"
            fontWeight="normal"
            color={data.status === "paid" ? "primary.1000" : "red.default"}
          >
            {data.status === "paid" ? "Paid" : "To be paid"}
          </DefaultText>
        </>
      ) : (
        <>
          <DefaultText
            style={{ width: "28%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="normal"
          >
            {data.name?.en || "-"}
          </DefaultText>

          <View style={{ width: "23%", marginRight: "2%" }}>
            <DefaultText fontSize="lg" fontWeight="normal">
              {data?.user?.name || "-"}
            </DefaultText>

            <DefaultText fontSize="lg" fontWeight="normal">
              {data?.device?.devcieCode || "-"}
            </DefaultText>
          </View>

          <View style={{ width: "23%", marginRight: "2%" }}>
            <DefaultText fontSize="lg" fontWeight="normal">
              {data?.transactions?.length > 0
                ? `${t("SAR")} ${getAmount(data.transactions)?.toFixed(2)}`
                : "-"}
            </DefaultText>

            <DefaultText fontSize="lg" fontWeight="normal">
              {getPaymentMethod(data?.transactions) || "-"}
            </DefaultText>
          </View>

          <View style={{ width: "20%", alignItems: "flex-end" }}>
            <DefaultText fontSize="lg" fontWeight="normal">
              {data.status === "paid" && data?.paymentDate
                ? format(new Date(data.paymentDate), "dd/MM/yyyy")
                : format(new Date(data.date), "dd/MM/yyyy")}
            </DefaultText>

            <DefaultText
              fontSize="lg"
              fontWeight="normal"
              color={data.status === "paid" ? "primary.1000" : "red.default"}
            >
              {data.status === "paid" ? "Paid" : "To be paid"}
            </DefaultText>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}
