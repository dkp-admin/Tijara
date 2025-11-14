import { useIsFocused, useNavigation } from "@react-navigation/core";
import { createStackNavigator } from "@react-navigation/stack";
import React, {
  Suspense,
  lazy,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { t } from "../../../i18n";
import CatalogueNavHeader from "../../components/common/catalogue-navigation-header";
import CustomHeader from "../../components/common/custom-header";
import SearchWithAdd from "../../components/common/search-add";
import SeparatorVerticalView from "../../components/common/separator-vertical-view";
import SideMenu from "../../components/common/side-menu";
import AddEditCustomerModal from "../../components/customers/add-customer-modal";
import Loader from "../../components/loader";
import AuthContext from "../../context/auth-context";
import { useTheme } from "../../context/theme-context";
import { useResponsive } from "../../hooks/use-responsiveness";
import { AuthType } from "../../types/auth-types";
import { rowsPerPage } from "../../utils/constants";
import repository from "../../db/repository";

const CustomerList = lazy(
  () => import("../../components/customers/customers-list")
);

export const fetchCustomers = async (
  pageParam: number,
  searchText?: string
) => {
  const [customers, totalCount] =
    await repository.customerRepository.findWithSearch(
      rowsPerPage,
      pageParam,
      searchText
    );

  return { customers, totalCount };
};

const CustomerStackNav = createStackNavigator();

const Customers = () => {
  const { twoPaneView } = useResponsive();
  const theme = useTheme();
  const isFocused = useIsFocused();
  const queryClient = useQueryClient();
  const navigation = useNavigation() as any;
  const authContext = useContext<AuthType>(AuthContext);

  const [queryText, setQueryText] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("all");
  const [visibleAddCustomer, setVisibleAddCustomer] = useState(false);

  const menuOptions = [
    { title: t("All"), desc: "", value: "all" },
    { title: t("One timers"), desc: "", value: "oneTimers" },
    { title: t("Regulars"), desc: "", value: "regulars" },
  ];

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    [`find-customer`, queryText, selectedMenu],
    async ({ pageParam = 1 }) => {
      let query: any = [];

      // if (selectedMenu === "oneTimers") {
      //   query = [{ totalOrders: Raw((alias: any) => `${alias} = '1'`) }];
      // } else if (selectedMenu === "regulars") {
      //   query = [{ totalOrders: Raw((alias: any) => `${alias} > '1'`) }];
      // }

      if (queryText) {
        query = [
          { firstName: queryText },
          { lastName: queryText },
          { phone: queryText },
        ];
      }

      const customers = await repository.customerRepository.findWithSearch(
        rowsPerPage,
        pageParam,
        queryText
      );

      return customers;
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        const totalRecords = lastPage[1];
        const currentPageSize = lastPage[0]?.length || 0;
        const nextPage = allPages.length + 1;
        if (currentPageSize < rowsPerPage || currentPageSize === totalRecords) {
          return null; // No more pages to fetch
        }
        return nextPage;
      },
    }
  );

  const customers = useMemo(() => {
    if (data) {
      return data?.pages?.flatMap((page) => page[0] || []);
    }

    return [];
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderSideMenu = useMemo(
    () => (
      <SideMenu
        title={t("CUSTOMERS")}
        selectedMenu={selectedMenu}
        setSelectedMenu={(menu: string) => {
          setSelectedMenu(menu);

          if (!twoPaneView) {
            navigation.navigate("CustomerList");
          }
        }}
        menuOptions={menuOptions}
      />
    ),
    [selectedMenu]
  );

  const renderContent = () => (
    <>
      <SeparatorVerticalView />

      <View
        style={{
          flex: 0.75,
          height: "100%",
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <SearchWithAdd
          placeholderText={t("Search customer name, number")}
          btnText={t("Create Customer")}
          queryText={queryText}
          setQueryText={setQueryText}
          handleBtnTap={() => {
            setVisibleAddCustomer(true);
          }}
          readPermission={authContext.permission["pos:customer"]?.read}
          createPermission={authContext.permission["pos:customer"]?.create}
        />

        {CustomerListComponent()}
      </View>
    </>
  );

  const getHeaderTitle = useMemo(() => {
    if (selectedMenu === "oneTimers") {
      return t("One timers");
    } else if (selectedMenu === "regulars") {
      return t("Regulars");
    } else {
      return t("All");
    }
  }, [selectedMenu]);

  const MenuListComponent = () => {
    return (
      <View style={styles.container}>
        {renderSideMenu}

        {twoPaneView && renderContent()}
      </View>
    );
  };

  const CustomerListComponent = () => {
    return (
      <Suspense fallback={<Loader />}>
        <CustomerList
          isLoading={isLoading}
          customerList={customers || []}
          loadMore={loadMore}
          isFetchingNextPage={isFetchingNextPage}
        />
      </Suspense>
    );
  };

  useEffect(() => {
    if (selectedMenu) {
      setQueryText("");
    }
  }, [selectedMenu]);

  useEffect(() => {
    refetch();
  }, [isFocused]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`find-customer`);
    };
  }, []);

  return (
    <>
      <CustomHeader />

      <View
        style={{ ...styles.container, backgroundColor: theme.colors.bgColor }}
      >
        <CustomerStackNav.Navigator>
          <CustomerStackNav.Screen
            name="CustomerMenu"
            options={{ headerShown: false }}
          >
            {/* Keep this way to stop re-rendering and while searching keyboard auto hide on each entered character */}
            {MenuListComponent}
          </CustomerStackNav.Screen>

          <CustomerStackNav.Screen
            name="CustomerList"
            options={{
              header: () => (
                <CatalogueNavHeader
                  title={getHeaderTitle}
                  placeholderText={t("Search customer name, number")}
                  query={queryText}
                  handleQuery={setQueryText}
                  handleAddButtonTap={() => {
                    setVisibleAddCustomer(true);
                  }}
                  readPermission={authContext.permission["pos:customer"]?.read}
                  createPermission={
                    authContext.permission["pos:customer"]?.create
                  }
                />
              ),
            }}
            component={CustomerListComponent}
          />
        </CustomerStackNav.Navigator>
      </View>

      <AddEditCustomerModal
        data={{}}
        visible={visibleAddCustomer}
        handleClose={() => {
          setVisibleAddCustomer(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default Customers;
