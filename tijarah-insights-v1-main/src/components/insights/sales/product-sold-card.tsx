import { StyleSheet, View } from "react-native";
import { VictoryArea } from "victory-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import PercentageView, { calculatePercentage } from "../common/percentage-view";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function ProductsSoldCard({
  current,
  prev,
  loading,
  percentText,
}: {
  current: any;
  prev: any;
  loading: boolean;
  percentText: string;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  const getMonthlyTripsData = () => {
    const monthTripArr = Array(2).fill(0);

    monthTripArr?.splice(1, 1, current);
    monthTripArr?.splice(0, 1, prev);

    return monthTripArr;
  };

  return (
    <View
      style={{
        ...styles.product_sold,
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <View style={styles.content_view}>
        <View>
          <DefaultText fontSize="md" fontWeight="semibold" color="dark.800">
            {t("Products Sold")}
          </DefaultText>

          {loading ? (
            <LoadingRect
              width={getOriginalSize(100)}
              height={getOriginalSize(20)}
              style={{ marginTop: getOriginalSize(8) }}
            />
          ) : (
            <DefaultText
              style={{ marginTop: getOriginalSize(6) }}
              fontSize="2xl"
              fontWeight="bold"
            >
              {current}
            </DefaultText>
          )}
        </View>

        <Spacer space={getOriginalSize(6)} />

        {loading ? (
          <LoadingRect
            width={getOriginalSize(80)}
            height={getOriginalSize(35)}
            style={{ marginTop: getOriginalSize(10) }}
          />
        ) : (
          <VictoryArea
            padding={0}
            width={wp("20%")}
            height={hp("5%")}
            animate={{ duration: 500 }}
            interpolation="natural"
            style={{
              data: {
                fill:
                  calculatePercentage(prev, current) > 0
                    ? "#007AFF14"
                    : "#BFBFC14D",
                stroke:
                  calculatePercentage(prev, current) > 0
                    ? "#007AFF"
                    : "#3C3C4354",
                strokeWidth: getOriginalSize(2.5),
              },
            }}
            data={getMonthlyTripsData()}
          />
        )}

        <View style={{ flexDirection: "column", alignItems: "center" }}>
          {loading ? (
            <LoadingRect
              width={getOriginalSize(70)}
              height={getOriginalSize(30)}
              style={{ borderRadius: getOriginalSize(20) }}
            />
          ) : (
            <PercentageView prev={Number(prev)} current={Number(current)} />
          )}

          <DefaultText
            style={{
              marginTop: getOriginalSize(5),
              fontSize: getOriginalSize(9),
            }}
            color="text.secondary"
          >
            {percentText}
          </DefaultText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  product_sold: {
    marginTop: getOriginalSize(16),
    borderRadius: getOriginalSize(16),
    paddingVertical: getOriginalSize(12),
    paddingHorizontal: getOriginalSize(16),
  },
  content_view: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
