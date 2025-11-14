import {
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
import { ModifiersRowLoading } from "./modifiers-row-loading";

interface ModifierTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const ModifiersTableCard: FC<ModifierTableCardProps> = (props) => {
  usePageView();

  const router = useRouter();
  const { t } = useTranslation();
  const { companyRef, companyName, origin } = props;

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["modifier:update"]);

  const { find, updateEntity, loading, entities } = useEntity("modifier");

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
      key: "modifierName",
      label: t("Modifier Name"),
    },
    {
      key: "displayName",
      label: t("Display Name"),
    },
    // {
    //   key: "sku",
    //   label: t("SKU"),
    // },
    {
      key: "options",
      label: t("Options"),
    },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "action",
      label: "",
    },
  ];

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d: any) => {
      return {
        key: d._id,
        _id: d._id,
        modifierName: <Typography variant="body2">{d.name}</Typography>,
        displayName: <Typography variant="body2">{d.displayName}</Typography>,
        sku: <Typography variant="body2">{d.sku}</Typography>,
        options: (
          <Typography variant="body2">{d.values?.length || 0}</Typography>
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
                edge="end"
                name="status"
                color="primary"
                checked={d.status === "active"}
                onChange={(e) => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  handleStatusChange(d._id, e.target.checked);
                }}
                value={d.status === "active" ? true : false}
                sx={{ mr: 0.2 }}
              />
            }
            label={d.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.catalogue?.modifiers?.create,
                  query: {
                    id: d._id,
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
    <>
      <Card>
        <Box>
          <SuperTableHeader
            onQueryChange={handleQueryChange}
            onFiltersChange={handleFilterChange}
            searchPlaceholder={t("Search with Modifier Name")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={ModifiersRowLoading}
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
                      {t("No Modifiers!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Box>
      </Card>
    </>
  );
};
