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
import { TransformedArrowIcon } from "src/components/TransformedIcons";
import ConfirmationDialog from "src/components/confirmation-dialog";
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
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { DevicesRowLoading } from "./devices-row-loading";
import { ZatcaModal } from "./zatca-modal";
import { QueryClient, useQueryClient } from "react-query";
import { CompanyContext } from "src/contexts/company-context";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { useUserType } from "src/hooks/use-user-type";

interface DevicesTableCardProps {
  companyRef?: string;
  companyName?: string;
  businessType?: string;
  businessTypeRef?: string;
  origin?: string;
}

export const DevicesTableCard: FC<DevicesTableCardProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { companyRef, companyName, businessTypeRef, businessType, origin } =
    props;
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>({ status: ["active"] });
  const router = useRouter();
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [showZatcaConfirmationModal, setShowZatcaConfirmationModal] =
    useState(false);

  const queryClient = useQueryClient();

  const [openZatcaModal, setOpenZatcaModal] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState({}) as any;
  const [deviceId, setDeviceId] = useState<any>("");
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["device:update"]);
  const { find, updateEntity, loading, entities } = useEntity("device");

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const authContext = useContext(AuthContext) as any;

  const companyContext = useContext(CompanyContext) as any;

  localStorage.setItem("companyContext", JSON.stringify(companyContext));

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
      key: "deviceName",
      label: t("Device Name"),
    },
    {
      key: "location",
      label: t("Location"),
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
    ...(authContext.user?.company?.configuration?.enableZatca ||
    companyContext?.configuration?.enableZatca
      ? [
          {
            key: "enableZatca",
            label: t("Zatca"),
          },
        ]
      : []),
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const restaurantTableHeaders = [
    {
      key: "deviceName",
      label: t("Device Name"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "deviceType",
      label: t("Device Type"),
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
    ...(authContext.user?.company?.configuration?.enableZatca ||
    companyContext?.configuration?.enableZatca
      ? [
          {
            key: "enableZatca",
            label: t("Zatca"),
          },
        ]
      : []),
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d) => {
      return {
        key: d._id,
        _id: d._id,
        deviceName: <Typography variant="body2">{d?.name || "NA"}</Typography>,
        location: <Typography variant="body2">{d?.location?.name}</Typography>,
        deviceType: (
          <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
            {d?.type || "-"}
          </Typography>
        ),
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
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (d?.status === "active") {
                    setSelectedDevice(d);
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
        ...(authContext.user?.company?.configuration?.enableZatca ||
        companyContext?.configuration?.enableZatca
          ? {
              enableZatca: (
                <>
                  <FormControlLabel
                    onClick={() => {
                      if (user.userType !== USER_TYPES.SUPERADMIN) {
                        toast.error(t("You don't have permission"));
                      }
                    }}
                    sx={{
                      width: "100px",
                      display: "flex",
                      flexDirection: "row",
                    }}
                    control={
                      <Switch
                        disabled={user.userType != USER_TYPES.SUPERADMIN}
                        checked={
                          d?.zatcaConfiguration?.enableZatca === "active"
                            ? true
                            : false
                        }
                        color="primary"
                        edge="end"
                        name="enableZatca"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDevice(d);
                            setOpenZatcaModal(true);
                          } else {
                            setSelectedDevice(d);
                            setShowZatcaConfirmationModal(true);
                          }
                        }}
                        value={
                          d?.zatcaConfiguration?.enableZatca === "active"
                            ? true
                            : false
                        }
                        sx={{
                          mr: 0.2,
                        }}
                      />
                    }
                    label={
                      d?.zatcaConfiguration?.enableZatca === "active"
                        ? t("Active")
                        : t("Inactive")
                    }
                  />
                </>
              ),
            }
          : {}),
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
                  pathname:
                    tijarahPaths?.management?.devicesManagement?.devices
                      ?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    businessTypeRef: businessTypeRef,
                    businessType: businessType,
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

  useEffect(() => {
    const newLocationRef = filter?.location?.[0] || "";

    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      locationRefs: newLocationRef,
      companyRef: companyRef ? companyRef : user.company?._id,
      zatcaEnabled:
        filter?.zatcaEnabled?.length > 0 ? filter?.zatcaEnabled[0] : "",
      type: filter?.deviceType?.length > 0 ? filter?.deviceType[0] : "",
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <SuperTableHeader
          companyRef={companyRef}
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          showLocationFilter={true}
          showDeviceTypeFilter={
            authContext.user?.company?.industry?.toString()?.toLowerCase() ===
              "restaurant" ||
            companyContext?.industry?.toString()?.toLowerCase() === "restaurant"
          }
          searchPlaceholder={t("Search with Device Name")}
          onSortChange={handleSortChange}
          sort={sort}
          sortOptions={sortOptions}
          showDeviceZatcaFilter={
            authContext.user?.company?.configuration?.enableZatca ||
            companyContext?.configuration?.enableZatca
          }
          initialStatus="active"
        />

        <SuperTable
          isLoading={loading}
          loaderComponent={DevicesRowLoading}
          items={transformedData}
          headers={
            authContext.user?.company?.industry?.toString()?.toLowerCase() ===
              "restaurant" ||
            companyContext?.industry?.toString()?.toLowerCase() === "restaurant"
              ? restaurantTableHeaders
              : tableHeaders
          }
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
          show={showZatcaConfirmationModal}
          toggle={() =>
            setShowZatcaConfirmationModal(!showZatcaConfirmationModal)
          }
          onOk={(e: any) => {
            updateEntity(selectedDevice?._id, {
              zatcaConfiguration: { enableZatca: "inactive" },
            });
            toast.success("Zatca disbaled successfully");
            setSelectedDevice({});
            setShowZatcaConfirmationModal(false);
          }}
          okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
          cancelButtonText={t("Cancel")}
          title={t("Confirmation")}
          text={t(
            "The invoices created on this device will not be pushed to ZATCA, if disabled"
          )}
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
        <ZatcaModal
          open={openZatcaModal}
          handleClose={() => {
            queryClient.invalidateQueries("find-device");
            setSelectedDevice({});
            setOpenZatcaModal(false);
          }}
          data={selectedDevice}
        />
      </Card>
    </>
  );
};
