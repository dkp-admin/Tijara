import { FontAwesome } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { t } from "../../i18n";
import DefaultText, { getOriginalSize } from "../components/text/Text";
import { useTheme } from "../context/theme-context";
import { checkDirection } from "../hooks/use-direction-check";
import { useEntity } from "../hooks/use-entity";
import { useResponsive } from "../hooks/use-responsiveness";

const Tab = ({
  title,
  icon: Icon,
  isFocused,
  tabBarActiveTintColor,
  jumpTo,
}: any) => {
  const theme = useTheme();
  const isRTL = checkDirection();

  const { find, entities } = useEntity("notification");

  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    find({
      page: 0,
      sort: "desc",
      limit: 100,
    });
  }, []);

  useEffect(() => {
    const unread = entities?.results?.filter((noti: any) => !noti.read);
    setUnreadNotif(unread?.length);
  }, [entities?.results]);

  return (
    <Pressable
      style={{
        flex: 1,
        alignItems: "center",
      }}
      onPress={() => jumpTo(title)}
    >
      {unreadNotif > 0 && title == "Notifications" ? (
        <View style={{ position: "relative" }}>
          <FontAwesome
            name="circle"
            color={"red"}
            size={getOriginalSize(6)}
            style={{
              position: "relative",
              top: -3,
              left: isRTL ? 0.5 : 18,
              marginBottom: -7,
            }}
          />
          <Icon
            color={isFocused() ? tabBarActiveTintColor : theme.colors.dark[600]}
            fontSize={getOriginalSize(24)}
          />
        </View>
      ) : (
        <Icon
          color={isFocused() ? tabBarActiveTintColor : theme.colors.dark[600]}
          fontSize={getOriginalSize(24)}
        />
      )}

      <DefaultText
        style={{ marginLeft: isRTL ? 6 : 2 }}
        fontSize="md"
        fontWeight="semibold"
        color={isFocused() ? tabBarActiveTintColor : theme.colors.dark[600]}
      >
        {title}
      </DefaultText>
    </Pressable>
  );
};

export default function CustomBottomTab(props: any) {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        zIndex: 1,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#D8D8D8",
        height: hp("8%"),
        backgroundColor: theme.colors.tabBottomColor,
      }}
    >
      {Object.keys(props.descriptors).map((routeId, idx) => {
        const { route, options, navigation } = props.descriptors[routeId];
        const Icon = options.tabBarIcon;

        return (
          <Tab
            key={idx}
            idx={idx}
            title={route.name}
            icon={Icon}
            color="red"
            size={getOriginalSize(24)}
            isFocused={navigation.isFocused}
            jumpTo={navigation.jumpTo}
            tabBarActiveTintColor={options.tabBarActiveTintColor}
            tabBarBadgeCount={options?.tabBarBadge}
          />
        );
      })}
    </View>
  );
}
