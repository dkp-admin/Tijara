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
import { toFixedNumber } from "src/utils/toFixedNumber";
import { BoxesAndCratesRowLoading } from "./boxes-crates-row-loading";
import { useCurrency } from "src/utils/useCurrency";

interface BoxesAndCratesTableCardProps {
  industry?: string;
  companyRef?: string;
  companyName?: string;
  profilePicture?: string;
  origin?: string;
}

export const BoxesAndCratesTableCard: FC<BoxesAndCratesTableCardProps> = (
  props
) => {
  usePageView();
  const { companyRef, companyName, origin, industry } = props;
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["category:update"]);

  const { find, updateEntity, entities, loading } = useEntity("boxes-crates");

  const router = useRouter();

  const { t } = useTranslation();

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

  const getStock = (d: any) => {
    if (d?.stockConfiguration && d.stockConfiguration.length > 0) {
      const stockCount = d.stockConfiguration.reduce(
        (total: number, item: any) => {
          if (item.tracking) {
            return total + item.count;
          }
          return total;
        },
        0
      );

      return `${stockCount || "-"}`;
    }
    return "-";
  };

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "sku",
      label: t("SKU"),
    },
    {
      key: "noOfUnits",
      label: t("NO. of Units"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "costPrice",
      label: t("Cost Price"),
    },
    {
      key: "sellingPrice",
      label: t("Selling Price"),
    },
    {
      key: "stockCount",
      label: t("Stock Count"),
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
  const currency = useCurrency();

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
            }}
          >
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
        sku: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {d?.type == "box" ? d?.boxSku : d?.crateSku}
              </Typography>
            </Box>
          </Box>
        ),
        noOfUnits: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {d?.qty || "0"}
              </Typography>
            </Box>
          </Box>
        ),
        type: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {d?.type || "NA"}
              </Typography>
            </Box>
          </Box>
        ),
        costPrice: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {`${currency} ${toFixedNumber(d?.costPrice)}` || "0"}
              </Typography>
            </Box>
          </Box>
        ),
        sellingPrice: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography
                style={{ textTransform: "capitalize" }}
                color="inherit"
                variant="subtitle2"
              >
                {`${currency} ${toFixedNumber(d?.price)}` || "0"}
              </Typography>
            </Box>
          </Box>
        ),
        stockCount: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
            }}
          >
            {getStock(d) || "-"}
          </Box>
        ),
        status: (
          <FormControlLabel
            sx={{
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
                  pathname: tijarahPaths?.catalogue?.boxesAndCrates.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    industry: industry,
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
  }, [entities]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
      type:
        filter?.boxAndCrateType?.length > 0 ? filter?.boxAndCrateType[0] : "",
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <Box>
          <SuperTableHeader
            showBoxAndCrateTypeFilter
            onQueryChange={handleQueryChange}
            onFiltersChange={handleFilterChange}
            searchPlaceholder={t("Search with Name, SKU and Code")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={BoxesAndCratesRowLoading}
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
                      {t("No Boxes or Crates!")}
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
