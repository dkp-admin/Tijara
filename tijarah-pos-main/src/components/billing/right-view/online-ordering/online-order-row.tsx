import { differenceInMinutes, format, formatDistanceToNow } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../../i18n";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import ItemDivider from "../../../action-sheet/row-divider";
import DefaultText from "../../../text/Text";

export default function OnlineOrderRow({
  data,
  handleOnPress,
}: {
  data: any;
  handleOnPress: any;
}) {
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  const getMinutes = () => {
    return differenceInMinutes(new Date(), new Date(data.createdAt));
  };

  const quantity = data.items?.reduce(
    (prev: any, cur: any) => prev + Number(cur.quantity),
    0
  );

  const orderStatusName = (deliveryType: string, orderStatus: string) => {
    if (orderStatus === "open") {
      return t("Open");
    } else if (orderStatus === "inprocess") {
      return t("Inprocess");
    } else if (orderStatus === "ready") {
      return deliveryType === "Pickup" ? t("Ready") : t("On the way");
    } else if (orderStatus === "completed") {
      return t("Completed");
    } else {
      return t("Cancelled");
    }
  };

  const orderStatusBgColor = (orderStatus: string) => {
    if (orderStatus === "open") {
      return "#4D5761";
    } else if (orderStatus === "inprocess") {
      return "#06AED4";
    } else if (orderStatus === "ready") {
      return "#F79009";
    } else if (orderStatus === "completed") {
      return "#006C35";
    } else {
      return "#F04438";
    }
  };

  return (
    <>
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: hp("1.75%"),
          paddingHorizontal: hp("2.5%"),
        }}
        onPress={() => {
          handleOnPress(data);
        }}
      >
        {twoPaneView ? (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: "11%", marginRight: "2%" }}>
              <DefaultText
                fontSize="lg"
                fontWeight="normal"
                color="primary.1000"
              >
                {data.orderNum}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="normal"
              >
                {data.orderType === "Pickup" ? t("Pickup") : t("Delivery")}
              </DefaultText>
            </View>

            <View style={{ width: "12%", marginRight: "2%" }}>
              <DefaultText fontSize="lg" fontWeight="normal">
                {getMinutes() < 60
                  ? formatDistanceToNow(new Date(data.createdAt), {
                      addSuffix: true,
                    })
                  : format(new Date(data.createdAt), "dd/MM/yyyy")}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="normal"
              >
                {`${getMinutes() < 60 ? " at " : ""}${format(
                  new Date(data.createdAt),
                  "h:mm a"
                )}`}
              </DefaultText>
            </View>

            <View style={{ width: "22%", marginRight: "2%" }}>
              <DefaultText fontSize="lg" fontWeight="normal" noOfLines={1}>
                {data.customer?.name || "N/A"}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="normal"
              >
                {data?.customer?.phone || "N/A"}
              </DefaultText>
            </View>

            <DefaultText
              style={{ width: "10%", marginRight: "2%" }}
              fontSize="lg"
              fontWeight="normal"
            >
              {data.qrOrdering ? "QR" : data.onlineOrdering ? "Online" : "-"}
            </DefaultText>

            <View style={{ width: "10%", marginRight: "2%" }}>
              <DefaultText fontSize="lg" fontWeight="normal">
                {data.payment.paymentType === "online"
                  ? t("Online")
                  : t("Offline")}
              </DefaultText>

              <View
                style={{
                  marginTop: 5,
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  alignItems: "center",
                  alignSelf: "flex-start",
                  backgroundColor:
                    data.payment.paymentStatus === "paid"
                      ? "#006C351A"
                      : "#FEE4E2",
                }}
              >
                <DefaultText
                  fontSize="lg"
                  fontWeight="normal"
                  color={
                    data.payment.paymentStatus === "paid"
                      ? "#006C35"
                      : "#F04438"
                  }
                >
                  {data.payment.paymentStatus === "paid" ? t("Paid") : t("Due")}
                </DefaultText>
              </View>
            </View>

            <View style={{ width: "11%", marginRight: "2%" }}>
              <DefaultText
                style={{ textAlign: "right" }}
                fontSize="lg"
                fontWeight="normal"
              >
                {`${t("SAR")} ${(data?.payment?.total || 0)?.toFixed(2)}`}
              </DefaultText>

              <DefaultText
                style={{ marginTop: 5, textAlign: "right" }}
                fontSize="lg"
                fontWeight="normal"
              >
                {`${quantity} ${t("Qty")}`}
              </DefaultText>
            </View>

            <View style={{ width: "11%", marginRight: "1%" }}>
              <View
                style={{
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  alignSelf: "flex-end",
                  backgroundColor: orderStatusBgColor(data.orderStatus),
                }}
              >
                <DefaultText fontSize="lg" fontWeight="normal" color="#fff">
                  {orderStatusName(data.orderType, data.orderStatus)}
                </DefaultText>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: "38%", marginRight: "2%" }}>
              <DefaultText fontSize="lg" fontWeight="normal">
                {data.orderNum}
              </DefaultText>

              {getMinutes() < 60 ? (
                <DefaultText
                  style={{ marginTop: 5 }}
                  fontSize="lg"
                  fontWeight="normal"
                >
                  {formatDistanceToNow(new Date(data.createdAt), {
                    addSuffix: true,
                  })}
                </DefaultText>
              ) : (
                <DefaultText
                  style={{ marginTop: 5 }}
                  fontSize="lg"
                  fontWeight="normal"
                >
                  {format(new Date(data.createdAt), "dd/MM/yyyy")}
                </DefaultText>
              )}

              <DefaultText
                style={{ marginTop: 5 }}
                fontSize="lg"
                fontWeight="normal"
              >
                {(getMinutes() < 60 ? ` at ` : "") +
                  format(new Date(data.createdAt), "h:mm a")}
              </DefaultText>
            </View>

            <View style={{ width: "22%", marginRight: "2%" }}>
              <DefaultText fontSize="lg" fontWeight="normal">
                {data.payment.paymentType === "online"
                  ? t("Online")
                  : t("Offline")}
              </DefaultText>

              <View
                style={{
                  marginTop: 5,
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 15,
                  alignItems: "center",
                  alignSelf: "flex-start",
                  backgroundColor:
                    data.payment.paymentStatus === "paid"
                      ? "#006C351A"
                      : "#FEE4E2",
                }}
              >
                <DefaultText
                  fontSize="lg"
                  fontWeight="normal"
                  color={
                    data.payment.paymentStatus === "paid"
                      ? "#006C35"
                      : "#F04438"
                  }
                >
                  {data.payment.paymentStatus === "paid" ? t("Paid") : t("Due")}
                </DefaultText>
              </View>
            </View>

            <View style={{ width: "35%", marginRight: "1%" }}>
              <View
                style={{
                  borderRadius: 50,
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  alignSelf: "flex-end",
                  backgroundColor: orderStatusBgColor(data.orderStatus),
                }}
              >
                <DefaultText fontSize="lg" fontWeight="normal" color="#fff">
                  {orderStatusName(data.orderType, data.orderStatus)}
                </DefaultText>
              </View>

              <DefaultText
                style={{ marginTop: 5, marginRight: 8, textAlign: "right" }}
                fontSize="lg"
                fontWeight="normal"
              >
                {data.orderType === "Pickup" ? t("Pickup") : t("Delivery")}
              </DefaultText>
            </View>
          </View>
        )}
      </TouchableOpacity>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </>
  ) as any;
}
