import { useIsFocused } from "@react-navigation/core";
import { useNavigation } from "@react-navigation/native";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  RefreshControl,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import OnlineOrderListHeader from "../../components/billing/right-view/online-ordering/online-order-list-header";
import OnlineOrderRow from "../../components/billing/right-view/online-ordering/online-order-row";
import OnlineTabButton from "../../components/billing/right-view/online-ordering/online-order-tab-button";
import OnlineOrderQRSettingModal from "../../components/billing/right-view/online-ordering/order-qr-setting-modal";
import OnlineOrderSettingModal from "../../components/billing/right-view/online-ordering/order-setting-modal";
import CustomHeader from "../../components/common/custom-header";
import SeparatorHorizontalView from "../../components/common/separator-horizontal-view";
import EmptyOrLoaderComponent from "../../components/empty";
import Input from "../../components/input/input";
import Loader from "../../components/loader";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { orderRowsPerPage } from "../../utils/constants";
import ICONS from "../../utils/icons";

const fetchOnlineOrderingApi = async (
  pageParam: any,
  companyRef: any,
  locationRef: any,
  activeTab: string,
  queryText: string
) => {
  const response = await serviceCaller(endpoint.onlineOrdering.path, {
    method: endpoint.onlineOrdering.method,
    query: {
      sort: "desc",
      _q: queryText,
      page: pageParam,
      orderType: "online",
      limit: orderRowsPerPage,
      activeTab: activeTab,
      companyRef: companyRef,
      locationRef: locationRef,
    },
  });

  return response;
};

