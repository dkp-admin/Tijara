import { useNavigation } from "@react-navigation/core";
import { TouchableOpacity, View } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

const SettingsNavHeader = ({ title }: { title: string }) => {
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { hp } = useResponsive();

  return (
    <>
      <View
        style={{
          height: hp("6%"),
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity
          style={{
            maxWidth: "50%",
            marginLeft: 10,
            flexDirection: "row",
            alignItems: "center",
          }}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View
            style={{
              paddingLeft: 10,
              transform: [
                {
                  rotate: isRTL ? "180deg" : "0deg",
                },
              ],
            }}
          >
            <ICONS.ArrowLeftIcon />
          </View>

          <DefaultText
            style={{ marginHorizontal: 10 }}
            fontSize="xl"
            fontWeight="medium"
          >
            {title}
          </DefaultText>
        </TouchableOpacity>
      </View>

      <SeparatorHorizontalView />
    </>
  );
};

export default SettingsNavHeader;
