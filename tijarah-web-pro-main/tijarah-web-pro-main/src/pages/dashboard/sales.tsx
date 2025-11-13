import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Container,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import { endOfDay, format, startOfDay, subDays } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import CustomDateFilter from "src/components/custom-date-filter/custom-date-filter";
import { MonthlyEarnings } from "src/components/dashboard/monthly-earnings";
import { OrderTypeDashboardCard } from "src/components/dashboard/order-type-card";
import { SuperAdminTopCard } from "src/components/dashboard/super-admin-top-card";
import { TopCard } from "src/components/dashboard/top-card";
import { TopCategories } from "src/components/dashboard/top-categories";
import { TopSellingProducts } from "src/components/dashboard/top-selling-products";
import { TransactionByMode } from "src/components/dashboard/transaction-mode";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import ReportingHoursAutoCompleteDropdown from "src/components/input/reporting-hours-auto-complete";
import { Seo } from "src/components/seo";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useFindOne } from "src/hooks/use-find-one";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import UpgradePackage from "src/pages/upgrade-package";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { green } from "src/theme/colors";
import type { Page as PageType } from "src/types/page";
import { capitalizeFirstLetter } from "src/utils/capitalize-first-letter";
import { USER_TYPES } from "src/utils/constants";
import { getReportDateTime } from "src/utils/get-report-date-time";
import { note } from "src/utils/get-report-note";
import { toFixedNumber } from "src/utils/toFixedNumber";

