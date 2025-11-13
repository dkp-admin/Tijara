import {
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { useRouter } from "next/router";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import { CustomChargesRowLoading } from "./custom-charges-row-loading";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useEntity } from "src/hooks/use-entity";
import toast from "react-hot-toast";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useCurrency } from "src/utils/useCurrency";

interface CustomChargesTableCardProps {
  companyNameAr?: string;
  companyRef?: string;
  companyName?: string;
  origin?: string;
}

export const CustomChargesTableCard: FC<CustomChargesTableCardProps> = (
  props
) => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const { companyRef, companyName, companyNameAr, origin } = props;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const router = useRouter();
  const canAccess = usePermissionManager();
  const { find, updateEntity, entities, loading } = useEntity("custom-charge");

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
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

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const date = false;

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const getValue = (data: any) => {
    if (data.type === "amount") {
      if (data.fixedOrCustom === "fixed") {
        return toFixedNumber(data?.amount);
      } else {
        return toFixedNumber(data?.maxAmount);
      }
    } else {
      if (data.fixedOrCustom === "fixed") {
        return `${toFixedNumber(data.percentage)}%`;
      } else {
        return `${toFixedNumber(data?.maxPercentage)}%`;
      }
    }
  };

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "type",
      label: t("Type"),
    },
    {
      key: "fixedCustom",
      label: t("Fixed / Custom"),
    },
    {
      key: "value",
      label: t("Value"),
    },

    {
      key: "location",
      label: t("Location"),
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

  const getLocations = (locations: any) => {
    if (locations?.length > 0) {
      let data = locations.slice(0, 2).join(", ");

      return locations?.length >= 3
        ? data + ` +${locations?.length - 2}`
        : data || "NA";
    } else {
      return "NA";
    }
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: d?._id,
        _id: d?._id,
        name: (
          <Typography sx={{ textTransform: "capitalize" }} variant="body2">
            {d?.name?.en}
          </Typography>
        ),
        type: (
          <Typography variant="body2">{`${
            d?.type == "fixed" ? t("Amount") : t("Percentage")
          }`}</Typography>
        ),
        fixedCustom: (
          <Typography
            sx={{ textTransform: "capitalize" }}
            variant="body2"
          >{`${d?.chargeType}`}</Typography>
        ),
        value: (
          <Typography variant="body2">{`${
            d?.type == "fixed" ? currency : ""
          } ${toFixedNumber(d?.value)}${
            d?.type == "fixed" ? "" : "%"
          }`}</Typography>
        ),
        location: (
          <Typography sx={{ textTransform: "capitalize" }} variant="body2">{`${
            getLocations(d?.locations) || "NA"
          }`}</Typography>
        ),
        status: (
          <FormControlLabel
            sx={{
              width: "100px",
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
                  if (!canAccess(MoleculeType["custom-charge:update"])) {
                    return toast.error(t("You don't have access"));
                  }
                  handleStatusChange(d._id, e.target.checked);
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
                  pathname: tijarahPaths.catalogue.customCharges.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    companyNameAr: companyNameAr,
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
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with custom charge")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={CustomChargesRowLoading}
          items={transformedData || []}
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
                    {t("No Custom charges!")}
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
