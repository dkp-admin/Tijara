import { FontAwesome } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useMarkNotification } from "../../hooks/use-mark-notification";
import DefaultText, { getOriginalSize } from "../text/Text";

export default function NotificationRow({ data }: any) {
  const theme = useTheme();
  const { markNotification } = useMarkNotification();

  return (
    <TouchableOpacity
      style={{
        marginLeft: getOriginalSize(20),
        marginRight: -getOriginalSize(16),
        paddingBottom: getOriginalSize(12),
        borderTopWidth: getOriginalSize(1),
        borderColor: theme.colors.dividerColor.main,
      }}
      onPress={async () => {
        await markNotification({
          notificationIds: [data?._id],
          type: "selective",
        });
      }}
      disabled={data?.read}
    >
      <View
        style={{
          marginTop: getOriginalSize(12),
          marginLeft: -getOriginalSize(20),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View
          style={{ width: "60%", flexDirection: "row", alignItems: "center" }}
        >
          <FontAwesome
            name="circle"
            size={12}
            style={{
              marginLeft: getOriginalSize(5),
              marginRight: getOriginalSize(8),
            }}
            color={theme.colors.primary[1000]}
          />

          <DefaultText fontSize="xl" fontWeight="bold">
            {data?.title}
          </DefaultText>
        </View>

        <DefaultText
          style={{ marginRight: getOriginalSize(24) }}
          fontSize="md"
          color="otherGrey.200"
        >
          {format(new Date(data?.createdAt), "h:mm a, dd/MM/yyyy")}
        </DefaultText>
      </View>

      <DefaultText
        style={{
          marginTop: getOriginalSize(5),
          marginLeft: getOriginalSize(5),
          marginRight: getOriginalSize(10),
        }}
        fontSize="lg"
        color="otherGrey.100"
      >
        {data?.body}
      </DefaultText>
    </TouchableOpacity>
  );
}
