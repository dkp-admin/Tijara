import { useNavigation } from "@react-navigation/core";
import { TouchableOpacity, View } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";
import useReportStore from "../../store/report-filter";

const ReportsNavHeader = ({
  title,
  dateRange,
  selectedMenu,
  handleFilterTap,
}: {
  title: string;
  dateRange: string;
  selectedMenu: string;
  handleFilterTap: any;
}) => {
  const isRTL = checkDirection();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { wp, hp } = useResponsive();

  const { reportFilter } = useReportStore() as any;

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            marginLeft: 10,
            flexDirection: "row",
            alignItems: "center",
            width: "45%",
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View
            style={{
              paddingLeft: 10,
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.ArrowLeftIcon />
          </View>

          <DefaultText
            style={{ marginHorizontal: 10 }}
            fontSize="xl"
            fontWeight="medium"
          >
            {title}
          </DefaultText>
        </TouchableOpacity>

        <View
          style={{
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            paddingVertical: hp("1%"),
            paddingHorizontal: wp("3.5%"),
          }}
        >
          <DefaultText
            style={{ maxWidth: "50%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {dateRange}
          </DefaultText>

          {(selectedMenu == "activityLogs" ? true : isConnected) && (
            <TouchableOpacity
              style={{ paddingHorizontal: wp("2%") }}
              onPress={() => handleFilterTap()}
            >
              {Object.keys(reportFilter).length > 0 ? (
                <ICONS.FilterAppliedIcon />
              ) : (
                <ICONS.FilterSquareIcon />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SeparatorHorizontalView />
    </>
  );
};

export default ReportsNavHeader;
