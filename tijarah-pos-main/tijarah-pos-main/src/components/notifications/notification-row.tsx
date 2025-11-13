import { Entypo } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ItemDivider from "../action-sheet/row-divider";
import DefaultText from "../text/Text";

export default function NotificationRow({
  data,
  handleMarkReadkNotification,
}: any) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();

  return (
    <>
      <TouchableOpacity
        key={data._id}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: hp("2%"),
          paddingLeft: wp("1.5%"),
          paddingRight: wp("1.8%"),
          backgroundColor: theme.colors.white[1000],
        }}
        onPress={() => {
          if (!data.read) {
            handleMarkReadkNotification(data._id);
          }
        }}
        disabled={data.read}
      >
        <View
          style={{
            width: hp("6%"),
            height: hp("6%"),
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: data.read
              ? theme.colors.dividerColor.secondary
              : theme.colors.primary[300],
          }}
        >
          <Entypo
            size={hp("3.25%")}
            key={"chatbox-outline"}
            name="chat"
            color={theme.colors.white[1000]}
          />
        </View>

        <View style={{ marginLeft: wp("1.25%") }}>
          <DefaultText
            style={{
              marginTop: -3,
              fontSize: 19,
              fontFamily: data.read ? "Tijarah-Regular" : "Tijarah-Bold",
            }}
            color={data.read ? theme.colors.placeholder : "text.primary"}
          >
            {data.title}
          </DefaultText>

          <DefaultText
            style={{ marginTop: 3, textAlign: "left" }}
            fontSize="xl"
            fontWeight={data.read ? "normal" : "medium"}
            color={data.read ? theme.colors.placeholder : "otherGrey.100"}
          >
            {data.body}
          </DefaultText>

          <DefaultText
            style={{ marginTop: 5, textAlign: "left" }}
            fontSize="lg"
            color={data.read ? theme.colors.placeholder : "otherGrey.200"}
          >
            {format(new Date(data.createdAt), "dd/MM/yyyy, h:mm a")}
          </DefaultText>
        </View>
      </TouchableOpacity>

      <ItemDivider
        style={{
          margin: 0,
          borderWidth: 0,
          borderBottomWidth: 1,
          borderColor: "#E5E9EC",
        }}
      />
    </>
  );
}
