import { Box, Container, Divider, Stack, Tab, Tabs } from "@mui/material";
import { NextPage } from "next";
import { ChangeEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CompletedSignupTab from "src/components/company-tabs/completed-signup";
import IncompleteSignupTab from "src/components/company-tabs/incomplete-signup";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";

const TabContents: any = {
  completedSignup: CompletedSignupTab,
  incompleteSignup: IncompleteSignupTab,
};

const CompaniesList: NextPage = () => {
  const { t } = useTranslation();

  const { changeTab, getTab } = useActiveTabs();

  const Component =
    TabContents[getTab(Screens.companiesList) || "completedSignup"];

  const tabs = [
    {
      label: t("Companies"),
      value: "completedSignup",
    },
    {
      label: t("Incomplete Signup"),
      value: "incompleteSignup",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.companiesList);
  };

  const canAccess = usePermissionManager();

  useEffect(() => {
    return () => {
      changeTab("companiesList", TabContents["completedSignup"]);
    };
  }, []);

  if (!canAccess(MoleculeType["company:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Companies")}`} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} sx={{ mb: 3 }}>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.companiesList)}
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

CompaniesList.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CompaniesList;
