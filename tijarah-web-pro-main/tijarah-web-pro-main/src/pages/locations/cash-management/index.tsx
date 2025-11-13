import { ChangeEvent, useMemo, useState } from "react";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
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
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { SuperTable } from "src/components/widgets/super-table";
import { useTranslation } from "react-i18next";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import Download01Icon from "@untitled-ui/icons-react/build/esm/Download01";
import { entities } from "src/api/dummy-api/cash-management";
import { sortOptions } from "src/utils/constants";
import { Sort } from "src/types/sortoption";
import { useCurrency } from "src/utils/useCurrency";

const Page: PageType = () => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [isCancelAllClicked, setIsCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");

  const [sort, setSort] = useState<Sort>(sortOptions[0].value);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
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

  const tableHeaders = [
    {
      key: "defaultStartingCash",
      label: t("Default Starting Cash"),
    },
    {
      key: "recipientEmail",
      label: t("Recipient Email"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "cashManagementStatus",
      label: t("Cash Management Status"),
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
        key: "d?._id",
        _id: d?._id,
        defaultStartingCash: (
          <Typography variant="body2">
            {currency} {d?.defaultStartingCash}
          </Typography>
        ),
        recipientEmail: (
          <Box sx={{ minWidth: "190px" }}>
            <Typography variant="body2">{d?.recipientEmail}</Typography>
          </Box>
        ),
        location: (
          <Box sx={{ minWidth: "190px" }}>
            <Typography variant="body2">{d?.location}</Typography>
          </Box>
        ),
        cashManagementStatus: (
          <FormControlLabel
            sx={{
              minWidth: "100px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                checked={d?.cashManagementStatus === "active" ? true : false}
                color="primary"
                edge="end"
                name="cashManagementStatus"
                // onChange={(e) => {
                //   handleStatusChange(d?._id, e.target.checked);
                // }}
                value={d?.cashManagementStatus === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={
              d?.cashManagementStatus === "active"
                ? t("Active")
                : t("Deactivated")
            }
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
              href={tijarahPaths?.management?.locations?.cashManagement?.edit}
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

  return (
    <>
      <Seo title="Cash Management" />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={9}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">{t("Cash Management")}</Typography>
              </Stack>
            </Stack>
            <Card>
              <SuperTableHeader
                onQueryChange={handleQueryChange}
                onFiltersChange={() => {}}
                searchPlaceholder={t("Search using Location")}
                onSortChange={handleSortChange}
                sort={sort}
                sortOptions={sortOptions}
              />

              <SuperTable
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
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
