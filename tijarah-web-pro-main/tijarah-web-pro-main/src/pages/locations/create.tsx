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
import LocationCreateTab from "src/components/locations/location-create-tab";
import LocationSettingsTab from "src/components/locations/location-settings-tab";
import QuickItemsTab from "src/components/locations/quick-items-tab";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";

const TabContents: any = {
  location: LocationCreateTab,
  quickItems: QuickItemsTab,
  settings: LocationSettingsTab,
};
function CreateLocation() {
  const { t } = useTranslation();
  const router = useRouter();
  const { canAccessModule } = useFeatureModuleManager();
  const { changeTab, getTab } = useActiveTabs();

  const Component = TabContents[getTab(Screens?.createLocation) || "location"];
  usePageView();

  const { id, location, companyRef, companyName, origin } = router.query;

  const tabs = [
    {
      label: id !== undefined ? t("Details") : "",
      value: "location",
    },

    {
      label: id !== undefined ? t("Quick Items") : "",
      value: "quickItems",
    },
    {
      label: id !== undefined ? t("Settings") : "",
      value: "settings",
    },
  ];

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    changeTab(value, Screens.createLocation);
  };

  useEffect(() => {
    return () => {
      changeTab("location", Screens.createLocation);
    };
  }, []);

  // if (!canAccessModule("Locations")) {
  //   return <UpgradePackage/>;
  // }

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 2,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3} sx={{ mb: 3 }}>
            <Stack spacing={4}>
              <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    if (origin == "company") {
                      changeTab("locations", Screens?.companyDetail);
                    }
                    router.back();
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Locations")}</Typography>
                </Link>
              </Box>
            </Stack>
            <div>
              <Tabs
                indicatorColor="primary"
                onChange={handleTabsChange}
                scrollButtons="auto"
                textColor="primary"
                value={getTab(Screens.createLocation) || "location"}
                variant="scrollable"
              >
                {tabs.map((tab) => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>
              <Divider />
            </div>
          </Stack>

          <Box sx={{ width: "100%", mt: -5 }}>
            <Component
              id={id}
              location={location}
              companyRef={companyRef}
              companyName={companyName}
              origin={origin}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
}

CreateLocation.getLayout = (page: any) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateLocation;
