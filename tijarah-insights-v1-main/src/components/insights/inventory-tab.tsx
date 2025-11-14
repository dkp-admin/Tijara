import { endOfDay, format, startOfDay } from "date-fns";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useAuth } from "../../hooks/use-auth";
import { useFindOne } from "../../hooks/use-find-one";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { getAmount } from "../modal/currency-view-modal";
import Spacer from "../spacer";
import DefaultText, { getOriginalSize } from "../text/Text";
import ToolTip from "../tool-tip";
import FinancialCard from "./common/financials-card";
import DeadProductCard from "./inventory/dead-product-card";
import ExpiringProductCard from "./inventory/expiring-product-card";
import LostDamagedProductCard from "./inventory/lost-damaged-product-card";
import OutLowStockProductCard from "./inventory/out--low-stock-product-card";
import POGRNCard from "./inventory/po-grn-card";
import LoadingRect from "./skeleton-loader/skeleton-loader";

export default function InventoryTab({
  locationRef,
  dateRange,
}: {
  locationRef: string;
  dateRange: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { user } = useAuth();

  const {
    findOne: findInventoryDashboard,
    entity: inventoryData,
    loading,
    dataUpdatedAt,
  } = useFindOne("dash/inventory");

  useEffect(() => {
    const query: any = {
      companyRef: user?.companyRef,
      dateRange: {
        from: startOfDay(dateRange?.from),
        to: endOfDay(dateRange?.to),
      },
    };

    if (locationRef && locationRef !== "all") {
      query["locationRef"] = locationRef;
    }

    findInventoryDashboard(query);
  }, [user, locationRef, dateRange]);

  return (
    <View style={{ marginTop: getOriginalSize(8) }}>
      <View
        style={{
          marginLeft: getOriginalSize(16),
          marginBottom: getOriginalSize(16),
        }}
      >
        {inventoryData ? (
          <DefaultText
            fontSize="lg"
            fontWeight="bold"
            color={theme.colors.otherGrey[100]}
          >
            {`${t("Note")}: ${t("Last updated on")} ${format(
              new Date(dataUpdatedAt),
              "d/MM/yyyy, h:mm a"
            )}`}
          </DefaultText>
        ) : (
          <LoadingRect
            width={getOriginalSize(250)}
            height={getOriginalSize(20)}
          />
        )}
      </View>

      <DefaultText
        style={{
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
        }}
        fontWeight="bold"
      >
        {t("Purchase Orders")}
      </DefaultText>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Open Orders")}
            icon={
              <ICONS.OpenOrdersIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.open?.orderCount || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.ReceiptItemIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.open?.totalItem || 0} ${t("Qty")}.`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Overdue Orders")}
            icon={
              <ICONS.OverdueOrdersIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.overdue?.orderCount || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.ReceiptItemIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.overdue?.totalItem || 0} ${t(
              "Qty"
            )}.`}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Partially Delivered")}
            icon={
              <ICONS.PartiallyDeliveredIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.partiallyReceived?.orderCount || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.ReceiptItemIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${
              inventoryData?.partiallyReceived?.totalItem || 0
            } ${t("Qty")}.`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Completed")}
            icon={
              <ICONS.CompletedOrdersIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.completed?.orderCount || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.ReceiptItemIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.completed?.totalItem || 0} ${t(
              "Qty"
            )}.`}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <POGRNCard
        orders={
          loading || !inventoryData?.orders
            ? [1, 2, 3, 4, 5]
            : inventoryData?.orders || []
        }
        loading={loading || !inventoryData}
      />

      <View
        style={{
          marginTop: hp("4%"),
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
        }}
      >
        <DefaultText fontWeight="bold">{t("Expiring Inventory")}</DefaultText>

        <DefaultText fontSize="md" fontWeight="medium" color="otherGrey.100">
          {t("Products expiring in 7 days")}
        </DefaultText>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Expiring Products")}
            icon={
              <ICONS.ExpiringProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${
              inventoryData?.expired?.length === 0
                ? 0
                : inventoryData?.expired || 0
            }`}
            isDescription={true}
            descriptionIcon={
              <ICONS.HashtagIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.expiredQty || 0} ${t("Qty")}.`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Total Lots")}
            icon={
              <ICONS.TotalLotsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.expiredLot || 0}`}
            isDescription={true}
            descriptionIcon={<></>}
            description={``}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Products Value")}
            infoTextMsg={t(
              "info_products_value_expiring_products_stats_in_inventory"
            )}
            icon={
              <ICONS.MoneyIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(inventoryData?.expiredValue || 0).toFixed(2)}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Potential Profit")}
            infoTextMsg={t(
              "info_products_profit_expiring_products_stats_in_inventory"
            )}
            icon={
              <ICONS.MoneyTimeIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(inventoryData?.expiredPotentialProfit || 0).toFixed(
              2
            )}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <ExpiringProductCard
        expiring={
          loading || !inventoryData?.expiredProducts
            ? [1, 2, 3, 4, 5]
            : inventoryData?.expiredProducts || []
        }
        loading={loading || !inventoryData}
      />
      <View
        style={{
          marginTop: hp("4%"),
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ marginRight: getOriginalSize(6) }}>
          <DefaultText fontWeight="bold">{t("Dead Inventory")}</DefaultText>

          <DefaultText fontSize="md" fontWeight="medium" color="otherGrey.100">
            {t("No sale since last 30 days")}
          </DefaultText>
        </View>

        <ToolTip infoMsg={t("info_dead_inventory")} />
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Dead Products")}
            icon={
              <ICONS.ExpiringProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.dead || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.HashtagIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.deadQty || 0} ${t("Qty")}.`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={`${t("Value & P")}. ${t("Profit")}`}
            infoTextMsg={t(
              "info_value_profit_dead_products_stats_in_inventory"
            )}
            icon={
              <ICONS.MoneyIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(inventoryData?.totalCostPrice || 0).toFixed(2)}
            isDescription={true}
            descriptionIcon={
              <ICONS.MoneyTimeSmallIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${t("SAR")} ${
              inventoryData?.totalProfitPotential > 0 ? "" : "-"
            }${getAmount(
              inventoryData?.totalProfitPotential > 0
                ? inventoryData?.totalProfitPotential || 0
                : -inventoryData?.totalProfitPotential || 0
            )}`}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <DeadProductCard
        deadProduct={
          loading || !inventoryData?.deadProducts
            ? [1, 2, 3, 4, 5]
            : inventoryData?.deadProducts || []
        }
        loading={loading || !inventoryData}
      />

      <View
        style={{
          marginTop: hp("4%"),
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultText style={{ marginRight: 6 }} fontWeight="bold">
          {t("Lost/Damaged Inventory")}
        </DefaultText>

        <ToolTip infoMsg={t("info_lost_damaged_inventory")} />
      </View>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Lost/Damaged Products")}
            icon={
              <ICONS.ExpiringProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.lostOrDamagedProduct || 0}`}
            isDescription={true}
            descriptionIcon={
              <ICONS.HashtagIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${inventoryData?.lostOrDamagedQty || 0} ${t("Qty")}.`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={`${t("Value & P")}. ${t("Profit")}`}
            infoTextMsg={t(
              "info_value_profit_lost_damaged_products_stats_in_inventory"
            )}
            icon={
              <ICONS.MoneyIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            amount={Number(inventoryData?.lostOrDamagedPrice || 0).toFixed(2)}
            isDescription={true}
            descriptionIcon={
              <ICONS.MoneyTimeSmallIcon
                width={getOriginalSize(14)}
                height={getOriginalSize(14)}
              />
            }
            description={`${t("SAR")} ${getAmount(
              inventoryData?.lostOrDamagedProfit || 0
            )}`}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <LostDamagedProductCard
        lostOrDamaged={
          loading ? [1, 2, 3, 4, 5] : inventoryData?.lostOrDamaged || []
        }
        loading={loading}
      />

      <DefaultText
        style={{
          marginTop: hp("4%"),
          marginLeft: getOriginalSize(16),
          marginBottom: -getOriginalSize(4),
        }}
        fontWeight="bold"
      >
        {t("Out of Stock and Low Stock Products")}
      </DefaultText>

      <View style={styles.grossSalesView}>
        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Out of Stock")}
            infoTextMsg={t("info_out_of_stock_products_stats_in_inventory")}
            icon={
              <ICONS.OutOfStockProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.outOfStock || 0}`}
            loading={loading || !inventoryData}
          />
        </View>

        <Spacer space={getOriginalSize(14)} />

        <View style={{ flex: 1 }}>
          <FinancialCard
            title={t("Low in stock")}
            infoTextMsg={t("info_low_in_stock_products_stats_in_inventory")}
            icon={
              <ICONS.LowStockProductsIcon
                width={getOriginalSize(26)}
                height={getOriginalSize(24)}
              />
            }
            textValue={`${inventoryData?.lowStock || 0}`}
            loading={loading || !inventoryData}
          />
        </View>
      </View>

      <OutLowStockProductCard
        outOfStockProducts={
          loading ? [1, 2, 3, 4, 5] : inventoryData?.outOfStockProducts || []
        }
        lowStockProducts={
          loading ? [1, 2, 3, 4, 5] : inventoryData?.lowStockProducts || []
        }
        lowStockDate={dataUpdatedAt}
        loading={loading || !inventoryData}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grossSalesView: {
    marginTop: getOriginalSize(16),
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
