import {
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { floorTypeOptions, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import { SectionTableRowLoading } from "./section-table-row-loading";
import i18n from "src/i18n";

interface SectionTableTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const SectionTableTableCard: FC<SectionTableTableCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName, origin } = props;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["section-table:update"]);
  const lng = localStorage.getItem("currentLanguage");
  const { find, updateEntity, loading, entities } = useEntity("sections");

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

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const handleStatusChange = async (id: string, checked: boolean, d: any) => {
    const updatedEntity = {
      ...d,
      status: checked ? "active" : "inactive",
    };

    await updateEntity(id, updatedEntity);
  };

  const tableHeaders = [
    {
      key: "sectionName",
      label: t("Section Name"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "floor",
      label: t("Floor"),
    },
    {
      key: "table",
      label: t("Table (capacity)"),
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
      const getFloorLabel = (value: any) => {
        const option = floorTypeOptions.find(
          (option) => option.value === value
        );
        return option ? option.label : "na";
      };
      const filteredTables =
        d?.tables?.filter((table: any) => table.status === "true") || [];
      const totalCapacity = filteredTables.reduce(
        (sum: any, table: any) => sum + Number(table?.capacity),
        0
      );

      arr.push({
        key: d?._id,
        _id: d?._id,
        sectionName: (
          <Typography variant="body2">
            {d?.name?.[lng] || d?.name?.en || "-"}
          </Typography>
        ),
        location: (
          <Typography variant="body2">{d?.location?.name || "na"}</Typography>
        ),
        floor: (
          <Typography variant="body2">{getFloorLabel(d?.floorType)}</Typography>
        ),
        table: (
          <Typography variant="body2">
            {filteredTables.length} ({totalCapacity})
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
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }

                  handleStatusChange(d._id, e.target.checked, d);
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
                  pathname: tijarahPaths?.management?.sectionTable?.create,
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
      });
    });

    return arr;
  }, [entities?.results]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
      locationRef: filter?.location || [],
      floor: filter?.floor?.toString() || "",
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with section name")}
          onSortChange={handleSortChange}
          showLocationFilter={true}
          showFloorFilter={true}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={SectionTableRowLoading}
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
                    {t("No Sections!")}
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
