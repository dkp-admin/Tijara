import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  View,
} from "react-native";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import AddEditCustomerModal from "./add-customer-modal";
import CustomerHeader from "./customer-header";
import CustomerRow from "./customer-row";
import AuthContext from "../../context/auth-context";
import { AuthType } from "../../types/auth-types";
import useCartStore from "../../store/cart-item";
import repository from "../../db/repository";

const CustomerList = ({
  isLoading,
  customerList,
  loadMore,
  isFetchingNextPage,
}: any) => {
  const theme = useTheme();
  const { hp } = useResponsive();
  const { setCustomer } = useCartStore();
  const authContext = useContext<AuthType>(AuthContext);

  const [customerData, setCustomerData] = useState({});
  const [visibleEditCustomer, setVisibleEditCustomer] = useState(false);

  if (!authContext.permission["pos:customer"]?.read) {
    return (
      <View style={{ marginHorizontal: 16 }}>
        <NoDataPlaceholder
          title={t("You don't have permission to view this screen")}
          marginTop={hp("35%")}
        />
      </View>
    );
  }

  if (isLoading) {
    return <Loader marginTop={hp("35%")} />;
  }

  return (
    <>
      <View style={{ ...styles.container }}>
        <FlatList
          onEndReached={loadMore}
          onEndReachedThreshold={0.01}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={Keyboard.dismiss}
          data={customerList}
          renderItem={({ item }) => {
            return (
              <CustomerRow
                data={item}
                handleOnPress={(data: any) => {
                  setCustomerData({
                    id: data._id,
                    title: `${data.firstName} ${data.lastName}`,
                  });
                  setVisibleEditCustomer(true);
                }}
              />
            );
          }}
          ListHeaderComponent={() => {
            return <CustomerHeader />;
          }}
          ListEmptyComponent={() => {
            return (
              <View style={{ marginHorizontal: 16 }}>
                <NoDataPlaceholder
                  title={t("No Customers!")}
                  marginTop={hp("25%")}
                  showBtn={authContext.permission["pos:customer"]?.create}
                  btnTitle={t("Create Customer")}
                  handleOnPress={() => {
                    setCustomerData({ isAdd: true });
                    setVisibleEditCustomer(true);
                  }}
                />
              </View>
            );
          }}
          ListFooterComponent={() => (
            <View style={{ height: hp("10%"), marginBottom: 16 }}>
              {isFetchingNextPage && (
                <ActivityIndicator
                  size={"small"}
                  color={theme.colors.primary[1000]}
                />
              )}
            </View>
          )}
        />
      </View>

      <AddEditCustomerModal
        data={customerData}
        visible={visibleEditCustomer}
        handleClose={() => {
          setVisibleEditCustomer(false);
        }}
        isFromCustomer={false}
        handleCustomerAdd={async (phone: string) => {
          const customer = await repository.customerRepository.findByPhone(
            phone
          );

          if (customer) {
            setCustomer(customer);
          }
          setVisibleEditCustomer(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default CustomerList;
