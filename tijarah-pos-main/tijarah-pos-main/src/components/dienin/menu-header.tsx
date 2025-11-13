import { useNavigation } from "@react-navigation/core";
import { TouchableOpacity, View } from "react-native";
import { t } from "../../../i18n";
import { checkDirection } from "../../hooks/check-direction";
import ICONS from "../../utils/icons";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";
import CustomHeader from "../common/custom-header";

const MenuHeader = () => {
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;

  return (
    <>
      <TouchableOpacity
        style={{
          marginLeft: 10,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          backgroundColor: "transparent",
        }}
        onPress={() => {
          navigation.navigate("DineinMenu");
        }}
      >
        <View
          style={{
            paddingLeft: 10,
            transform: [{ rotate: isRTL ? "180deg" : "0deg" }],
          }}
        >
          <ICONS.ArrowLeftIcon />
        </View>

        <DefaultText
          style={{ marginHorizontal: 10 }}
          fontSize="lg"
          fontWeight="medium"
        >
          {t("Menu")}
        </DefaultText>
      </TouchableOpacity>

      <SeparatorHorizontalView />
    </>
  );
};

export default MenuHeader;
