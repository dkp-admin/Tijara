import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useAuth } from "../../../hooks/use-auth";
import ICONS from "../../../utils/icons";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import LoadingRect from "../skeleton-loader/skeleton-loader";

const env = Constants.expoConfig?.extra?.env || "development";

export const redirectToWebURL = async (path: string) => {
  let url;

  if (env === "production") {
    url = `https://app.tijarah360.com/${path}`;
  } else if (env === "qa") {
    url = `https://tijarah-qa.vercel.app/${path}`;
  } else {
    url = `https://tijarah.vercel.app/${path}`;
  }

  await WebBrowser.openBrowserAsync(url);
};

const paymentStatusColor: any = {
  paid: "#34C759",
  unpaid: "#F58634",
};

const paymentStatusText: any = {
  paid: "Paid",
  unpaid: "Due",
};

const deliveryStatusColor: any = {
  open: "#06AED4",
  overdue: "#FF2D55",
  completed: "#34C759",
  cancelled: "#FB4E4E",
  partiallyReceived: "#F58634",
};

const deliveryStatusText: any = {
  open: "Open",
  overdue: "Overdue",
  cancelled: "Cancelled",
  completed: "Completed",
  partiallyReceived: "Delivery Due",
};

export default function POGRNCard({
  orders,
  loading,
}: {
  orders: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const { user } = useAuth();

  const totalQuantity = (order: any) => {
    const quantity = order?.items?.reduce((qty: number, item: any) => {
      return qty + Number(item.quantity);
    }, 0);

    return quantity;
  };

  return (
    <>
      <View
        style={{
          ...styles.overview,
          backgroundColor: theme.colors.bgColor2,
        }}
      >
        <View
          style={{
            paddingVertical: getOriginalSize(8),
            paddingHorizontal: getOriginalSize(16),
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <DefaultText fontWeight="bold">{t("PO & GRNs")}</DefaultText>

          <View style={{ alignItems: "flex-end" }}>
            <DefaultText fontSize="md" fontWeight="bold">
              {t("Order Value")}
            </DefaultText>

            <DefaultText fontSize="md" fontWeight="bold" color="text.secondary">
              {`${t("Qty")}.`}
            </DefaultText>
          </View>
        </View>

        <View
          style={{
            borderWidth: 0,
            borderBottomWidth: getOriginalSize(1),
            borderStyle: "solid",
            borderColor: theme.colors.dark[100],
          }}
        />

        {orders?.length > 0 ? (
          orders?.map((order: any) => {
            return (
              <View key={order._id}>
                <View
                  style={{
                    paddingVertical: getOriginalSize(12),
                    paddingHorizontal: getOriginalSize(16),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View>
                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(150)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <DefaultText fontSize="lg" fontWeight="bold">
                        {`#${order.orderNum}, ${format(
                          new Date(order.orderDate),
                          "dd/MM/yyyy"
                        )}`}
                      </DefaultText>
                    )}

                    <Spacer space={getOriginalSize(2)} />

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      {loading ? (
                        <LoadingRect
                          width={getOriginalSize(70)}
                          height={getOriginalSize(16)}
                          style={{ marginTop: getOriginalSize(5) }}
                        />
                      ) : (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <ICONS.MoneySendSmallIcon
                            width={getOriginalSize(15)}
                            height={getOriginalSize(16)}
                            color={
                              paymentStatusColor[order.billing.paymentStatus]
                            }
                          />

                          <DefaultText
                            style={{ marginLeft: getOriginalSize(5) }}
                            fontSize="md"
                            fontWeight="medium"
                            color={
                              paymentStatusColor[order.billing.paymentStatus]
                            }
                          >
                            {paymentStatusText[order.billing.paymentStatus]}
                          </DefaultText>
                        </View>
                      )}

                      <FontAwesome
                        name="circle"
                        size={getOriginalSize(5)}
                        style={{ marginHorizontal: getOriginalSize(8) }}
                        color={theme.colors.text.secondary}
                      />

                      {loading ? (
                        <LoadingRect
                          width={getOriginalSize(100)}
                          height={getOriginalSize(16)}
                          style={{ marginTop: getOriginalSize(5) }}
                        />
                      ) : (
                        <View
                          style={{ flexDirection: "row", alignItems: "center" }}
                        >
                          <ICONS.TruckTimeIcon
                            width={getOriginalSize(15)}
                            height={getOriginalSize(16)}
                            color={
                              deliveryStatusColor[order.status] ||
                              theme.colors.text.primary
                            }
                          />

                          <DefaultText
                            style={{ marginLeft: getOriginalSize(5) }}
                            fontSize="md"
                            fontWeight="medium"
                            color={
                              deliveryStatusColor[order.status] ||
                              "text.primary"
                            }
                          >
                            {deliveryStatusText[order.status] || "NA"}
                          </DefaultText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={{ alignItems: "flex-end" }}>
                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(100)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <CurrencyView
                        amount={Number(order.billing.total || 0).toFixed(2)}
                        symbolFontsize={12}
                        amountFontsize={18}
                        decimalFontsize={12}
                        symbolFontweight="semibold"
                        amountFontweight="bold"
                        decimalFontweight="semibold"
                      />
                    )}

                    <Spacer space={getOriginalSize(2)} />

                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(100)}
                        height={getOriginalSize(16)}
                        style={{ marginTop: getOriginalSize(5) }}
                      />
                    ) : (
                      <DefaultText fontSize="md" color="text.secondary">
                        {totalQuantity(order) || "-"}
                      </DefaultText>
                    )}
                  </View>
                </View>

                <View
                  style={{
                    marginLeft: getOriginalSize(16),
                    borderWidth: 0,
                    borderBottomWidth: getOriginalSize(1),
                    borderStyle: "solid",
                    borderColor: theme.colors.dark[50],
                  }}
                />
              </View>
            );
          })
        ) : (
          <View
            style={{
              marginTop: -getOriginalSize(20),
              marginBottom: getOriginalSize(20),
            }}
          >
            <NoDataPlaceholder title={t("no_data_po_grn_list_in_inventory")} />
          </View>
        )}

        {orders?.length > 0 && !loading && (
          <TouchableOpacity
            style={{
              paddingVertical: getOriginalSize(18),
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() =>
              redirectToWebURL("inventory-management/purchase-order")
            }
          >
            <DefaultText
              fontSize="lg"
              fontWeight="semibold"
              color="primary.1000"
            >
              {t("View All")}
            </DefaultText>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overview: {
    marginTop: getOriginalSize(16),
    borderRadius: getOriginalSize(16),
  },
});
