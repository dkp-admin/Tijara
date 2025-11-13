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

export default function CustomerGroupSelectInput({
  refresh,
  sheetRef,
  selectedIds,
  selectedNames,
  handleSelected,
}: {
  refresh: boolean;
  sheetRef: any;
  selectedIds: any;
  selectedNames: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const { wp, hp } = useResponsive();
  const isConnected = checkInternet();
  const authContext = useContext<AuthType>(AuthContext);

  const [query, setQuery] = useState("");
  const [customerGroups, setCustomerGroups] = useState<any>([]);
  const [customerGroupIds, setCustomerGroupIds] = useState<string[]>([]);
  const [customerGroupNames, setCustomerGroupNames] = useState<string[]>([]);

  const getCustomerGroups = async () => {
    if (!isConnected) {
      setCustomerGroups([]);
    }

    try {
      const res = await serviceCaller(endpoint.customerGoups.path, {
        method: endpoint.customerGoups.method,
        query: {
          page: 0,
          limit: 10,
          _q: query,
          sort: "desc",
          activeTab: "active",
          companyRef: authContext.user.companyRef,
        },
      });

      debugLog(
        "Customer Groups fetch from api",
        res?.results?.length,
        "customer-add-modal",
        "fetchCustomerGroups"
      );

      setCustomerGroups(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "customer-group-add-modal",
        "fetchCustomerGroups",
        error
      );
      setCustomerGroups([]);
    }
  };

  const isSelected = (item: any) => {
    if (customerGroupIds?.length > 0) {
      return customerGroupIds.includes(item._id);
    }

    return false;
  };

  useEffect(() => {
    getCustomerGroups();
  }, [refresh, query]);

  useEffect(() => {
    setCustomerGroupIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    setCustomerGroupNames(selectedNames);
  }, [selectedNames]);

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
            {t("Select Customer Groups")}
          </DefaultText>

          <TouchableOpacity
            style={{
              paddingVertical: 15,
              paddingHorizontal: 12,
              position: "absolute",
              right: wp("1.5%"),
            }}
            onPress={() => {
              handleSelected(customerGroupIds, customerGroupNames);
            }}
            disabled={!isConnected}
          >
            <DefaultText
              fontSize="2xl"
              fontWeight="medium"
              color={isConnected ? "primary.1000" : theme.colors.placeholder}
            >
              {t("Done")}
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
              placeholderText={t("Search Customer Groups")}
              values={query}
              allowClear
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

            <FlatList
              style={{
                marginTop: 5,
                minHeight: hp("60%"),
              }}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={customerGroups}
              renderItem={({ item, index }) => {
                return (
                  <>
                    <TouchableOpacity
                      key={index}
                      style={{
                        ...styles.item_row,
                        backgroundColor: theme.colors.bgColor,
                      }}
                      onPress={() => {
                        const idx = customerGroupIds?.indexOf(item?._id);
                        const index = customerGroupNames?.indexOf(item?.name);

                        if (idx === -1) {
                          setCustomerGroupIds([...customerGroupIds, item?._id]);
                        } else {
                          const newIds = [...customerGroupIds];
                          newIds.splice(idx, 1);
                          setCustomerGroupIds(newIds);
                        }

                        if (index === -1) {
                          setCustomerGroupNames([
                            ...customerGroupNames,
                            item?.name,
                          ]);
                        } else {
                          const newNames = [...customerGroupNames];
                          newNames.splice(index, 1);
                          setCustomerGroupNames(newNames);
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
                      title={t("No Customer Groups!")}
                      marginTop={hp("10%")}
                    />
                  </View>
                );
              }}
              ListFooterComponent={() => (
                <View
                  style={{
                    height: hp("28%"),
                    paddingVertical: 20,
                    paddingHorizontal: 26,
                  }}
                >
                  {customerGroups.length === 10 && (
                    <DefaultText fontWeight="medium" color="otherGrey.200">
                      {t("Type in the search bar to find more customer groups")}
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