const OnlineOrdering = () => {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { wp, hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [location, setlocation] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [visibleOrderSetting, setVisibleOrderSetting] = useState(false);
  const [visibleQROrderSetting, setVisibleQROrderSetting] = useState(false);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isRefetching,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    [
      `find-online-ordering`,
      authContext,
      queryText,
      currentTab,
      isFocused,
      isConnected,
    ],
    async ({ pageParam = 0 }) => {
      if (isConnected) {
        return fetchOnlineOrderingApi(
          pageParam,
          authContext.user.companyRef,
          authContext.user.locationRef,
          currentTab,
          queryText
        );
      }
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const totalRecords = lastPage?.total;
        const currentPageSize = lastPage?.results?.length || 0;
        const nextPage = allPages?.length;
        if (
          currentPageSize < orderRowsPerPage ||
          currentPageSize === totalRecords
        ) {
          return null; // No more pages to fetch
        }
        return nextPage;
      },
    }
  );

  const fetchLocationApi = async () => {
    if (!isConnected) {
      setLoading(false);
      setlocation({});
      return;
    }

    try {
      const res = await serviceCaller(
        `${endpoint.menuConfig.path}?locationRef=${authContext.user.locationRef}&companyRef=${authContext.user.companyRef}`,
        { method: endpoint.menuConfig.method }
      );

      if (res) {
        setlocation(res);
      }
    } catch (error: any) {
      setlocation({});
    } finally {
      setLoading(false);
    }
  };

  const ordersList = useMemo(() => {
    if (data?.pages && isConnected) {
      return data?.pages?.map((page: any) => page?.results).flat();
    } else {
      return [];
    }
  }, [data?.pages]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // const getStatusText = () => {
  //   if (
  //     location?.pickupDeliveryConfiguration?.pickup &&
  //     location?.pickupDeliveryConfiguration?.delivery
  //   ) {
  //     return t("Accepting");
  //   } else if (
  //     location?.pickupDeliveryConfiguration?.pickup ||
  //     location?.pickupDeliveryConfiguration?.delivery
  //   ) {
  //     return t("Partial Accept");
  //   } else {
  //     return t("Not Accepting");
  //   }
  // };

  const getStatusColor = () => {
    if (
      location?.pickupDeliveryConfiguration?.pickup &&
      location?.pickupDeliveryConfiguration?.delivery
    ) {
      return "#006C35";
    } else if (
      location?.pickupDeliveryConfiguration?.pickup ||
      location?.pickupDeliveryConfiguration?.delivery
    ) {
      return "#F79009";
    } else {
      return "#F04438";
    }
  };

  const headerComponent = useMemo(
    () => (
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              width: twoPaneView ? "79%" : "45%",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {twoPaneView && (
              <DefaultText
                style={{ marginHorizontal: hp("2%") }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {t("Online Orders")}
              </DefaultText>
            )}

            <OnlineTabButton
              currentTab={currentTab}
              handleCurrentTab={(value: string) => {
                setCurrentTab(value);
              }}
            />
          </View>

          <View style={{ ...styles.stack, marginRight: 0 }}>
            <TouchableOpacity
              style={{
                ...styles.box,
                borderColor: theme.colors.dividerColor.secondary,
              }}
              onPress={() => {
                setVisibleQROrderSetting(true);
              }}
            >
              <DefaultText
                fontSize="md"
                fontWeight="medium"
                color={
                  location?.pickupQRConfiguration?.pickup
                    ? "#006C35"
                    : "#F04438"
                }
              >
                {"QR"}
              </DefaultText>

              <Switch
                style={{
                  marginLeft: 5,
                  height: hp("5%"),
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.75 }, { scaleY: 0.75 }]
                      : [
                          { scaleX: twoPaneView ? 1.25 : 1 },
                          { scaleY: twoPaneView ? 1.25 : 1 },
                        ],
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: location?.pickupQRConfiguration?.pickup
                    ? "#006C35"
                    : "#F04438",
                }}
                thumbColor={theme.colors.white[1000]}
                value={true}
                disabled
              />
            </TouchableOpacity>
          </View>

          <View style={styles.stack}>
            <TouchableOpacity
              style={{
                ...styles.box,
                borderColor: theme.colors.dividerColor.secondary,
              }}
              onPress={() => {
                setVisibleOrderSetting(true);
              }}
            >
              <DefaultText
                fontSize="md"
                fontWeight="medium"
                color={getStatusColor()}
              >
                {t("Online")}
              </DefaultText>

              <Switch
                style={{
                  marginLeft: 5,
                  height: hp("5%"),
                  transform:
                    Platform.OS == "ios"
                      ? [{ scaleX: 0.75 }, { scaleY: 0.75 }]
                      : [
                          { scaleX: twoPaneView ? 1.25 : 1 },
                          { scaleY: twoPaneView ? 1.25 : 1 },
                        ],
                }}
                trackColor={{
                  false: "rgba(120, 120, 128, 0.16)",
                  true: getStatusColor(),
                }}
                thumbColor={theme.colors.white[1000]}
                value={true}
                disabled
              />
            </TouchableOpacity>
          </View>
        </View>

        <SeparatorHorizontalView />

        <View
          style={{
            borderRadius: 16,
            marginVertical: hp("1.5%"),
            marginHorizontal: hp("2%"),
            paddingLeft: wp("1.5"),
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#8A959E1A",
          }}
        >
          <ICONS.SearchPrimaryIcon />

          <Input
            containerStyle={{
              borderWidth: 0,
              height: hp("6.5%"),
              width: queryText ? "90%" : "100%",
              marginLeft: wp("0.25%"),
              backgroundColor: "transparent",
            }}
            allowClear={queryText}
            style={{
              flex: twoPaneView ? 1 : 0.945,
              fontSize: twoPaneView ? 18 : 14,
            }}
            placeholderText={t(
              "Search with Order Number or Customer Name/Phone"
            )}
            values={queryText}
            handleChange={(val: any) => setQueryText(val)}
          />

          {queryText && (
            <TouchableOpacity
              style={{
                paddingVertical: 15,
                position: "absolute",
                right: wp("1.5%"),
              }}
              onPress={() => {
                setQueryText("");
                Keyboard.dismiss();
              }}
            >
              <DefaultText
                fontSize="lg"
                fontWeight="medium"
                color="primary.1000"
              >
                {t("Cancel")}
              </DefaultText>
            </TouchableOpacity>
          )}
        </View>

        <SeparatorHorizontalView />
      </View>
    ),
    [currentTab, queryText, twoPaneView, location]
  );

  const listHeaderComponent = useMemo(() => <OnlineOrderListHeader />, []);

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("18%"), marginBottom: 16 }}>
        {isFetchingNextPage && (
          <ActivityIndicator
            size={"small"}
            color={theme.colors.primary[1000]}
          />
        )}
      </View>
    ),
    [isFetchingNextPage]
  );

  const emptyComponent = useMemo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={ordersList.length === 0}
        title={t("No Online Orders!")}
        showBtn={false}
        btnTitle=""
        handleOnPress={() => {}}
      />
    );
  }, [ordersList]);

  const renderOnlineOrdering = useCallback(
    ({ item }: any) => {
      return (
        <OnlineOrderRow
          key={item?._id}
          data={item}
          handleOnPress={(data: any) => {
            if (!isConnected) {
              showToast("info", t("Please connect with internet"));
              return;
            }

            navigation.navigate("OnlineOrderDetails", {
              id: data._id,
              orderType: data.orderType,
              industry: data?.industry || location?.industry,
            });
          }}
        />
      );
    },
    [location]
  );

  useEffect(() => {
    fetchLocationApi();
  }, []);

  return (
    <View>
      <CustomHeader />

      {!isConnected ? (
        <PermissionPlaceholderComponent
          title={t("Please connect with internet")}
          marginTop="-5%"
        />
      ) : !authContext.permission["pos:order"]?.read ? (
        <PermissionPlaceholderComponent
          title={t("You don't have permission to view this screen")}
          marginTop="-5%"
        />
      ) : !loading &&
        !location?.qrOrderingConfiguration?.qrOrdering &&
        !location?.qrOrderingConfiguration?.onlineOrdering ? (
        <PermissionPlaceholderComponent
          title={t(
            "Enabled online ordering feature from Tijarah360's Web Merchant Panel to receive orders"
          )}
          marginTop="-5%"
        />
      ) : (
        <View style={{ height: "100%", backgroundColor: theme.colors.bgColor }}>
          {headerComponent}

          {isLoading ? (
            <Loader style={{ marginTop: hp("30%") }} />
          ) : (
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={isRefetching}
                  onRefresh={() => {
                    refetch();
                  }}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              onScrollBeginDrag={Keyboard.dismiss}
              data={ordersList}
              renderItem={renderOnlineOrdering}
              ListEmptyComponent={emptyComponent}
              ListHeaderComponent={listHeaderComponent}
              ListFooterComponent={listFooterComponent}
            />
          )}
        </View>
      )}

      {visibleQROrderSetting && (
        <OnlineOrderQRSettingModal
          data={location}
          visible={visibleQROrderSetting}
          handleClose={() => setVisibleQROrderSetting(false)}
          handleSuccess={() => {
            fetchLocationApi();
            setVisibleQROrderSetting(false);
          }}
        />
      )}

      {visibleOrderSetting && (
        <OnlineOrderSettingModal
          data={location}
          visible={visibleOrderSetting}
          handleClose={() => setVisibleOrderSetting(false)}
          handleSuccess={() => {
            fetchLocationApi();
            setVisibleOrderSetting(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  stack: {
    marginLeft: 10,
    marginRight: "2%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  box: {
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default OnlineOrdering;
