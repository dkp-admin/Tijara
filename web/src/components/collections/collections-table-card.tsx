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
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import { CollectionsRowLoading } from "./collections-row-loading";

interface CollectionTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const CollectionsTableCard: FC<CollectionTableCardProps> = (props) => {
  usePageView();
  const router = useRouter();
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["collection:update"]);

  const { find, updateEntity, loading, entities } = useEntity("collection");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

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

  const handleStatusChange = async (
    id: string,
    checked: boolean,
    name: { en: string; ar: string }
  ) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
      companyRef,
      name,
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "collection",
      label: t("Collection"),
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

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d: any) => {
      return {
        key: d?._id,
        _id: d?._id,
        collection: (
          <Box
            sx={{ minWidth: "180px", display: "flex", alignItems: "center" }}
          >
            <Avatar src={d?.image || ""} sx={{ height: 42, width: 42 }} />
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {d?.name?.[lng] || d?.name?.en}
              </Typography>
            </Box>
          </Box>
        ),
        status: (
          <FormControlLabel
            sx={{ width: "120px", display: "flex", flexDirection: "row" }}
            control={
              <Switch
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  handleStatusChange(d?._id, e.target.checked, d?.name);
                }}
                value={d?.status === "active" ? true : false}
                sx={{ mr: 0.2 }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.catalogue?.collections?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    origin: origin ? origin : "",
                  },
                });
              }}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      };
    });

    return arr;
  }, [entities]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <Card>
      <Box>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with Collection Name")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={CollectionsRowLoading}
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
                    {t("No Collections!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Box>
    </Card>
  );
};
