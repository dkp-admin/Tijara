import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import DeviceContext from "../../../../context/device-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { USER_TYPES } from "../../../../utils/constants";
import ICONS from "../../../../utils/icons";
import { debugLog, errorLog } from "../../../../utils/log-patch";
import ItemDivider from "../../../action-sheet/row-divider";
import Input from "../../../input/input";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import PermissionPlaceholderComponent from "../../../permission-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";

export default function DeliveryBoySelectInput({
  sheetRef,
  values,
  handleSelected,
}: {
  sheetRef: any;
  values: any;
  handleSelected: (x: any, y: any) => any;
}) {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();
  const deviceContext = useContext(DeviceContext) as any;

  const [query, setQuery] = useState("");
  const [deliveryUsers, setDeliveryUsers] = useState<any[]>([]);

  const getDeliveryUsers = async () => {
    if (!isConnected) {
      setDeliveryUsers([]);
    }

    try {
      const res = await serviceCaller(endpoint.driver.path, {
        method: endpoint.driver.method,
        query: {
          page: 0,
          limit: 25,
          _q: query,
          sort: "asc",
          activeTab: "active",
          userType: USER_TYPES.DRIVER,
          companyRef: deviceContext.user.companyRef,
          locationRef: deviceContext.user.locationRef,
        },
      });

      debugLog(
        "Delivery users fetch from api",
        res?.results?.length,
        "delivery-user-select-input",
        "fetchDeliveryUsers"
      );

      setDeliveryUsers(res?.results || []);
    } catch (error: any) {
      errorLog(
        error?.message,
        {},
        "delivery-user-select-input",
        "fetchDeliveryUsers",
        error
      );
      setDeliveryUsers([]);
    }
  };

  useEffect(() => {
    getDeliveryUsers();
  }, [query]);

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
        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {t("Select Delivery Boy")}
        </DefaultText>

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
              placeholderText={t("Search Delivery Boy")}
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

            <FlatList
              style={{
                marginTop: 5,
                minHeight: hp("60%"),
              }}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={deliveryUsers}
              renderItem={({ item, index }) => {
                return (
                  <>
                    <TouchableOpacity
                      key={index}
                      style={{
                        ...styles.item_row,
                        backgroundColor:
                          item._id === values.key
                            ? theme.colors.primary[100]
                            : theme.colors.bgColor,
                      }}
                      onPress={() => {
                        handleSelected(
                          {
                            value: `${item.name}, ${item.phone}`,
                            key: item._id,
                          },
                          item
                        );
                      }}
                    >
                      <DefaultText
                        fontWeight={
                          item._id === values.key ? "medium" : "normal"
                        }
                        color={
                          item._id === values.key
                            ? "primary.1000"
                            : "text.primary"
                        }
                      >
                        {`${item.name}, ${item.phone}`}
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
                      title={t("No Drivers!")}
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
                  {deliveryUsers.length === 25 && (
                    <DefaultText fontWeight="medium" color="otherGrey.200">
                      {t("Type in the search bar to find more delivery boys")}
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
