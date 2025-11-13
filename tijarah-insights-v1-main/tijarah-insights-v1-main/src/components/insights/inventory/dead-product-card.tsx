import { StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/use-direction-check";
import CurrencyView from "../../modal/currency-view-modal";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function DeadProductCard({
  deadProduct,
  loading,
}: {
  deadProduct: any;
  loading: boolean;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();

  const getProductName = (data: any) => {
    if (isRTL) {
      return `${data.name.ar} ${data.variants[0]?.name?.ar}` || "-";
    } else {
      return `${data.name.en} ${data.variants[0]?.name?.en}` || "-";
    }
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
          <DefaultText fontWeight="bold">
            {t("Dead Stock Products")}
          </DefaultText>

          <View style={{ alignItems: "flex-end" }}>
            <DefaultText fontSize="md" fontWeight="bold">
              {t("Value")}
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

        {deadProduct?.length > 0 ? (
          deadProduct?.map((data: any, index: number) => {
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
                        {data?.variants?.[0]?.sku || "-"}
                      </DefaultText>
                    )}
                  </View>

                  <View style={{ width: "45%", alignItems: "flex-end" }}>
                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(120)}
                        height={getOriginalSize(20)}
                      />
                    ) : data?.variants?.[0]?.costPrice ? (
                      <CurrencyView
                        amount={Number(
                          data?.variants?.[0]?.costPrice *
                            (data?.variants?.[0]?.stockConfiguration?.[0]
                              ?.count || 0)
                        ).toFixed(2)}
                        symbolFontsize={12}
                        amountFontsize={18}
                        decimalFontsize={12}
                        symbolFontweight="semibold"
                        amountFontweight="bold"
                        decimalFontweight="semibold"
                      />
                    ) : (
                      <DefaultText fontSize="xl" fontWeight="bold">
                        {"-"}
                      </DefaultText>
                    )}

                    <Spacer space={getOriginalSize(5)} />

                    {loading ? (
                      <LoadingRect
                        width={getOriginalSize(40)}
                        height={getOriginalSize(16)}
                        style={{ marginTop: getOriginalSize(5) }}
                      />
                    ) : (
                      <DefaultText fontSize="md" color="text.secondary">
                        {data?.variants?.[0]?.stockConfiguration?.[0]?.count ||
                          0}
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
            <NoDataPlaceholder
              title={t("no_data_dead_stock_products_list_in_inventory")}
            />
          </View>
        )}

        {/* {deadProduct?.length > 0 && !loading && (
          <TouchableOpacity
            style={{
              paddingVertical: getOriginalSize(18),
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DefaultText
              fontSize="lg"
              fontWeight="semibold"
              color="primary.1000"
            >
              {t("View All")}
            </DefaultText>
          </TouchableOpacity>
        )} */}
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
