import { format } from "date-fns";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { debugLog, errorLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function ReportingHoursSelectInput({
  sheetRef,
  values,
  handleSelected,
}: {
  sheetRef: any;
  values: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [reportingHours, setReportingHours] = useState<any>([]);

  const getReportingHours = async () => {
    if (!isConnected) {
      setReportingHours([]);
    }

    try {
      const res = await serviceCaller(endpoint.reportingHours.path, {
        method: endpoint.reportingHours.method,
        query: {
          page: 0,
          limit: 25,
          sort: "asc",
          companyRef: authContext.user.companyRef,
        },
      });

      debugLog(
        "Reporting hours fetch from api",
        res?.results?.length,
        "reporting-hours-select-input",
        "fetchReportingHours"
      );

      setReportingHours(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "reporting-hours-select-input",
        "fetchReportingHours",
        error
      );
      setReportingHours([]);
    }
  };

  const getTimezone = (item: any) => {
    const timezone = item.timezone?.split(", ");
    return timezone?.[0] || "";
  };

  useEffect(() => {
    getReportingHours();
  }, []);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {t("Select Reporting Hours")}
        </DefaultText>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        {isConnected ? (
          <FlatList
            style={{
              marginTop: 5,
              minHeight: hp("60%"),
            }}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={reportingHours}
            renderItem={({ item, index }) => {
              return (
                <>
                  <TouchableOpacity
                    key={index}
                    style={{
                      ...styles.item_row,
                      backgroundColor:
                        item._id === values?._id
                          ? theme.colors.primary[100]
                          : theme.colors.bgColor,
                    }}
                    onPress={() => {
                      handleSelected({
                        _id: item._id,
                        name: item.name,
                        startTime: new Date(item.startTime),
                        endTime: new Date(item.endTime),
                        createdStartTime: item.createdStartTime,
                        createdEndTime: item.createdEndTime,
                        default: item.default,
                        timezone: item.timezone,
                      });
                    }}
                  >
                    <DefaultText
                      fontWeight={
                        item._id === values?._id ? "medium" : "normal"
                      }
                      color={
                        item._id === values?._id
                          ? "primary.1000"
                          : "text.primary"
                      }
                    >
                      {`${item.name.en}, ${
                        item?.createdStartTime
                          ? item.createdStartTime
                          : item?.startTime
                          ? format(new Date(item.startTime), "h:mm a")
                          : ""
                      } - ${
                        item?.createdEndTime
                          ? item.createdEndTime
                          : item?.endTime
                          ? format(new Date(item.endTime), "h:mm a")
                          : ""
                      }${item.default ? " (D)" : ""}, ${getTimezone(item)}`}
                    </DefaultText>
                  </TouchableOpacity>

                  <ItemDivider
                    style={{
                      margin: 0,
                      borderWidth: 0,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                    }}
                  />
                </>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Reporting Hours!")}
                    marginTop={hp("10%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <Spacer space={hp("20%")} />}
          />
        ) : (
          <PermissionPlaceholderComponent
            title={t("Please connect with internet")}
            marginTop="-25%"
          />
        )}
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
