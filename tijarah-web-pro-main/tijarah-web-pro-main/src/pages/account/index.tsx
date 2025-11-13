import {
  Box,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import OverviewTab from "src/components/account/company-tab";
import CreditManagementTab from "src/components/account/credit-tab";
import CompanyDocsTab from "src/components/account/docs-tab";
import OrderTypesTab from "src/components/account/order-types-tab";
import ReportingHourTab from "src/components/account/reporting-hour-tab";
import SubscriptionTab from "src/components/account/subscriptionDetails-tab";
import VoidAndCompTab from "src/components/account/void-and-comp-tab";
import WalletManagementTab from "src/components/account/wallet-tab";
import { Seo } from "src/components/seo";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
import stcPay from "src/components/account/stc-pay";
import nearPay from "src/components/account/near-pay";

const TabContents: any = {
  overview: OverviewTab,
  subscription: SubscriptionTab,
  documents: CompanyDocsTab,
  wallet: WalletManagementTab,
  credit: CreditManagementTab,
  reportingHour: ReportingHourTab,
  voidAndComp: VoidAndCompTab,
  orderTypes: OrderTypesTab,
  stcPay: stcPay,
  nearpay: nearPay,
};

const AccountDetails: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canAccess = usePermissionManager();
  usePageView();
  const { canAccessModule } = useFeatureModuleManager();
  const { findOne, entity, refetch } = useEntity("company");

  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[getTab(Screens?.accountDetails) || "overview"];

  const tabs = [
    {
      label: t("Overview"),
      value: "overview",
    },
    {
      label: t("Subscription"),
      value: "subscription",
    },
    {
      label: t("Documents"),
      value: "documents",
    },
    {
      label: t("Loyalty"),
      value: "wallet",
    },
    {
      label: t("Credit"),
      value: "credit",
    },
    {
      label: t("Reporting Hour"),
      value: "reportingHour",
    },
    ...(user?.company?.industry === "restaurant" ||
    entity?.industry == "restaurant"
      ? [
          {
            label: t("Void and Comp"),
            value: "voidAndComp",
          },
        ]
      : []),
    {
      label: t("Order Types"),
      value: "orderTypes",
    },
    {
      label: t("Stc Pay"),
      value: "stcPay",
    },
    {
      label: t("Nearpay"),
      value: "nearpay",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.accountDetails);
  };

  useEffect(() => {
    findOne(user?.companyRef?.toString());
  }, [user?.company]);

  useEffect(() => {
    return () => {
      changeTab("overview", Screens.accountDetails);
    };
  }, []);

  if (!canAccessModule("account")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["account:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Account")}`} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} sx={{ mb: 0 }}>
            <Typography variant="h4">{`${t("Account")}`} </Typography>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.accountDetails) || "overview"}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>

          <Box sx={{ width: "100%", py: 2 }}>
            <CompanyContext.Provider value={{ ...entity, onRefresh: refetch }}>
              <Component origin={"account"} />
            </CompanyContext.Provider>
          </Box>
        </Container>
      </Box>
    </>
  );
};

AccountDetails.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default AccountDetails;
