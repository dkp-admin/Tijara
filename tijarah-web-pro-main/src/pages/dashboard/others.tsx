import { ClearRounded } from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EmployeeTopCard } from "src/components/dashboard/others/employee-top-card";
import { OtherTopCard } from "src/components/dashboard/others/other-top-card";
import { VendorOrderChart } from "src/components/dashboard/others/vendor-order-chart";
import { VendorOrdersTopCard } from "src/components/dashboard/others/vendor-order-top-card";
import { VendorProfitChart } from "src/components/dashboard/others/vendor-profit-chart";
import { VendorsCard } from "src/components/dashboard/others/vendors-card";
import { SuperAdminTopCard } from "src/components/dashboard/super-admin-top-card";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";

const Page: PageType = () => {
  const { t } = useTranslation();
  const { userType } = useUserType();
  const { user } = useAuth();
  const { canAccessModule } = useFeatureModuleManager();
  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const canAccess = usePermissionManager();

  const [showButton, setShowButton] = useState(false);
  const [openFromDate, setOpenFromDate] = useState(false);
  const [openToDate, setOpenToDate] = useState(false);
  const [companyRef, setCompanyRef] = useState("all");
  const [locationRef, setLocationRef] = useState("all");
  const newLocationRef = user.locationRef;

  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());

  usePageView();

  const { findOne, entity } = useFindOne("dash");

  const { findOne: findSuperAdminStats, entity: superAdminStats } =
    useFindOne("dash/admin/stats");
  const { findOne: findAdminStats, entity: adminStats } = useFindOne(
    "dash/merchant/stats"
  );

  const revBillGrossRevenue: number[] = entity?.revenueAndBills.map(
    (rev: any) => {
      return rev.grossRevenue;
    }
  );

  const revBillTotalOrder: number[] = entity?.revenueAndBills.map(
    (rev: any) => {
      return rev.totalOrder;
    }
  );

  const txnByModeGrossRevenue: number[] = entity?.transactionByMode.map(
    (txn: any) => {
      return txn.grossRevenue;
    }
  );

  const txnByModeName: string[] = entity?.transactionByMode.map((txn: any) => {
    return txn.name;
  });

  const topcategoryName: string[] = entity?.topCategories.map(
    (category: any) => {
      return category.name.en;
    }
  );

  const topcategoryGrossRevenue: number[] = entity?.topCategories.map(
    (category: any) => {
      return category.grossRevenue;
    }
  );

  const monthlyEarning: number[] = entity?.monthlyEarning.map(
    (earning: any) => {
      return earning.grossRevenue;
    }
  );

  const handleStartDateChange = useCallback(
    (date: Date | null): void => {
      setShowButton(true);
      if (date) {
        setStartDate(date);
      }

      // Prevent end date to be before start date
      if (endDate && date && date > endDate) {
        setEndDate(date);
      }
    },
    [endDate]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null): void => {
      setShowButton(true);
      if (date) {
        setEndDate(date);
      }

      // Prevent start date to be after end date
      if (startDate && date && date < startDate) {
        setStartDate(date);
      }
    },
    [startDate]
  );

  const getQuery = () => {
    const query: any = {
      activeTab: "all",
    };

    if (userType == USER_TYPES?.SUPERADMIN) {
      if (companyRef !== "all" && companyRef) {
        query["companyRef"] = companyRef;
      }
    } else {
      query["companyRef"] = user?.companyRef;
    }

    if (userIsAdmin) {
      if (locationRef !== "all" && locationRef) {
        query["locationRef"] = locationRef;
      }
    } else {
      query["locationRef"] = newLocationRef;
    }

    if (startDate && endDate) {
      const fromDate = new Date(startDate);
      // fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
      // toDate.setHours(23, 59, 0, 0);

      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }

    return query;
  };

  useEffect(() => {
    if (user.userType === USER_TYPES.SUPERADMIN) {
      return findSuperAdminStats({ ...getQuery() });
    }
  }, [companyRef]);

  useEffect(() => {
    findAdminStats({ ...getQuery() });
  }, [companyRef, locationRef]);

  useEffect(() => {
    findOne({ ...getQuery() });
  }, [companyRef, locationRef]);

  if (!canAccessModule("others")) {
    return <UpgradePackage />;
  }

  if (user.userType !== USER_TYPES.SUPERADMIN) {
    return <NoPermission />;
  }

  if (canAccess(MoleculeType["dashboard:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={t("Others")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4">{t("Others")}</Typography>

          {userType == USER_TYPES.SUPERADMIN && (
            <SuperAdminTopCard stats={superAdminStats} />
          )}

          <Box sx={{ display: "flex", mt: 4 }}>
            {userType == USER_TYPES.SUPERADMIN && (
              <Box sx={{ width: "290px", ml: 0.5, mr: 1.3 }}>
                <CompanyDropdown
                  onChange={(id) => {
                    setCompanyRef(id || "");
                  }}
                  selectedId={companyRef as string}
                  label={t("Company")}
                  id="company"
                />
              </Box>
            )}

            {userIsAdmin ? (
              <Box sx={{ width: "290px", ml: 0.5 }}>
                <LocationAutoCompleteDropdown
                  showAllLocation
                  required={false}
                  companyRef={
                    userType == USER_TYPES.ADMIN
                      ? user.company?._id
                      : companyRef === "all"
                      ? ""
                      : companyRef
                  }
                  onChange={(id) => {
                    setLocationRef(id || "");
                  }}
                  selectedId={locationRef as string}
                  label={t("Location")}
                  id="location"
                />
              </Box>
            ) : (
              <Box sx={{ width: "290px", ml: 0.5 }}>
                <LocationAutoCompleteDropdown
                  disabled
                  showAllLocation
                  required={false}
                  companyRef={user.company._id}
                  onChange={(id) => {}}
                  selectedId={newLocationRef}
                  label={t("Location")}
                  id="location"
                />
              </Box>
            )}
          </Box>

          <Box>
            <Stack
              spacing={2}
              sx={{ pt: 2, mb: 1 }}
              alignItems="center"
              direction="row"
              flexWrap="wrap"
            >
              <Typography variant="h6">{t("Date Range")}</Typography>

              <DatePicker
                open={openFromDate}
                onOpen={() => setOpenFromDate(true)}
                onClose={() => setOpenFromDate(false)}
                inputFormat="dd/MM/yyyy"
                label={t("From")}
                maxDate={new Date()}
                onChange={handleStartDateChange}
                //@ts-ignore
                inputProps={{ disabled: true }}
                renderInput={(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    onClick={() => setOpenFromDate(!openFromDate)}
                  />
                )}
                value={startDate || null}
              />

              {showButton && (startDate || endDate) && (
                <IconButton
                  onClick={() => {
                    setStartDate(new Date());
                    setEndDate(new Date());
                    setShowButton(false);
                  }}
                >
                  <ClearRounded />
                </IconButton>
              )}

              <DatePicker
                open={openToDate}
                onOpen={() => setOpenToDate(true)}
                onClose={() => setOpenToDate(false)}
                minDate={startDate}
                inputFormat="dd/MM/yyyy"
                label={t("To")}
                maxDate={new Date()}
                onChange={handleEndDateChange}
                //@ts-ignore
                inputProps={{ disabled: true }}
                renderInput={(inputProps: any) => (
                  <TextField
                    {...inputProps}
                    onClick={() => setOpenToDate(!openToDate)}
                  />
                )}
                value={endDate || null}
              />
            </Stack>
          </Box>

          <Box sx={{ mt: 4 }}>
            <OtherTopCard companyRef={companyRef} stats={adminStats} />
          </Box>

          <EmployeeTopCard companyRef={companyRef} stats={adminStats} />

          <Divider />

          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography variant="h6">{t("Vendor Orders")}</Typography>
          </Box>

          <Box>
            <VendorOrdersTopCard companyRef={companyRef} stats={adminStats} />
          </Box>

          <Box sx={{ mt: 3, mb: 3 }}>
            <VendorsCard />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
            }}
          >
            <Grid sx={{ mt: 3 }} xs={12} lg={8}>
              <Stack
                sx={{ ml: 2 }}
                spacing={{
                  xs: 3,
                  lg: 4,
                }}
              >
                <VendorOrderChart
                  chartSeries={txnByModeGrossRevenue || [45250, 35690, 14859]}
                  labels={txnByModeName || ["Cash", "Card", "Wallet"]}
                />
              </Stack>
            </Grid>
            <Grid sx={{ mt: 3 }} xs={12} lg={8}>
              <Stack
                sx={{ ml: 2 }}
                spacing={{
                  xs: 3,
                  lg: 4,
                }}
              >
                <VendorProfitChart
                  weeklyEarnings={[335, 184, 225, 578, 934, 524, 277]}
                />
              </Stack>
            </Grid>
          </Box>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
