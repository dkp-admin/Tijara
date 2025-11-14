import { StackActions, useNavigation } from "@react-navigation/core";
import nextFrame from "next-frame";
import React from "react";
import { TouchableHighlight, View } from "react-native";
import DefaultText from "../components/text/Text";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";

const Tab = ({
  title,
  icon: Icon,
  isFocused,
  tabBarActiveTintColor,
  jumpTo,
  idx,
  twoPaneView,
}: any) => {
  const theme = useTheme();
  // const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  // const deviceContext = useContext(DeviceContext) as any;
  // const opacity = useRef(new Animated.Value(0)).current;

  // const [unreadNotif, setUnreadNotif] = useState(0);

  // const getNotifications = async () => {
  //   try {
  //     const res = await serviceCaller(endpoint.notification.path, {
  //       method: endpoint.notification.method,
  //       query: {
  //         page: 0,
  //         sort: "desc",
  //         limit: 100,
  //         activeTab: "all",
  //         companyRef: deviceContext?.user?.companyRef,
  //         locationRef: deviceContext?.user?.locationRef,
  //       },
  //     });

  //     if (res?.results?.length > 0) {
  //       const unread = res?.results?.filter((noti: any) => !noti.read);
  //       setUnreadNotif(unread?.length);
  //     }
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  // useEffect(() => {
  //   getNotifications();
  // }, []);

  // useEffect(() => {
  //   const animate = () => {
  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.timing(opacity, {
  //           toValue: 1,
  //           duration: 750,
  //           easing: Easing.linear,
  //           useNativeDriver: true,
  //         }),
  //         Animated.timing(opacity, {
  //           toValue: 0,
  //           duration: 750,
  //           easing: Easing.linear,
  //           useNativeDriver: true,
  //         }),
  //       ]),
  //       { iterations: -1 }
  //     ).start();
  //   };

  //   animate();

  //   return () => {
  //     opacity.setValue(0); // Reset the opacity value when component unmounts
  //   };
  // }, []);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
      }}
    >
      <TouchableHighlight
        activeOpacity={0.6}
        underlayColor={theme.colors.placeholder}
        onPress={async () => {
          await nextFrame();
          // playTouchSound();
          navigation.dispatch(StackActions.popToTop());
          jumpTo(title);
        }}
        style={{
          borderRadius: 5,
          paddingVertical: 8,
          paddingHorizontal: twoPaneView ? 50 : 5,
        }}
      >
        <View
          style={{
            flexDirection: twoPaneView ? "row" : "column",
            alignItems: "center",
          }}
        >
          {/* {unreadNotif > 0 && title == t("Notifications") ? (
            <View style={{ position: "relative" }}>
              <FontAwesome
                name="circle"
                color={"red"}
                size={7}
                style={{
                  position: "relative",
                  top: -3,
                  left: isRTL ? 0.5 : 18,
                  marginBottom: -7,
                }}
              />
              <Icon
                color={
                  isFocused() ? tabBarActiveTintColor : theme.colors.dark[600]
                }
                fontSize={24}
              />
            </View>
          ) : ( */}
          <Icon
            color={isFocused() ? tabBarActiveTintColor : theme.colors.dark[600]}
            fontSize={24}
          />
          {/* )} */}

          {/* <View style={{ flexDirection: "row" }}> */}
          <DefaultText
            style={{
              fontSize: twoPaneView ? 16 : 12,
              marginLeft: twoPaneView ? 12 : 0,
            }}
            fontWeight={isFocused() ? "semibold" : "normal"}
            color={
              isFocused() ? tabBarActiveTintColor : theme.colors.text.primary
            }
          >
            {title}
          </DefaultText>

          {/* {title === t("Orders") && (
              <Animated.View style={{ opacity }}>
                <FontAwesome
                  size={10}
                  name="circle"
                  color={theme.colors.primary[1000]}
                  style={{
                    marginTop: -0.5,
                    marginLeft: 1.5,
                    position: "relative",
                  }}
                />
              </Animated.View>
            )} */}
          {/* </View> */}
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default function CustomBottomTab(props: any) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        position: "absolute",
        backgroundColor: theme.colors.tabBottomColor,
        bottom: 0,
        zIndex: 1,
        width: "100%",
        height: twoPaneView ? hp("7%") : hp("8.25%"),
        flexDirection: "row",
        paddingVertical: twoPaneView ? 6 : 3,
        borderTopWidth: 1,
        borderTopColor: "#D8D8D8",
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
            size={24}
            isFocused={navigation.isFocused}
            jumpTo={navigation.jumpTo}
            tabBarActiveTintColor={options.tabBarActiveTintColor}
            tabBarBadgeCount={options?.tabBarBadge}
            twoPaneView={twoPaneView}
          />
        );
      })}
    </View>
  );
}
