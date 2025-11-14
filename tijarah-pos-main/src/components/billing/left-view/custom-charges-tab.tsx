import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { EventRegister } from "react-native-event-listeners";
import Toast from "react-native-toast-message";
import { useInfiniteQuery } from "react-query";
import { t } from "../../../../i18n";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import cart from "../../../utils/cart";
import { rowsPerPage } from "../../../utils/constants";
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog } from "../../../utils/log-patch";
import ActionSheetHeader from "../../action-sheet/action-sheet-header";
import EmptyOrLoaderComponent from "../../empty";
import Loader from "../../loader";
import CustomChargeHaeder from "./custom-charge/custom-charge-header";
import CustomChargeRow from "./custom-charge/custom-charge-row";

export default function CustomChargesTab({
  visible,
  handleClose,
}: {
  visible: boolean;
  handleClose: any;
}) {
  const theme = useTheme();
  const { hp, twoPaneView } = useResponsive();

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-custom-charge`],
      async ({ pageParam = 1 }) => {
        return repo.customCharge.findAndCount({
          take: rowsPerPage,
          skip: rowsPerPage * (pageParam - 1),
          where: { status: "active" },
        });
      },
      {
        getNextPageParam: (lastPage, allPages) => {
          const totalRecords = lastPage[1];
          const currentPageSize = lastPage[0]?.length || 0;
          const nextPage = allPages.length + 1;
          if (
            currentPageSize < rowsPerPage ||
            currentPageSize === totalRecords
          ) {
            return null; // No more pages to fetch
          }
          return nextPage;
        },
      }
    );

  const customChargesList = useMemo(() => {
    const charges = data?.pages?.flatMap((page) => page[0] || []) || [];
    debugLog(
      "Custom charges list fetch from db",
      {},
      "billing-screen",
      "fetchCustomCharge"
    );
    return charges;
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const listHeaderComponent = useMemo(() => <CustomChargeHaeder />, []);

  const listFooterComponent = useMemo(
    () => (
      <View style={{ height: hp("10%"), marginBottom: 16 }}>
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
        isEmpty={customChargesList.length === 0}
        title={t("No Custom Charges!")}
        showBtn={false}
        btnTitle={""}
        handleOnPress={() => {}}
      />
    );
  }, []);

  const renderCustomCharge = useCallback(({ item }: any) => {
    return (
      <CustomChargeRow
        data={item}
        handleOnPress={(data: any) => {
          if (cart.cartItems.length >= 0) {
            cart.applyCharges(data, (charges: any) => {
              debugLog(
                "Charge applied to cart",
                charges,
                "billing-screen",
                "handleCHargeAddButton"
              );
              EventRegister.emit("chargeApplied", charges);
            });
          }
        }}
      />
    );
  }, []);

  if (isLoading) {
    return <Loader marginTop={hp("30%")} />;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={false}
      style={{ height: "100%" }}
    >
      <View
        style={{
          ...styles.container,
          backgroundColor: theme.colors.transparentBg,
        }}
      >
        <View
          style={{
            ...styles.container,
            marginHorizontal: twoPaneView ? "20%" : "0%",
            backgroundColor: theme.colors.bgColor,
          }}
        >
          <ActionSheetHeader
            title={t("Custom Charges")}
            handleLeftBtn={() => handleClose()}
          />

          <FlatList
            onEndReached={loadMore}
            onEndReachedThreshold={0.01}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            data={customChargesList}
            renderItem={renderCustomCharge}
            ListHeaderComponent={listHeaderComponent}
            ListEmptyComponent={emptyComponent}
            ListFooterComponent={listFooterComponent}
          />
        </View>
      </View>

      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: "100%",
  },
});
