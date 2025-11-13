import React from "react";
import { Platform, Switch, TouchableOpacity, View } from "react-native";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { checkDirection } from "../../../hooks/check-direction";
import { useResponsive } from "../../../hooks/use-responsiveness";
import ICONS from "../../../utils/icons";
import DefaultText from "../../text/Text";
import showToast from "../../toast";

export default function ModifierRow({ data, disabled, handleOnPress }: any) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { wp, hp, twoPaneView } = useResponsive();

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
        borderBottomWidth: 1,
        borderColor: "#E5E9EC",
        backgroundColor: theme.colors.white[1000],
      }}
    >
      {twoPaneView ? (
        <>
          <View
            style={{
              width: "42%",
              marginRight: "3%",
              flexDirection: "row",
              alignItems: "center",
            }} // 42%
          >
            {/* <ICONS.MenuIcon /> */}

            <DefaultText
              // style={{ marginLeft: wp("1%") }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.name}
            </DefaultText>
          </View>

          <DefaultText
            style={{ width: "19%", marginRight: "2%" }} // 18%
            fontSize="lg"
            fontWeight="medium"
          >
            {data.min}
          </DefaultText>

          <DefaultText
            style={{ width: "19%", marginRight: "2%" }} // 18%
            fontSize="lg"
            fontWeight="medium"
          >
            {data.max}
          </DefaultText>

          <View style={{ width: "6%", marginRight: "2%" }}>
            <Switch
              style={{
                transform:
                  Platform.OS == "ios"
                    ? [{ scaleX: 0.9 }, { scaleY: 0.9 }]
                    : [{ scaleX: 1 }, { scaleY: 1 }],
                height: hp("5%"),
              }}
              trackColor={{
                false: "rgba(120, 120, 128, 0.16)",
                true: "#34C759",
              }}
              thumbColor={theme.colors.white[1000]}
              value={data.status === "active"}
              onValueChange={() => {
                showToast(
                  "info",
                  t("Manage modifier status from merchant panel")
                );
              }}
            />
          </View>

          {/* <DefaultText
            style={{ width: "18%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data?.noOfFreeModifier || 0}
          </DefaultText> */}
        </>
      ) : (
        <>
          <View
            style={{
              width: "48%",
              marginRight: "3%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* <ICONS.MenuIcon /> */}

            <DefaultText
              // style={{ marginLeft: wp("1%") }}
              fontSize="lg"
              fontWeight="medium"
            >
              {data.name}
            </DefaultText>
          </View>

          <DefaultText
            style={{ width: "20%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data.min}
          </DefaultText>

          <DefaultText
            style={{ width: "20%", marginRight: "2%" }}
            fontSize="lg"
            fontWeight="medium"
          >
            {data.max}
          </DefaultText>
        </>
      )}

      <TouchableOpacity
        style={{
          opacity: disabled ? 0.5 : 1,
          width: "5%",
          marginLeft: wp("1.75%"),
          marginRight: wp("2%"),
          paddingVertical: hp("1%"),
          transform: [
            {
              rotate: isRTL ? "180deg" : "0deg",
            },
          ],
        }}
        onPress={() => handleOnPress(data)}
        disabled={disabled}
      >
        <ICONS.RightArrowBoldIcon />
      </TouchableOpacity>
    </View>
  );
}
