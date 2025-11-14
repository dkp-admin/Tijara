import { useNavigation } from "@react-navigation/core";
import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../i18n";
import serviceCaller from "../../api";
import endpoint from "../../api/endpoints";
import CustomHeader from "../../components/common/custom-header";
import EmptyOrLoaderComponent from "../../components/empty";
import Loader from "../../components/loader";
import NotificationRow from "../../components/notifications/notification-row";
import PermissionPlaceholderComponent from "../../components/permission-placeholder";
import DefaultText from "../../components/text/Text";
import showToast from "../../components/toast";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { checkInternet } from "../../hooks/check-internet";
import { useMarkNotification } from "../../hooks/use-mark-notification";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";

const fetchNotifications = async (
  pageParam: any,
  companyRef: string,
  locationRef: string
) => {
  const response = await serviceCaller(endpoint.notification.path, {
    method: endpoint.notification.method,
    query: {
      page: pageParam,
      sort: "desc",
      activeTab: "all",
      limit: rowsPerPage,
      companyRef: companyRef,
      locationRef: locationRef,
    },
  });

  return response;
};

const Notification = () => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const isConnected = checkInternet();
  const navigation = useNavigation() as any;
  const { markNotification } = useMarkNotification();
  const authContext = useContext<AuthType>(AuthContext);
  const [unreadNotify, setUnreadNotify] = useState(0);

  const [refreshing] = useState(false);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    [`find-notification`, authContext, isConnected],
    async ({ pageParam = 0 }) => {
      if (isConnected) {
        return fetchNotifications(
          pageParam,
          authContext.user.companyRef,
          authContext.user.locationRef
        );
      }
    },
    {
      getNextPageParam: (lastPage: any, allPages: any) => {
        const totalRecords = lastPage?.total;
        const currentPageSize = lastPage?.results?.length || 0;
        const nextPage = allPages?.length;
        if (currentPageSize < rowsPerPage || currentPageSize === totalRecords) {
          return null; // No more pages to fetch
        }
        return nextPage;
      },
    }
  );

  const notificationsList = useMemo(() => {
    if (data?.pages && isConnected) {
      let readNotifications = [];
      let unreadNotifications = [];

      const notifications = data?.pages
        ?.map((page: any) => page.results)
        .flat();

      unreadNotifications = notifications?.filter(
        (notify: any) => !notify.read
      );

      readNotifications = notifications?.filter((notify: any) => notify.read);

      setUnreadNotify(unreadNotifications?.length || 0);

      return [...unreadNotifications, ...readNotifications];
    } else {
      return [];
    }
  }, [data?.pages]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleMarkAllReadNotification = async () => {
    const res = await markNotification({
      notificationIds: [],
      type: "all",
    });

    if (res?.code == "success") {
      showToast("success", t("All notifications marked as read"));
    }
  };

  const handleMarkReadNotification = async (id: string) => {
    const res = await markNotification({
      notificationIds: [id],
      type: "selective",
    });

    if (res?.code == "success") {
      showToast("success", t("Notification marked as read"));
      navigation.navigate(t("Orders"));
    }
  };

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("15%"), marginBottom: 16 }}>
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
        isEmpty={notificationsList.length === 0}
        title={t("No Notifications!")}
        showBtn={false}
        btnTitle=""
        handleOnPress={() => {}}
      />
    );
  }, [notificationsList]);

  const renderNotification = useCallback(({ item }: any) => {
    return (
      <NotificationRow
        key={item?._id}
        data={item}
        handleMarkReadkNotification={(id: string) => {
          handleMarkReadNotification(id);
        }}
      />
    );
  }, []);

  return (
    <>
      <CustomHeader />

      {!isConnected ? (
        <PermissionPlaceholderComponent
          title={t("Please connect with internet")}
          marginTop="-10%"
        />
      ) : (
        <View style={{ ...styles.container }}>
          <View style={styles.header_view}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <DefaultText
                style={{ marginLeft: 20 }}
                fontSize="2xl"
                fontWeight="medium"
              >
                {t("Unread Notifications") + ` (${unreadNotify})`}
              </DefaultText>
            </View>

            <TouchableOpacity
              style={{ marginRight: 20 }}
              onPress={() => handleMarkAllReadNotification()}
              disabled={unreadNotify === 0}
            >
              <DefaultText
                fontSize="xl"
                color={
                  unreadNotify === 0
                    ? theme.colors.placeholder
                    : theme.colors.primary[1000]
                }
              >
                {t("Mark All Read")}
              </DefaultText>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <Loader style={{ marginTop: hp("32%") }} />
          ) : (
            <FlatList
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => {
                    refetch();
                  }}
                />
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.01}
              alwaysBounceVertical={false}
              showsVerticalScrollIndicator={false}
              data={notificationsList}
              renderItem={renderNotification}
              ListEmptyComponent={emptyComponent}
              ListFooterComponent={listFooterComponent}
            />
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header_view: {
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default Notification;
