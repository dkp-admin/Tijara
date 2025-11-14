import { ChangeEvent, useEffect, useMemo, useState } from "react";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import { RouterLink } from "src/components/router-link";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { SuperTable } from "src/components/widgets/super-table";
import { useTranslation } from "react-i18next";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { sortOptions } from "src/utils/constants";
import { Sort } from "src/types/sortoption";
import { useDebounce } from "use-debounce";
import { useEntity } from "src/hooks/use-entity";

const Page: PageType = () => {
  const { t } = useTranslation();

  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [queryText, setQueryText] = useState<string>("");
  const [debouncedQuery] = useDebounce(queryText, 500);

  const { find, updateEntity, loading, entities } = useEntity("brands");

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        brand: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Avatar
              src={d?.logo || ""}
              sx={{
                height: 42,
                width: 42,
              }}
            />
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.name?.en}
              </Typography>
            </Box>
          </Box>
        ),
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
              sx={{ mr: 1.5 }}
              href={`${tijarahPaths?.catalogue?.brands?.create}?id=${d?._id}`}
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

  const tableHeaders = [
    {
      key: "brand",
      label: t("Brand"),
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
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container>
            <Grid xs={12} md={8}>
              <Stack spacing={1}>
                <Typography variant="h6">{t("Create Brand")}</Typography>
                <Typography color="text.secondary" variant="body2">
                  {t("Brands of the company can be managed here")}
                </Typography>
              </Stack>
            </Grid>
            <Grid xs={12} md={4}>
              <Stack
                alignItems="center"
                justifyContent="flex-end"
                direction="row"
                spacing={3}
              >
                <Button
                  component={RouterLink}
                  href={tijarahPaths?.catalogue?.brands?.create}
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
            </Grid>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <Card>
          <SuperTableHeader
            onQueryChange={handleQueryChange}
            onFiltersChange={() => { }}
            showLocationFilter
            searchPlaceholder={t("Search using Brands")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            count={0}
            items={transformedData}
            headers={tableHeaders}
            total={20}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            isCancelAllClicked={isCancelAllClicked}
          />
        </Card>
      </Card>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
