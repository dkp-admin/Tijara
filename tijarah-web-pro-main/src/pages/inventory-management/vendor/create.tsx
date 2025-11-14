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
import { useRouter } from "next/router";
import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { PurchaseOrderTableCard } from "src/components/vendor/orderlist-tabs";
import { OverviewTabs } from "src/components/vendor/overview-tabs";
import ProductTab from "src/components/vendor/product-tabs";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const TabContents: any = {
  overview: OverviewTabs,
  orderlist: PurchaseOrderTableCard,
  product: ProductTab,
};

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, origin } = router.query;
  usePageView();
  const canAccess = usePermissionManager();
  const { canAccessModule } = useFeatureModuleManager();
  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[getTab(Screens?.vendorTab) || "overview"];

  const tabs = [
    {
      label: t("Overview"),
      value: "overview",
    },
    {
      label: t("Order List"),
      value: "orderlist",
    },
    {
      label: t("Product"),
      value: "product",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.vendorTab);
  };

  useEffect(() => {
    return () => {
      changeTab("overview", Screens.vendorTab);
    };
  }, []);

  if (!canAccessModule("vendors")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["vendor:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={id ? `${t("Edit Vendor")}` : `${t("Create New Vendor")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4} sx={{ mt: 3 }}>
            <Stack spacing={4}>
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  if (origin == "company") {
                    changeTab("inventoryManagement", Screens?.companyDetail);
                  }
                  router.back();
                }}
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Vendor")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Vendor") : t("Create New Vendor")}
              </Typography>

              {id != null && (
                <div>
                  <Tabs
                    indicatorColor="primary"
                    onChange={handleTabsChange}
                    scrollButtons="auto"
                    textColor="primary"
                    value={getTab(Screens.vendorTab) || "overview"}
                    variant="scrollable"
                  >
                    {tabs.map((tab) => (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                      />
                    ))}
                  </Tabs>
                  <Divider />
                </div>
              )}
            </Stack>
            <Component />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
