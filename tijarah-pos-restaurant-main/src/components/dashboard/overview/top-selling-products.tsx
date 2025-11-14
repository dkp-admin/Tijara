import { FlashList } from "@shopify/flash-list";
import React, { useCallback, useMemo } from "react";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import DefaultText from "../../text/Text";
import ToolTip from "../../tool-tip";
import TopProductsHeader from "./top-selling-products/top-products-header";
import TopProductsRow from "./top-selling-products/top-products-row";

export default function TopSellingProducts({
  productsData,
  handleViewAll,
}: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const topProducts = useMemo(() => {
    let products: any[] = [];

    if (productsData?.length > 0) {
      productsData.map((data: any, index: number) => {
        if (index < 10) {
          products.push({
            name: data.name,
            image: data?.image || "",
            totalOrders: data.totalOrder,
            totalSales: data.grossRevenue,
          });
        } else {
          return;
        }
      });
    }

    return products;
  }, [productsData]);

  const renderHeader = useMemo(() => {
    return <TopProductsHeader />;
  }, []);

  const renderItems = useCallback(({ item, index }: any) => {
    return <TopProductsRow key={index} data={item} index={index + 1} />;
  }, []);

  return (
    <View
      style={{
        borderRadius: 10,
        paddingTop: hp("2.25%"),
        paddingBottom: hp("2%"),
        paddingHorizontal: hp("2.5%"),
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <DefaultText fontSize="sm" fontWeight="medium" color="dark.800">
            {t("TOP SELLING PRODUCTS")}
          </DefaultText>

          <View style={{ marginLeft: 8 }}>
            <ToolTip infoMsg={t("Data is showing for last 30 days")} />
          </View>
        </View>

        <TouchableOpacity onPress={() => handleViewAll()}>
          <DefaultText
            style={{
              fontSize: 13,
              fontWeight: "700",
              fontFamily: theme.fonts.circulatStd,
            }}
            color={theme.colors.primary[1000]}
          >
            {t("View All")}
          </DefaultText>
        </TouchableOpacity>
      </View>

      {topProducts?.length > 0 ? (
        <View style={{ minHeight: hp("15%") }}>
          <FlashList
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={topProducts}
            scrollEnabled={false}
            estimatedItemSize={hp("12%")}
            renderItem={renderItems}
            ListHeaderComponent={renderHeader}
          />
        </View>
      ) : (
        <View
          style={{
            marginBottom: hp("10%"),
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <NoDataPlaceholder
            marginTop={hp("15%")}
            title={`${t("Waiting for data to show products")}.`}
          />
        </View>
      )}
    </View>
  );
}
