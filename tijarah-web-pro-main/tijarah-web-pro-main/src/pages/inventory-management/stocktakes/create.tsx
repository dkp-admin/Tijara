import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalPrintshopIcon from "@mui/icons-material/LocalPrintshop";
import ShareIcon from "@mui/icons-material/Share";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Link,
  Menu,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextFieldProps,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import serviceCaller from "src/api/serviceCaller";
import ConfirmationDialog from "src/components/confirmation-dialog";
import LocationSingleSelect from "src/components/input/location-singleSelect";
import { SendPoReceiptModal } from "src/components/modals/po-send-receipt";
import { ProductCreateModal } from "src/components/modals/quick-create/product-create-modal";
import { StocktakesLog } from "src/components/stocktakes/stocktakes-log";
import { StocktakesAddCard } from "src/components/stocktakes/stocktakes-add-card";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import StocktakesPrintReceipt from "./stocktakes-print-receipt";
import { StocktakeItemModal } from "src/components/modals/stocktakes/stocktake-item-modal";
import { useAuth } from "src/hooks/use-auth";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import UserAutoCompleteDropdown from "src/components/input/user-auto-complete";
import { SendStocktakesReceiptModal } from "src/components/modals/stocktake-send-receipt";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";

const ReasonOptions = [
  {
    label: "Reconciliation",
    value: "reconciliation",
  },
  {
    label: "Others",
    value: "others",
  },
];

interface Product {
  pid: string;
  name: any;
  varient: string;
  sku: string;
  price: string;
  expiry: Date;
}

interface Stocktakes {
  orderType: any;
  orderNum: string;
  dueDate: Date;
  userRef?: string;
  approvedByRef?: string;
  approvedBy?: string;
  user: string;
  userType: string;
  locationRef: string;
  locationEn: string;
  locationAr: string;
  reason: string;
  orderStatus: string;
  items: any;
  message: string;
  approveRequest: boolean;
}

const itemSchema = Yup.object().shape({
  actual: Yup.number().min(1, "Must be greater than 0").nullable(),
  note: Yup.string().max(150, "Maximum 150 character "),
});

