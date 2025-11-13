import { Box, Tab, Tabs } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import OverviewTab from "src/components/account/company-tab";
import CreditManagementTab from "src/components/account/credit-tab";
import CompanyDocsTab from "src/components/account/docs-tab";
import SubscriptionTab from "src/components/account/subscriptionDetails-tab";
import WalletManagementTab from "src/components/account/wallet-tab";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import ReportingHourTab from "./reporting-hour-tab";
import OrderTypesTab from "src/components/account/order-types-tab";
import VoidAndCompTab from "src/components/account/void-and-comp-tab";
import { CompanyContext } from "src/contexts/company-context";
import stcPay from "./stc-pay";
import nearPay from "./near-pay";

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
  nearPay: nearPay,
};

function AccountOverviewTab({ origin = "company" }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  usePageView();
  const canAccess = usePermissionManager();
  const companyContext = useContext<any>(CompanyContext);
  const [currentTab, setCurrentTab] = useState<string>("overview");

  const Component = TabContents[currentTab];
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
    companyContext?.industry == "restaurant"
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
      label: t("STC Pay"),
      value: "stcPay",
    },
    {
      label: t("Nearpay"),
      value: "nearPay",
    },
  ];

  useEffect(() => {
    setCurrentTab(
      typeof router.query.tab === "string" ? router.query.tab : currentTab
    );
  }, [router.query.tab]);

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  if (!canAccess(MoleculeType["account:read"])) {
    return <NoPermission />;
  }

  return (
    <Box
      sx={{
        py: 0.5,
        textAlign: "left",
      }}
    >
      <Seo title={`${t("Account")}`} />

      <Box
        component="main"
        sx={{
          textAlign: "center",
        }}
      >
        <div>
          <Tabs
            TabIndicatorProps={{
              style: { display: "none" },
            }}
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab
                sx={{
                  "&:hover": {
                    backgroundColor: "action.hover",
                    cursor: "pointer",
                    opacity: 0.5,
                    border: `1px solid  #16b364 `,
                  },
                  width: "auto",
                  minHeight: "43px",
                  color: currentTab ? "primary" : "text.secondary",
                  px: 1.5,
                  py: 0,
                  mb: 0.5,
                  ml: 1,
                  borderRadius: 3,
                  border: "1px solid transparent",
                }}
                key={tab.value}
                label={tab.label}
                value={tab.value}
              />
            ))}
          </Tabs>
        </div>

        <Box>
          <Component origin={"company"} />
        </Box>
      </Box>
    </Box>
  );
}

export default AccountOverviewTab;
