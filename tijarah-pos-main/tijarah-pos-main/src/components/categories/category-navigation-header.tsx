import React, { useContext, useState } from "react";
import { View } from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import ICONS from "../../utils/icons";
import { PrimaryButton } from "../buttons/primary-button";
import CatalogueNavHeader from "../common/catalogue-navigation-header";
import Input from "../input/input";
import AddEditCategoryModal from "./add-category-modal";
import AuthContext from "../../context/auth-context";
import { AuthType } from "../../types/auth-types";
import { debugLog } from "../../utils/log-patch";

const CategoryNavigationHeader = ({
  queryText,
  setQueryText,
}: {
  queryText: string;
  setQueryText: any;
}) => {
  const theme = useTheme();
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const readPermission = authContext.permission["pos:category"]?.read;
  const createPermission = authContext.permission["pos:category"]?.create;

  const [visibleAddCategory, setVisibleAddCategory] = useState(false);

  return (
    <View>
      {twoPaneView ? (
        <View
          style={{
            height: hp("9.5%"),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: wp("1.75%"),
            paddingRight: wp("0.75%"),
            paddingVertical: hp("1.25%"),
            borderBottomWidth: 1,
            borderColor: theme.colors.dividerColor.secondary,
            backgroundColor: theme.colors.primary[100],
          }}
        >
          <View
            style={{
              flex: 0.95,
              borderRadius: 16,
              marginRight: -15,
              paddingLeft: wp("1.5"),
              flexDirection: "row",
              alignItems: "center",
              opacity: readPermission ? 1 : 0.25,
              backgroundColor: readPermission
                ? theme.colors.primary[100]
                : theme.colors.placeholder,
            }}
          >
            <ICONS.SearchPrimaryIcon />

            <Input
              containerStyle={{
                borderWidth: 0,
                height: hp("7.25%"),
                marginLeft: -5,
                backgroundColor: "transparent",
              }}
              allowClear={readPermission && queryText !== ""}
              style={{
                flex: queryText == "" ? 0.97 : 0.93,
              }}
              placeholderText={t("Search categories")}
              values={queryText}
              handleChange={(val: any) => setQueryText(val)}
              disabled={!readPermission}
            />
          </View>

          <PrimaryButton
            style={{ marginRight: -12, backgroundColor: "transparent" }}
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
              debugLog(
                "Create category modal opened",
                {},
                "catalogue-categories-screen",
                "handleAddCategory"
              );
              setVisibleAddCategory(true);
            }}
            disabled={!createPermission}
          />
        </View>
      ) : (
        <CatalogueNavHeader
          title={t("Categories")}
          placeholderText={t("Search categories")}
          query={queryText}
          handleQuery={setQueryText}
          handleAddButtonTap={() => {
            debugLog(
              "Create category modal opened",
              {},
              "catalogue-categories-screen",
              "handleAddCategory"
            );
            setVisibleAddCategory(true);
          }}
          readPermission={readPermission}
          createPermission={createPermission}
        />
      )}

      <AddEditCategoryModal
        visible={visibleAddCategory}
        handleClose={() => {
          debugLog(
            "Create category modal closed",
            {},
            "catalogue-categories-screen",
            "handleClose"
          );
          setVisibleAddCategory(false);
        }}
      />
    </View>
  );
};

export default React.memo(CategoryNavigationHeader);
