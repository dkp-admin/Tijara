import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import { useFormik } from "formik";
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
import ConfirmationDialog from "src/components/confirmation-dialog";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Sort } from "src/types/sortoption";
import { USER_TYPES, sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import * as Yup from "yup";
import { KitchenMoveMergeModal } from "../modals/kitchen-move-merge-modal";
import { KitchenActionDropdown } from "./kitchen-action-dropdown";
import { KitchenRowLoading } from "./kitchen-row-loading";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { useQueryClient } from "react-query";

interface KitchenManagementProps {
  companyRef?: string;
  companyName?: string;
  businessType?: string;
  businessTypeRef?: string;
  origin?: string;
}

interface KitchenSettingsProps {
  enableKitchen: boolean;
}

const initialValues: KitchenSettingsProps = {
  enableKitchen: false,
};

export const KitchenManagement: FC<KitchenManagementProps> = (props) => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);
  const { companyRef, companyName, businessTypeRef, businessType, origin } =
    props;

  const userIsAdmin =
    user.userType === USER_TYPES.ADMIN ||
    user.userType === USER_TYPES.SUPERADMIN;

  const companyContext = useContext(CompanyContext) as any;

  localStorage.setItem("companyContext", JSON.stringify(companyContext));

  usePageView();

  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["kitchen:create"]);
  const canUpdate = canAccess(MoleculeType["kitchen:update"]);

  const { find, updateEntity, loading, entities } =
    useEntity("kitchen-management");

  const { create: deleteOrAssign } = useEntity(
    "kitchen-management/delete-or-assign"
  );

  const {
    findOne: findCompany,
    entity: companyData,
    updateEntity: updateCompanyData,
    loading: companyLoading,
  } = useEntity("company");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [kitchen, setKitchen] = useState<any>(null);
  const [openKitchenModal, setOpenKitchenModal] = useState(false);
  const [showDialogStatusEvent, setShowDialogStatusEvent] = useState(false);
  const [showDialogDeleteEvent, setShowDialogDeleteEvent] = useState(false);
  const [showDialogKitchenEvent, setShowDialogKitchenEvent] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [productData, setProductData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const { canAccessModule } = useFeatureModuleManager();
  const queryClient = useQueryClient();

  const formik = useFormik({
    initialValues,
    validationSchema: Yup.object({}),
    onSubmit: async (values): Promise<void> => {
      const configuration = companyData
        ? companyData?.configuration
        : user.company.configuration;

      const data = {
        companyRef: companyRef,
        configuration: {
          ...configuration,
          enableKitchenManagement: values.enableKitchen,
        },
      };

      try {
        const res = await updateCompanyData(companyRef.toString(), {
          ...data,
        });

        toast.success(t("Kitchen setting updated").toString());
        localStorage.setItem("user", JSON.stringify({ ...user, company: res }));
        if (user.userType != USER_TYPES.SUPERADMIN) {
          authContext.updateUser({ ...user, company: res });
        }
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

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
    try {
      await updateEntity(id, {
        status: checked ? "active" : "inactive",
      });
    } catch (e) {
      toast.error(e?.error?.error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteLoading(true);
      await deleteOrAssign({
        id: id,
        mode: "delete",
      });
      toast.success(t("Kitchen deleted successfully"));
      queryClient.invalidateQueries("find-kitchen-management");
      setDeleteLoading(false);
    } catch (error) {
      setDeleteLoading(false);

      toast.error(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "name",
      label: t("Kitchen"),
    },
    {
      key: "location",
      label: t("Location"),
    },
    {
      key: "products",
      label: t("No. of Products"),
    },
    // {
    //   key: "categories",
    //   label: t("No. of Categories"),
    // },
    {
      key: "printerId",
      label: t("Printer ID"),
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

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = entities?.results?.map((d: any) => {
      const moreOptions = [
        {
          name: t("Edit"),
          path: tijarahPaths.management.devicesManagement.kitchen.create,
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
          },
        },
        {
          name: t("Delete"),
          path: "delete",
          query: {
            id: d?._id,
            companyRef: companyRef,
            companyName: companyName,
            origin: origin,
          },
        },
      ];

      return {
        key: d._id,
        _id: d._id,
        name: (
          <Box>
            <Typography variant="body2">
              {d?.name?.[lng] || d?.name?.en}
            </Typography>
            <Typography variant="body2" color="gray">
              {d?.description}
            </Typography>
          </Box>
        ),
        location: <Typography variant="body2">{d?.location?.name}</Typography>,
        products: (
          <Typography variant="body2">
            {d?.assignedToAllProducts
              ? "All"
              : d?.productRefs?.length > 0
              ? d?.productRefs?.length
              : "-"}
          </Typography>
        ),
        categories: (
          <Typography variant="body2">
            {d?.categoryRefs?.length > 0 ? d?.categoryRefs?.length : "-"}
          </Typography>
        ),
        printerId: (
          <Typography variant="body2">
            {d?.printerId || d?.printerRef || "-"}
          </Typography>
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
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (d?.status === "active") {
                    setKitchen({ id: d._id, locationRef: d.locationRef });
                    setShowDialogStatusEvent(true);
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
        action: (
          <Box sx={{ display: "flex", justifyContent: "end" }}>
            <KitchenActionDropdown
              dropdownData={moreOptions}
              handleDelete={() => {
                setKitchen({ id: d._id, locationRef: d.locationRef });
                setProductData([...d?.products]);
                setCategoriesData([...d?.categories]);
                setShowDialogDeleteEvent(true);
              }}
            />
          </Box>
        ),
      };
    });

    return arr;
  }, [entities?.results]);

  const getQuery = (type = "") => {
    const newLocationRef = !userIsAdmin
      ? user.locationRefs
      : filter?.location?.[0] || "";
    const query: any = {
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      locationRef: newLocationRef,
      companyRef: companyRef ? companyRef : user.company?._id,
    };

    if (filter?.printer?.length > 0) {
      query["printer"] = filter?.printer[0] === "assigned";
    }

    return query;
  };

  useEffect(() => {
    find({ ...getQuery() });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  useEffect(() => {
    if (companyData && companyData?.configuration?.enableKitchenManagement) {
      formik.setValues({
        enableKitchen: companyData?.configuration?.enableKitchenManagement,
      });
    }
  }, [companyData?.configuration]);

  useEffect(() => {
    if (companyRef) {
      findCompany(companyRef?.toString());
    }
  }, [companyRef]);

  if (!canAccess(MoleculeType["kitchen:read"])) {
    return <NoPermission />;
  }

  if (companyLoading && !companyData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        {/* <LoaderAnimation /> */}
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mt: 4, textAlign: "left" }}>
        <Card sx={{ mt: 5 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Stack spacing={1}>
                  <Typography align="left" variant="h6">
                    {t("Kitchen Settings")}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item md={8} xs={12}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ mr: 10 }}>
                      <Typography align="left" gutterBottom variant="subtitle1">
                        {t("Enable Kitchen Settings")}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        variant="body2"
                      >
                        {t("Manage KDS settings from Dashboard.")}
                      </Typography>
                    </Box>
                    <Box>
                      <Switch
                        checked={formik.values.enableKitchen}
                        color="primary"
                        edge="start"
                        name="enableKitchen"
                        disabled={!canAccessModule("kitchens")}
                        onChange={() => {
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          if (formik.values.enableKitchen) {
                            return setShowDialogKitchenEvent(true);
                          }
                          formik.setFieldValue(
                            "enableKitchen",
                            !formik.values.enableKitchen
                          );
                          formik.handleSubmit();
                        }}
                        value={formik.values.enableKitchen}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {formik.values.enableKitchen && (
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ mt: -1, mb: -2 }}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Typography variant="h5">{t("Kitchens")}</Typography>

              <Stack alignItems="center" direction="row" spacing={3}>
                <Button
                  onClick={() => {
                    if (!canCreate) {
                      return toast.error(t("You don't have access"));
                    }
                    router.push({
                      pathname:
                        tijarahPaths.management.devicesManagement.kitchen
                          .create,
                      query: {
                        origin: origin,
                        companyRef: companyRef,
                        companyName: companyName,
                      },
                    });
                  }}
                  startIcon={
                    <SvgIcon>
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  {t("Create")}
                </Button>
              </Stack>
            </Stack>
          </CardContent>

          <Divider />
          <Divider />

          <SuperTableHeader
            companyRef={companyRef}
            onQueryChange={handleQueryChange}
            onFiltersChange={handleFilterChange}
            showLocationFilter={userIsAdmin}
            showPrinterFilter={true}
            searchPlaceholder={t("Search with Kitchen Name")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={KitchenRowLoading}
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
                      {t("No Kitchens!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Card>
      )}

      <KitchenMoveMergeModal
        products={productData}
        categories={categoriesData}
        open={openKitchenModal}
        companyRef={companyRef}
        modalData={{
          kitchenGroupId: kitchen?.id,
          locationRef: kitchen?.locationRef,
        }}
        handleClose={() => setOpenKitchenModal(false)}
        onSuccess={() => setOpenKitchenModal(false)}
      />

      <ConfirmationDialog
        show={showDialogStatusEvent}
        toggle={() => setShowDialogStatusEvent(!showDialogStatusEvent)}
        onOk={(e: any) => {
          handleStatusChange(kitchen?.id, e.target.checked);
          setShowDialogStatusEvent(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Deactivate")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirmation")}
        text={t("disable_kitchen_management_status_alert_msg_for_list")}
      />

      <ConfirmationDialog
        show={showDialogDeleteEvent}
        toggle={() => setShowDialogDeleteEvent(!showDialogDeleteEvent)}
        onOk={() => {
          setOpenKitchenModal(true);
          setShowDialogDeleteEvent(false);
        }}
        onCancel={async () => {
          try {
            await handleDelete(kitchen?.id);
          } catch (error) {
            setShowDialogDeleteEvent(false);
          } finally {
            setShowDialogDeleteEvent(false);
          }
        }}
        loading={deleteLoading}
        kitchenManagement={true}
        cancelButtonErrorColor={true}
        okButtonText={`${t("Delete & Move item to another kitchen")}`}
        cancelButtonText={t("Delete & remove product assigned")}
        title={t("Confirmation")}
        text={t("delete_kitchen_management_alert_msg_for_list")}
      />

      <ConfirmationDialog
        show={showDialogKitchenEvent}
        toggle={() => setShowDialogKitchenEvent(!showDialogKitchenEvent)}
        onOk={() => {
          formik.setFieldValue("enableKitchen", !formik.values.enableKitchen);
          formik.handleSubmit();
          setShowDialogKitchenEvent(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Disable")}`}
        cancelButtonText={t("Cancel")}
        title={t("You're about to disable Kichen Settings")}
        text={t("disable_kitchen_settings_alert_msg_for_kitchen_management")}
      />
    </>
  );
};
