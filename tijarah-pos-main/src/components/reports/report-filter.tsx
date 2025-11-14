import {
  addDays,
  endOfDay,
  format,
  isAfter,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";
import { DateTime } from "luxon";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import useCommonApis from "../../hooks/useCommonApis";
import useReportStore from "../../store/report-filter";
import { ChannelsName } from "../../utils/constants";
import { getAdjustedTimeRange } from "../../utils/get-time";
import ICONS from "../../utils/icons";
import { debugLog } from "../../utils/log-patch";
import ActionSheetHeader from "../action-sheet/action-sheet-header";
import { PrimaryButton } from "../buttons/primary-button";
import RadioRow from "../common/radio-row";
import SeparatorVerticalView from "../common/separator-vertical-view";
import DateInput from "../input/date-input";
import Spacer from "../spacer";
import DefaultText from "../text/Text";
import Label from "../text/label";
import ReportingHoursSelectInput from "./reporting-hours-select-input";

export const getReportDateTime = async (
  from: Date,
  to: Date,
  businessData: any,
  isConnected: boolean,
  reportingHours?: any
) => {
  const startDate = from;
  const endDate = to;

  const businessHour =
    businessData?.location?.businessClosureSetting?.businessTime;
  const endStartReporting =
    businessData?.location?.businessClosureSetting?.endStartReporting;
  const schedule = businessData?.location?.qrOrderingConfiguration?.schedule;
  const locationTimeZone = businessData?.location?.timeZone;

  let dayEndTime: any;

  if (
    isConnected &&
    endStartReporting &&
    businessData?.company &&
    businessData?.location
  ) {
    dayEndTime = await serviceCaller(endpoint.dayEndTime.path, {
      method: endpoint.dayEndTime.method,
      query: {
        startDate: startDate,
        endDate: endDate,
        companyRef: businessData?.company?._id,
        locationRef: businessData?.location?._id,
      },
    });
  }

  if (reportingHours?.startTime && reportingHours?.endTime) {
    const startTime = reportingHours.startTime;
    const endTime = reportingHours.endTime;
    const createdStartTime = reportingHours?.createdStartTime
      ? reportingHours.createdStartTime
      : format(new Date(startTime), "h:mm a");
    const createdEndTime = reportingHours?.createdEndTime
      ? reportingHours.createdEndTime
      : format(new Date(endTime), "h:mm a");
    const timeZone = reportingHours.timezone?.split(",");

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    const start = setMinutes(setHours(fromDate, startHours), startMinutes);
    const end = setMinutes(setHours(fromDate, endHours), endMinutes);

    if (isAfter(start, end)) {
      toDate = addDays(endDate, 1);
    }

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");

    const { UTCFromDate, UTCToDate } = convertToUTC(
      startDateString,
      endDateString,
      createdStartTime,
      createdEndTime,
      timeZone?.[1]?.trim()
    );

    return {
      from: UTCFromDate,
      to: UTCToDate,
      startDate: fromDate,
      endDate: toDate,
      showStartDate: `${format(
        new Date(fromDate),
        "MMM d, `yy"
      )}, ${createdStartTime}`,
      showEndDate: `${format(
        new Date(toDate),
        "MMM d, `yy"
      )}, ${createdEndTime}`,
    };
  } else if (businessHour && schedule?.length > 0) {
    const timeZone = locationTimeZone?.split(",");
    const { startTime, endTime } = getAdjustedTimeRange(schedule);

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const d = new Date(toDate);
    d.setDate(d.getDate() + 1);
    toDate = d;

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    const startDateTimeUTC = DateTime.fromISO(startTime, {
      zone: "utc",
    });
    const endDateTimeUTC = DateTime.fromISO(endTime, {
      zone: "utc",
    });

    const startDateTimeInZone = startDateTimeUTC.setZone(timeZone?.[1]?.trim());
    const endDateTimeInZone = endDateTimeUTC.setZone(timeZone?.[1]?.trim());

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");
    const startTimeString = startDateTimeInZone.toFormat("h:mm a");
    const endTimeString = endDateTimeInZone.toFormat("h:mm a");

    const { UTCFromDate, UTCToDate } = convertToUTC(
      startDateString,
      endDateString,
      startTimeString,
      endTimeString,
      timeZone?.[1]?.trim()
    );

    return {
      from: UTCFromDate,
      to: UTCToDate,
      startDate: fromDate,
      endDate: toDate,
      showStartDate: `${format(
        new Date(fromDate),
        "MMM d, `yy"
      )}, ${startTimeString}`,
      showEndDate: `${format(
        new Date(toDate),
        "MMM d, `yy"
      )}, ${endTimeString}`,
    };
  } else if (
    endStartReporting &&
    dayEndTime?.startDate &&
    dayEndTime?.endDate
  ) {
    const startTime = dayEndTime.startDate;
    const endTime = dayEndTime.endDate;
    const timeZone = locationTimeZone?.split(",");

    const fromDate = new Date(startDate);

    const startHours = new Date(startTime).getHours();
    const startMinutes = new Date(startTime).getMinutes();
    const startSeconds = new Date(startTime).getSeconds();

    fromDate.setHours(startHours);
    fromDate.setMinutes(startMinutes);
    fromDate.setSeconds(startSeconds);

    let toDate = new Date(endDate);

    const endHours = new Date(endTime).getHours();
    const endMinutes = new Date(endTime).getMinutes();
    const endSeconds = new Date(endTime).getSeconds();

    toDate.setHours(endHours);
    toDate.setMinutes(endMinutes);
    toDate.setSeconds(endSeconds);

    const start = setMinutes(setHours(fromDate, startHours), startMinutes);
    const end = setMinutes(setHours(fromDate, endHours), endMinutes);

    if (isAfter(start, end)) {
      toDate = addDays(endDate, 1);
    }

    const startDateTimeUTC = DateTime.fromISO(startTime, {
      zone: "utc",
    });
    const endDateTimeUTC = DateTime.fromISO(endTime, {
      zone: "utc",
    });

    const startDateTimeInZone = startDateTimeUTC.setZone(timeZone?.[1]?.trim());
    const endDateTimeInZone = endDateTimeUTC.setZone(timeZone?.[1]?.trim());

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");
    const startTimeString = startDateTimeInZone.toFormat("h:mm a");
    const endTimeString = endDateTimeInZone.toFormat("h:mm a");

    const { UTCFromDate, UTCToDate } = convertToUTC(
      startDateString,
      endDateString,
      startTimeString,
      endTimeString,
      timeZone?.[1]?.trim()
    );

    return {
      from: UTCFromDate,
      to: UTCToDate,
      startDate: fromDate,
      endDate: toDate,
      showStartDate: `${format(
        new Date(fromDate),
        "MMM d, `yy"
      )}, ${startTimeString}`,
      showEndDate: `${format(
        new Date(toDate),
        "MMM d, `yy"
      )}, ${endTimeString}`,
    };
  } else {
    const fromDate = startOfDay(new Date(startDate));
    const toDate = endOfDay(new Date(endDate));
    const timeZone = locationTimeZone?.split(",");

    const startDateString = format(new Date(fromDate), "dd MMM yyyy");
    const endDateString = format(new Date(toDate), "dd MMM yyyy");
    const startTimeString = "12:00 AM";
    const endTimeString = "11:59 PM";

    if (timeZone?.length > 0) {
      const { UTCFromDate, UTCToDate } = convertToUTC(
        startDateString,
        endDateString,
        startTimeString,
        endTimeString,
        timeZone?.[1]?.trim()
      );

      return {
        from: UTCFromDate,
        to: UTCToDate,
        startDate: fromDate,
        endDate: toDate,
        showStartDate: `${format(
          new Date(fromDate),
          "MMM d, `yy"
        )}, ${startTimeString}`,
        showEndDate: `${format(
          new Date(toDate),
          "MMM d, `yy"
        )}, ${endTimeString}`,
      };
    } else {
      return {
        from: startOfDay(startDate),
        to: endOfDay(endDate),
        startDate: startOfDay(startDate),
        endDate: endOfDay(endDate),
        showStartDate: format(
          new Date(startOfDay(startDate)),
          "MMM d, `yy, h:mm a"
        ),
        showEndDate: format(new Date(endOfDay(endDate)), "MMM d, `yy, h:mm a"),
      };
    }
  }
};

