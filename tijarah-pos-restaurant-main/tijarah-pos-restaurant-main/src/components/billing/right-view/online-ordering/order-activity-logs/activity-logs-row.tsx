import { format } from "date-fns";
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../../../../context/theme-context";
import { useResponsive } from "../../../../../hooks/use-responsiveness";
import DefaultText from "../../../../text/Text";

export default function ActivityLogsRow({
  data,
  isLast,
}: {
  data: any;
  isLast: boolean;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  if (!data) {
    return <></>;
  }

  return (
    <View
      style={{
        paddingVertical: hp("2.5%"),
        paddingHorizontal: hp("1.75%"),
        flexDirection: "row",
        alignItems: "center",
        borderColor: "#E5E9EC",
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomLeftRadius: isLast ? 16 : 0,
        borderBottomRightRadius: isLast ? 16 : 0,
        backgroundColor: theme.colors.dark[50],
      }}
    >
      {twoPaneView ? (
        <>
          <DefaultText
            style={{ width: "22%", marginLeft: "1%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data?.updatedAt
              ? format(new Date(data.updatedAt), "dd/MM/yyyy, h:mm a")
              : format(new Date(), "dd/MM/yyyy, h:mm a")}
          </DefaultText>

          <DefaultText
            style={{ width: "23%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data?.userName || "-"}
          </DefaultText>
        </>
      ) : (
        <View style={{ width: "32%", marginLeft: "1%", marginRight: "2%" }}>
          <DefaultText fontSize="lg" fontWeight="medium">
            {data?.updatedAt
              ? format(new Date(data.updatedAt), "dd/MM/yyyy, h:mm a")
              : format(new Date(), "dd/MM/yyyy, h:mm a")}
          </DefaultText>

          <DefaultText fontSize="lg" fontWeight="medium">
            {data?.userName || "-"}
          </DefaultText>
        </View>
      )}

      <DefaultText
        style={{ width: twoPaneView ? "49%" : "64%", marginRight: "1%" }}
        fontSize="lg"
        fontWeight="medium"
      >
        {`${data?.event.replace(/(\w)-(\w)/g, "$1 $2").replace(/-/g, " ")}`}
      </DefaultText>
    </View>
  );
}
