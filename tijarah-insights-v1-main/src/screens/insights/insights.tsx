import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import TabButton from "../../components/buttons/tab-button";
import DateRangeFilter from "../../components/insights/date-range-filter";
import InventoryTab from "../../components/insights/inventory-tab";
import OthersTab from "../../components/insights/others-tab";
import SalesTab from "../../components/insights/sales-tab";
import SelectLocationSheet from "../../components/insights/select-location-sheet";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { STATUSBAR_HEIGHT } from "../../utils/Constants";
import ICONS from "../../utils/icons";
import { trimText } from "../../utils/trim-text";

const fromDate = new Date();
fromDate.setDate(fromDate.getDate() - 6);

const prevFromDate = new Date();
prevFromDate.setDate(prevFromDate.getDate() - 13);

const prevToDate = new Date();
prevToDate.setDate(prevToDate.getDate() - 7);

const allData = { _id: "all", name: "All Locations" };
const dateRange = { from: fromDate, to: new Date() };
const prevDateRange = {
  from: prevFromDate,
  to: prevToDate,
};

const Insights = () => {
  const theme = useTheme();
  const scrollRef = useRef<any>();
  const { wp, hp } = useResponsive();
  const navigation = useNavigation<any>();
  const dateRangeSheetRef = useRef<any>();
  const selectLocationSheetRef = useRef<any>();

  const [activeTab, setActiveTab] = useState(0);
  const [callApi, setCallApi] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState(1);
  const [prevDate, setPrevDate] = useState(prevDateRange);
  const [selectedDate, setSelectedDate] = useState(dateRange);
  const [selectedLocation, setSelectedLocation] = useState(allData);

  const getHeaderText = useMemo(() => {
    if (activeTab === 0) {
      return t("Sales Insights");
    } else if (activeTab === 1) {
      return t("Inventory Insights");
    } else {
      return t("Others Insights");
    }
  }, [activeTab, t]);

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;

    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - getOriginalSize(60);

    if (isCloseToBottom) {
      setCallApi(true);
    } else {
      setCallApi(false);
    }
  };

  useEffect(() => {
    const isFocused = navigation.addListener("focus", () => {
      scrollRef?.current?.scrollTo({
        animated: false,
        index: 0,
      });
    });
    return isFocused;
  }, [navigation]);

  return (
    <View
      style={{
        ...styles.container,
        backgroundColor: theme.colors.bgColor2,
      }}
    >
      <StatusBar
        style={"light" === "light" ? "dark" : "light"}
        backgroundColor={theme.colors.bgColor2}
      />

      <View
        style={{
          paddingVertical: hp("1.25%"),
          marginHorizontal: wp("4%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{ marginLeft: getOriginalSize(16) }}
          onPress={() => selectLocationSheetRef.current.open()}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <DefaultText
              style={{
                marginBottom: getOriginalSize(3),
                marginRight: getOriginalSize(10),
                lineHeight: getOriginalSize(28),
              }}
              fontSize="2xl"
              fontWeight="bold"
            >
              {trimText(selectedLocation.name, 22)}
            </DefaultText>

            <ICONS.LocationDownArrowIcon
              width={getOriginalSize(24)}
              height={getOriginalSize(24)}
            />
          </View>

          <DefaultText fontSize="sm">{getHeaderText}</DefaultText>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingHorizontal: getOriginalSize(8) }}
          onPress={() => dateRangeSheetRef.current.open()}
        >
          <ICONS.FilterIcon
            width={getOriginalSize(30)}
            height={getOriginalSize(30)}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{
          backgroundColor: theme.colors.bgColor,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            overflow: "scroll",
            paddingVertical: hp("2.25%"),
            paddingHorizontal: wp("2.5%"),
          }}
        >
          <TabButton
            tabs={[t("Sales"), t("Inventory"), t("Others")]}
            activeTab={activeTab}
            onChange={(tab: any) => {
              setActiveTab(tab);
            }}
          />
        </View>

        <View style={{ paddingHorizontal: wp("5%") }}>
          {activeTab === 0 && (
            <SalesTab
              activeDateTab={activeDateTab}
              locationRef={selectedLocation._id}
              dateRange={selectedDate}
              prevDate={prevDate}
            />
          )}

          {activeTab === 1 && (
            <InventoryTab
              locationRef={selectedLocation._id}
              dateRange={selectedDate}
            />
          )}

          {activeTab === 2 && (
            <OthersTab
              apiCall={callApi}
              locationRef={selectedLocation._id}
              dateRange={selectedDate}
            />
          )}
        </View>

        <Spacer space={hp("15%")} />
      </ScrollView>

      <SelectLocationSheet
        sheetRef={selectLocationSheetRef}
        selectedLocation={selectedLocation}
        handleSelectedLocation={(val: any) => {
          setSelectedLocation(val);
          selectLocationSheetRef.current.close();
        }}
      />

      <DateRangeFilter
        sheetRef={dateRangeSheetRef}
        activeTab={activeDateTab}
        setActiveTab={setActiveDateTab}
        selectedPrevDate={prevDate}
        selectedDate={selectedDate}
        handleSelectedDate={(date: any, prevDate: any) => {
          setPrevDate(prevDate);
          setSelectedDate(date);
          dateRangeSheetRef.current.close();
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUSBAR_HEIGHT + getOriginalSize(16),
  },
});

export default Insights;
