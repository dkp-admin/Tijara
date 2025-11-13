import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import CurrencyView from "../../modal/currency-view-modal";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import PercentageView from "./percentage-view";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function FinancialCard({
  title,
  infoTextMsg = "",
  icon,
  amount,
  textValue,
  isPercent,
  prev = 0,
  current = 0,
  percentText,
  isDescription,
  descriptionIcon,
  description,
  loading = false,
}: {
  title: string;
  infoTextMsg?: string;
  icon: any;
  amount?: string;
  textValue?: string;
  isPercent?: boolean;
  prev?: number;
  current?: number;
  percentText?: string;
  isDescription?: boolean;
  descriptionIcon?: any;
  description?: string;
  loading?: boolean;
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
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <DefaultText fontWeight="semibold" fontSize="md">
            {title}
          </DefaultText>

          {infoTextMsg && <ToolTip infoMsg={infoTextMsg} />}
        </View>

        <View
          style={{
            marginTop: getOriginalSize(12),
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ marginRight: getOriginalSize(12) }}>{icon}</View>

          {loading ? (
            <LoadingRect
              width={getOriginalSize(100)}
              height={getOriginalSize(27)}
            />
          ) : amount ? (
            <View style={{ marginTop: getOriginalSize(-4) }}>
              <CurrencyView
                large
                amount={amount}
                symbolFontweight="semibold"
                amountFontweight="bold"
                decimalFontweight="bold"
                symbolFontsize={12}
                amountFontsize={20}
                decimalFontsize={14}
              />
            </View>
          ) : (
            <DefaultText fontSize="3xl" fontWeight="bold">
              {textValue}
            </DefaultText>
          )}
        </View>

        {isPercent && (
          <View style={{ marginTop: getOriginalSize(10) }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              {loading ? (
                <LoadingRect
                  width={getOriginalSize(70)}
                  height={getOriginalSize(30)}
                  style={{ borderRadius: 20 }}
                />
              ) : (
                <PercentageView prev={prev} current={current} />
              )}
            </View>

            <DefaultText
              style={{
                marginTop: getOriginalSize(4),
                fontSize: getOriginalSize(12),
              }}
              color={"text.secondary"}
            >
              {percentText}
            </DefaultText>
          </View>
        )}

        {isDescription && (
          <View
            style={{
              marginTop: getOriginalSize(10),
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ marginRight: getOriginalSize(8) }}>
              {descriptionIcon}
            </View>

            {loading ? (
              <LoadingRect
                width={getOriginalSize(100)}
                height={getOriginalSize(18)}
              />
            ) : (
              <DefaultText
                fontSize="md"
                fontWeight="semibold"
                color="primary.1000"
              >
                {description}
              </DefaultText>
            )}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overview: {
    paddingHorizontal: getOriginalSize(16),
    paddingVertical: getOriginalSize(12),
    borderRadius: getOriginalSize(16),
  },
});
