import {
  Avatar,
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { VendorRowLoading } from "src/components/vendor/vendor-row-loading";
import { RouterLink } from "src/components/router-link";
import { useAuth } from "src/hooks/use-auth";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { useRouter } from "next/router";

interface VendorTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const VendorTableCard: FC<VendorTableCardProps> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { companyRef, companyName, origin } = props;
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const { find, updateEntity, loading, entities } = useEntity("vendor");

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
      if (page > 0) {
        setPage(0);
      }
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

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "vendor",
      label: t("Vendor"),
    },
    {
      key: "phone",
      label: t("Phone"),
    },
    {
      key: "email",
      label: t("Email"),
    },
    {
      key: "note",
      label: t("Notes"),
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
        key: d._id,
        _id: d?._id,
        vendor: (
          <>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={d?.image || ""}
                sx={{
                  height: 47,
                  width: 47,
                  mr: 1,
                }}
              />
              <Box>
                <Typography variant="body2">{d?.name}</Typography>
              </Box>
            </Box>
          </>
        ),
        phone: (
          <Typography variant="body2" sx={{ minWidth: "110px" }}>
            {d?.phone}
          </Typography>
        ),
        email: <Typography variant="body2">{d?.email}</Typography>,
        note: (
          <Typography
            style={d?.note ? { textAlign: "left" } : { textAlign: "center" }}
            variant="body2"
          >
            {" "}
            {d?.note ? d?.note : "-"}{" "}
          </Typography>
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
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.inventoryManagement?.vendor?.create,
                  query: {
                    id: d?._id,
                    name: d?.name,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin ? origin : "",
                  },
                });
              }}
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
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      locationRefs: filter?.location || [],
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search using Vendor or phone")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={VendorRowLoading}
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
                  <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    {t("No Vendor!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Card>
    </>
  );
};
