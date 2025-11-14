import { differenceInDays, format, startOfDay } from "date-fns";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/use-direction-check";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ScrollTabButton from "../common/scroll-tab-button";
import LoadingRect from "../skeleton-loader/skeleton-loader";
import { redirectToWebURL } from "./po-grn-card";

export default function OutLowStockProductCard({
  outOfStockProducts,
  lowStockProducts,
  lowStockDate = 0,
  loading,
}: {
  outOfStockProducts: any;
  lowStockProducts: any;
  lowStockDate: number;
  loading: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();

  const [activeTab, setActiveTab] = useState(0);

  const getProductName = (data: any) => {
    if (activeTab === 0) {
      if (isRTL) {
        return `${data?.name?.ar} ${data?.variant?.ar}` || "-";
      } else {
        return `${data?.name?.en} ${data?.variant?.en}` || "-";
      }
    } else {
      if (isRTL) {
        return `${data?.name?.ar} ${data?.variants?.name?.ar}` || "-";
      } else {
        return `${data?.name?.en} ${data?.variants?.name?.en}` || "-";
      }
    }
  };

  const getDiffInDays = (lastAvailable: any) => {
    const lastAvailableDate = startOfDay(new Date(lastAvailable));
    const currentDate = startOfDay(new Date());

    return differenceInDays(lastAvailableDate, currentDate);
  };

  return (
    <View
      style={{
        ...styles.overview,
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <View>
        <View
          style={{
            paddingTop: getOriginalSize(20),
            paddingBottom: getOriginalSize(12),
            paddingHorizontal: getOriginalSize(16),
          }}
        >
          <ScrollTabButton
            tabs={[t("Out of Stock"), t("Low in stock")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />
        </View>

        <View
          style={{
            borderWidth: 0,
            borderBottomWidth: getOriginalSize(1),
            borderStyle: "solid",
            borderColor: theme.colors.dark[100],
          }}
        />
      </View>

      <View
        style={{
          paddingVertical: getOriginalSize(8),
          paddingHorizontal: getOriginalSize(16),
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <DefaultText fontWeight="bold">
          {activeTab === 0 ? t("Out of Stock") : t("Low in stock")}
        </DefaultText>

        <View style={{ alignItems: "flex-end" }}>
          <DefaultText fontSize="md" fontWeight="bold">
            {activeTab === 0 ? t("Last Available") : t("Stock Available")}
          </DefaultText>

          <DefaultText fontSize="md" fontWeight="bold" color="text.secondary">
            {activeTab === 0
              ? t("Date")
              : `${t("As on")} ${format(
                  new Date(lowStockDate),
                  "d/MM/yyyy, h:mma"
                )}`}
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

      {(activeTab === 0 ? outOfStockProducts : lowStockProducts)?.length > 0 ? (
        (activeTab === 0 ? outOfStockProducts : lowStockProducts)?.map(
          (data: any, index: number) => {
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
                        width={getOriginalSize(120)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <DefaultText fontSize="lg" fontWeight="bold">
                        {getProductName(data)}
                      </DefaultText>
                    )}

                    <Spacer space={getOriginalSize(5)} />

                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(60)}
                        height={getOriginalSize(16)}
                        style={{ marginTop: getOriginalSize(5) }}
                      />
                    ) : (
                      <DefaultText
                        fontSize="md"
                        fontWeight="medium"
                        color="text.secondary"
                      >
                        {activeTab === 0
                          ? data?.sku || "-"
                          : data?.variants?.sku || "-"}
                      </DefaultText>
                    )}
                  </View>

                  {activeTab === 0 && (
                    <View style={{ width: "45%", alignItems: "flex-end" }}>
                      {loading ? (
                        <LoadingRect
                          width={getOriginalSize(120)}
                          height={getOriginalSize(20)}
                        />
                      ) : (
                        <DefaultText fontSize="lg" fontWeight="bold">
                          {data?.expiry
                            ? format(new Date(data.expiry), "dd/MM/yyyy")
                            : "NA"}
                        </DefaultText>
                      )}

                      <Spacer space={getOriginalSize(5)} />

                      {loading ? (
                        <LoadingRect
                          width={getOriginalSize(50)}
                          height={getOriginalSize(16)}
                          style={{ marginTop: getOriginalSize(5) }}
                        />
                      ) : (
                        <DefaultText fontSize="md" color="text.secondary">
                          {data?.expiry
                            ? `${getDiffInDays(data.expiry)} ${t("Days")}`
                            : "-"}
                        </DefaultText>
                      )}
                    </View>
                  )}

                  {activeTab === 1 &&
                    (loading ? (
                      <LoadingRect
                        width={getOriginalSize(120)}
                        height={getOriginalSize(20)}
                      />
                    ) : (
                      <DefaultText
                        style={{ width: "45%", textAlign: "right" }}
                        fontSize="lg"
                        fontWeight="bold"
                      >
                        {data?.variants?.stockConfiguration?.count}
                      </DefaultText>
                    ))}
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
          }
        )
      ) : (
        <View
          style={{
            marginTop: -getOriginalSize(20),
            marginBottom: getOriginalSize(20),
          }}
        >
          <NoDataPlaceholder
            title={
              activeTab === 0
                ? t("no_data_out_of_stock_products_list_in_inventory")
                : t("no_data_low_stock_products_list_in_inventory")
            }
          />
        </View>
      )}

      {(activeTab === 0 ? outOfStockProducts : lowStockProducts)?.length > 0 &&
        !loading && (
          <TouchableOpacity
            style={{
              paddingVertical: getOriginalSize(18),
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => redirectToWebURL("reports/inventory")}
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
  );
}

const styles = StyleSheet.create({
  overview: {
    marginTop: 16,
    borderRadius: 16,
  },
});