const Page: PageType = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { userType } = useUserType();

  const { canAccessModule } = useFeatureModuleManager();
  const canAccess = usePermissionManager();

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);

  const [reset, setReset] = useState(false);
  const [industry, setIndustry] = useState();
  const [startDate, setStartDate] = useState<Date>(prevDate);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [companyRef, setCompanyRef] = useState("all");
  const [locationRef, setLocationRef] = useState("all");
  const [businessHour, setBusinessHour] = useState(false);
  const [locationData, setLocationData] = useState<any>();
  const [reportingHour, setReportingHour] = useState<any>();
  const [reportingHourId, setReportingHourId] = useState("");
  // const [dateWiseSalesData, setDateWiseSalesData] = useState<any>([]);
  // const [dateWiseLoading, setDateWiseloading] = useState(false);

  usePageView();

  const { findOne: findOneLocation, entity: locationEntity } =
    useEntity("location");

  const { findOne: findDayEnd, entity: dayEndTime } = useFindOne(
    "cash-drawer-txn/get-day-end"
  );

  const {
    findOne: salesSummaryFindOne,
    entity: salesSummaryData,
    loading: loadingSaleSummary,
  } = useFindOne("report/sale-summary");

  const {
    findOne,
    entity,
    newDateAndTime,
    loading: dashboardLoading,
  } = useFindOne("dash");

  const {
    findOne: findSuperAdminStats,
    entity: superAdminStats,
    loading: adminStatsLoading,
  } = useFindOne("dash/admin/stats");

  const processedPaymentData = useMemo(() => {
    return salesSummaryData?.txnStats?.reduce(
      (acc: any, payment: any) => {
        const { paymentName, totalPayments, balanceAmount } = payment;
        if (totalPayments > 0) {
          acc.labels.push(capitalizeFirstLetter(paymentName));
          acc.values.push(balanceAmount);
        }
        return acc;
      },
      { labels: [], values: [] }
    );
  }, [salesSummaryData]);

  const topcategoryName = useMemo(
    () =>
      entity?.topCategories?.map((category: any) => {
        return category?.name?.en || "";
      }),
    [entity]
  );

  const topcategoryGrossRevenue = useMemo(
    () =>
      entity?.topCategories?.map((category: any) => {
        return category.grossRevenue;
      }),
    [entity]
  );

  // const monthlyEarning = useMemo(() => {
  //   const data = dateWiseSalesData.map((earning: any) => {
  //     return earning.grossRevenue;
  //   });

  //   return data;
  // }, [dateWiseSalesData]);

  // const monthlyEarningDate: any = useMemo(() => {
  //   const earningDate = dateWiseSalesData.map((earn: any) => {
  //     const date = new Date(earn.date);
  //     return format(date, "dd MMM ");
  //   });

  //   return earningDate;
  // }, [dateWiseSalesData]);

  const getQuery = () => {
    const query: any = {
      _q: "",
      sort: "asc",
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
      query["locationRef"] = locationRef;
    }

    if (startDate && endDate) {
      const dateTime = getReportDateTime(
        startDate,
        endDate,
        startTime,
        endTime,
        reportingHour,
        businessHour,
        locationData?.qrOrderingConfiguration?.schedule ||
          locationEntity?.qrOrderingConfiguration?.schedule,
        locationData?.timeZone || locationEntity?.timeZone,
        dayEndTime,
        locationRef,
        locationData?.businessClosureSetting?.endStartReporting ||
          locationEntity?.businessClosureSetting?.endStartReporting
      );

      query["dateRange"] = { from: dateTime.from, to: dateTime.to };
    }

    return query;
  };

  const getTimeQuery = () => {
    const query: any = {
      startDate: startOfDay(startDate),
      endDate: endOfDay(endDate),
    };
    if (userType == USER_TYPES?.SUPERADMIN) {
      if (companyRef !== "all" && companyRef) {
        query["companyRef"] = companyRef;
      }
    } else {
      query["companyRef"] = user?.company?._id;
    }

    if (userIsAdmin) {
      if (locationRef !== "all" && locationRef) {
        query["locationRef"] = locationRef;
      }
    } else {
      query["locationRef"] = locationRef;
    }

    return query;
  };

  useEffect(() => {
    if (
      locationRef?.length > 0 &&
      locationRef != "all" &&
      locationData?.businessClosureSetting?.endStartReporting
    ) {
      findDayEnd({ ...getTimeQuery() });
    }
  }, [
    locationData?.businessClosureSetting?.endStartReporting,
    locationRef,
    companyRef,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (
      user?.locationRef &&
      user.userType !== "app:super-admin" &&
      user?.userType === "app:admin"
    ) {
      findOneLocation(user?.locationRef?.toString());
    } else if (locationRef !== "" && locationRef !== "all") {
      findOneLocation(locationRef);
    }
  }, [user, locationRef]);

  useEffect(() => {
    if (user.userType === USER_TYPES.SUPERADMIN) {
      return findSuperAdminStats({ ...getQuery() });
    }
  }, []);

  useEffect(() => {
    salesSummaryFindOne({ ...getQuery() });
  }, [
    companyRef,
    locationRef,
    startDate,
    endDate,
    startTime,
    endTime,
    dayEndTime,
    businessHour,
    locationData,
  ]);

  if (!canAccessModule("sales_dashboard")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["dashboard:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={t("Sales")} />

      <Box component="main" sx={{ flexGrow: 1, py: 1 }}>
        <Container maxWidth="xl">
          <Stack
            spacing={1}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.8,
              flexDirection: "row",
            }}
          >
            <Typography variant="h4">{t("Sales")}</Typography>

            <Tooltip
              title={`${t("Stats were last updated on")}: ${
                dashboardLoading
                  ? ""
                  : format(new Date(newDateAndTime), "dd-MM-yyy hh:mm a")
              }`}
            >
              <SvgIcon fontSize="small">
                <InfoTwoToneIcon color="primary" />
              </SvgIcon>
            </Tooltip>
          </Stack>

          {userType == USER_TYPES.SUPERADMIN && (
            <SuperAdminTopCard
              stats={superAdminStats}
              loading={adminStatsLoading}
              salesSummaryData={salesSummaryData}
            />
          )}

          <Box
            sx={{
              mt: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box sx={{ display: "flex" }}>
              {userType == USER_TYPES.SUPERADMIN && (
                <Box sx={{ width: { xs: "45%", md: "200px" }, mr: 1.3 }}>
                  <CompanyDropdown
                    onChange={(id, name, businessType, industry) => {
                      setCompanyRef(id || "");
                      setIndustry(industry);
                    }}
                    selectedId={companyRef as string}
                    label={t("Company")}
                    id="company"
                  />
                </Box>
              )}

              {userIsAdmin ? (
                <Box sx={{ width: { xs: "45%", md: "200px" }, mr: 1.7 }}>
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
                    onChange={(id, name, data) => {
                      setLocationRef(id || "");
                      setLocationData(data);
                      if (data?.businessClosureSetting?.businessTime) {
                        setBusinessHour(true);
                      }
                    }}
                    selectedId={locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              ) : (
                <Box
                  sx={{ width: { xs: "45%", md: "200px" }, ml: 0.5, mr: 1.3 }}
                >
                  <LocationAutoCompleteDropdown
                    disabled={false}
                    showAllLocation
                    required={false}
                    companyRef={user.company._id}
                    onChange={(id, name, data) => {
                      setLocationRef(id || "");
                      setLocationData(data);
                      if (data?.businessClosureSetting?.businessTime) {
                        setBusinessHour(true);
                      }
                    }}
                    selectedId={locationRef}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "250px",
                mt: { xs: 2, md: 0 },
              }}
            >
              <CustomDateFilter
                reset={reset}
                setReset={(val: any) => setReset(val)}
                startDate={startDate}
                setStartDate={(val: any) => {
                  setStartDate(val);
                }}
                endDate={endDate}
                setEndDate={(val: any) => {
                  setEndDate(val);
                }}
              />

              <Box
                sx={{
                  width: "50px",
                }}
              >
                <Tooltip title={t("Reset date")}>
                  <IconButton
                    onClick={() => {
                      setReset(true);
                      setStartDate(prevDate);
                      setEndDate(new Date());
                    }}
                  >
                    <AutorenewRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: "flex", width: "290px", ml: 3 }}>
              <ReportingHoursAutoCompleteDropdown
                showAllHours
                required={false}
                companyRef={
                  userType == USER_TYPES.ADMIN || userType == USER_TYPES.CASHIER
                    ? user.company?._id
                    : companyRef === "all"
                    ? ""
                    : companyRef
                }
                onChange={(id, name, startTime, endTime, timezone, data) => {
                  setReportingHour(data);
                  setReportingHourId(id);
                  setStartTime(startTime);
                  setEndTime(endTime);
                }}
                selectedId={reportingHourId}
                label={t("Reporting Hours")}
                id="reportingHour"
              />
            </Box>
          </Box>

          <Box
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode !== "dark" ? `${green}` : "neutral.900",
              display: "flex",
              alignItems: "center",
              pt: 3,
              pl: 1,
              pr: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <SvgIcon fontSize="small">
                <InfoTwoToneIcon color="primary" />
              </SvgIcon>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    fontSize: "13px",
                    fontWeight: "bold",
                    pl: 0.7,
                  }}
                >
                  {t("Note: ")}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                color="gray"
                sx={{ fontSize: "13px", pl: 0.5 }}
              >
                {note(
                  locationData?.businessClosureSetting ||
                    locationEntity?.businessClosureSetting,
                  reportingHourId
                )}
              </Typography>
            </Box>
          </Box>

          <TopCard
            companyRef={companyRef}
            stats={salesSummaryData}
            loading={loadingSaleSummary}
          />

          {/* <SaleRefundTopCard
            companyRef={companyRef}
            locationRef={locationRef}
            startDate={startDate}
            endDate={endDate}
            startTime={startTime}
            endTime={endTime}
            businessHour={businessHour}
            reportingHour={reportingHour}
            locationData={locationData}
            locationEntity={locationEntity}
            dayEndTime={dayEndTime}
          /> */}

          <Grid container spacing={3} mt={3}>
            {/* Top Selling Products first, taking full width */}
            <Grid item xs={12}>
              <TopSellingProducts
                loading={dashboardLoading}
                products={entity?.topProducts}
              />
            </Grid>

            {/* Second row with 3 equal columns */}
            <Grid item xs={12} md={4}>
              <TransactionByMode
                loading={dashboardLoading}
                chartSeries={processedPaymentData?.values || []}
                labels={processedPaymentData?.labels || []}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TopCategories
                loading={dashboardLoading}
                chartSeries={topcategoryGrossRevenue || []}
                labels={topcategoryName || []}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <OrderTypeDashboardCard
                loading={dashboardLoading}
                industry={industry || user?.company?.industry}
                data={
                  user?.userType === USER_TYPES.SUPERADMIN
                    ? salesSummaryData
                    : salesSummaryData
                }
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
