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
import {
  ChangeEvent,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LocationsRowLoading } from "src/components/locations/locations-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import ConfirmationDialog from "../confirmation-dialog";

interface LocationsTableCardProps {
  companyRef?: string;
  companyName?: string;
  businessTypeRef?: string;
  businessType?: string;
  ownerRef?: string;
  ownerName?: string;
  origin?: string;
}

export const LocationsTableCard: FC<LocationsTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName, origin } = props;

  const companyContext = useContext<any>(CompanyContext);

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [locationId, setLocationId] = useState<any>("");
  const router = useRouter();

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["location:update"]);
  const canCreate = canAccess(MoleculeType["location:create"]);
  const receiptTemplateView = canAccess(MoleculeType["receipt-template:read"]);

  const { find, updateEntity, loading, entities } = useEntity("location");

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
      key: "locationBusinessName",
      label: t("Location Business Name"),
    },
    {
      key: "address",
      label: t("Address"),
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
      key: "status",
      label: t("Status"),
    },
    {
      key: "template",
      label: t("Template"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    let arr: any[] = [];

    entities?.results?.map((d) => {
      arr.push({
        key: "d?._id",
        _id: d?._id,
        locationBusinessName: (
          <Box>
            <Typography>{d?.name[lng] || d?.name?.en}</Typography>
          </Box>
        ),
        address: (
          <Typography variant="body2">
            {d?.address?.address1}, <br />
            {d?.address?.city}, {d?.address?.country}
          </Typography>
        ),
        phone: <Typography variant="body2">{d?.phone || "NA"}</Typography>,
        email: <Typography variant="body2">{d?.email || "NA"}</Typography>,
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
                  if (d?.status === "active") {
                    setShowDialogCustomerEvent(true);
                    setLocationId(d?._id);
                    return;
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
        template: (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <IconButton
              onClick={() => {
                if (!receiptTemplateView) {
                  return toast.error(t("You don't have access"));
                }
                router.push({
                  pathname:
                    tijarahPaths?.management?.locations?.receiptTemplate?.index,
                  query: {
                    id: d?._id,
                    origin: origin ? origin : "",
                    companyRef: companyRef,
                    vatRef: companyContext?.vat?.vatRef,
                  },
                });
              }}
            >
              <Typography color={"primary"}>{t("View/Edit")}</Typography>
            </IconButton>
          </Box>
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
                  pathname: tijarahPaths.management.locations.create,
                  query: {
                    id: d?._id,
                    location: d?.name?.en,
                    origin: origin ? origin : "",
                    companyRef: companyRef,
                    companyName: companyName,
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
      companyRef: companyRef ? companyRef : user.company?._id,
      locationRefs:
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user
          ? user?.locationRefs
          : [],
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with Location")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={LocationsRowLoading}
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
                    {t("No Locations!")}
                  </Typography>
                }
              />
            </Box>
          }
        />
        <ConfirmationDialog
          show={showDialogCustomerEvent}
          toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
          onOk={(e: any) => {
            handleStatusChange(locationId, e.target.checked);
            setShowDialogCustomerEvent(false);
          }}
          okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirmation")}
          text={t(
            "Before deactivating this location, please be aware that all active billing will be cleared and the cashier/s will be logged off. Do you still wish to proceed with deactivation?"
          )}
        />
      </Card>
    </>
  );
};
