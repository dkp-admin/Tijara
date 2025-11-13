import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
import ChannelMultiSelect from "../input/channel-multiSelect";
import DaysMultiSelect from "../input/days-multiSelect";
import LocationMultiSelect from "../input/location-multiSelect";
import NewCategoryMultiSelect from "../input/new-category-multiSelect";
import TimedEventProductMultiSelect from "../input/timed-event-product-multiSelect";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import ConfirmationDialog from "../confirmation-dialog";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { truncate } from "lodash";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

const EventTypeOptions = [
  {
    label: "Set Fixed Price",
    value: "set-fixed-price",
  },
  {
    label: "Reduce Price by Fixed Amount",
    value: "reduce-price-by-fixed-amount",
  },
  {
    label: "Reduce Price by Percentage Amount",
    value: "reduce-price-by-percentage-amount",
  },
  {
    label: "Increase Price by Fixed Amount",
    value: "increase-price-by-fixed-amount",
  },
  {
    label: "Increase Price by Percentage Amount",
    value: "increase-price-by-percentage-amount",
  },
  {
    label: "Activate Products",
    value: "activate-products",
  },
  {
    label: "Deactivate Products",
    value: "deactivate-products",
  },
];

const HoursOptions = [
  { label: "00:00", value: "00:00" },
  { label: "01:00", value: "01:00" },
  { label: "02:00", value: "02:00" },
  { label: "03:00", value: "03:00" },
  { label: "04:00", value: "04:00" },
  { label: "05:00", value: "05:00" },
  { label: "06:00", value: "06:00" },
  { label: "07:00", value: "07:00" },
  { label: "08:00", value: "08:00" },
  { label: "09:00", value: "09:00" },
  { label: "10:00", value: "10:00" },
  { label: "11:00", value: "11:00" },
  { label: "12:00", value: "12:00" },
  { label: "13:00", value: "13:00" },
  { label: "14:00", value: "14:00" },
  { label: "15:00", value: "15:00" },
  { label: "16:00", value: "16:00" },
  { label: "17:00", value: "17:00" },
  { label: "18:00", value: "18:00" },
  { label: "19:00", value: "19:00" },
  { label: "20:00", value: "20:00" },
  { label: "21:00", value: "21:00" },
  { label: "22:00", value: "22:00" },
  { label: "23:00", value: "23:00" },
];

interface CreateTimedEventProps {
  id: string;
  companyRef?: string;
  companyName?: string;
  origin?: string;
  industry?: string;
}

interface CreateTimedEvent {
  appliedToCategory: boolean;
  appliedToProduct: boolean;
  assignedToAllCategories: boolean;
  assignedToAllChannel: boolean;
  assignedToAllDays: boolean;
  newProductRefs: string[];
  productList: any[];
  eventNameEn: string;
  eventNameAr: string;
  type: string;
  amount: string;
  startDate: Date;
  endDate: Date;
  assignedToAllLocations: boolean;
  locationRefs: string[];
  locations: string[];
  categoryRefs: string[];
  categories: string[];
  productRefs: string[];
  products: string[];
  startHour: string;
  endHour: string;
  daysRefs: string[];
}