function convertToUTC(
  startDateString: string,
  endDateString: string,
  startTimeString: string,
  endTimeString: string,
  timeZone: string
): { UTCFromDate: string; UTCToDate: string } {
  const startUTC = DateTime.fromFormat(
    `${startDateString} ${startTimeString}`,
    "dd MMM yyyy h:mm a",
    { zone: timeZone }
  );

  const endUTC = DateTime.fromFormat(
    `${endDateString} ${endTimeString}`,
    "dd MMM yyyy h:mm a",
    { zone: timeZone }
  );

  if (!startUTC.isValid) {
    console.log(`Invalid date/time format: ${startUTC.invalidExplanation}`);
    return { UTCFromDate: "", UTCToDate: "" };
  }

  if (!endUTC.isValid) {
    console.log(`Invalid date/time format: ${endUTC.invalidExplanation}`);
    return { UTCFromDate: "", UTCToDate: "" };
  }

  const UTCFromDate = startUTC.toUTC().toISO();
  const UTCToDate = endUTC.toUTC().toISO();

  return { UTCFromDate, UTCToDate };
}

export default function ReportFilter({
  reportType,
  visible = false,
  handleClose,
}: {
  reportType: string;
  visible: boolean;
  handleClose?: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const { businessData } = useCommonApis();
  const { hp, twoPaneView } = useResponsive();
  const reportingHoursSelectInputRef = useRef<any>();

  const [selectedOption, setSelectedOptions] = useState("date-range");
  const [startDate, setStartDate] = useState(undefined) as any;
  const [endDate, setEndDate] = useState(undefined) as any;
  const [dateText, setDateText] = useState("");
  const [reportingHours, setReportingHours] = useState(null) as any;
  const [selectedStaff, setSelectedStaff] = useState<any>("");
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [selectedOrderType, setSelectedOrderType] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [selectedSource, setSelectedSource] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<any>({
    title: t("All"),
    value: "all",
  });
  const [loadingApply, setLoadingApply] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const { reportFilter, setReportFilter } = useReportStore() as any;

  const dateOptions = [
    { value: t("Today"), label: "today" },
    { value: t("Yesterday"), label: "yesterday" },
    { value: t("Last Week"), label: "lastWeek" },
    { value: t("Last Month"), label: "lastMonth" },
  ];

  const optionsList = [
    { title: t("Date range"), value: "date-range", show: true },
    {
      title: t("Staff"),
      desc: selectedStaff?.title,
      value: "staff",
      show: false,
    },
    {
      title: t("Status"),
      desc: selectedStatus?.title,
      value: "status",
      show: false,
    },
    {
      title: t("Order type"),
      desc: selectedOrderType?.title,
      value: "order-type",
      show: reportType === "orders",
    },
    {
      title: t("Source"),
      desc: selectedSource?.title,
      value: "source",
      show: reportType === "orders",
    },
    {
      title: t("Order status"),
      desc: selectedOrderStatus?.title,
      value: "order-status",
      show: reportType === "orders",
    },
  ];

  const staffOptions = [
    { title: t("All staffs"), value: "all" },
    { title: "Abdullah", value: "abdullah" },
    { title: "Ahmed", value: "ahmed" },
  ];

  const statusOptions = [
    { title: t("All statuses"), value: "truck-type" },
    { title: t("Open"), value: "open" },
    { title: t("Ended"), value: "ended" },
    { title: t("Closed"), value: "closed" },
  ];

  const orderTypeOptions = [{ title: t("All"), value: "all" }];

  if (businessData?.location?.channel?.length > 0) {
    businessData?.location?.channel?.forEach((type: any) => {
      orderTypeOptions.push({
        title: ChannelsName[type.name] || type.name,
        value: type.name,
      });
    });
  }

  const sourceOptions = [
    { title: t("All"), value: "all" },
    { title: t("Online"), value: "online" },
    { title: "QR", value: "qr" },
  ];

  const orderStatusOptions = [
    { title: t("All"), value: "all" },
    { title: t("Completed"), value: "completed" },
    { title: t("Cancelled"), value: "cancelled" },
  ];

  const getReportNote = () => {
    const businessHour =
      businessData?.location?.businessClosureSetting?.businessTime;
    const endStartReporting =
      businessData?.location?.businessClosureSetting?.endStartReporting;

    if (businessHour && !reportingHours?._id) {
      return `${t(
        "The report being shown is based on location business hours"
      )}.`;
    } else if (endStartReporting && !reportingHours?._id) {
      return `${t(
        "The report being shown is based on End at business day settings"
      )}.`;
    } else if (reportingHours?._id) {
      return `${t("The report being shown is based on Reporting hours")}.`;
    } else {
      return `${t(
        "The report being shown is based on Company time zone (12:00 - 11:59)"
      )}`;
    }
  };

  const handleDateOption = (value: string) => {
    const fromDate = new Date();
    const toDate = new Date();

    if (value === "yesterday") {
      fromDate.setDate(fromDate.getDate() - 1);
      toDate.setDate(toDate.getDate() - 1);
    } else if (value === "lastWeek") {
      fromDate.setDate(fromDate.getDate() - 7);
    } else if (value === "lastMonth") {
      fromDate.setMonth(fromDate.getMonth() - 1);
    }

    setDateText(value);
    setStartDate(fromDate);
    setEndDate(toDate);
  };

  const handleApplyFilter = async () => {
    setLoadingApply(true);

    const dateTime = await getReportDateTime(
      new Date(startDate),
      new Date(endDate),
      businessData,
      isConnected,
      reportingHours
    );

    const obj = {
      dateRange: {
        from: dateTime.from,
        to: dateTime.to,
        startDate: dateTime.startDate,
        endDate: dateTime.endDate,
        showStartDate: dateTime.showStartDate,
        showEndDate: dateTime.showEndDate,
      },
      orderType: selectedOrderType,
      source: selectedSource,
      orderStatus: selectedOrderStatus,
    } as any;

    if (reportingHours) {
      obj["reportingHours"] = {
        _id: reportingHours._id,
        name: reportingHours.name,
        startTime: new Date(reportingHours.startTime),
        endTime: new Date(reportingHours.endTime),
        createdStartTime: reportingHours.createdStartTime,
        createdEndTime: reportingHours.createdEndTime,
        default: reportingHours.default,
        timezone: reportingHours.timezone,
      };
    }

    Object.keys(obj).map((o: any) => {
      if (!obj[o]) {
        delete obj[o];
      }
    });

    debugLog("Report apply filter", obj, "reports-screen", "handleApplyFilter");

    setReportFilter(obj);

    handleClose();
    setLoadingApply(false);
  };

  const handleResetDate = async () => {
    setLoadingReset(true);

    const dateTime = await getReportDateTime(
      new Date(),
      new Date(),
      businessData,
      isConnected
    );

    const obj: any = {
      dateRange: {
        from: dateTime.from,
        to: dateTime.to,
        startDate: dateTime.startDate,
        endDate: dateTime.endDate,
        showStartDate: dateTime.showStartDate,
        showEndDate: dateTime.showEndDate,
      },
      orderType: { title: t("All"), value: "all" },
      source: { title: t("All"), value: "all" },
      orderStatus: { title: t("All"), value: "all" },
    };

    Object.keys(obj).map((o: any) => {
      if (!obj[o]) {
        delete obj[o];
      }
    });

    debugLog("Report reset filter", obj, "reports-screen", "handleResetDate");

    setReportFilter(obj);

    handleClose();
    setLoadingReset(false);
  };

  const getTimezone = () => {
    const timezone = reportingHours?.timezone?.split(", ");
    return timezone?.[0] || "";
  };

  useEffect(() => {
    if (visible) {
      debugLog(
        "Report filter modal opened",
        {},
        "reports-screen",
        "reportFilterFunction"
      );
      setLoadingApply(false);
      setLoadingReset(false);
      setSelectedOptions("date-range");

      if (Object.keys(reportFilter).length == 0) {
        setSelectedStaff("");
        setSelectedStatus("");
        setSelectedOrderType({ title: t("All"), value: "all" });
        setSelectedSource({ title: t("All"), value: "all" });
        setSelectedOrderStatus({ title: t("All"), value: "all" });
        setStartDate(undefined);
        setEndDate(undefined);
        setDateText("");
        setReportingHours(null);
      } else {
        setSelectedOrderType(reportFilter?.orderType);
        setSelectedSource(reportFilter?.source);
        setSelectedOrderStatus(reportFilter?.orderStatus);
        setStartDate(new Date(reportFilter?.dateRange?.startDate));
        setEndDate(new Date(reportFilter?.dateRange?.endDate));
        setDateText("");

        if (reportFilter?.reportingHours) {
          setReportingHours({
            _id: reportFilter.reportingHours._id,
            name: reportFilter.reportingHours.name,
            startTime: new Date(reportFilter.reportingHours.startTime),
            endTime: new Date(reportFilter.reportingHours.endTime),
            createdStartTime: reportFilter.reportingHours.createdStartTime,
            createdEndTime: reportFilter.reportingHours.createdEndTime,
            default: reportFilter.reportingHours.default,
            timezone: reportFilter.reportingHours.timezone,
          });
        } else {
          setReportingHours(null);
        }
      }
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Filter")}
            handleLeftBtn={() => handleClose()}
          />

          <ScrollView contentContainerStyle={{ flex: 1, flexDirection: "row" }}>
            <View
              style={{
                flex: 0.35,
                height: "100%",
                backgroundColor: theme.colors.white[1000],
              }}
            >
              {optionsList.map((option) => {
                if (!option.show) {
                  return;
                }

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={{
                      paddingHorizontal: 22,
                      paddingVertical: option.desc ? 10 : 20,
                      backgroundColor:
                        selectedOption == option.value
                          ? "#F2F2F2"
                          : "transparent",
                    }}
                    onPress={() => {
                      setSelectedOptions(option.value);
                    }}
                  >
                    <DefaultText>{option.title}</DefaultText>

                    {option.desc && (
                      <DefaultText fontSize="md" color="otherGrey.200">
                        {option.desc}
                      </DefaultText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <SeparatorVerticalView />

            <View
              style={{
                flex: 0.65,
                height: "100%",
                marginTop: hp("3%"),
              }}
            >
              {selectedOption == "date-range" && (
                <View
                  style={{
                    marginBottom: hp("3%"),
                    marginHorizontal: hp("2.5%"),
                  }}
                >
                  <DefaultText
                    fontSize="lg"
                    fontWeight="medium"
                    color={theme.colors.otherGrey[100]}
                  >
                    {`${t("Note")}: ${getReportNote()}`}
                  </DefaultText>
                </View>
              )}

              {selectedOption == "date-range" && (
                <View style={{ height: "8.5%" }}>
                  <ScrollView
                    contentContainerStyle={{
                      height: "80%",
                      paddingHorizontal: hp("1.5%"),
                    }}
                    horizontal={true}
                    alwaysBounceHorizontal={false}
                    showsHorizontalScrollIndicator={false}
                  >
                    {dateOptions.map((option) => {
                      return (
                        <TouchableOpacity
                          key={option.label}
                          style={{
                            ...styles.dateOptionsView,
                            backgroundColor:
                              option.label === dateText
                                ? theme.colors.primary[100]
                                : theme.colors.white[1000],
                          }}
                          onPress={() => handleDateOption(option.label)}
                        >
                          <DefaultText
                            color={
                              option.label === dateText
                                ? "primary.1000"
                                : "text.primary"
                            }
                          >
                            {option.value}
                          </DefaultText>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {selectedOption == "date-range" && (
                <View
                  style={{
                    marginTop: hp("2.5%"),
                    marginHorizontal: hp("2.5%"),
                  }}
                >
                  <DateInput
                    containerStyle={{ paddingRight: 16 }}
                    label={t("FROM DATE")}
                    placeholderText={t("Select Date")}
                    mode={"date"}
                    values={startDate}
                    maximumDate={endDate}
                    handleChange={(val: any) => {
                      setStartDate(val);
                    }}
                  />

                  <Spacer space={hp("3%")} />

                  <DateInput
                    containerStyle={{ paddingRight: 16 }}
                    label={t("TO DATE")}
                    placeholderText={t("Select Date")}
                    mode={"date"}
                    minimumDate={startDate}
                    values={endDate}
                    maximumDate={new Date()}
                    handleChange={(val: any) => {
                      setEndDate(val);
                    }}
                  />

                  <Spacer space={hp("3%")} />

                  <Label>{t("REPORTING HOURS")}</Label>

                  <TouchableOpacity
                    style={{
                      ...styles.drop_down_view,
                      height: hp("7.5%"),
                      backgroundColor: theme.colors.white[1000],
                    }}
                    onPress={() => {
                      reportingHoursSelectInputRef.current.open();
                    }}
                  >
                    <DefaultText
                      fontWeight="normal"
                      color={
                        reportingHours
                          ? theme.colors.otherGrey[100]
                          : theme.colors.placeholder
                      }
                    >
                      {reportingHours
                        ? `${reportingHours.name.en}, ${
                            reportingHours?.createdStartTime
                              ? reportingHours.createdStartTime
                              : format(
                                  new Date(reportingHours.startTime),
                                  "h:mm a"
                                )
                          } - ${
                            reportingHours?.createdEndTime
                              ? reportingHours.createdEndTime
                              : format(
                                  new Date(reportingHours.endTime),
                                  "h:mm a"
                                )
                          }${
                            reportingHours.default ? " (D)" : ""
                          }, ${getTimezone()}`
                        : t("Select Reporting Hours")}
                    </DefaultText>

                    <View
                      style={{
                        transform: [
                          {
                            rotate: isRTL ? "180deg" : "0deg",
                          },
                        ],
                      }}
                    >
                      <ICONS.RightContentIcon />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {selectedOption == "staff" && (
                <RadioRow
                  options={staffOptions}
                  selected={selectedStaff}
                  setSelected={setSelectedStaff}
                />
              )}

              {selectedOption == "status" && (
                <RadioRow
                  options={statusOptions}
                  selected={selectedStatus}
                  setSelected={setSelectedStatus}
                />
              )}

              {selectedOption === "order-type" && (
                <RadioRow
                  options={orderTypeOptions}
                  selected={selectedOrderType}
                  setSelected={setSelectedOrderType}
                />
              )}

              {selectedOption == "source" && (
                <RadioRow
                  options={sourceOptions}
                  selected={selectedSource}
                  setSelected={setSelectedSource}
                />
              )}

              {selectedOption === "order-status" && (
                <RadioRow
                  options={orderStatusOptions}
                  selected={selectedOrderStatus}
                  setSelected={setSelectedOrderStatus}
                />
              )}
            </View>
          </ScrollView>

          <View
            style={{
              ...styles.footer,
              paddingVertical: hp("3.5%"),
              paddingHorizontal: hp("2%"),
              backgroundColor: "#FFFFFF",
            }}
          >
            <View style={{ flex: 1 }}>
              <PrimaryButton
                reverse
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                loading={loadingReset}
                title={t("Reset")}
                onPress={() => {
                  handleResetDate();
                }}
              />
            </View>

            <Spacer space={hp("3%")} />

            <View style={{ flex: 1 }}>
              <PrimaryButton
                style={{ paddingVertical: hp("2%") }}
                textStyle={{ fontSize: 18 }}
                loading={loadingApply}
                title={t("Apply")}
                onPress={handleApplyFilter}
              />
            </View>
          </View>
        </View>
      </View>

      <ReportingHoursSelectInput
        sheetRef={reportingHoursSelectInputRef}
        values={reportingHours}
        handleSelected={(val: any) => {
          if (val) {
            setReportingHours(val);
            reportingHoursSelectInputRef.current.close();
          }
        }}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
  dateOptionsView: {
    borderRadius: 50,
    marginHorizontal: 6,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  drop_down_view: {
    width: "100%",
    borderRadius: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    flex: 1,
    bottom: 0,
    margin: 0,
    width: "100%",
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    elevation: 24,
    shadowRadius: 24,
    shadowOpacity: 24,
    shadowColor: "#15141F",
    shadowOffset: { width: 16, height: 16 },
  },
});
