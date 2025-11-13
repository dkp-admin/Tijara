import React from "react";
import { View } from "react-native";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";
import NoDataPlaceholder from "./no-data-placeholder/no-data-placeholder";

const PermissionPlaceholderComponent = ({
  title,
  marginTop = "20%",
}: {
  title: string;
  marginTop?: string;
}) => {
  const theme = useTheme();
  const { hp } = useResponsive();

  return (
    <View
      style={{
        height: "100%",
        paddingHorizontal: "5%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.bgColor,
      }}
    >
      <NoDataPlaceholder title={title} marginTop={hp(marginTop)} />
    </View>
  );
};

export default PermissionPlaceholderComponent;