export const TimedEventCreateForm: FC<CreateTimedEventProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const { id, companyRef, companyName, origin, industry } = props;
  const currency = useCurrency();

  const router = useRouter();

  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }

        router.back();
      }}
    >
      {t("Timed Events")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Timed Event") : t("Create Timed Event")}
    </Link>,
  ];

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["timed-event:update"]);
  const canCreate = canAccess(MoleculeType["timed-event:create"]);

  usePageView();
  const { changeTab, getTab } = useActiveTabs();

  const {
    findOne: findTimedEvents,
    entity,
    loading: loadingTimedEvents,
    updateEntity: updateTimedEvents,
    deleteEntity,
    create,
  } = useEntity("time-based-events");

  const { find, entities: categories } = useEntity("category");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const initialValues: CreateTimedEvent = {
    appliedToCategory: false,
    appliedToProduct: true,
    assignedToAllCategories: false,
    assignedToAllChannel: false,
    assignedToAllDays: false,
    newProductRefs: [],
    productList: [],
    eventNameEn: "",
    eventNameAr: "",
    type: "",
    amount: "",
    startDate: null,
    endDate: null,
    startHour: "",
    endHour: "",
    daysRefs: [],
    // channelRefs: [],
    assignedToAllLocations: false,
    locationRefs: [],
    locations: [],
    categoryRefs: [],
    categories: [],
    productRefs: [],
    products: [],
  };

  const validationSchema = Yup.object({
    eventNameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid product name")
      )
      .required(`${t("Event Name is required")}`)
      .max(60, t("Event name must not be greater than 60 characters")),
    eventNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid Event name")
      )
      .required(`${t("Event Name is required")}`)
      .max(60, t("Event name must not be greater than 60 characters")),
    type: Yup.string().required("Event type is required"),
    appliedToProduct: Yup.boolean(),
    categoryRefs: Yup.array().when("appliedToProduct", {
      is: true,
      then: Yup.array().optional(),
      otherwise: Yup.array().when("assignedToAllCategories", {
        is: true,
        then: Yup.array().optional(),
        otherwise: Yup.array()
          .required(t("Category is required"))
          .min(1, t("Category is required")),
      }),
    }),
    amount: Yup.number().when("type", {
      is: (value: any) =>
        value !== "deactivate-products" && value !== "activate-products",
      then: Yup.number()
        .typeError(t("Amount must be a number"))
        .moreThan(0, t("Amount must be greater than 0"))
        .required(t("Amount is required")),
      otherwise: Yup.number().nullable(),
    }),
    startDate: Yup.date()
      .nullable()
      .typeError("Start Date is required")
      .required(t("Start Date is required"))
      .default(null),
    endDate: Yup.date()
      .nullable()
      .typeError("End Date is required")
      .required(t("End Date is required"))
      .default(null),

    locationRefs: Yup.array().when("assignedToAll", {
      is: true,
      then: Yup.array().optional(),
      otherwise: Yup.array()
        .required(t("Locations is required"))
        .min(1, t("Locations is required")),
    }),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        if (id != null && !canUpdate) {
          toast.error("You don't have access");
          return;
        }
        const data = {
          company: {
            name: user?.company?.name?.en,
          },
          locationRefs: values.locationRefs,
          companyRef: user?.company?._id,
          name: {
            en: values?.eventNameEn,
            ar: values?.eventNameAr,
          },
          allLocationsSelected: values.assignedToAllLocations,
          categoryRefs: values.categoryRefs,
          category: values.categories,
          eventType: values.type,
          eventAmount: values.amount,
          dateRange: {
            from: new Date(values.startDate),
            to: new Date(values.endDate),
          },
          timeRange: {
            from: values.startHour,
            to: values.endHour,
          },
          days: values.daysRefs,
          allDaysSelected: values.assignedToAllDays,
          productRefs: values.productRefs ? values.productRefs : [],
          products: values.products ? values.products : [],
          target: values.appliedToCategory ? "category" : "product",
        };

        if (id != null && canUpdate) {
          await updateTimedEvents(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err.message == "sku_exists_message") {
          toast.error(`${"SKU alredy exists"}`);
        } else {
          toast.error(err.message || err.code);
        }
      }
    },
  });

  // console.log("values", formik.values);

  const headers = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "brand",
      label: t("Brand"),
    },
    {
      key: "category",
      label: t("Category"),
    },
    {
      key: "price",
      label: t("Price"),
    },
    {
      key: "action",
      label: "",
    },
  ];

  const lng = localStorage.getItem("currentLanguage");

  const transformedData = useMemo(() => {
    const arr: any[] = formik.values.products?.map((d: any, idx: number) => {
      return {
        key: d?._id,
        _id: d?._id,
        product: (
          <Box>
            <Typography>
              {" "}
              {d?.type === "item" &&
                `${d?.name[lng] || d?.name?.en} ${
                  d.hasMultipleVariants
                    ? d?.variant?.name[lng] || d?.variant?.name?.en
                    : ""
                }, ${d.sku}`}
              {d?.type === "box" &&
                `${d?.name[lng] || d?.name?.en} ${
                  d.hasMultipleVariants
                    ? d?.variant?.name[lng] || d?.variant?.name?.en
                    : ""
                }  [${t("Box")} - ${d?.unitCount} ${t("Unit(s)")}] ${d.sku}`}
            </Typography>
          </Box>
        ),
        category: (
          <Typography variant="body2">{d?.category?.name || "NA"}</Typography>
        ),
        brand: (
          <Typography variant="body2">{d?.brand?.name || "NA"}</Typography>
        ),
        price: (
          <Typography variant="body2">{toFixedNumber(d?.total)}</Typography>
        ),
        action: (
          <IconButton
            onClick={(e) => {
              const notPermission = id == null ? !canCreate : !canUpdate;

              if (notPermission) {
                return toast.error(t("You don't have access"));
              }
              e.preventDefault();

              formik.values.products.splice(idx, 1);
              formik.setFieldValue("products", [...formik.values.products]);
              const ids = formik?.values?.products?.map(
                (d: any) => d?.productRef
              );
              formik.setFieldValue("productRefs", ids);
            }}
            sx={{ mr: 0.7 }}
          >
            <SvgIcon>
              <DeleteOutlineTwoToneIcon color="error" />
            </SvgIcon>
          </IconButton>
        ),
      };
    });

    return arr;
  }, [entity, formik.values?.products]);

  usePageView();

  const handleDeleteItem = async () => {
    try {
      await deleteEntity(id.toString());
      toast.success(`${t("Item Deleted")}`);
      setShowDialogDeleteItem(false);
      router.back();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
    }
  };

  useEffect(() => {
    if (entity != null) {
      formik.setFieldValue("assignedToAllChannel", entity?.allChannelsSelected);
      formik.setFieldValue("assignedToAllDays", entity?.allDaysSelected);
      formik.setFieldValue("eventNameEn", entity?.name?.en);
      formik.setFieldValue("eventNameAr", entity?.name?.ar);
      formik.setFieldValue("type", entity?.eventType);
      formik.setFieldValue("amount", entity?.eventAmount);
      formik.setFieldValue("startDate", entity?.dateRange?.from);
      formik.setFieldValue("endDate", entity?.dateRange?.to);
      formik.setFieldValue("startHour", entity?.timeRange?.from);
      formik.setFieldValue("endHour", entity?.timeRange?.to);
      formik.setFieldValue("daysRefs", entity?.days);
      formik.setFieldValue("channelRefs", entity?.channels);
      formik.setFieldValue(
        "assignedToAllLocations",
        entity?.allLocationsSelected
      );
      formik.setFieldValue(
        "assignedToAllCategories",
        categories?.total == entity?.categoryRefs?.length ? true : false
      );
      formik.setFieldValue("locationRefs", entity?.locationRefs || []);
      formik.setFieldValue("categoryRefs", entity?.categoryRefs || []);
      formik.setFieldValue("categories", entity?.category);
      formik.setFieldValue(
        "productRefs",
        entity?.productRefs ? entity?.productRefs : []
      );
      formik.setFieldValue("products", entity?.products);
    }
  }, [entity]);

  useEffect(() => {
    if (id != null) {
      findTimedEvents(id.toString());
    }
  }, [id]);

  useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 100,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [companyRef]);

  if (loadingTimedEvents) {
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

  return (
    <>
      <Stack spacing={4}>
        <Box
          sx={{
            maxWidth: 80,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              width: 400,
              mt: 1,
            }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
            >
              {breadcrumbs}
            </Breadcrumbs>
          </Stack>
        </Box>

        <Typography variant="h4">
          {id != null ? t("Edit Timed Event") : t("Create Timed Event")}
        </Typography>
      </Stack>

      <form noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={4} sx={{ mt: 3 }}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">{t("Basic Details")}</Typography>
                </Grid>
                <Grid item container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <Box>
                      <LocationMultiSelect
                        showAllLocation={formik.values.assignedToAllLocations}
                        companyRef={companyRef}
                        selectedIds={formik.values.locationRefs}
                        required
                        id={"locations"}
                        error={
                          formik.touched.locationRefs &&
                          formik.errors.locationRefs
                        }
                        onChange={(option: any, total: number) => {
                          if (option?.length > 0) {
                            const ids = option.map((option: any) => {
                              return option._id;
                            });

                            const names = option.map((option: any) => {
                              return option.name.en;
                            });

                            if (ids.length == total) {
                              formik.setFieldValue(
                                "assignedToAllLocations",
                                true
                              );
                            } else {
                              formik.setFieldValue(
                                "assignedToAllLocations",
                                false
                              );
                            }

                            formik.setFieldValue("locationRefs", ids);
                            formik.setFieldValue("locations", names);
                          } else {
                            formik.setFieldValue("locationRefs", []);
                            formik.setFieldValue("locations", []);
                            formik.setFieldValue(
                              "assignedToAllLocations",
                              false
                            );
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("Event Name (English)")}
                        name="eventNameEn"
                        error={Boolean(
                          formik.touched.eventNameEn &&
                            formik.errors.eventNameEn
                        )}
                        helperText={
                          (formik.touched.eventNameEn &&
                            formik.errors.eventNameEn) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        required
                        value={formik.values.eventNameEn}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("Event Name (Arabic)")}
                        name="eventNameAr"
                        error={Boolean(
                          formik.touched.eventNameAr &&
                            formik.errors.eventNameAr
                        )}
                        helperText={
                          (formik.touched.eventNameAr &&
                            formik.errors.eventNameAr) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        required
                        value={formik.values.eventNameAr}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        select
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("Event Type")}
                        name="type"
                        error={Boolean(
                          formik.touched.type && formik.errors.type
                        )}
                        helperText={
                          (formik.touched.type && formik.errors.type) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                          localStorage.setItem("isChangeinProduct", "true");
                        }}
                        required
                        value={formik.values.type}
                      >
                        {EventTypeOptions?.map((event) => (
                          <MenuItem key={event.value} value={event.value}>
                            {event.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                  </Grid>

                  {formik.values.type !== "activate-products" &&
                    formik.values.type !== "deactivate-products" && (
                      <Grid item md={6} xs={12}>
                        <Box>
                          <TextField
                            required
                            fullWidth
                            label={
                              formik.values.type.includes("percentage")
                                ? `${t("Percentage")}(%)`
                                : `${t("Amount")} ${currency}`
                            }
                            name="amount"
                            onBlur={formik.handleBlur}
                            error={
                              (formik?.touched?.amount &&
                                formik.errors.amount) as any
                            }
                            helperText={
                              (formik.touched.amount &&
                                formik.errors.amount) as any
                            }
                            onKeyPress={(event): void => {
                              const ascii = event.charCode;
                              const value = (event.target as HTMLInputElement)
                                .value;
                              const decimalCheck = value.indexOf(".") !== -1;

                              if (decimalCheck) {
                                const decimalSplit = value.split(".");
                                const decimalLength = decimalSplit[1].length;
                                if (decimalLength > 1 || ascii === 46) {
                                  event.preventDefault();
                                } else if (ascii < 48 || ascii > 57) {
                                  event.preventDefault();
                                }
                              } else if (value.length > 5 && ascii !== 46) {
                                event.preventDefault();
                              } else if (
                                (ascii < 48 || ascii > 57) &&
                                ascii !== 46
                              ) {
                                event.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            value={formik.values.amount}
                          />
                        </Box>
                      </Grid>
                    )}

                  <Grid item md={6} xs={12}>
                    <Box>
                      <DatePicker
                        //@ts-ignore
                        inputProps={{ disabled: true }}
                        // disabled={!isEditing}
                        label="Start Date"
                        inputFormat="dd/MM/yyyy"
                        onChange={(date: Date): void => {
                          formik.setFieldValue("startDate", date);
                          formik.setFieldValue("endDate", null);
                        }}
                        minDate={new Date()}
                        disablePast
                        value={formik.values.startDate}
                        renderInput={(
                          params: JSX.IntrinsicAttributes & TextFieldProps
                        ) => (
                          <TextFieldWrapper
                            required
                            // disabled={!isEditing}
                            fullWidth
                            {...params}
                            error={Boolean(
                              formik.touched.startDate &&
                                formik.errors.startDate
                            )}
                            helperText={
                              (formik.touched.startDate &&
                                formik.errors.startDate) as any
                            }
                            onBlur={formik.handleBlur("startDate")}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <DatePicker
                        //@ts-ignore
                        inputProps={{ disabled: true }}
                        // disabled={!isEditing}
                        label="End Date"
                        inputFormat="dd/MM/yyyy"
                        onChange={(date: Date): void => {
                          formik.setFieldValue("endDate", date);
                        }}
                        minDate={formik.values.startDate}
                        disablePast
                        value={formik.values.endDate}
                        renderInput={(
                          params: JSX.IntrinsicAttributes & TextFieldProps
                        ) => (
                          <TextFieldWrapper
                            required
                            // disabled={!isEditing}
                            fullWidth
                            {...params}
                            error={Boolean(
                              formik.touched.endDate && formik.errors.endDate
                            )}
                            helperText={
                              (formik.touched.endDate &&
                                formik.errors.endDate) as any
                            }
                            onBlur={formik.handleBlur("endDate")}
                          />
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        select
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("Start Hour")}
                        name="startHour"
                        error={Boolean(
                          formik.touched.startHour && formik.errors.startHour
                        )}
                        helperText={
                          (formik.touched.startHour &&
                            formik.errors.startHour) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                        }}
                        value={formik.values.startHour}
                      >
                        {HoursOptions?.map((hour) => (
                          <MenuItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <TextFieldWrapper
                        select
                        disabled={id != null && !canUpdate}
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("End Hour")}
                        name="endHour"
                        error={Boolean(
                          formik.touched.endHour && formik.errors.endHour
                        )}
                        helperText={
                          (formik.touched.endHour &&
                            formik.errors.endHour) as any
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                        }}
                        value={formik.values.endHour}
                      >
                        {HoursOptions?.map((hour) => (
                          <MenuItem key={hour.value} value={hour.value}>
                            {hour.label}
                          </MenuItem>
                        ))}
                      </TextFieldWrapper>
                    </Box>
                  </Grid>

                  <Grid item md={6} xs={12}>
                    <Box>
                      <DaysMultiSelect
                        showAllDays={formik.values.assignedToAllDays}
                        selectedIds={formik?.values?.daysRefs as any}
                        id={"days-multi-select"}
                        error={
                          formik?.touched?.daysRefs && formik.errors.daysRefs
                        }
                        onChange={(option: any, total: number) => {
                          if (option?.length > 0) {
                            const ids = option?.map((option: any) => {
                              return option.value;
                            });

                            const names = option?.map((option: any) => {
                              return option.label;
                            });

                            if (ids.length == total) {
                              formik.setFieldValue("assignedToAllDays", true);
                            } else {
                              formik.setFieldValue("assignedToAllDays", false);
                            }

                            formik.setFieldValue("daysRefs", ids);
                            formik.setFieldValue("days", names);
                          } else {
                            formik.setFieldValue("daysRefs", []);
                            formik.setFieldValue("days", []);
                            formik.setFieldValue("assignedToAllDays", false);
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* <Grid item md={6} xs={12}>
                    <Box>
                      <ChannelMultiSelect
                        industry={industry}
                        showAllChannels={formik.values.assignedToAllChannel}
                        selectedIds={formik?.values?.channelRefs as any}
                        id={"channels-multi-select"}
                        error={
                          formik?.touched?.channelRefs &&
                          formik.errors.channelRefs
                        }
                        onChange={(option: any, total: number) => {
                          if (option?.length > 0) {
                            const ids = option?.map((option: any) => {
                              return option.value;
                            });

                            const names = option?.map((option: any) => {
                              return option.label;
                            });

                            if (ids.length == total) {
                              formik.setFieldValue(
                                "assignedToAllChannel",
                                true
                              );
                            } else {
                              formik.setFieldValue(
                                "assignedToAllChannel",
                                false
                              );
                            }

                            formik.setFieldValue("channelRefs", ids);
                            formik.setFieldValue("channels", names);
                          } else {
                            formik.setFieldValue("channelRefs", []);
                            formik.setFieldValue("channels", []);
                            formik.setFieldValue("assignedToAllChannel", false);
                          }
                        }}
                      />
                    </Box>
                  </Grid> */}
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                <Grid item md={2} xs={5}>
                  <Card
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      px: 1,
                      maxWidth: 170,
                      backgroundColor: formik.values.appliedToCategory
                        ? "primary.alpha12"
                        : "transparent",
                      boxShadow: formik.values.appliedToCategory
                        ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                        : "none",
                    }}
                    onClick={(e) => {
                      // if (formik.values.appliedToCategory) {
                      //   toast(`${t("Applies on categories")}`);
                      // }

                      formik.setFieldValue("appliedToCategory", true);

                      formik.setFieldValue("appliedToProduct", false);
                      formik.setFieldValue("newProductRefs", []);
                      formik.setFieldValue("products", []);
                    }}
                    variant="outlined"
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center" }}
                      spacing={2}
                    >
                      <Radio
                        color="primary"
                        checked={Boolean(formik.values.appliedToCategory)}
                      />
                      <div>
                        <Typography variant="subtitle1">
                          {t("Categories")}
                        </Typography>
                      </div>
                    </Stack>
                  </Card>
                </Grid>

                <Grid item md={2} xs={5}>
                  <Card
                    sx={{
                      alignItems: "center",
                      cursor: "pointer",
                      display: "flex",
                      px: 1,
                      maxWidth: 155,
                      backgroundColor: formik.values.appliedToProduct
                        ? "primary.alpha12"
                        : "transparent",
                      boxShadow: formik.values.appliedToProduct
                        ? (theme) => `${theme.palette.primary.main} 0 0 0 1px`
                        : "none",
                    }}
                    onClick={() => {
                      formik.setFieldValue("appliedToProduct", true);
                      formik.setFieldValue("appliedToCategory", false);
                      formik.setFieldValue("categoryRefs", []);
                      formik.setFieldValue("categories", []);
                      formik.setFieldValue("assignedToAllCategories", false);
                      // if (formik.values.appliedToProduct) {
                      //   toast(`${t("applies on product")}`);
                      // }
                    }}
                    variant="outlined"
                  >
                    <Stack
                      direction="row"
                      sx={{ alignItems: "center" }}
                      spacing={2}
                    >
                      <Radio
                        color="primary"
                        checked={Boolean(formik.values.appliedToProduct)}
                      />
                      <div>
                        <Typography variant="subtitle1">
                          {t("Products")}
                        </Typography>
                      </div>
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {formik.values.appliedToCategory ? (
                <Box>
                  <Grid item md={6} xs={12}>
                    <Box>
                      <NewCategoryMultiSelect
                        showAllCategories={
                          formik.values.assignedToAllCategories
                        }
                        companyRef={companyRef}
                        selectedIds={formik.values.categoryRefs}
                        required
                        id={"categories"}
                        error={
                          formik.touched.categoryRefs &&
                          formik.errors.categoryRefs
                        }
                        onChange={(option: any, total: number) => {
                          if (option?.length > 0) {
                            const ids = option.map((option: any) => {
                              return option._id;
                            });

                            const names = option.map((option: any) => {
                              return {
                                name: {
                                  en: option.name.en,
                                  ar: option.name.ar,
                                },
                              };
                            });

                            if (ids.length == total) {
                              formik.setFieldValue(
                                "assignedToAllCategories",
                                true
                              );
                            } else {
                              formik.setFieldValue(
                                "assignedToAllCategories",
                                false
                              );
                            }

                            formik.setFieldValue("categoryRefs", ids);
                            formik.setFieldValue("categories", names);
                          } else {
                            formik.setFieldValue("categoryRefs", []);
                            formik.setFieldValue("categories", []);
                            formik.setFieldValue(
                              "assignedToAllCategories",
                              false
                            );
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Box>
              ) : (
                <Box>
                  {/* <Grid xs={12} md={12}>
                    <Stack spacing={1}>
                      <Typography variant="h6">{t("Add Products")}</Typography>
                    </Stack>
                  </Grid> */}

                  <Grid
                    container
                    sx={{ mt: 3 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <TimedEventProductMultiSelect
                      allLocationSelected={formik.values.assignedToAllLocations}
                      selectedLocationFrom={formik.values.locationRefs}
                      onChange={() => {}}
                      selectedId=""
                      onProductSelect={(selectedProduct: any) => {
                        console.log("selected product", selectedProduct);

                        console.log("selected product", selectedProduct);

                        // const productRefs = selectedProduct?.map(
                        //   (p: any) => p?.productRef
                        // );
                        formik.setFieldValue("productRefs", [
                          ...formik.values.productRefs,
                          selectedProduct?.productRef,
                        ]);
                        formik.setFieldValue("products", [
                          ...formik.values.products,
                          selectedProduct,
                        ]);
                      }}
                      label={t("Search using Product/SKU or Box SKU")}
                      id="Products"
                      formik={formik.values.products}
                      companyRef={companyRef}
                      // onChange={(option: any) => {

                      //   if (option?.length > 0) {
                      //     const ids = option?.map((option: any) => {
                      //       return option?.productRef;
                      //     });

                      //     formik.setFieldValue("productRefs", ids);
                      //     const product = option.map((d: any) => {
                      //       return {
                      //         productRef: d?._id,
                      //         name: {
                      //           en: d?.name?.en,
                      //           ar: d?.name?.ar,
                      //         },
                      //         brand: { name: d?.brand?.name },
                      //         category: {
                      //           name: d?.category?.name,
                      //         },
                      //         price: d?.variants?.[0]?.price,
                      //         sku: d?.variants?.[0]?.sku,
                      //       };
                      //     });
                      //     setProductData(product);
                      //   } else {
                      //     formik.setFieldValue("productRefs", []);
                      //   }
                      // }}
                    />
                  </Grid>

                  <Box sx={{ mt: 4, mb: -3 }}>
                    <SuperTable
                      showPagination={false}
                      isLoading={loadingTimedEvents}
                      // loaderComponent={CollectionProductRowLoading}
                      items={transformedData}
                      headers={headers}
                      total={formik.values.productList.length || 0}
                      onPageChange={handlePageChange}
                      onRowsPerPageChange={handleRowsPerPageChange}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      noDataPlaceholder={
                        <Box sx={{ mt: 6, mb: 4 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 2 }}
                              >
                                {t("No Products!")}
                              </Typography>
                            }
                          />
                        </Box>
                      }
                    />
                  </Box>
                </Box>
              )}
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
            {/* {Boolean(!id) && ( */}
            <LoadingButton
              color="inherit"
              onClick={() => {
                // if (origin == "company") {
                //   changeTab("catalogue", Screens?.companyDetail);
                // }

                router.back();
              }}
            >
              {t("Cancel")}
            </LoadingButton>
            {/* )} */}
            {/* {id && (
              <LoadingButton
                variant="outlined"
                color="error"
                onClick={() => {
                  setShowDialogDeleteItem(true);
                }}
                sx={{ ml: 1 }}
              >
                {t("Delete")}
              </LoadingButton>
            )} */}
            <Box>
              {/* {id && (
                <LoadingButton
                  color="inherit"
                  onClick={() => {
                   
                    router.back();
                  }}
                >
                  {t("Cancel")}
                </LoadingButton>
              )} */}

              <LoadingButton
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (id != null && !canUpdate) {
                    return toast.error(t("You don't have access"));
                  } else if (!id && !canCreate) {
                    return toast.error(t("You don't have access"));
                  }
                  formik.handleSubmit();
                }}
                loading={formik.isSubmitting}
                sx={{ m: 1 }}
                variant="contained"
                // disabled={!localStorage.getItem("isChangeinProduct")}
              >
                {id != null ? t("Update") : t("Create")}
              </LoadingButton>
            </Box>
          </Stack>
        </Stack>
      </form>
      <ConfirmationDialog
        show={showDialogDeleteItem}
        toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
        onOk={(e: any) => {
          handleDeleteItem();
        }}
        okButtonText={`${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirm Delete?")}
        text={t(
          "Are you sure you want to delete this? This action cannot be undone."
        )}
      />
    </>
  );
};
