import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { t } from "../../../i18n";
import NoDataPlaceholder from "../../components/no-data-placeholder/no-data-placeholder";
import NotificationRow from "../../components/notifications/notification-row";
import Spacer from "../../components/spacer";
import DefaultText, { getOriginalSize } from "../../components/text/Text";
import { useTheme } from "../../context/theme-context";
import { useEntity } from "../../hooks/use-entity";
import { useResponsive } from "../../hooks/use-responsiveness";
import { STATUSBAR_HEIGHT } from "../../utils/Constants";
import Loader from "../../components/loader";

const Motifications = () => {
  const theme = useTheme();
  const { hp } = useResponsive();

  const { find, entities, isFetching, loading, refetch } =
    useEntity("notification");

  const renderItem = ({ item, index }: any) => {
    return <NotificationRow key={index} {...item} />;
  };

  useEffect(() => {
    find({
      page: 0,
      limit: 10,
      sort: "desc",
      activeTab: "all",
    });
  }, []);

  return (
    <View>
      <StatusBar
        style={"light" === "light" ? "dark" : "light"}
        backgroundColor={theme.colors.bgColor2}
      />

      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.bgColor2,
        }}
      >
        <DefaultText
          style={{ marginBottom: getOriginalSize(8), paddingHorizontal: "8%" }}
          fontSize="3xl"
          fontWeight="bold"
        >
          {t("Notifications")}
        </DefaultText>

        {loading ? (
          <Loader style={{ backgroundColor: theme.colors.bgColor }} />
        ) : (
          <FlatList
            contentContainerStyle={{
              paddingHorizontal: getOriginalSize(12),
              backgroundColor: theme.colors.bgColor,
            }}
            refreshControl={
              <RefreshControl refreshing={isFetching} onRefresh={refetch} />
            }
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item: any) => item.id}
            data={entities?.results?.filter((notif: any) => !notif.read)}
            renderItem={renderItem}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginTop: hp("30%"), marginHorizontal: 16 }}>
                  <NoDataPlaceholder title={t("No Notifications!")} />
                </View>
              );
            }}
            ListFooterComponent={() => <Spacer space={hp("15%")} />}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: STATUSBAR_HEIGHT + getOriginalSize(20),
  },
});

export default Motifications;
