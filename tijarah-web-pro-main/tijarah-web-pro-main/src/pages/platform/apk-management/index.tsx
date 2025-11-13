import {
  Box,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import ActiveDeviceListTab from "./active-device-list-tab";
import ApkManagementListTab from "./apk-management-list-tab";

const TabContents: any = {
  apkTab: ApkManagementListTab,
  device: ActiveDeviceListTab,
};

const ApkManagement: NextPage = () => {
  const { t } = useTranslation();

  const canAccess = usePermissionManager();

  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[getTab(Screens?.apkManagement) || "apkTab"];

  const tabs = [
    {
      label: t("APKs"),
      value: "apkTab",
    },
    {
      label: t("Devices"),
      value: "device",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.apkManagement);
  };

  useEffect(() => {
    return () => {
      changeTab("apkTab", Screens.apkManagement);
    };
  }, []);

  if (!canAccess(MoleculeType["apk-management:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("APK Management")}`} />

      <Box component="main">
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30%",
            mb: 2,
          }}
        >
          <Typography variant="h4">{t("APK Management")}</Typography>
        </Box>
        <Container maxWidth="xl">
          <Stack spacing={3} sx={{ mb: 3 }}>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.apkManagement) || "apkTab"}
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
            <Component />
          </Box>
        </Container>
      </Box>
    </>
  );
};

ApkManagement.getLayout = (page: any) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ApkManagement;
