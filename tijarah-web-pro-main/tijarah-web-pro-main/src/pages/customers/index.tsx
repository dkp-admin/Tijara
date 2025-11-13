import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import { CustomersTableCard } from "src/components/customer/customer-table-card";
import { GroupsTableCard } from "src/components/customer/group-table-card";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import useExportAll from "src/utils/export-all";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";

const TabContents: any = {
  customers: CustomersTableCard,
  groups: GroupsTableCard,
};

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();
  const { exportCsv } = useExportAll({});
  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[getTab(Screens.customersList) || "customers"];

  const tabs = [
    {
      label: t("Customers"),
      value: "customers",
    },
    {
      label: t("Groups"),
      value: "groups",
    },
  ];

  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["customer:create"]);
  const canCreateGroup = canAccess(MoleculeType["group:create"]);

  const [groupId, setGroupId] = useState("");

  usePageView();

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    setGroupId("");
    changeTab(value, Screens.customersList);
  };

  const handleViewCustomers = (id: string) => {
    setGroupId(id);

    if (id) {
      changeTab("customers", Screens.customersList);
    }
  };

  useEffect(() => {
    return () => {
      changeTab("customers", TabContents["customers"]);
    };
  }, []);

  if (!canAccessModule("customers")) {
    return <UpgradePackage />;
  }

  return (
    <>
      <Seo title={`${t("Customers")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">
                  {getTab(Screens.customersList) === "customers"
                    ? t("Customers")
                    : t("Groups")}
                </Typography>
                {getTab(Screens.customersList) === "customers" && (
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <ExportButton
                      onClick={(type: string) => {
                        exportCsv("/export/customer", type, "customer");
                      }}
                    />
                  </Stack>
                )}
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (getTab(Screens.customersList) === "customers") {
                      if (!canCreate) {
                        return toast.error(t("You don't have access"));
                      }
                      router.push({
                        pathname: tijarahPaths?.management?.customers?.create,
                        query: {
                          companyRef: user.company._id,
                          companyName: user.company.name.en,
                        },
                      });
                    } else {
                      if (!canCreateGroup) {
                        return toast.error(t("You don't have access"));
                      }
                      router.push({
                        pathname:
                          tijarahPaths?.management?.customers?.createGroup,
                        query: {
                          companyRef: user.company._id,
                          companyName: user.company.name.en,
                        },
                      });
                    }
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {getTab(Screens.customersList) === "customers"
                    ? t("Create Customer")
                    : t("Create Group")}
                </Button>
              </Stack>
            </Stack>

            <Stack spacing={3} sx={{ mb: 3 }}>
              <div>
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  textColor="primary"
                  value={getTab(Screens.customersList) || "customers"}
                  variant="scrollable"
                >
                  {tabs.map((tab) => {
                    return (
                      <Tab
                        key={tab.value}
                        label={tab.label}
                        value={tab.value}
                      />
                    );
                  })}
                </Tabs>
                <Divider />
              </div>
            </Stack>

            <Box sx={{ width: "100%" }}>
              <Component
                groupId={groupId}
                companyRef={user?.company?._id}
                companyName={user?.company?.name?.en}
                handleViewCustomers={handleViewCustomers}
              />
            </Box>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
