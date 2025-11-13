import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Container,
  Divider,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import accountOverviewTab from "src/components/account/account-overview-tab";
import UsersTab from "src/components/account/users-tab";
import auditLogTab from "src/components/company/audit-log-tab";
import CatalogueTab from "src/components/company/catalogue-tab";
import customChargesTab from "src/components/company/custom-charges-tab";
import CustomersTab from "src/components/company/customers-tab";
import DevicesTab from "src/components/company/devices-tab";
import DiscountsTab from "src/components/company/discounts-tab";
import InventoryManagementTab from "src/components/company/inventory-management-tab";
import LocationsTab from "src/components/company/locations-tab";
import menuManangementTab from "src/components/company/menu-manangement-tab";
import OrdersTab from "src/components/company/orders-tab";
import PromotionsTab from "src/components/company/promotions-tab";
import SectionsTab from "src/components/company/sections-tab";
import SingleGlobalProductTab from "src/components/company/single-global-product-tab";
import { Seo } from "src/components/seo";
import { CompanyContext } from "src/contexts/company-context";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import AuditLogs from "../logs/audit-logs";
import AuditLogsTab from "src/components/company/audit-log-tab";

const TabContents: any = {
  accountOverview: accountOverviewTab,
  locations: LocationsTab,
  orders: OrdersTab,
  singleGlobalProduct: SingleGlobalProductTab,
  catalogue: CatalogueTab,
  customCharges: customChargesTab,
  customers: CustomersTab,
  discounts: DiscountsTab,
  promotions: PromotionsTab,
  users: UsersTab,
  devices: DevicesTab,
  inventoryManagement: InventoryManagementTab,
  sections: SectionsTab,
  menuManagement: menuManangementTab,
  auditLogs: AuditLogsTab,
};

const CompanyDetails: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { companyId }: any = router.query;

  usePageView();

  const { findOne, entity, refetch } = useEntity("company");

  const { changeTab, getTab } = useActiveTabs();

  const Component =
    TabContents[getTab(Screens?.companyDetail) || "accountOverview"];

  const tabs = [
    {
      label: t("Account"),
      value: "accountOverview",
    },
    {
      label: t("Orders"),
      value: "orders",
    },
    {
      label: t("Locations"),
      value: "locations",
    },
    {
      label: t("Global Product"),
      value: "singleGlobalProduct",
    },
    {
      label: t("Catalogue"),
      value: "catalogue",
    },
    {
      label: t("Custom Charges"),
      value: "customCharges",
    },
    {
      label: t("Customers"),
      value: "customers",
    },
    {
      label: t("Discounts"),
      value: "discounts",
    },

    {
      label: t("Promotions"),
      value: "promotions",
    },
    {
      label: t("Devices"),
      value: "devices",
    },
    {
      label: t("Users"),
      value: "users",
    },
    {
      label: t("Inventory Management"),
      value: "inventoryManagement",
    },
    {
      label: t("Audit Logs"),
      value: "auditLogs",
    },
    {
      label: entity?.industry == "restaurant" ? t("Sections") : "",
      value: "sections",
    },
    {
      label: entity?.industry == "restaurant" ? t("Menu Management") : "",
      value: "menuManagement",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.companyDetail);
  };

  useEffect(() => {
    if (companyId) {
      findOne(companyId?.toString());
    }
  }, [companyId]);

  useEffect(() => {
    return () => {
      changeTab("accountOverview", Screens.companyDetail);
    };
  }, []);

  return (
    <>
      <Seo title={`${t("Company Details")}`} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} sx={{ mb: 3 }}>
            <Box sx={{ cursor: "pointer", width: "10%" }}>
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  maxWidth: 80,
                  alignItems: "center",
                  display: "flex",
                }}
                onClick={() => {
                  router.push({ pathname: tijarahPaths?.platform?.companies });
                }}
              >
                <ArrowBackIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "#6B7280" }}
                />
                <Typography variant="subtitle2">{t("Companies")}</Typography>
              </Link>
            </Box>
            <Typography variant="h4">{entity?.name?.en}</Typography>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.companyDetail)}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>

          <Box sx={{ width: "100%" }}>
            <CompanyContext.Provider
              value={{
                ...entity,
                onRefresh: refetch,
              }}
            >
              <Component />
            </CompanyContext.Provider>
          </Box>
        </Container>
      </Box>
    </>
  );
};

CompanyDetails.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CompanyDetails;
