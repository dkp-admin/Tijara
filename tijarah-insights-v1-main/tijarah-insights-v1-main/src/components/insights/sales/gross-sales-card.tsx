import { StyleSheet, View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import CurrencyView from "../../modal/currency-view-modal";
import Spacer from "../../spacer";
import DefaultText, { getOriginalSize } from "../../text/Text";
import ToolTip from "../../tool-tip";
import PercentageView from "../common/percentage-view";
import LoadingRect from "../skeleton-loader/skeleton-loader";

export default function GrossSalesCard({
  title,
  infoTextMsg = "",
  amount,
  subTitle1,
  subTitle2,
  prev = 0,
  current = 0,
  desc1,
  desc2,
  loading = false,
}: {
  title: string;
  infoTextMsg: string;
  amount: string;
  subTitle1: string;
  subTitle2: string;
  prev: number;
  current: number;
  desc1: string;
  desc2: string;
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
        <View style={{ alignItems: "center", flexDirection: "row" }}>
          <DefaultText fontWeight="semibold" fontSize="md">
            {title}
          </DefaultText>

          <ToolTip infoMsg={infoTextMsg} />
        </View>

        <Spacer space={getOriginalSize(6)} />

        {loading ? (
          <LoadingRect
            width={getOriginalSize(100)}
            height={getOriginalSize(25)}
          />
        ) : (
          <CurrencyView
            large
            amount={amount}
            symbolFontweight="semibold"
            amountFontweight="bold"
            decimalFontweight="bold"
            symbolFontsize={14}
            amountFontsize={20}
            decimalFontsize={14}
          />
        )}

        {/* {loading ? (
          <LoadingRect
            width={getOriginalSize(100)}
            height={getOriginalSize(20)}
            style={{ marginTop: getOriginalSize(10) }}
          />
        ) : (
          <View
            style={{
              marginTop: getOriginalSize(2),
              flexDirection: "row",
              alignItems: "baseline",
            }}
          >
            <DefaultText fontSize="2xl" fontWeight="bold">
              {subTitle1}
            </DefaultText>

            <Spacer space={getOriginalSize(5)} />

            <DefaultText fontSize="xl" color="dark.800">
              {subTitle2}
            </DefaultText>
          </View>
        )}

        <Spacer space={getOriginalSize(12)} />

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
              style={{ borderRadius: getOriginalSize(20) }}
            />
          ) : (
            <PercentageView prev={prev} current={current} />
          )}
        </View>

        {loading ? (
          <LoadingRect
            width={getOriginalSize(80)}
            height={getOriginalSize(18)}
            style={{ marginTop: getOriginalSize(5) }}
          />
        ) : (
          <DefaultText
            style={{ marginTop: getOriginalSize(2) }}
            fontSize="sm"
            color={"text.secondary"}
          >
            {desc1}
          </DefaultText>
        )}

        <DefaultText
          style={{ marginTop: getOriginalSize(3) }}
          fontSize="sm"
          color={"text.secondary"}
        >
          {desc2}
        </DefaultText> */}
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
