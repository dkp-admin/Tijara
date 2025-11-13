import React from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";
import { trimText } from "../../utils/trim-text";

export default function ActionSheetHeader({
  title,
  isLeftBtn = true,
  isClose = true,
  isCurrency,
  rightBtnText,
  handleLeftBtn,
  handleRightBtn,
  isDivider = true,
  descriptionRight,
  description,
  loading = false,
  permission,
}: {
  title: string;
  isLeftBtn?: boolean;
  isClose?: boolean;
  isCurrency?: boolean;
  rightBtnText?: string;
  handleLeftBtn?: any;
  handleRightBtn?: any;
  isDivider?: boolean;
  descriptionRight?: string;
  description?: string;
  loading?: boolean;
  permission?: boolean;
}) {
  const { wp, hp, twoPaneView } = useResponsive();
  const isRTL = checkDirection();

  return (
    <>
      <View
        style={{
          paddingVertical: hp("1.5%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isLeftBtn && (
          <TouchableOpacity
            onPress={() => handleLeftBtn()}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 5,
              position: "absolute",
              left: wp("1.25%"),
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            {isClose ? <ICONS.CloseIcon /> : <ICONS.ArrowBackIcon />}
          </TouchableOpacity>
        )}

        <View
          style={{
            maxWidth: twoPaneView ? "60%" : "40%",
            alignItems: "center",
          }}
        >
          <DefaultText
            style={{ textAlign: "center" }}
            fontSize={"2xl"}
            fontWeight="medium"
            noOfLines={2}
          >
            {trimText(title, 40)}
          </DefaultText>

          {description && (
            <DefaultText
              style={{ marginTop: 2 }}
              fontSize="sm"
              fontWeight="normal"
              color="otherGrey.100"
            >
              {description}
            </DefaultText>
          )}
        </View>

        {rightBtnText &&
          (isCurrency ? (
            <View
              style={{
                position: "absolute",
                right: wp("2%"),
                flexDirection: "column",
              }}
            >
              <DefaultText fontSize="2xl" fontWeight="medium">
                {rightBtnText}
              </DefaultText>

              {descriptionRight && (
                <DefaultText
                  fontSize="md"
                  fontWeight="normal"
                  color="otherGrey.100"
                >
                  {descriptionRight}
                </DefaultText>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={{
                paddingVertical: 15,
                paddingHorizontal: 12,
                position: "absolute",
                right: wp("1.5%"),
              }}
              onPress={() => handleRightBtn()}
              disabled={!permission || loading}
            >
              {loading ? (
                <ActivityIndicator size={"small"} />
              ) : (
                <DefaultText
                  fontSize={"2xl"}
                  fontWeight="medium"
                  color={
                    !permission || loading ? "otherGrey.200" : "primary.1000"
                  }
                >
                  {rightBtnText}
                </DefaultText>
              )}
            </TouchableOpacity>
          ))}
      </View>

      {isDivider && <SeparatorHorizontalView />}
    </>
  );
}
