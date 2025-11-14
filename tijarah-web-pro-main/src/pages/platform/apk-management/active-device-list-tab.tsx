import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import CompanyDropdown from "src/components/input/company-auto-complete";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import { DevicesRowLoading } from "src/components/locations/devices/devices-row-loading";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";

function ActiveDeviceListTab() {
  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const { userType } = useUserType();
  const [companyRef, setCompanyRef] = useState("all");
  const [locationRef, setLocationRef] = useState("all");

  const router = useRouter();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["apk-management:create"]);

  const { find, updateEntity, loading, entities } = useEntity("device");
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [deviceId, setDeviceId] = useState<any>("");
  const [filter, setFilter] = useState<any>([]);

  const { user } = useAuth();

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

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const tableHeaders = [
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "deviceName",
      label: t("Device Name"),
    },
    {
      key: "deviceCode",
      label: t("Device Code"),
    },
    {
      key: "connectivityStatus",
      label: t("Connectivity"),
    },
    {
      key: "brand",
      label: t("Brand / Model"),
    },
    {
      key: "osApk",
      label: t("OS / APK"),
    },
    {
      key: "deviceStatus",
      label: t("Status"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d) => {
      arr.push({
        key: d._id,
        _id: d._id,
        deviceName: <Typography variant="body2">{d?.name || "NA"}</Typography>,
        location: <Typography variant="body2">{d?.location?.name}</Typography>,
        deviceCode: <Typography variant="body2">{d?.deviceCode}</Typography>,
        connectivityStatus:
          d?.connectivityStatus === "online" ? (
            <Typography variant="body2" color="success.main">
              Paired
            </Typography>
          ) : (
            <Typography variant="body2" color="error">
              Unpaired
            </Typography>
          ),
        brand: (
          <>
            <Typography variant="body2">{`Brand: ${
              d?.metadata?.brand || "NA"
            }`}</Typography>
            <Typography variant="body2">{`Model: ${
              d?.metadata?.model || "NA"
            }`}</Typography>
          </>
        ),
        osApk: (
          <>
            <Typography variant="body2">{`OS: ${
              d?.metadata?.osName || "NA"
            }`}</Typography>
            <Typography variant="body2">{`APK: ${
              d?.metadata?.appVersion || "NA"
            }`}</Typography>
          </>
        ),
        deviceStatus: (
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
                  if (d?.status === "active") {
                    setShowDialogCustomerEvent(true);
                    setDeviceId(d._id);
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
      });
    });

    return arr;
  }, [entities?.results]);

  const getQuery = (type = "") => {
    const query: any = {
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      type,
    };

    if (companyRef !== "all" && companyRef) {
      query["companyRef"] = companyRef;
    }

    if (locationRef !== "all" && locationRef) {
      query["locationRef"] = locationRef;
    }

    if (filter?.connectivity?.length > 0) {
      query["connectivity"] = filter.connectivity[0];
    }

    if (filter?.apkVersion?.length > 0) {
      query["apkVersion"] = filter.apkVersion[0];
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
    locationRef,
    filter,
  ]);

  if (!canAccess(MoleculeType["apk-management:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Card sx={{ my: 4 }}>
        <CardContent>
          <Grid container xs={12} md={12} spacing={1}>
            <Stack justifyContent={"center"}>
              <Typography variant="h6">{t("Devices")}</Typography>
            </Stack>
            <Stack ml={2}>
              <Box sx={{ display: "flex" }}>
                <Box sx={{ width: "290px", ml: 0.5, mr: 1.3 }}>
                  <CompanyDropdown
                    onChange={(id) => {
                      setCompanyRef(id || "");
                    }}
                    selectedId={companyRef as string}
                    label={t("Company")}
                    id="company"
                  />
                </Box>

                <Box sx={{ width: "290px", ml: 0.5 }}>
                  <LocationAutoCompleteDropdown
                    showAllLocation
                    required={false}
                    companyRef={
                      userType == USER_TYPES.ADMIN
                        ? user.company?._id
                        : companyRef === "all"
                        ? ""
                        : companyRef
                    }
                    onChange={(id) => {
                      setLocationRef(id || "");
                    }}
                    selectedId={locationRef as string}
                    label={t("Location")}
                    id="location"
                  />
                </Box>
              </Box>
            </Stack>
          </Grid>
        </CardContent>

        <Divider />
        <Divider />

        <Card>
          <SuperTableHeader
            showApkVersionFilter={true}
            onQueryChange={handleQueryChange}
            onFiltersChange={handleFilterChange}
            showConnectivityFilter={true}
            searchPlaceholder={t("Search with Device Name / Brand")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={DevicesRowLoading}
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
                      {t("No Devices!")}
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
              handleStatusChange(deviceId, e.target.checked);
              setShowDialogCustomerEvent(false);
            }}
            okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
            cancelButtonText={t("Cancel")}
            title={t("Confirmation")}
            text={t(
              "Before deactivating the device, please be aware that all active billing will be cleared and the cashier will be logged off. Do you still wish to proceed with deactivation?"
            )}
          />
        </Card>
      </Card>
    </>
  );
}

export default ActiveDeviceListTab;
