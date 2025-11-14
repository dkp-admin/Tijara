import {
  Avatar,
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { format, isValid } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandsRowLoading } from "src/components/brands/brands-row-loading";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { CompanyContext } from "src/contexts/company-context";
import { useAuth } from "src/hooks/use-auth";

import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

const ReportingHourTab: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const companyContext = useContext<any>(CompanyContext);

  const router = useRouter();

  const { find, updateEntity, loading, entities } =
    useEntity("reporting-hours");

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };

  const handleSortChange = (value: any): void => {
    setSort(value);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // const handleStatusChange = async (id: string, checked: boolean) => {
  //   await updateEntity(id, {
  //     status: checked ? "active" : "inactive",
  //   });
  // };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        name: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}>
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.name?.en}
              </Typography>
            </Box>
          </Box>
        ),
        range: (
          <Box sx={{ display: "flex" }}>
            <Typography>
              {isValid(new Date(d?.startTime))
                ? d?.createdStartTime
                  ? d?.createdStartTime
                  : format(new Date(d?.startTime), "hh:mm a")
                : ""}
            </Typography>
            <Typography>{"-"}</Typography>
            <Typography>
              {isValid(new Date(d?.endTime))
                ? d?.createdEndTime
                  ? d?.createdEndTime
                  : format(new Date(d?.endTime), "hh:mm a")
                : ""}
              {/* /{d?.createdEndTime} */}
            </Typography>
          </Box>
        ),
        timeZone: (
          <Box>
            <Typography>{d?.timezone}</Typography>
          </Box>
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}>
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.management.reportingHour,
                  query: {
                    id: d?._id,
                    companyRef: companyContext?._id,
                    companyNameEn: companyContext?.name?.en,
                    companyNameAr: companyContext?.name?.ar,
                  },
                });
              }}
              sx={{ mr: 1.5 }}>
              <SvgIcon>
                <ArrowRightIcon />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities?.results]);

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "range",
      label: t("Range"),
    },
    {
      key: "timeZone",
      label: t("Time Zone"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: user?.company?._id || companyContext?._id,
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  return (
    <>
      <Seo title={`${t("Reporting Hours")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Grid container justifyContent="space-between" spacing={3}>
              <Grid item>
                <Typography variant="h4">{t("Reporting Hours")}</Typography>
              </Grid>
              <Grid item>
                <Button
                  onClick={() => {
                    router.push({
                      pathname: tijarahPaths?.management.reportingHour,
                      query: {
                        companyRef: companyContext?._id,
                        companyNameEn: companyContext?.name?.en,
                        companyNameAr: companyContext?.name?.ar,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained">
                  {t("Create")}
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Card>
            <Box>
              <SuperTableHeader
                showSearch={false}
                showFilter={false}
                onQueryChange={handleQueryChange}
                onFiltersChange={() => {}}
                showLocationFilter
                searchPlaceholder={t("Search using reporting hours")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={BrandsRowLoading}
                items={transformedData}
                headers={tableHeaders}
                total={entities?.total || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                isCancelAllClicked={isCancelAllClicked}
                noDataPlaceholder={
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <NoDataAnimation
                      text={
                        <Typography
                          variant="h6"
                          textAlign="center"
                          sx={{ mt: 2 }}>
                          {t("No reporting hours!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Box>
          </Card>
        </Container>
      </Box>
    </>
  );
};

ReportingHourTab.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default ReportingHourTab;
