import { useNavigation } from "@react-navigation/core";
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import Input from "../input/input";
import DefaultText from "../text/Text";
import SeparatorHorizontalView from "./separator-horizontal-view";

const CatalogueNavHeader = ({
  title,
  placeholderText,
  query,
  handleQuery,
  showAddBtn = true,
  handleAddButtonTap,
  readPermission,
  createPermission,
}: {
  title: string;
  placeholderText: string;
  query: string;
  handleQuery: any;
  showAddBtn?: boolean;
  handleAddButtonTap?: any;
  readPermission?: boolean;
  createPermission?: boolean;
}) => {
  const theme = useTheme();
  const isRTL = checkDirection();
  const navigation = useNavigation() as any;
  const { wp, hp } = useResponsive();

  const [showTextInput, setShowTextInput] = useState(false);

  return (
    <>
      <View
        style={{
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

        <View
          style={{
            height: hp("6.5%"),
            flexDirection: "row",
            alignItems: "center",
            paddingLeft: wp("1.75%"),
            paddingRight: showAddBtn ? wp("1%") : wp("6%"),
          }}
        >
          <TouchableOpacity
            onPress={() => {
              handleQuery("");
              setShowTextInput(!showTextInput);
            }}
            disabled={!readPermission}
          >
            <ICONS.SearchPrimaryIcon
              color={
                readPermission
                  ? theme.colors.primary[1000]
                  : theme.colors.placeholder
              }
            />
          </TouchableOpacity>

          {showAddBtn && (
            <PrimaryButton
              style={{ backgroundColor: "transparent" }}
              title={""}
              leftIcon={
                <ICONS.AddCircleIcon
                  color={
                    createPermission
                      ? theme.colors.primary[1000]
                      : theme.colors.placeholder
                  }
                />
              }
              onPress={() => {
                handleAddButtonTap();
              }}
              disabled={!createPermission}
            />
          )}
        </View>
      </View>

      {showTextInput && (
        <Input
          containerStyle={{
            height: hp("6%"),
            marginTop: hp("0.5%"),
            marginBottom: hp("1%"),
            marginHorizontal: hp("2%"),
            backgroundColor: "#8A959E1A",
          }}
          allowClear={query}
          style={{ flex: 0.985 }}
          placeholderText={placeholderText}
          values={query}
          handleChange={(val: any) => handleQuery(val)}
        />
      )}

      <SeparatorHorizontalView />
    </>
  );
};

export default CatalogueNavHeader;
