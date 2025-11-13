import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import ICONS from "../../../utils/icons";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import { redirectToWebURL } from "../inventory/po-grn-card";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function VendorOrderCard({
  subtitle,
  vendorOrders,
  loading,
}: {
  subtitle: string;
  vendorOrders: any;
  loading: boolean;
}) {
  const theme = useTheme();

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
          <View>
            <DefaultText fontWeight="bold">{t("Vendor")}</DefaultText>

            <DefaultText fontSize="md" fontWeight="bold" color="text.secondary">
              {subtitle}
            </DefaultText>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <DefaultText fontSize="md" fontWeight="bold">
              {t("Paid Amount (Orders)")}
            </DefaultText>

            <DefaultText fontSize="md" fontWeight="bold" color="text.secondary">
              {t("Due Amount (Orders)")}
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

        {vendorOrders?.length > 0 ? (
          vendorOrders?.map((vendor: any, index: number) => {
            return (
              <View key={index}>
                <View
                  style={{
                    paddingVertical: getOriginalSize(12),
                    paddingHorizontal: getOriginalSize(16),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ width: "50%" }}>
                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(100)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <DefaultText fontSize="lg" fontWeight="bold">
                        {vendor.name}
                      </DefaultText>
                    )}

                    <Spacer space={getOriginalSize(2)} />

                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <ICONS.CallIcon
                        width={getOriginalSize(15)}
                        height={getOriginalSize(16)}
                      />

                      {loading ? (
                        <LoadingRect
                          width={getOriginalSize(100)}
                          height={getOriginalSize(16)}
                          style={{
                            marginTop: getOriginalSize(5),
                            marginLeft: getOriginalSize(5),
                          }}
                        />
                      ) : (
                        <DefaultText
                          style={{ marginLeft: getOriginalSize(5) }}
                          fontSize="lg"
                          fontWeight="medium"
                          color="text.secondary"
                        >
                          {vendor?.phone || "NA"}
                        </DefaultText>
                      )}
                    </View>
                  </View>

                  <View style={{ width: "45%", alignItems: "flex-end" }}>
                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(100)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <CurrencyView
                          amount={Number(vendor.paid || 0).toFixed(2)}
                          symbolFontsize={12}
                          amountFontsize={18}
                          decimalFontsize={12}
                          symbolFontweight="semibold"
                          amountFontweight="bold"
                          decimalFontweight="semibold"
                        />

                        <DefaultText
                          style={{ marginLeft: getOriginalSize(2) }}
                          fontWeight="bold"
                        >
                          {`(${vendor.paidCount || 0})`}
                        </DefaultText>
                      </View>
                    )}

                    <Spacer space={getOriginalSize(2)} />

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
                        <CurrencyView
                          amount={Number(vendor.unpaid || 0).toFixed(2)}
                          symbolFontsize={12}
                          amountFontsize={18}
                          decimalFontsize={12}
                          symbolFontweight="semibold"
                          amountFontweight="bold"
                          decimalFontweight="semibold"
                          symbolColor="text.secondary"
                          amountColor="text.secondary"
                          decimalColor="text.secondary"
                        />

                        <DefaultText
                          style={{ marginLeft: getOriginalSize(2) }}
                          fontWeight="bold"
                          color="text.secondary"
                        >
                          {`(${vendor.unpaidCount || 0})`}
                        </DefaultText>
                      </View>
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
            <NoDataPlaceholder title={t("no_data_vendor_list_in_others")} />
          </View>
        )}

        {vendorOrders?.length > 0 && !loading && (
          <TouchableOpacity
            style={{
              paddingVertical: getOriginalSize(18),
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => redirectToWebURL("inventory-management/vendor")}
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
    borderRadius: getOriginalSize(16),
  },
});
