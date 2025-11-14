import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { ChangeEvent, FC, Key, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { ReferralCouponRowLoading } from "src/components/referral-coupon/referral-coupon-row-loading";
import { RouterLink } from "src/components/router-link";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

interface CaustomerTableCardProps {
  companyRef?: string;
  companyName?: string;
}

export const ReferralCouponTableCard: FC<CaustomerTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName } = props;

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [copySuccess, setCopySuccess] = useState("");

  const { find, updateEntity, loading, entities } = useEntity("coupon");

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
    updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "code",
      label: t("Referral Code"),
    },
    {
      key: "vendor",
      label: t("User"),
    },
    {
      key: "userType",
      label: t("User Type"),
    },
    {
      key: "discountValue",
      label: t("Discount Values(in %)"),
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
    let arr: any[] = [];
    console.log(entities?.results);
    [
      {
        code: "4AT6",
        name: "Name 1",
        phone: "+91567874747",
        companyRef: "6491af045cb3bda41c3b02ba",
        userType: "Sales",
        discountValue: "15",
        status: "active",
        locations: { name: "My Location" },
        profilePicture: "",
        _id: "649568a1f4efbf102ef71837",
      },
      {
        code: "H555",
        name: "Name 2",
        phone: "+916747637634",
        companyRef: "6491af045cb3bda41c3b02ba",
        userType: "Other",
        discountValue: "",
        status: "deactivate",
        locations: { name: "My new location" },
        profilePicture: "",
        _id: "6491eaa9e5da1531332f9672",
      },
    ].map((d) => {
      const copyToClipboard = () => {
        navigator.clipboard.writeText(d?.code);
        toast.success(t("Copied"));
      };

      arr.push({
        key: d._id,
        _id: d?._id,
        code: (
          <Typography variant="body2" sx={{ minWidth: "110px" }}>
            {d?.code}
            <IconButton onClick={copyToClipboard}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Typography>
        ),
        vendor: (
          <Box>
            <Typography variant="body2">{d?.name}</Typography>
            <Typography variant="body2" color="gray">
              {d?.phone}
            </Typography>
          </Box>
        ),
        userType: <Typography variant="body2">{d?.userType}</Typography>,
        discountValue: (
          <Typography variant="body2">{d?.discountValue}</Typography>
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
              component={RouterLink}
              href={`${tijarahPaths?.platform?.subscriptionManagement?.referralCoupon?.create}?id=${d?._id}&companyRef=${companyRef}&companyName=${companyName}`}
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
      companyRef: companyRef ? companyRef : user.company?._id,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search using User")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={ReferralCouponRowLoading}
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
                  <Typography variant="h4" textAlign="center" sx={{ mt: 2 }}>
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
