import { useNavigation } from "@react-navigation/core";
import React, { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import Input from "../input/input";
import DefaultText from "../text/Text";

interface SideMenuProps {
  title?: string;
  isSearch?: boolean;
  placeholderText?: string;
  queryText?: string;
  setQueryText?: any;
  selectedMenu?: string;
  setSelectedMenu?: any;
  menuOptions?: any;
}

const SideMenu: FC<SideMenuProps> = ({
  title,
  isSearch,
  placeholderText,
  queryText,
  setQueryText,
  selectedMenu,
  setSelectedMenu,
  menuOptions,
}) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();

  return (
    <View
      style={{
        overflow: "hidden",
        flex: twoPaneView ? 0.25 : 1,
        height: "100%",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      <TouchableOpacity
        style={{ position: "absolute", left: 100000 }}
        onPress={(e) => {
          e.preventDefault();
        }}
      >
        <Text>PRESS</Text>
      </TouchableOpacity>

      {title && (
        <View
          style={{
            height: twoPaneView ? hp("9.5%") : hp("6%"),
            paddingHorizontal: hp("2%"),
            borderBottomWidth: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderColor: theme.colors.dividerColor.secondary,
            backgroundColor: theme.colors.primary[100],
          }}
        >
          <TouchableOpacity
            style={{
              paddingTop: hp("2.25%"),
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              navigation.goBack();
            }}
          >
            <View
              style={{
                marginRight: 10,
                transform: [
                  {
                    rotate: isRTL ? "180deg" : "0deg",
                  },
                ],
              }}
            >
              <ICONS.ArrowLeftIcon />
            </View>

            <DefaultText fontWeight="medium">{title}</DefaultText>
          </TouchableOpacity>

          {false && <ICONS.FilterSquareIcon />}
        </View>
      )}

      {isSearch && (
        <View
          style={{
            borderRadius: 16,
            marginVertical: 10,
            marginHorizontal: 12,
            paddingLeft: wp("1.5"),
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#8A959E1A",
          }}
        >
          <ICONS.SearchPrimaryIcon />

          <Input
            containerStyle={{
              borderWidth: 0,
              height: hp("6.5%"),
              backgroundColor: "transparent",
            }}
            allowClear
            style={{
              flex: twoPaneView ? 0.89 : 0.94,
            }}
            placeholderText={placeholderText}
            values={queryText}
            handleChange={(val: any) => setQueryText(val)}
          />
        </View>
      )}

      {menuOptions.map((option: any, index: number) => {
        return (
          <View key={index}>
            <TouchableOpacity
              key={index}
              style={{
                paddingVertical: hp("2.5%"),
                paddingHorizontal: hp("2%"),
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor:
                  selectedMenu == option.value && twoPaneView
                    ? "#8A959E1A"
                    : theme.colors.white[1000],
              }}
              onPress={() => {
                setSelectedMenu(option.value);
              }}
            >
              <View style={{ width: "90%" }}>
                <DefaultText fontSize="lg">{option.title}</DefaultText>

                {option.desc && (
                  <DefaultText
                    style={{ marginRight: 16 }}
                    fontSize="lg"
                    fontWeight="normal"
                    color={theme.colors.placeholder}
                  >
                    {option.desc}
                  </DefaultText>
                )}
              </View>

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

            <View
              key={option.value}
              style={{
                width: "100%",
                height: 1,
                marginLeft: hp("2%"),
                backgroundColor: theme.colors.dividerColor.main,
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

export default SideMenu;
