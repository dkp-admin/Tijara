import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import ICONS from "../../utils/icons";
import DefaultText from "../text/Text";

function CustomHeader({
  showBackBtn = false,
  title,
  right,
  subTitle,
}: {
  showBackBtn?: boolean;
  title: string;
  right?: any;
  subTitle?: string;
}) {
  const theme = useTheme();
  const navigation = useNavigation();

  return (
    <>
      <StatusBar backgroundColor={theme.colors.bgColor} />

      <View
        style={{
          marginTop: Constants.statusBarHeight + 16,
          width: "100%",
          marginVertical: 20,
          flexDirection: "row",
        }}
      >
        <View
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {showBackBtn && (
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <ICONS.ArrowBackIcon />
            </TouchableOpacity>
          )}

          <View style={{ flex: 1 }}>
            <DefaultText
              fontSize="2xl"
              fontWeight="extrabold"
              style={{ marginLeft: showBackBtn ? 20 : 0 }}
            >
              {title}
            </DefaultText>

            {subTitle && (
              <DefaultText
                fontSize="sm"
                fontWeight="normal"
                style={{ marginLeft: showBackBtn ? 20 : 0 }}
              >
                {subTitle}
              </DefaultText>
            )}
          </View>
          {right}
        </View>
      </View>
    </>
  );
}

export default CustomHeader;
