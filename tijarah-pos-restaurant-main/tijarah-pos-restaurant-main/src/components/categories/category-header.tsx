import { useNavigation } from "@react-navigation/core";
import { TouchableOpacity, View } from "react-native";
import { checkDirection } from "../../hooks/check-direction";
import ICONS from "../../utils/icons";
import SeparatorHorizontalView from "../common/separator-horizontal-view";
import DefaultText from "../text/Text";

const CategoryHeader = ({ route }: any) => {
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;

  const categoryName = route.params.categoryName;
  const isRestaurant = route.params.isRestaurant;

  return (
    <>
      <TouchableOpacity
        style={{
          maxWidth: "50%",
          marginLeft: 10,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "transparent",
        }}
        onPress={() => {
          navigation.navigate(
            isRestaurant ? "MenuCategoryListBilling" : "CategoryListBilling"
          );
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
          style={{ marginHorizontal: 12 }}
          fontSize="lg"
          fontWeight="medium"
        >
          {isRTL ? categoryName?.ar : categoryName?.en}
        </DefaultText>
      </TouchableOpacity>

      <SeparatorHorizontalView />
    </>
  );
};

export default CategoryHeader;
