import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import ItemDivider from "../../action-sheet/row-divider";
import DefaultText from "../../text/Text";

export default function ActivityLogsRow({ data }: any) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <>
      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingLeft: hp("2%"),
          paddingRight: hp("3%"),
          paddingVertical: hp("2%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <View style={{ width: twoPaneView ? "35%" : "45%" }}>
          <DefaultText
            fontSize="lg"
            fontWeight="medium"
            style={{ textTransform: "capitalize" }}
          >
            {data?.entityName + " " + data?.eventName}
          </DefaultText>

          {data?.eventType && (
            <DefaultText
              style={{ marginTop: 5, textTransform: "capitalize" }}
              fontSize="lg"
              fontWeight="medium"
              color="otherGrey.100"
            >
              {data?.eventType}
            </DefaultText>
          )}
        </View>

        <DefaultText
          style={{ width: twoPaneView ? "10%" : "15%" }}
          fontSize="lg"
        >
          {format(new Date(data?.createdAt), "h:mm:ss")}
        </DefaultText>

        {twoPaneView && (
          <DefaultText style={{ width: "25%" }} fontSize="lg">
            {data?.response}
          </DefaultText>
        )}

        <DefaultText
          style={{
            width: twoPaneView ? "10%" : "25%",
            textAlign: "right",
            textTransform: "capitalize",
          }}
          fontSize="lg"
        >
          {data?.triggeredBy || "System"}
        </DefaultText>

        <View style={{ width: "15%", alignItems: "flex-end" }}>
          {data?.success ? (
            <ICONS.TickFilledIcon color={theme.colors.primary[1000]} />
          ) : (
            <ICONS.RemoveIcon width={30} height={30} />
          )}
        </View>
      </View>
    </>
  );
}
