import {
  Box,
  Button,
  Card,
  Container,
  FormControlLabel,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IndustriesRowLoading } from "src/components/industries/industries-row-loading";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

const Page: PageType = () => {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const { find, updateEntity, loading, entities } = useEntity("business-type");

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const tableHeaders = [
    {
      key: "industry",
      label: t("Industry"),
    },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        industry: <Typography variant="body2">{d.name.en}</Typography>,
        status: (
          <FormControlLabel
            sx={{
              width: "120px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  handleStatusChange(d?._id, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              component={RouterLink}
              href={`${tijarahPaths?.platform?.industries?.create}?id=${d?._id}`}
              sx={{ mr: 1.5 }}
            >
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

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
    });
  }, [page, sort, debouncedQuery, rowsPerPage]);

  return (
    <>
      <Seo title={`${t("Industries")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={4}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Industries")}</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={
                      <SvgIcon>
                        <Download01Icon />
                      </SvgIcon>
                    }
                  >
                    {t("Export All")}
                  </Button>
                </Stack>
              </Stack>
              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  component={RouterLink}
                  href={tijarahPaths?.platform?.industries?.create}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Stack>
            </Stack>
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={() => {}}
                showLocationFilter
                searchPlaceholder={t("Search using Industry Name")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
                isLoading={loading}
                loaderComponent={IndustriesRowLoading}
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
                          sx={{ mt: 2 }}
                        >
                          {t("No Industries!")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
