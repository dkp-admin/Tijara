import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import InfoTwoToneIcon from "@mui/icons-material/InfoTwoTone";
import {
  Box,
  Container,
  Grid,
  IconButton,
  MenuItem,
  SvgIcon,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { green } from "@mui/material/colors";
import { addHours, format, parseISO } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomDateFilter from "src/components/custom-date-filter/custom-date-filter";
import { SalesUsage } from "src/components/dashboard/hourly-report/sales-usage";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import ReportingHoursAutoCompleteDropdown from "src/components/input/reporting-hours-auto-complete";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
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
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useDebounce } from "use-debounce";

const ChartType = [
  {
    label: "Line",
    value: "line",
  },
  {
    label: "Bar",
    value: "bar",
  },
];
const SaleType = [
  {
    label: "Type 1",
    value: "type1",
  },
  {
    label: "Type 2",
    value: "type2",
  },
];

const Page: PageType = () => {
  const { t } = useTranslation();
  const { userType } = useUserType();
  const { user } = useAuth();
  const theme = useTheme();
  const { canAccessModule } = useFeatureModuleManager();
  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const canAccess = usePermissionManager();

  const [queryText, setQueryText] = useState("");

  const [debouncedQuery] = useDebounce(queryText, 500);

  const [showButton, setShowButton] = useState(false);
  const [companyRef, setCompanyRef] = useState("all");
  const [saleTypeValue, setSaleTypeValue] = useState("type1");
  const [chartTypeValue, setChartTypeValue] = useState("bar");
  const [chartTypeValue1, setChartTypeValue1] = useState("bar");
  const [chartTypeValue2, setChartTypeValue2] = useState("bar");
  const [chartTypeValue3, setChartTypeValue3] = useState("bar");
  const [industry, setIndustry] = useState();
  const [locationRef, setLocationRef] = useState("all");
  const newLocationRef = user.locationRef;

  const prevDate = new Date();
  prevDate.setDate(prevDate.getDate() - 1);
  const prevDateVs = new Date();
  prevDateVs.setDate(prevDateVs.getDate() - 7);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startDateVs, setStartDateVs] = useState<Date>(prevDateVs);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [endDateVs, setEndDateVs] = useState<Date>(prevDateVs);
  const [reset, setReset] = useState(false);
  const [startTime, setStartTime] = useState<Date>();
  const [endTime, setEndTime] = useState<Date>();
  const [reportingHourId, setReportingHourId] = useState("");
  const [timezone, setTimezone] = useState("");

  usePageView();

  const { find: findReportingHours, entities: reportingHours } =
    useEntity("reporting-hours");

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

  const {
    findOne: findAdminStats,
    entity: adminStats,
    loading: merchantStatsLoading,
  } = useFindOne("dash/merchant/stats");

  const revBillGrossRevenue = useMemo(() => {
    const sortedData = entity?.revenueAndBills?.sort(
      (a: any, b: any) =>
        new Date(a?.date).getTime() - new Date(b?.date).getTime()
    );
    return sortedData?.map((rev: any) => {
      return toFixedNumber(rev?.totalGrossRevenue);
    });
  }, [entity]);

  const revDate: any = useMemo(() => {
    const revenueDate = entity?.revenueAndBills?.map((rev: any) => {
      const date = new Date(rev?.date);
      return format(date, "dd MMM ");
    });

    return revenueDate;
  }, [entity]);

  console.log("revDate", revDate);
  const revBillTotalOrder: any = useMemo(() => {
    return entity?.revenueAndBills?.map((rev: any) => {
      return toFixedNumber(rev?.totalOrders);
    });
  }, [entity]);

  const getQuery = () => {
    const query: any = {
      activeTab: "all",
      _q: debouncedQuery,
      sort: "asc",
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
      if (startTime && endTime) {
        let fromDate = startDate;
        const startHours = new Date(startTime).getHours();
        const startMinutes = new Date(startTime).getMinutes();
        const startSeconds = new Date(startTime).getSeconds();

        fromDate.setHours(startHours);
        fromDate.setMinutes(startMinutes);
        fromDate.setSeconds(startSeconds);

        let toDate = endDate;
        const end = Number(
          `${new Date(endTime).getHours()}${new Date(endTime).getMinutes()}`
        );
        const start = Number(
          `${new Date(startTime).getHours()}${new Date(startTime).getMinutes()}`
        );

        if (end < start) {
          const d = new Date(toDate);
          d.setDate(d.getDate() + 1);
          toDate = d;
        }
        const endHours = new Date(endTime).getHours();
        const endMinutes = new Date(endTime).getMinutes();
        const endSeconds = new Date(endTime).getSeconds();

        toDate.setHours(endHours);
        toDate.setMinutes(endMinutes);
        toDate.setSeconds(endSeconds);

        let UTCFromDate = fromDate;
        let UTCToDate = toDate;

        if (timezone.includes("+03:00")) {
          const utcFromDate: Date = parseISO(fromDate.toISOString());
          const utcToDate: Date = parseISO(toDate.toISOString());
          UTCFromDate = addHours(utcFromDate, 3);
          UTCToDate = addHours(utcToDate, 3);
        } else if (timezone.includes("+04:00")) {
          const utcFromDate: Date = parseISO(fromDate.toISOString());
          const utcToDate: Date = parseISO(toDate.toISOString());
          UTCFromDate = addHours(utcFromDate, 4);
          UTCToDate = addHours(utcToDate, 4);
        }

        query["dateRange"] = {
          from: UTCFromDate,
          to: UTCToDate,
        };
      } else {
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);

        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 0, 0);

        query["dateRange"] = {
          from: fromDate,
          to: toDate,
        };
      }
    }

    return query;
  };

  useEffect(() => {
    if (user.userType === USER_TYPES.SUPERADMIN) {
      return findSuperAdminStats({ ...getQuery() });
    }
  }, []);

  useEffect(() => {
    findAdminStats({ ...getQuery() });
  }, [companyRef, locationRef, startDate, endDate, startTime, endTime]);

  useEffect(() => {
    findOne({ ...getQuery() });
  }, [companyRef, locationRef, startDate, endDate, startTime, endTime]);

  useEffect(() => {
    if (user.userType === USER_TYPES.ADMIN) {
      if (user?.company?._id) {
        findReportingHours({
          page: 0,
          limit: 100,
          _q: "",
          activeTab: "all",
          sort: "asc",
          companyRef: user?.company?._id,
        });
      }
    } else {
      if (companyRef && companyRef != "all") {
        findReportingHours({
          page: 0,
          limit: 100,
          _q: "",
          activeTab: "all",
          sort: "asc",
          companyRef: companyRef,
        });
      }
    }
  }, [companyRef]);

  const defaultHour = reportingHours?.results?.filter(
    (d: any) => d?.default === true
  );

  useEffect(() => {
    if (reportingHours?.results?.length > 0 && !reportingHourId) {
      if (defaultHour?.length > 0) {
        setStartTime(new Date(defaultHour?.[0]?.startTime));
        setEndTime(new Date(defaultHour?.[0]?.endTime));
        setTimezone(defaultHour?.[0]?.timezone);
      } else {
        setStartTime(new Date(reportingHours?.results?.[0]?.startTime));
        setEndTime(new Date(reportingHours?.results?.[0]?.endTime));
        setTimezone(reportingHours?.results?.[0]?.timezone);
      }
    }
  }, [!reportingHourId, reportingHours?.results]);

  if (!canAccessModule("hourly_report")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["dashboard:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={t("Sales trends")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4">{t("Sales trends")}</Typography>

          <Box
            sx={{
              backgroundColor:
                theme.palette.mode !== "dark" ? `${green}` : "neutral.900",
              display: "flex",
              alignItems: "center",
              py: 1,
              pl: 1,
              pr: 2,
              mt: 1,
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
                {`${t("Last Updated on")}: ${
                  dashboardLoading
                    ? ""
                    : format(new Date(newDateAndTime), "dd-MM-yyy hh:mm a")
                }`}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
              }}
            >
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
                <>
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
                      onChange={(id) => {
                        setLocationRef(id || "");
                      }}
                      selectedId={locationRef as string}
                      label={t("Location")}
                      id="location"
                    />
                  </Box>
                  <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
                    <TextFieldWrapper
                      select
                      fullWidth
                      label={t("Sale Type")}
                      name="saleTypeValue"
                      onChange={(e) => {
                        setSaleTypeValue(e.target.value);
                      }}
                      value={saleTypeValue}
                    >
                      {SaleType?.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Box>
                </>
              ) : (
                <>
                  <Box
                    sx={{ width: { xs: "45%", md: "200px" }, ml: 0.5, mr: 1.3 }}
                  >
                    <LocationAutoCompleteDropdown
                      disabled={false}
                      showAllLocation
                      required={false}
                      companyRef={user.company._id}
                      onChange={(id) => {
                        setLocationRef(id || "");
                      }}
                      selectedId={locationRef as string}
                      label={t("Location")}
                      id="location"
                    />
                  </Box>
                  <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
                    <TextFieldWrapper
                      select
                      fullWidth
                      label={t("Sale Type")}
                      name="saleTypeValue"
                      onChange={(e) => {
                        setSaleTypeValue(e.target.value);
                      }}
                      value={saleTypeValue}
                    >
                      {SaleType?.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Hourly sales")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("No sale since 30 days")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
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
                <Typography
                  sx={{ pl: 1, pr: 2 }}
                  variant="h6"
                  color="textSecondary"
                >
                  VS
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "250px",
                mt: { xs: 2, md: 0 },
                ml: 2,
              }}
            >
              <CustomDateFilter
                reset={reset}
                setReset={(val: any) => setReset(val)}
                startDate={startDateVs}
                setStartDate={(val: any) => {
                  setStartDateVs(val);
                }}
                endDate={endDateVs}
                setEndDate={(val: any) => {
                  setEndDateVs(val);
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
                      setStartDate(new Date());
                      setStartDateVs(prevDateVs);
                      setEndDate(new Date());
                      setEndDateVs(prevDateVs);
                      setShowButton(false);
                    }}
                  >
                    <AutorenewRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: "flex", width: "200px", ml: 3 }}>
              <ReportingHoursAutoCompleteDropdown
                showAllHours
                required={false}
                companyRef={
                  userType == USER_TYPES.ADMIN
                    ? user.company?._id
                    : companyRef === "all"
                    ? ""
                    : companyRef
                }
                onChange={(id, name, startTime, endTime, timezone) => {
                  setTimezone(timezone);
                  setReportingHourId(id);
                  setStartTime(startTime);
                  setEndTime(endTime);
                }}
                selectedId={
                  reportingHourId?.length > 0
                    ? reportingHourId
                    : defaultHour?.length > 0
                    ? (defaultHour?.[0]?._id as string)
                    : (reportingHours?.results?.[0]?._id as string)
                }
                label={t("Reporting Hours")}
                id="reportingHour"
              />
            </Box>

            <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
              <TextFieldWrapper
                select
                fullWidth
                label={t("Chart Type")}
                name="chartTypeValue"
                onChange={(e) => {
                  setChartTypeValue(e.target.value);
                }}
                value={chartTypeValue}
              >
                {ChartType?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextFieldWrapper>
            </Box>
          </Box>

          <Grid
            sx={{
              mt: 2,
            }}
          >
            <SalesUsage
              loading={dashboardLoading}
              chartType={chartTypeValue}
              title={"Hourly"}
              categories={[
                "1 AM",
                "2 AM",
                "3 AM",
                "4 AM",
                "5 AM",
                "6 AM",
                "7 AM",
                "8 AM",
                "9 AM",
                "10 AM",
                "11 AM",
                "12 AM",
                "1 PM",
                "2 PM",
                "3 PM",
                "4 PM",
                "5 PM",
                "6 PM",
                "7 PM",
                "8 PM",
                "9 PM",
                "10 PM",
                "11 PM",
                "12 PM",
              ]}
              chartSeries={[
                {
                  name: t("Present"),
                  data: [
                    44, 55, 57, 56, 44, 55, 57, 56, 61, 58, 63, 60, 66, 58, 63,
                    60, 55, 57, 56, 61, 55, 57, 56, 61,
                  ],
                },
                {
                  name: t("Previous"),
                  data: [
                    76, 85, 101, 98, 87, 76, 85, 101, 98, 87, 105, 91, 114, 98,
                    87, 55, 57, 56, 61, 105, 91, 61, 105, 91,
                  ],
                },
              ]}
            />
          </Grid>

          {/* {Daily} */}

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Daily sales")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("text")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
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
                <Typography sx={{ px: 1 }} variant="h6" color="textSecondary">
                  VS
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "250px",
                mt: { xs: 2, md: 0 },
                ml: 2,
              }}
            >
              <CustomDateFilter
                reset={reset}
                setReset={(val: any) => setReset(val)}
                startDate={startDateVs}
                setStartDate={(val: any) => {
                  setStartDateVs(val);
                }}
                endDate={endDateVs}
                setEndDate={(val: any) => {
                  setEndDateVs(val);
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
                      setStartDate(new Date());
                      setStartDateVs(prevDateVs);
                      setEndDate(new Date());
                      setEndDateVs(prevDateVs);
                      setShowButton(false);
                    }}
                  >
                    <AutorenewRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: "flex", width: "200px", ml: 3 }}>
              <ReportingHoursAutoCompleteDropdown
                showAllHours
                required={false}
                companyRef={
                  userType == USER_TYPES.ADMIN
                    ? user.company?._id
                    : companyRef === "all"
                    ? ""
                    : companyRef
                }
                onChange={(id, name, startTime, endTime, timezone) => {
                  setTimezone(timezone);
                  setReportingHourId(id);
                  setStartTime(startTime);
                  setEndTime(endTime);
                }}
                selectedId={
                  reportingHourId?.length > 0
                    ? reportingHourId
                    : defaultHour?.length > 0
                    ? (defaultHour?.[0]?._id as string)
                    : (reportingHours?.results?.[0]?._id as string)
                }
                label={t("Reporting Hours")}
                id="reportingHour"
              />
            </Box>

            <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
              <TextFieldWrapper
                select
                fullWidth
                label={t("Chart Type")}
                name="chartTypeValue1"
                onChange={(e) => {
                  setChartTypeValue1(e.target.value);
                }}
                value={chartTypeValue1}
              >
                {ChartType?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextFieldWrapper>
            </Box>
          </Box>

          <Grid
            sx={{
              mt: 2,
            }}
          >
            <SalesUsage
              loading={dashboardLoading}
              chartType={chartTypeValue1}
              title={"Daily"}
              categories={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
              chartSeries={[
                {
                  name: t("This week"),
                  data: [100, 158, 63, 160, 66, 66, 66],
                },
                {
                  name: t("Previous week"),
                  data: [76, 85, 101, 98, 87, 105, 91],
                },
              ]}
            />
          </Grid>

          {/* weekly */}

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Weekly sales")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("text")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
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
                      setShowButton(false);
                    }}
                  >
                    <AutorenewRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box sx={{ display: "flex", width: "200px", ml: 3 }}>
              <ReportingHoursAutoCompleteDropdown
                showAllHours
                required={false}
                companyRef={
                  userType == USER_TYPES.ADMIN
                    ? user.company?._id
                    : companyRef === "all"
                    ? ""
                    : companyRef
                }
                onChange={(id, name, startTime, endTime, timezone) => {
                  setTimezone(timezone);
                  setReportingHourId(id);
                  setStartTime(startTime);
                  setEndTime(endTime);
                }}
                selectedId={
                  reportingHourId?.length > 0
                    ? reportingHourId
                    : defaultHour?.length > 0
                    ? (defaultHour?.[0]?._id as string)
                    : (reportingHours?.results?.[0]?._id as string)
                }
                label={t("Reporting Hours")}
                id="reportingHour"
              />
            </Box>

            <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
              <TextFieldWrapper
                select
                fullWidth
                label={t("Chart Type")}
                name="chartTypeValue2"
                onChange={(e) => {
                  setChartTypeValue2(e.target.value);
                }}
                value={chartTypeValue2}
              >
                {ChartType?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextFieldWrapper>
            </Box>
          </Box>

          <Grid
            sx={{
              mt: 2,
            }}
          >
            <SalesUsage
              loading={dashboardLoading}
              chartType={chartTypeValue2}
              title={"Weekly"}
              categories={[
                "Week1",
                "week2",
                "Week 3",
                "week 4",
                "week 5",
                "Week 6",
              ]}
              chartSeries={[
                {
                  name: t("Week"),
                  data: [44, 55, 57, 56, 61, 58],
                },
              ]}
            />
          </Grid>

          {/* Monthly */}

          <Box
            sx={{
              mt: 4,
              mb: 3,
            }}
          >
            <Typography variant="h5">{t("Monthly sales")}</Typography>
            <Typography color={"GrayText"} variant="body2">
              {t("text")}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", width: "200px", ml: 3 }}>
              <ReportingHoursAutoCompleteDropdown
                showAllHours
                required={false}
                companyRef={
                  userType == USER_TYPES.ADMIN
                    ? user.company?._id
                    : companyRef === "all"
                    ? ""
                    : companyRef
                }
                onChange={(id, name, startTime, endTime, timezone) => {
                  setTimezone(timezone);
                  setReportingHourId(id);
                  setStartTime(startTime);
                  setEndTime(endTime);
                }}
                selectedId={
                  reportingHourId?.length > 0
                    ? reportingHourId
                    : defaultHour?.length > 0
                    ? (defaultHour?.[0]?._id as string)
                    : (reportingHours?.results?.[0]?._id as string)
                }
                label={t("Reporting Hours")}
                id="reportingHour"
              />
            </Box>

            <Box sx={{ display: "flex", width: "140px", ml: 3 }}>
              <TextFieldWrapper
                select
                fullWidth
                label={t("Chart Type")}
                name="chartTypeValue3"
                onChange={(e) => {
                  setChartTypeValue3(e.target.value);
                }}
                value={chartTypeValue3}
              >
                {ChartType?.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextFieldWrapper>
            </Box>
          </Box>

          <Grid
            sx={{
              mt: 2,
            }}
          >
            <SalesUsage
              loading={dashboardLoading}
              chartType={chartTypeValue2}
              title={"Monthly"}
              categories={[
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ]}
              chartSeries={[
                {
                  name: t("Months"),
                  data: [44, 55, 57, 56, 61, 58, 44, 55, 57, 56, 61, 58],
                },
              ]}
            />
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
