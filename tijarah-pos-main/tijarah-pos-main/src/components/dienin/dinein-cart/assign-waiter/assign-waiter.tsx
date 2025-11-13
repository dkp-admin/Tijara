import { useIsFocused } from "@react-navigation/core";
import React, { useContext, useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import Toast from "react-native-toast-message";
import { ILike } from "typeorm";
import { t } from "../../../../../i18n";
import serviceCaller from "../../../../api";
import endpoint from "../../../../api/endpoints";
import DeviceContext from "../../../../context/device-context";
import { useTheme } from "../../../../context/theme-context";
import { checkInternet } from "../../../../hooks/check-internet";
import { useResponsive } from "../../../../hooks/use-responsiveness";
import { USER_TYPES } from "../../../../utils/constants";
import { repo } from "../../../../utils/createDatabaseConnection";
import ICONS from "../../../../utils/icons";
import { debugLog, errorLog } from "../../../../utils/log-patch";
import ItemDivider from "../../../action-sheet/row-divider";
import Input from "../../../input/input";
import NoDataPlaceholder from "../../../no-data-placeholder/no-data-placeholder";
import Spacer from "../../../spacer";
import DefaultText from "../../../text/Text";
import showToast from "../../../toast";

export default function AssignWaiter({
  values,
  sheetRef,
  handleSelected,
}: {
  values: any;
  sheetRef: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const isFocused = useIsFocused();

  const { wp, hp } = useResponsive();

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [usersList, setUsersList] = useState([]) as any;
  const isConnected = checkInternet();
  const deviceContext = useContext(DeviceContext) as any;

  useEffect(() => {
    if (values) {
      setSelected(values);
    }
  }, [values]);

  const getUsers = () => {
    repo.user
      .find({
        where: query
          ? {
              name: ILike(`%${query}%`),
              userType: USER_TYPES.WAITER,
            }
          : { userType: USER_TYPES.WAITER },
      })
      .then((users: any) => {
        debugLog(
          "Waiter fetched successful",
          users,
          "dinein-cart-screen",
          "getUsersFromDB"
        );
        setUsersList(users);
      })
      .catch((err) =>
        errorLog(
          "Waiter fetch failed",
          { locationRef: deviceContext.user?.locationRef },
          "dinein-cart-screen",
          "getUsersFromDB",
          err
        )
      );
  };

  const fetchUsersAPI = async () => {
    if (!isConnected) {
      showToast("info", t("Please connect with internet"));
      return;
    }

    try {
      const res = await serviceCaller(endpoint.fetchPOSUser.path, {
        method: endpoint.fetchPOSUser.method,
        query: {
          locationRef: deviceContext.user?.locationRef,
        },
      });

      if (res?.users?.length > 0) {
        const data = res.users.map((user: any) => {
          return {
            _id: user._id,
            name: user.name,
            company: { name: user.company.name },
            companyRef: user.companyRef,
            location: { name: user.location.name },
            locationRef: user.locationRef,
            profilePicture: user.profilePicture,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            permissions: user.permissions,
            status: user.status,
            onboarded: user.onboarded,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            __v: user.__v,
            pin: user.pin,
            id: user.id,
            key: user._id,
            value: `${user.name} (${user.phone})`,
          };
        });

        setUsersList(
          data?.filter((user: any) => user.userType === USER_TYPES.WAITER)
        );

        const prms = res?.users?.map((user: any) => {
          return repo.user.save({
            _id: user._id,
            name: user.name,
            company: { name: user.company.name },
            companyRef: user.companyRef,
            location: { name: user.location.name },
            locationRef: user.locationRef,
            profilePicture: user.profilePicture,
            email: user.email,
            phone: user.phone,
            userType: user.userType,
            permissions: user.permissions,
            status: user.status,
            onboarded: user.onboarded,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            __v: user.__v,
            pin: user.pin,
            id: user.id,
            key: user._id,
            value: `${user.name} (${user.phone})`,
          });
        });
        await Promise.all(prms);

        debugLog(
          "Waiter list from api updated to db",
          { locationRef: deviceContext.user?.locationRef, users: res?.users },
          "dinein-cart-screen",
          "fetchUsersApi"
        );

        showToast("success", t("Waiter list has been refreshed"));
      } else {
        debugLog(
          "Waiter list from api is empty",
          { locationRef: deviceContext.user?.locationRef, users: res?.users },
          "dinein-cart-screen",
          "fetchUsersApi"
        );
      }
    } catch (error: any) {
      errorLog(
        error?.code,
        { locationRef: deviceContext.user?.locationRef },
        "dinein-cart-screen",
        "fetchUsersApi",
        error
      );
    }
  };

  useEffect(() => {
    getUsers();
  }, [isFocused, query]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setQuery("");
        setSelected(null);
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
            {t("Select Waiter")}
          </DefaultText>

          <View
            style={{
              gap: hp("3%"),
              right: wp("1.5%"),
              position: "absolute",
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 12,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                fetchUsersAPI();
              }}
            >
              <DefaultText
                fontSize="2xl"
                fontWeight="medium"
                color="primary.1000"
              >
                {t("Sync")}
              </DefaultText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (selected) {
                  handleSelected(selected);
                }
              }}
              disabled={!selected}
            >
              <DefaultText
                fontSize="2xl"
                fontWeight="medium"
                color={selected ? "primary.1000" : theme.colors.placeholder}
              >
                {t("Done")}
              </DefaultText>
            </TouchableOpacity>
          </View>
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
          placeholderText={t("Search Waiter")}
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
          style={{ marginTop: 5, minHeight: hp("60%") }}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={usersList}
          renderItem={({ item, index }) => {
            return (
              <>
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                    backgroundColor:
                      item._id === selected?._id
                        ? theme.colors.primary[100]
                        : theme.colors.bgColor,
                  }}
                  onPress={() => {
                    setSelected(item);
                  }}
                >
                  <DefaultText
                    fontWeight={
                      item._id === selected?._id ? "medium" : "normal"
                    }
                    color={
                      item._id === selected?._id
                        ? "primary.1000"
                        : "text.primary"
                    }
                  >
                    {`${item.name} (${item.phone})`}
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
                  title={t("No Waiters!")}
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
              {usersList.length === 20 && (
                <DefaultText fontWeight="medium" color="otherGrey.200">
                  {t("Type in the search bar to find more waiters")}
                </DefaultText>
              )}
            </View>
          )}
        />
      </View>

      <Toast />
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
