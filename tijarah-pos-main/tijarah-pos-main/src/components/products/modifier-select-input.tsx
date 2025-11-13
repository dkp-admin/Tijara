import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import Checkbox from "react-native-bouncy-checkbox";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../permission-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

export default function ModifierSelectInput({
  sheetRef,
  values,
  handleSelected,
}: {
  sheetRef: any;
  values: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [query, setQuery] = useState("");
  const [modifiers, setModifiers] = useState<any>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<any[]>([]);

  const getModifiers = async () => {
    if (!isConnected) {
      setModifiers([]);
    }

    try {
      const res = await serviceCaller(endpoint.modifiers.path, {
        method: endpoint.modifiers.method,
        query: {
          page: 0,
          limit: 25,
          _q: query,
          sort: "asc",
          activeTab: "active",
          companyRef: authContext.user.companyRef,
        },
      });

      debugLog(
        "Modifiers fetch from api",
        res?.results?.length,
        "modifier-select-input",
        "fetchModifiers"
      );

      setModifiers(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "modifier-select-input",
        "fetchModifiers",
        error
      );
      setModifiers([]);
    }
  };

  const checkSelected = (item: any) => {
    if (values?.length > 0) {
      return values.some((value: any) => value.modifierRef === item._id);
    }

    return false;
  };

  const isSelected = (item: any) => {
    if (selectedModifiers?.length > 0) {
      return selectedModifiers.some(
        (value: any) => value.modifierRef === item._id
      );
    }

    return false;
  };

  useEffect(() => {
    getModifiers();
  }, [query]);

  useEffect(() => {
    setSelectedModifiers(values);
  }, [values]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setQuery("");
      }}
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <DefaultText
            style={{ marginLeft: hp("2.25%") }}
            fontSize="2xl"
            fontWeight="medium"
          >
            {t("Select Modifier")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(selectedModifiers);
            }}
            disabled={
              modifiers?.length === 0 || modifiers?.length === values?.length
            }
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color={
                modifiers?.length === 0 || modifiers?.length === values?.length
                  ? theme.colors.placeholder
                  : "primary.1000"
              }
            >
              {t("Add")}
            </DefaultText>
          </TouchableOpacity>
        </View>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        {isConnected ? (
          <View>
            <Input
              leftIcon={
                <ICONS.SearchIcon
                  color={
                    query?.length > 0
                      ? theme.colors.primary[1000]
                      : theme.colors.dark[600]
                  }
                />
              }
              placeholderText={t("Search Modifer")}
              values={query}
              handleChange={(val: string) => setQuery(val)}
              containerStyle={{
                height: hp("7%"),
                marginTop: hp("2%"),
                borderRadius: 10,
                marginHorizontal: hp("2.25%"),
                backgroundColor: theme.colors.bgColor2,
              }}
              style={{
                ...styles.textInput,
                color: theme.colors.text.primary,
              }}
            />

            {modifiers?.length !== 0 &&
              modifiers?.length === values?.length && (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Modifiers!")}
                    marginTop={hp("10%")}
                  />
                </View>
              )}

            <FlatList
              style={{ marginTop: 5, minHeight: hp("60%") }}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={modifiers}
              renderItem={({ item, index }) => {
                if (checkSelected(item)) {
                  return <></>;
                }

                return (
                  <>
                    <TouchableOpacity
                      key={index}
                      style={{
                        ...styles.item_row,
                        backgroundColor: theme.colors.bgColor,
                      }}
                      onPress={() => {
                        const idx = selectedModifiers?.findIndex(
                          (mod: any) => mod.modifierRef === item._id
                        );

                        if (idx === -1) {
                          const data = {
                            modifierRef: item._id,
                            name: item.name,
                            kitchenName: item.displayName,
                            values: item.values,
                            status: item.status,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                            min: 1,
                            max: 1,
                            noOfFreeModifier: 0,
                            default: null,
                            excluded: null,
                          };

                          setSelectedModifiers([...selectedModifiers, data]);
                        } else {
                          const newMod = [...selectedModifiers];
                          newMod.splice(idx, 1);
                          setSelectedModifiers(newMod);
                        }
                      }}
                    >
                      <Checkbox
                        style={{ marginRight: -hp("0.5%") }}
                        isChecked={isSelected(item)}
                        fillColor={theme.colors.white[1000]}
                        unfillColor={theme.colors.white[1000]}
                        iconComponent={
                          isSelected(item) ? (
                            <ICONS.TickFilledIcon
                              width={25}
                              height={25}
                              color={theme.colors.primary[1000]}
                            />
                          ) : (
                            <ICONS.TickEmptyIcon
                              width={25}
                              height={25}
                              color={theme.colors.primary[1000]}
                            />
                          )
                        }
                        disableBuiltInState
                        disabled
                      />

                      <DefaultText
                        fontWeight={isSelected(item) ? "medium" : "normal"}
                      >
                        {item.name}
                      </DefaultText>
                    </TouchableOpacity>

                    <ItemDivider
                      style={{
                        margin: 0,
                        borderWidth: 0,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      }}
                    />
                  </>
                );
              }}
              ListEmptyComponent={() => {
                return (
                  <View style={{ marginHorizontal: 16 }}>
                    <NoDataPlaceholder
                      title={t("No Modifiers!")}
                      marginTop={hp("10%")}
                    />
                  </View>
                );
              }}
              ListFooterComponent={() => (
                <View
                  style={{
                    height: hp("40%"),
                    paddingVertical: 20,
                    paddingHorizontal: 26,
                  }}
                >
                  {modifiers.length === 25 && (
                    <DefaultText fontWeight="medium" color="otherGrey.200">
                      {t("Type in the search bar to find more modifers")}
                    </DefaultText>
                  )}
                </View>
              )}
            />
          </View>
        ) : (
          <PermissionPlaceholderComponent
            title={t("Please connect with internet")}
            marginTop="-25%"
          />
        )}
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