const validationSchema = Yup.object({
  items: Yup.array().of(itemSchema),
  locationRef: Yup.string().required(`${i18n.t("Location is required")}`),
  reason: Yup.string().required(`${i18n.t("reason is required")}`),
  userRef: Yup.string().required(`${i18n.t("Staff is required")}`),
  dueDate: Yup.date()
    .nullable()
    .required(`${i18n.t("Due Date is required")}`),
  message: Yup.string().max(250, "Maximum 250 character "),
});

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();
  const { id, newid, companyRef, companyName, origin } = router.query;
  const canAccess = usePermissionManager();
  const componentRef = useRef();
  const canUpdate = canAccess(MoleculeType["stocktake:update"]);
  const canCreate = canAccess(MoleculeType["stocktake:create"]);
  const canRequest = canAccess(MoleculeType["stocktake:request"]);
  const canApprove = canAccess(MoleculeType["stocktake:approve"]);
  usePageView();
  const { canAccessModule } = useFeatureModuleManager();
  const { changeTab } = useActiveTabs();
  const [showError, setShowError] = useState(false);
  const [openDatePickerOrder, setOpenDatePickerOrder] = useState(false);
  const [selectedOption, setSelectedOption] = useState("product");
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [showDialogForceComplete, setShowDialogForceComplete] = useState(false);
  const [showDialogApproveRequest, setShowDialogApproveRequest] =
    useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [openProductCreateModal, setOpenProductCreateModal] = useState(false);
  const [dependFormik, setdependFormik] = useState(true);
  const [productloading, setProductLoading] = useState(false);
  const [openItemModal, setOpenItemModal] = useState(false);
  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [selectedProductsId, setSelectedProductsId] = useState([]);
  const {
    find: finduser,
    loading: loadingUser,
    entities: userEntities,
  } = useEntity("user");
  const [actionsExport, setActionsExport] = useState<null | HTMLElement>(null);

  const handleExportActionsClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log(event.currentTarget, "TARGET");
    setActionsExport(event.currentTarget);
  };

  const handleExportActionsClose = () => {
    setActionsExport(null);
  };

  const handleChange = (event: any, newValue: any) => {
    setTabValue(newValue);
  };

  usePageView();

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("stocktakes");

  const {
    find: findlocation,
    entities: locationsData,
    refetch,
  } = useEntity("location");

  const fetchData = async () => {
    if (
      newid &&
      (formik.values.orderStatus === "open" ||
        formik.values.orderStatus === "partiallyReceived") &&
      formik.values.items.length > 0
    ) {
      const itemIdsSet = new Set<string>();
      formik.values.items.map((item: any) => {
        if (!itemIdsSet.has(item.productRef)) {
          itemIdsSet.add(item.productRef);
        }
      });
      const hasStockConfiguration = formik.values.items.some((item: any) => {
        return item.stockConfiguration !== undefined;
      });

      let data: (typeof entity)[] = [];

      if (!hasStockConfiguration) {
        setProductLoading(true);
        for (let id of itemIdsSet) {
          try {
            const res = await serviceCaller(`/product/${id}`, {
              method: "GET",
              query: {
                page: 0,
                sort: "asc",
                activeTab: "all",
                limit: 10,
                _q: id,
              },
            });

            if (res) {
              data.push(res);
            }
          } catch (error: any) {
            console.log("error", error);
          } finally {
            setProductLoading(false);
          }
        }
      }

      formik.values.items.forEach((item: any, index: number) => {
        const product = data.find((entity) => entity._id === item.productRef);
        if (product) {
          const matchingVariant = product.variants.find(
            (variant: any) => variant.sku === item.variant.sku
          );

          if (matchingVariant) {
            formik.setFieldValue(
              `items.${index}.stockConfiguration`,
              matchingVariant.stockConfiguration
            );

            const locationRef = formik.values.locationRef;
            const matchingStockConfig = matchingVariant.stockConfiguration.find(
              (config: any) => config.locationRef === locationRef
            );

            if (matchingStockConfig) {
              formik.setFieldValue(
                `items.${index}.expected`,
                matchingStockConfig.count
              );
            }
          }
        }
      });
    }
  };

  const getPrintPreview = () => {
    return StocktakesPrintReceipt(entity);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleRemoveItem = (indexToRemove: any) => {
    const updatedItems = [...formik.values.items];
    updatedItems.splice(indexToRemove, 1);
    formik.setFieldValue("items", updatedItems);
  };

  const handleDeleteCustomerEvent = () => {
    formik.setFieldValue("orderStatus", "cancelled");
    setShowDialogCustomerEvent(false);
    formik.handleSubmit();
  };
  const handleRequestApproveEvent = () => {
    formik.setFieldValue("approveRequest", true);
    formik.setFieldValue("orderStatus", "pendingApproval");

    setShowDialogApproveRequest(false);
    formik.handleSubmit();
  };

  const handleDeleteForceComplete = () => {
    formik.setFieldValue("orderStatus", "completed");
    formik.setFieldValue("approveRequest", false);
    formik.setFieldValue("approvedByRef", user._id);
    formik.setFieldValue("approvedBy", user.name);
    setShowDialogForceComplete(false);
    formik.handleSubmit();
  };

  const initialValues: Stocktakes = {
    orderType: "",
    orderNum: "",
    dueDate: null,
    locationRef: "",
    locationEn: "",
    locationAr: "",
    reason: "",
    user: "",
    userType: "",
    userRef: "",
    approvedByRef: "",
    approvedBy: "",
    orderStatus: "",
    items: [],
    message: "",
    approveRequest: false,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,

    onSubmit: async (values): Promise<void> => {
      if (values.orderType === "batchproduct") {
        for (let i = 0; i < values.items.length; i++) {
          if (values.items[i].batching && !values.items[i].expiry) {
            formik.setFieldError(
              `items[${i}].expiry`,
              "Expiry Date is required"
            );
            return;
          }
        }
      }

      for (let i = 0; i < values.items.length; i++) {
        if (
          values.orderStatus === "completed" &&
          (values.items[i].actual === undefined ||
            values.items[i].actual === null ||
            values.items[i].actual === "")
        ) {
          toast.error(
            `Actual value is required for product ${values.items[i].name.en}, ${values.items[i].variant.name.en}`
          );
          return;
        }
      }
      if (values.items.length === 0) {
        toast.error(t("Add atleast one item").toString());
      } else {
        const data = {
          type: selectedOption,
          companyRef: companyRef,
          company: { name: companyName },
          dueDate: new Date(values.dueDate),
          locationRef: values.locationRef,
          location: {
            name: values.locationEn,
          },
          approveRequest: values.approveRequest,
          status: values.orderStatus || "open",
          reason: values.reason,
          staffRef: values.userRef,
          staff: {
            name: values.user,
          },

          ...(values.approvedByRef
            ? { approvedByRef: values.approvedByRef }
            : {}),
          ...(values.approvedBy
            ? { approvedBy: { name: values.approvedBy } }
            : {}),
          items: formik.values?.items?.map((item: any) => {
            const stockForShipTo = item?.variant?.stockConfiguration?.find(
              (stock: any) => stock.locationRef === values.locationRef
            );

            return {
              productRef: item.productRef,
              categoryRef: item.categoryRef,
              category: { name: item.category.name },
              sku: item.variant.sku,
              code: item.variant.code,
              hasMultipleVariants: item.hasMultipleVariants,
              price: item.variant.sellingPrice || 0,
              brand: { name: "na" },
              expiry: item.variant.expiry || "",
              name: {
                en: item.name.en,
                ar: item.name.ar,
              },
              variant: {
                en: item.variant.name.en,
                ar: item.variant.name.ar,
              },
              batching: item.batching,
              batches: item.batches || [],
              quantity: item.variant.quantity || 0,
              expected: id || newid ? item.expected : stockForShipTo?.count,
              actual: item.actual,
              discrepancy: id
                ? Number(item.expected - item.actual)
                : Number(stockForShipTo?.count - item.actual),
              cost: Number(item.variant.costPrice),
              tracking: id ? item.tracking : stockForShipTo?.tracking,
              type: item.variant.type,
              unitCount: item.variant.unitCount,
              note: item.note || "-",
              status: item.status,
            };
          }),
          internalNotes: values?.message,
        };

        try {
          if (id) {
            await updateEntity(id?.toString(), { ...data });
            toast.success(t("Stocktake updated").toString());
          } else {
            await create({ ...data });
            toast.success(t("New order placed").toString());
          }

          if (origin == "company") {
            changeTab("inventoryManagement", Screens?.companyDetail);
          }

          router.back();
        } catch (err) {
          toast.error(err.message);
        }
      }
    },
  });

  const handleAddEditAction = useCallback(
    (data: any, id: any, option: string) => {
      formik.setFieldValue("items", [...data]);
      setSelectedOption(option);
      formik.setFieldValue("orderType", option);
    },
    [formik.values.items]
  );

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    finduser({
      page: 0,
      sort: "asc",
      activeTab: "all",
      limit: 50,
      _q: "",
      roleRef: "",
      companyRef: companyRef ? companyRef?.toString() : user.company?._id,
    });
  }, [companyRef, user]);

  useEffect(() => {
    if (id != null) {
      findlocation({
        page: 0,
        limit: 50,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef.toString(),
      });
    }
  }, [id]);

  useEffect(() => {
    if (newid != null) {
      findOne(newid?.toString());
    }
  }, [newid]);

  useEffect(() => {
    if (entity != null) {
      formik.setValues({
        orderNum: newid ? "" : entity.orderNum,
        companyRef: entity.companyRef,
        companyName: entity?.company?.name,
        dueDate: entity.dueDate,
        locationRef: entity?.locationRef,
        orderStatus: newid ? "open" : entity.status,
        type: entity.type,
        locationEn: entity.location.name,
        reason: entity.reason,
        user: entity.staff.name,
        userRef: entity.staffRef,
        approvedBy: newid ? "" : entity?.approvedBy?.name,
        approvedByRef: newid ? "" : entity?.approvedByRef,
        approveRequest: newid ? false : entity?.approveRequest,
        items: entity?.items?.map((item: any) => ({
          productRef: item.productRef,
          categoryRef: item.categoryRef,
          category: { name: item?.category?.name || "na" },
          batching: newid ? false : item.batching,
          batches: newid ? [] : item.batches,
          variant: {
            sku: item.sku,
            code: item.code,
            hasMultipleVariants: item.hasMultipleVariants,
            sellingPrice: item.price || 0,
            expiry: null as Date | null,
            name: {
              en: item.name.en,
              ar: item.name.ar,
            },
            cost: item.cost,
            type: item.type,
            unitCount: item.unitCount,
          },
          expected: newid ? 0 : item.expected,
          actual: newid ? 0 : item.actual,
          discrepancy: newid ? 0 : item.discrepancy,

          name: {
            en: item.name.en,
            ar: item.name.ar,
          },

          note: newid ? "-" : item.note || "-",
          status: newid ? "pending" : item.status,
        })),
        message: entity?.internalNotes,
      });

      setSelectedOption(entity.type || "product");
    }
  }, [entity]);

  useEffect(() => {
    fetchData();
  }, [formik.values.items]);

  if (loading || productloading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccessModule("stocktakes")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["stocktake:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={id != null ? t("Stocktakes") : t("Create New Stocktakes")} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Box sx={{ cursor: "pointer" }}>
                  <Link
                    color="textPrimary"
                    component="a"
                    sx={{
                      alignItems: "center",
                      display: "flex",
                    }}
                    onClick={() => {
                      if (origin == "company") {
                        changeTab(
                          "inventoryManagement",
                          Screens?.companyDetail
                        );
                      }
                      router.back();
                    }}
                  >
                    <ArrowBackIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#6B7280" }}
                    />
                    <Typography variant="subtitle2">
                      {t("Stocktakes")}
                    </Typography>
                  </Link>
                </Box>
              </Stack>
              {id != null && entity?.status === "completed" && (
                <Box sx={{ display: "flex" }}>
                  <ShareIcon
                    onClick={() => {
                      setOpenSendReceiptModal(true);
                    }}
                    fontSize="medium"
                    sx={{ mr: 2, cursor: "pointer", color: "#6B7280" }}
                  />
                  <div id="printablediv">
                    <LocalPrintshopIcon
                      onClick={() => {
                        handlePrint();
                      }}
                      fontSize="medium"
                      sx={{ mr: 3, ml: 1, cursor: "pointer", color: "#6B7280" }}
                    />
                    <div style={{ display: "none" }}>
                      <div
                        ref={componentRef}
                        style={{
                          width: "100%",
                          height: "100%",
                          maxWidth: "100%",
                          margin: "0",
                        }}
                      >
                        <div
                          style={{
                            color: `${
                              theme.palette.mode === "dark" ? "#000" : ""
                            }`,
                          }}
                          dangerouslySetInnerHTML={{
                            __html: getPrintPreview(),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Box>
              )}
            </Stack>
            <Stack
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h4">
                {id != null
                  ? `${t("Stocktakes")} (#${formik.values.orderNum})`
                  : t("New Stocktakes")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid item container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Typography variant="h6">
                          {t("Stocktake Scope")}
                        </Typography>
                      </Grid>
                      <Grid item container spacing={3}>
                        <Grid item md={6} xs={12}>
                          <LocationSingleSelect
                            showAllLocation={false}
                            companyRef={companyRef}
                            required
                            error={
                              formik?.touched?.locationRef &&
                              formik?.errors?.locationRef
                            }
                            onChange={(id, name) => {
                              formik.handleChange("locationRef")(id || "");
                              formik.handleChange("locationEn")(name?.en || "");
                              formik.handleChange("locationAr")(name?.ar || "");
                              formik.setFieldValue("items", []);
                            }}
                            selectedId={formik?.values?.locationRef}
                            label={t("Location")}
                            id="locationRef"
                            disabled={id != null}
                          />
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <TextFieldWrapper
                            select
                            required
                            fullWidth
                            disabled={id != null}
                            label={t("Reason")}
                            name="reason"
                            error={
                              !!(formik.touched.reason && formik.errors.reason)
                            }
                            helperText={
                              (formik.touched.reason &&
                                formik.errors.reason) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                              localStorage.setItem("isChangeinProduct", "true");
                            }}
                            value={formik.values.reason}
                          >
                            {ReasonOptions?.map((reason) => (
                              <MenuItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Grid>
                        <Grid item md={6} xs={12}>
                          <UserAutoCompleteDropdown
                            disabled={id != null}
                            showAllUser={false}
                            companyRef={user?.company?._id}
                            locationRef={formik?.values?.locationRef}
                            required={false}
                            error={
                              formik?.touched?.userRef &&
                              formik?.errors?.userRef
                            }
                            onChange={(id, name, userType) => {
                              formik.setFieldValue("userRef", id);
                              formik.setFieldValue("user", name);
                              formik.setFieldValue("userType", userType);
                            }}
                            selectedId={formik?.values?.userRef}
                            label={t("Staff")}
                            id="userRef"
                          />
                        </Grid>
                        <Grid
                          item
                          md={6}
                          xs={12}
                          alignItems="center"
                          style={{ display: "inline-flex" }}
                        >
                          <DatePicker
                            open={openDatePickerOrder}
                            onOpen={() => setOpenDatePickerOrder(true)}
                            onClose={() => setOpenDatePickerOrder(false)}
                            label={t("Due Date")}
                            inputFormat="dd/MM/yyyy"
                            disabled={id != null}
                            onChange={(date: Date | null): void => {
                              formik.setFieldValue("dueDate", date);
                            }}
                            //{/*
                            // @ts-ignore */}
                            inputProps={{ disabled: true }}
                            minDate={new Date()}
                            value={formik.values.dueDate}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required
                                fullWidth
                                onClick={() => {
                                  if (id == null) {
                                    setOpenDatePickerOrder(
                                      !openDatePickerOrder
                                    );
                                  }
                                }}
                                {...params}
                                error={Boolean(
                                  formik.touched.dueDate &&
                                    formik.errors.dueDate
                                )}
                                helperText={
                                  (formik.touched.dueDate &&
                                    formik.errors.dueDate) as any
                                }
                                onBlur={formik.handleBlur("dueDate")}
                              />
                            )}
                          />
                          <Tooltip
                            title={t("Info stocktake due date")}
                            style={{ marginLeft: "6px" }}
                          >
                            <SvgIcon color="action">
                              <InfoCircleIcon />
                            </SvgIcon>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {formik.values.locationRef && (
                  <Card
                    sx={{
                      mt: 4,
                      overflow: "auto",
                    }}
                  >
                    <CardContent>
                      <Grid container>
                        <Grid
                          xs={12}
                          md={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Stack
                            spacing={1}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexDirection: "row",
                            }}
                          >
                            <Typography variant="h6">
                              {id != null ? t("View Items") : t("Add Items")}
                            </Typography>
                            <Tooltip
                              title={t("Stocktake_message")}
                              style={{ marginLeft: "6px" }}
                            >
                              <SvgIcon color="action">
                                <InfoCircleIcon />
                              </SvgIcon>
                            </Tooltip>
                          </Stack>
                          <Stack spacing={1}>
                            <Button
                              color="primary"
                              disabled={id != null}
                              variant="contained"
                              onClick={() => {
                                setOpenItemModal(true);
                              }}
                            >
                              {formik.values?.items?.length > 0
                                ? t("Manage")
                                : t("Add")}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>

                    <StocktakesAddCard
                      stockid={id}
                      formik={formik}
                      newid={newid}
                      onRemoveItem={handleRemoveItem}
                      selectedOption={selectedOption}
                      locationRef={formik.values?.locationRef}
                      companyRef={companyRef}
                    />
                  </Card>
                )}

                {formik.values.locationRef === "" && (
                  <Card
                    sx={{
                      mt: 4,
                      overflow: "auto",
                    }}
                  >
                    <CardContent>
                      <Grid container>
                        <Grid
                          xs={12}
                          md={12}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Stack spacing={1}>
                            <Typography variant="h6">
                              {t("Add Items")}
                            </Typography>

                            <Typography variant="body2">
                              {t("Choose a location before  adding")}
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent>
                    <Grid item container spacing={1}>
                      <Grid item xs={12} md={12}>
                        <Stack spacing={1}>
                          <Box sx={{ mt: 1 }}>
                            <TextFieldWrapper
                              label={t("Internal Notes")}
                              name="message"
                              multiline
                              rows={5}
                              fullWidth
                              error={Boolean(
                                formik.touched.message && formik.errors.message
                              )}
                              helperText={
                                (formik.touched.message &&
                                  formik.errors.message) as any
                              }
                              onChange={formik.handleChange}
                              value={formik.values.message}
                              disabled={
                                entity?.status === "completed" ||
                                entity?.status === "cancelled" ||
                                entity?.status === "return"
                              }
                            />
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  style={{
                    marginRight: "10px",
                    marginLeft: "10px",
                  }}
                  sx={{ mx: 6 }}
                >
                  <Stack alignItems="center" direction="row" spacing={1}>
                    <Button
                      color="inherit"
                      onClick={() => {
                        if (origin == "company") {
                          changeTab(
                            "inventoryManagement",
                            Screens?.companyDetail
                          );
                        }
                        router.back();
                      }}
                    >
                      {t("Cancel")}
                    </Button>
                  </Stack>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    {id !== null &&
                      (entity?.status === "open" ||
                        entity?.status === "overdue") &&
                      !newid && (
                        <LoadingButton
                          type="submit"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            setShowError(true);
                            setShowDialogCustomerEvent(true);
                          }}
                          loading={formik.isSubmitting}
                          sx={{ m: 1 }}
                          color="error"
                          variant="outlined"
                        >
                          {t("Cancel Stoktake")}
                        </LoadingButton>
                      )}

                    {id && (
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        sx={{ position: "relative" }}
                      >
                        {entity?.status !== "completed" &&
                          entity?.status !== "cancelled" && (
                            <Button
                              variant="outlined"
                              color="inherit"
                              onClick={() => {
                                setShowError(true);
                                if (canApprove) {
                                  setShowDialogForceComplete(true);
                                } else if (canRequest) {
                                  setShowDialogApproveRequest(true);
                                } else {
                                  toast.error(t("You don't have access"));
                                }
                              }}
                              sx={{ m: 1 }}
                              data-testid="add"
                            >
                              {canApprove
                                ? t("Approve & complete")
                                : t("Request Approve")}
                            </Button>
                          )}
                      </Stack>
                    )}

                    {entity?.status !== "return" &&
                      entity?.status !== "cancelled" && (
                        <LoadingButton
                          type="submit"
                          disabled={entity?.status === "completed" && !newid}
                          onClick={(e) => {
                            e.preventDefault();
                            if (id != null && !canUpdate) {
                              return toast.error(t("You don't have access"));
                            } else if (!id && !canCreate) {
                              return toast.error(t("You don't have access"));
                            }

                            if (formik.errors.length > 0) {
                              return toast.error(
                                t("Please fill the form properly")
                              );
                            }
                            setShowError(true);
                            formik.handleSubmit();
                          }}
                          loading={formik.isSubmitting}
                          sx={{ m: 1 }}
                          variant="contained"
                        >
                          {id != null ? t("Update") : t("Create")}
                        </LoadingButton>
                      )}
                  </Stack>
                </Stack>

                {openProductCreateModal && (
                  <ProductCreateModal
                    open={openProductCreateModal}
                    handleClose={() => {
                      setOpenProductCreateModal(false);
                    }}
                  />
                )}

                {showDialogCustomerEvent && (
                  <ConfirmationDialog
                    show={showDialogCustomerEvent}
                    toggle={() => {
                      setShowDialogCustomerEvent(!showDialogCustomerEvent);
                    }}
                    onOk={() => {
                      handleDeleteCustomerEvent();
                    }}
                    okButtonText={`${t("Yes")}, ${t("Cancel")}`}
                    cancelButtonText={t("Back")}
                    title={t("Confirmation")}
                    text={t(`Are you sure you want to cancel this order?`)}
                  />
                )}
                {showDialogForceComplete && (
                  <ConfirmationDialog
                    show={showDialogForceComplete}
                    toggle={() => {
                      setShowDialogForceComplete(!showDialogForceComplete);
                    }}
                    onOk={() => {
                      handleDeleteForceComplete();
                    }}
                    okButtonText={`${t("Yes")}, ${t("Complete")}`}
                    cancelButtonText={t("Cancel")}
                    title={t("Confirmation")}
                    text={t(
                      `Are you sure want to approve and completed. Do you want to proceed?`
                    )}
                  />
                )}

                {showDialogApproveRequest && (
                  <ConfirmationDialog
                    show={showDialogApproveRequest}
                    toggle={() => {
                      setShowDialogApproveRequest(!showDialogApproveRequest);
                    }}
                    onOk={() => {
                      handleRequestApproveEvent();
                    }}
                    okButtonText={`${t("Yes")}, ${t("Request")}`}
                    cancelButtonText={t("Cancel")}
                    title={t("Confirmation")}
                    text={t(`are you sure want to request?`)}
                  />
                )}
                {openSendReceiptModal && (
                  <SendStocktakesReceiptModal
                    modalData={entity}
                    open={openSendReceiptModal}
                    handleClose={() => {
                      setOpenSendReceiptModal(false);
                    }}
                  />
                )}
                {openItemModal && (
                  <StocktakeItemModal
                    id={id?.toString()}
                    modalData={formik.values.items}
                    companyRef={companyRef?.toString()}
                    locationRef={formik.values?.locationRef}
                    handleAddEditAction={handleAddEditAction}
                    selectedOption={selectedOption}
                    open={openItemModal}
                    handleClose={() => {
                      setOpenItemModal(false);
                    }}
                  />
                )}
              </Stack>
            </form>
          </Stack>

          {/* {id && entity?.status !== "return" && (
            <Card sx={{ mt: 3 }}>
              <div>
                <Tabs
                  value={tabValue}
                  onChange={handleChange}
                  aria-label="Log Tabs"
                  sx={{ px: 1 }}
                >
                  <Tab label="Action Log" />
                </Tabs>
                <Divider />
              </div>
              <Box>
                {tabValue === 0 && (
                  <Box>
                    <StocktakesLog />
                  </Box>
                )}
              </Box>
            </Card>
          )} */}
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
