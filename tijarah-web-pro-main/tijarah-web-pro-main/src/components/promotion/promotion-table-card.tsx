import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import {
  Box,
  Card,
  Divider,
  FormControlLabel,
  FormLabel,
  IconButton,
  Stack,
  SvgIcon,
  Switch,
  Tooltip,
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
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import CustomDateFilter from "../custom-date-filter/custom-date-filter";
import { PromotionRowLoading } from "./promotion-row-loading";
import { useSearchParams } from "next/navigation";

interface PromotionTableCardProps {
  companyRef?: string;
  companyName?: string;
  origin?: string;
  tab?: string;
}

export const PromotionTableCard: FC<PromotionTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { companyRef, companyName, origin, tab } = props;

  const today = new Date();
  const defaultDate = today.setMonth(today.getMonth() - 1);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [startDate, setStartDate] = useState<Date>(new Date(defaultDate));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reset, setReset] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const searchParams = useSearchParams();
  const type = searchParams.get("type");

  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["promotion:update"]);
  const { find, updateEntity, loading, entities } = useEntity("promotion");

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
      key: "promotionCode",
      label: t("Promotion Name"),
    },
    {
      key: "startsOn",
      label: t("Starts On"),
    },
    {
      key: "endsOn",
      label: t("Ends On"),
    },
    {
      key: "recurring",
      label: t("Recurring"),
    },
    {
      key: "promotionType",
      label: t("Promotion Type"),
    },
    {
      key: "targetPromotion",
      label: t("Target Promotion"),
    },
    {
      key: "promoCode",
      label: t("Promo Code"),
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
    const arr: any = entities?.results?.map((d) => {
      return {
        key: d?._id, //d?._id,
        _id: d?._id, //d?._id,
        promotionCode: <Typography variant="body2">{d?.name}</Typography>, //d?.code
        startsOn: (
          <Typography variant="body2">
            {format(new Date(d?.schedule?.expiryFrom), "MMM d, yyyy")}
          </Typography>
        ), //d?.expiry
        endsOn: (
          <Typography variant="body2">
            {d?.schedule?.noEndDate
              ? "No Expiry"
              : format(new Date(d?.schedule?.expiryTo), "MMM d, yyyy")}
          </Typography>
        ), //d?.expiry
        recurring: (
          <Typography variant="body2">
            {d?.schedule?.type === "recurring" ? "Yes" : "No"}
          </Typography>
        ),
        promotionType: (
          <Typography variant="body2">
            {d?.type?.type === "basic" ? "Basic" : "Advance"}
          </Typography>
        ),
        targetPromotion: (
          <Typography variant="body2">
            {d?.target?.type === "all" ? "All" : "Exclusive"}
          </Typography>
        ),
        promoCode: (
          <Typography variant="body2">
            {d?.code?.type == "no_code"
              ? "N/A"
              : d?.code?.type === "unique"
              ? `Unique Codes (${d?.code?.uniqueCodes?.length})`
              : d?.code?.code}
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
                disabled={
                  (d?.offer?.budgetType === "amount" &&
                    d?.offer?.budget <= 0) ||
                  (d?.offer?.type === "offer" && d?.offer?.offer <= 0)
                  // ||
                  // d?.status !== "active"
                }
                edge="end"
                name="status"
                onChange={(e) => {
                  if (!canUpdate) {
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
        ), //"active" replace with d?.status when api is ready
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
                  pathname: tijarahPaths?.management?.promotions?.create,
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
  }, [entities?.results]);

  const getQuery = () => {
    const query: any = {
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      status: filter?.adsStatus?.length > 0 ? filter?.adsStatus[0] : "",
      type: type !== "" ? type : "all",
      _q: debouncedQuery,
      companyRef,
      locationRef: filter?.location || [],
    };

    if (startDate && endDate) {
      const fromDate = new Date(startDate);
      fromDate.setHours(0, 0, 0, 0);

      const toDate = new Date(endDate);
      toDate.setHours(23, 59, 0, 0);

      query["dateRange"] = {
        from: fromDate,
        to: toDate,
      };
    }

    return query;
  };

  useEffect(() => {
    find({ ...getQuery() });
  }, [
    page,
    sort,
    debouncedQuery,
    rowsPerPage,
    filter,
    companyRef,
    tab,
    startDate,
    endDate,
    filter,
    type,
  ]);

  useEffect(() => {
    setFilter({});
  }, [type]);

  // if (!canAccess(MoleculeType["promotion:read"])) {
  //   return <NoPermission />;
  // }

  return (
    <>
      <Card>
        <SuperTableHeader
          showLocationFilter
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with Promotion name or code")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
          companyRef={companyRef}
        />

        <Divider />

        <Stack
          spacing={2}
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          sx={{ px: 3, py: 2, mb: 1 }}
        >
          <FormLabel
            sx={{
              color: "inherit",
              display: "block",
            }}
          >
            {t("Date Range")}
          </FormLabel>

          <CustomDateFilter
            reset={reset}
            setReset={(val: any) => setReset(val)}
            startDate={startDate}
            setStartDate={(val: any) => {
              setStartDate(val);
            }}
            endDate={endDate}
            setEndDate={(val: any) => {
              setEndDate(val);
            }}
          />

          <Box>
            <Tooltip title={t("Reset date")}>
              <IconButton
                onClick={() => {
                  setReset(true);
                  setStartDate(new Date(defaultDate));
                  setEndDate(new Date());
                  setShowButton(false);
                }}
              >
                <AutorenewRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Stack>

        <SuperTable
          isLoading={loading}
          loaderComponent={PromotionRowLoading}
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
                    {t("No Promotions!")}
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
