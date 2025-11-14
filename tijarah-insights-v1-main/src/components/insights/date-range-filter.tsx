import { endOfMonth, format, startOfMonth } from "date-fns";
import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import { PrimaryButton } from "../buttons/primary-button";
import Spacer from "../spacer";
import DefaultText, { getOriginalSize } from "../text/Text";
import DateTabButton from "./date-tab-button";
import { checkDirection } from "../../hooks/use-direction-check";

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const currentDay = (date: Date) => {
  return days[new Date(date).getDay()];
};

export const getComparisionText = (activeTab: number, date: Date) => {
  if (activeTab === 0) {
    return `${t("vs")} ${currentDay(date)}`;
  } else if (activeTab === 1) {
    return t("vs Prev week");
  } else {
    return t("vs Prev month");
  }
};

const month = new Date().getMonth();
const year = new Date().getFullYear();

const prevDate = new Date();
prevDate.setDate(prevDate.getDate() - 7);

export default function DateRangeFilter({
  sheetRef,
  activeTab = 0,
  setActiveTab,
  selectedDate,
  selectedPrevDate,
  handleSelectedDate,
}: {
  sheetRef: any;
  activeTab: number;
  setActiveTab: any;
  selectedDate: any;
  selectedPrevDate: any;
  handleSelectedDate: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });

  const [prevDateRange, setPrevDateRange] = useState({
    from: prevDate,
    to: prevDate,
  });

  const rightArrowActionable =
    activeTab === 2
      ? month === dateRange.from.getMonth() &&
        year === dateRange.to.getFullYear()
      : format(dateRange.to, "dd/MM/yyyy") === format(new Date(), "dd/MM/yyyy");

  const getDateText = () => {
    if (activeTab === 0) {
      return format(dateRange.to, "MMM dd, yyyy");
    } else {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
        dateRange.to,
        "MMM dd, yyyy"
      )}`;
    }
  };

  const handleArrow = (direction: "left" | "right") => {
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    const prevFromDate = new Date(prevDateRange.from);
    const prevToDate = new Date(prevDateRange.to);

    const increment = direction === "left" ? -1 : 1;

    if (activeTab === 0) {
      fromDate.setDate(fromDate.getDate() + increment);
      toDate.setDate(toDate.getDate() + increment);
      prevFromDate.setDate(prevFromDate.getDate() + increment);
      prevToDate.setDate(prevToDate.getDate() + increment);
    } else if (activeTab === 1) {
      fromDate.setDate(fromDate.getDate() + 7 * increment);
      toDate.setDate(toDate.getDate() + 7 * increment);
      prevFromDate.setDate(prevFromDate.getDate() + 7 * increment);
      prevToDate.setDate(prevToDate.getDate() + 7 * increment);
    } else {
      prevFromDate.setMonth(fromDate.getMonth() + increment - 1);
      fromDate.setMonth(fromDate.getMonth() + increment);

      setDateRange({
        from: startOfMonth(fromDate),
        to: endOfMonth(fromDate),
      });

      setPrevDateRange({
        from: startOfMonth(prevFromDate),
        to: endOfMonth(prevFromDate),
      });
      return;
    }

    setDateRange({ from: fromDate, to: toDate });
    setPrevDateRange({ from: prevFromDate, to: prevToDate });
  };

  const handleDefault = (tab: number, reset: boolean) => {
    const fromDate = new Date();
    const toDate = new Date();
    const prevFromDate = new Date();
    const prevToDate = new Date();

    prevFromDate.setDate(fromDate.getDate() - 7);
    prevToDate.setDate(toDate.getDate() - 7);

    if (tab === 2) {
      const date = { from: startOfMonth(fromDate), to: endOfMonth(fromDate) };
      prevFromDate.setMonth(fromDate.getMonth() - 1);

      const prevDate = {
        from: startOfMonth(prevFromDate),
        to: endOfMonth(prevFromDate),
      };

      if (reset) {
        handleSelectedDate(date, prevDate);
      } else {
        setDateRange(date);
        setPrevDateRange(prevDate);
      }
      return;
    }

    if (tab === 1) {
      fromDate.setDate(fromDate.getDate() - 6);
      prevFromDate.setDate(prevFromDate.getDate() - 6);
    }

    if (reset) {
      handleSelectedDate(
        { from: fromDate, to: toDate },
        { from: prevFromDate, to: prevToDate }
      );
    } else {
      setDateRange({ from: fromDate, to: toDate });
      setPrevDateRange({ from: prevFromDate, to: prevToDate });
    }
  };

  useEffect(() => {
    setDateRange(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setPrevDateRange(selectedPrevDate);
  }, [selectedPrevDate]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      animationType="fade"
      closeOnDragDown={true}
      closeOnPressMask={true}
      customStyles={{
        container: {
          ...styles.card_view,
          backgroundColor: theme.colors.bgColor2,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <ActionSheetHeader center title={t("Date Range")} sheetRef={sheetRef} />

      <View style={styles.date_range_view}>
        <DateTabButton
          tabs={[t("Day"), t("Week"), t("Month")]}
          activeTab={activeTab}
          onChange={(tab: any) => {
            handleDefault(tab, false);
            setActiveTab(tab);
          }}
        />

        <View
          style={{
            borderRadius: getOriginalSize(16),
            marginHorizontal: getOriginalSize(20),
            marginVertical: hp("3.5%"),
            paddingVertical: hp("2.5%"),
            backgroundColor: "#006C350F",
          }}
        >
          <DefaultText
            style={{ textAlign: "center" }}
            fontSize="lg"
            fontWeight="semibold"
            color="text.secondary"
          >
            {t("Dates")}
          </DefaultText>

          <View
            style={{
              marginTop: "6%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{
                padding: getOriginalSize(12),
                marginLeft: getOriginalSize(20),
                borderRadius: getOriginalSize(20),
                backgroundColor: theme.colors.bgColor2,
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
              onPress={() => {
                handleArrow("left");
              }}
            >
              <ICONS.ArrowLeftSmallIcon
                width={getOriginalSize(18)}
                height={getOriginalSize(18)}
              />
            </TouchableOpacity>

            <DefaultText
              style={{ textAlign: "center", width: "60%" }}
              fontSize="xl"
              fontWeight="bold"
            >
              {getDateText()}
            </DefaultText>

            <TouchableOpacity
              style={{
                padding: getOriginalSize(12),
                marginRight: getOriginalSize(20),
                borderRadius: getOriginalSize(20),
                opacity: rightArrowActionable ? 0.5 : 1,
                backgroundColor: theme.colors.bgColor2,
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
              onPress={() => {
                handleArrow("right");
              }}
              disabled={rightArrowActionable}
            >
              <ICONS.ArrowRightSmallIcon
                width={getOriginalSize(18)}
                height={getOriginalSize(18)}
              />
            </TouchableOpacity>
          </View>

          <DefaultText
            style={{
              textAlign: "center",
              marginTop: getOriginalSize(-4),
              marginBottom: getOriginalSize(6),
            }}
            fontSize="md"
            color="text.secondary"
          >
            {getComparisionText(activeTab, dateRange.to)}
          </DefaultText>
        </View>
      </View>

      <View
        style={{
          ...styles.footer,
          paddingVertical: hp("3.5%"),
          paddingHorizontal: hp("2%"),
          backgroundColor: theme.colors.bgColor2,
        }}
      >
        <View style={{ flex: 1 }}>
          <PrimaryButton
            reverse
            style={{ paddingVertical: hp("2%") }}
            textStyle={{ fontSize: getOriginalSize(18) }}
            title={t("Default")}
            onPress={() => {
              handleDefault(activeTab, true);
            }}
          />
        </View>

        <Spacer space={hp("3%")} />

        <View style={{ flex: 1 }}>
          <PrimaryButton
            style={{ paddingVertical: hp("2%") }}
            textStyle={{ fontSize: getOriginalSize(18) }}
            title={t("Apply")}
            onPress={() => {
              handleSelectedDate(dateRange, prevDateRange);
            }}
          />
        </View>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "5%",
    height: "75%",
    borderTopLeftRadius: getOriginalSize(32),
    borderTopRightRadius: getOriginalSize(32),
  },
  date_range_view: {
    paddingVertical: getOriginalSize(25),
  },
  footer: {
    flex: 1,
    bottom: 0,
    margin: 0,
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: getOriginalSize(34),
    borderTopRightRadius: getOriginalSize(34),
    elevation: getOriginalSize(24),
    shadowRadius: getOriginalSize(24),
    shadowOpacity: getOriginalSize(24),
    shadowColor: "#15141F",
    shadowOffset: { width: getOriginalSize(16), height: getOriginalSize(16) },
  },
});
