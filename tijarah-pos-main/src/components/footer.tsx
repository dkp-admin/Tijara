import { ActivityIndicator, View } from "react-native";
import { useTheme } from "../context/theme-context";
import { useResponsive } from "../hooks/use-responsiveness";

const FooterComponent = ({
  isFetchingNextPage,
}: {
  isFetchingNextPage: Boolean;
}) => {
  const { hp } = useResponsive();
  const theme = useTheme();
  return (
    <View style={{ height: hp("20%"), marginBottom: 100 }}>
      {isFetchingNextPage && (
        <ActivityIndicator size={"small"} color={theme.colors.primary[1000]} />
      )}
    </View>
  );
};

export default FooterComponent;
