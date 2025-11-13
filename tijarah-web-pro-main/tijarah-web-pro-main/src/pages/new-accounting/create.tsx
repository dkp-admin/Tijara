import { AddCircleOutlineRounded } from "@mui/icons-material";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  TextFieldProps,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import UserAutoCompleteDropdown from "src/components/input/user-auto-complete";
import VendorAutoCompleteDropdown from "src/components/input/vendor-singleSelect";
import { PaymentDateModal } from "src/components/modals/accounting/payment-submission-date-modal";
import { VendorCreateModal } from "src/components/modals/quick-create/vendor-create-modal";
import { MultiFileDropzone } from "src/components/multiple-upload-file-dropzone";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { getMultipleUploadedDocNames } from "src/utils/get-uploaded-file-name";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import UpgradePackage from "src/pages/upgrade-package";
import { useCurrency } from "src/utils/useCurrency";

export const CreditOptions = [
  {
    value: "administrative",
    label: "Administrative",
  },

  {
    value: "sales",
    label: "Sales",
  },
  {
    value: "returns_to_suppliers",
    label: "Returns to Suppliers",
  },
  {
    value: "investments",
    label: "Investments",
  },
  {
    value: "sale_of_assets",
    label: "Sale of Assets",
  },

  {
    value: "other",
    label: "Other",
  },
];

export const DebitOptions = [
  {
    value: "administrative",
    label: "Administrative",
  },
  {
    value: "vendorPayments",
    label: "Vendor Payments",
  },

  {
    value: "purchase",
    label: "Purchase",
  },
  {
    value: "medical",
    label: "Medical",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "rental",
    label: "Rental",
  },
  {
    value: "taxes",
    label: "Taxes",
  },
  {
    value: "other",
    label: "Other",
  },
];

export const transactionTypeOptions = [
  {
    value: "debit",
    label: "Debit",
  },
  {
    value: "credit",
    label: "Credit",
  },
];

// Payment method options will be loaded from API

export enum TransactionStatus {
  paid = "paid",
  received = "received",
  toBeReceived = "to_be_received",
  toBePaid = "to_be_paid",
}

interface CreateExpenseProps {
  markPaid: boolean;
  markReceived: boolean;
  paid: boolean;
  toBePaid: boolean;
  received: boolean;
  toBeReceived: boolean;
  vendor: string;
  vendorRef: string;
  transaction?: string;
  name?: string;
  reason?: string;
  expenseDate?: Date;
  paymentMethod?: string;
  payments?: any[];
  location?: string;
  locationRef?: string;
  userRef?: string;
  user: string;
  userType: string;
  referenceNumber?: string;
  amount?: string;
  description?: string;
  oldLogoFile: any[];
  logoFile: any[];
  logo: string[];
  // status: boolean;
  dueStatus: string;
  receivedStatus: string;
  paymentDate: Date;
  // brief: string;
  editable: boolean;
}

const CreateMiscellaneousExpenses: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["acounting:update"]);
  const canCreate = canAccess(MoleculeType["accounting:create"]);
  const { id } = router.query;

  const { user } = useAuth();
  const theme = useTheme();
  const [openVendorCreateModal, setOpenVendorCreateModal] = useState(false);
  const { canAccessModule } = useFeatureModuleManager();
  const [openModal, setOpenModal] = useState(false);

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
      <HomeIcon sx={{ mr: 0.5, mt: 0.8 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.accounting.accounting.index,
        });
      }}
    >
      {t("Accounting")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Transaction") : t("Add Transaction")}
    </Link>,
  ];
  usePageView();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentIndex, setPaymentIndex] = useState(-1);
  const currency = useCurrency();

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("accounting");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");

  // Fetch payment types from API
  useEffect(() => {
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  const paymentMethodOptions = useMemo(() => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      return paymentTypesData.results.map((paymentType: any) => ({
        label: paymentType.name?.en || paymentType.name,
        value: (paymentType.name?.en || paymentType.name)
          .toLowerCase()
          .replace(/\s+/g, ""),
      }));
    }
    return [
      { label: "Cash", value: "cash" },
      { label: "Card", value: "card" },
      { label: "Credit", value: "credit" },
    ];
  }, [paymentTypesData]);

  const initialValues: CreateExpenseProps = {
    markPaid: false,
    markReceived: false,
    received: false,
    toBeReceived: false,
    paid: false,
    toBePaid: false,
    vendor: "",
    vendorRef: "",
    transaction: "",
    name: "",
    reason: "",
    expenseDate: null,
    paymentMethod: "",
    locationRef: "",
    location: "",
    user: "",
    userType: "",
    userRef: "",
    referenceNumber: "",
    amount: "",
    payments: [],
    description: "",
    oldLogoFile: [],
    logoFile: [],
    logo: [],
    // status: true,
    dueStatus: "due",
    receivedStatus: "due",
    paymentDate: null,
    editable: true,
    // brief: "",
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid Transaction name")
      )
      .required(`${t("Transaction name is required")}`)
      .max(60, t("Transaction name must not be greater than 60 characters")),
    locationRef: Yup.string().required(`${t("Location is required")}`),
    payments: Yup.array()
      .required(t("Payment is required"))
      .min(1, t("Pyament should not be empty")),
    reason: Yup.string().required(t("Reason is required")),
    expenseDate: Yup.date().required(t("date is required")).nullable(),
    referenceNumber: Yup.string().max(
      30,
      t("Reference Number must not be greater than 30 characters")
    ),
    description: Yup.string().max(
      70,
      t("Description must not be greater than 70 characters")
    ),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      try {
        const data: any = {
          company: {
            name: user?.company?.name?.en,
          },
          companyRef: user?.company?._id,
          name: {
            en: values.name,
            ar: values.name,
          },
          locationRef: values.locationRef,
          location: { name: values.location },
          transactionType: values.transaction,
          user: {
            name: values?.user || "",
            type: values?.userType || "",
          },
          userRef: values?.userRef || null,
          editable: values.editable,
          description: values.description,
          reason: values.reason,
          transactions: values?.payments?.map((d) => {
            return {
              paymentMethod: d?.paymentMethod,
              amount: d?.amount,
            };
          }),
          referenceNumber: values.referenceNumber,
          fileUrl: values.logo,
          date: values.expenseDate,
          status:
            TransactionStatus[
              formik.values.paid
                ? "paid"
                : formik.values.toBePaid
                ? "toBePaid"
                : formik.values?.received
                ? "received"
                : formik.values.toBeReceived
                ? "toBeReceived"
                : null
            ],
        };
        if (values.vendorRef?.length > 0) {
          data.vendor = {
            name: values.vendor,
          };
          data.vendorRef = values.vendorRef;
        }
        if (values.userRef?.length > 0) {
          data.user = {
            name: values.user,
          };
          data.userRef = values.userRef;
        }
        if (values.paymentDate != null) {
          data.paymentDate = values.paymentDate;
        }

        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Transaction Updated").toString()
            : t("Transaction Added").toString()
        );

        router.push(tijarahPaths?.accounting.accounting.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  console.log("values", formik.values);

  const handleAddPayment = () => {
    if (paymentIndex === -1 && formik.values.payments?.length >= 3) {
      formik.setFieldValue("paymentMethod", "");
      formik.setFieldValue("amount", "");

      toast.error(t("You can't add more than 3 payment method"));
      return;
    }

    if (!formik.values.paymentMethod) {
      toast.error(t("payment method not added"));
      return;
    }

    if (!formik.values.amount || Number(formik.values?.amount) <= 0) {
      toast.error(t("amount not added"));
      return;
    }

    if (paymentIndex !== -1) {
      const data = formik.values.payments;

      data.splice(paymentIndex, 1, {
        paymentMethod: formik.values.paymentMethod,
        amount: formik.values.amount,
      });

      setPaymentIndex(-1);
      formik.setFieldValue("payments", data);
    } else {
      formik.setFieldValue("payments", [
        ...formik.values.payments,
        {
          paymentMethod: formik.values.paymentMethod,
          amount: formik.values.amount,
        },
      ]);
    }

    formik.setFieldValue("paymentMethod", "");
    formik.setFieldValue("amount", "");
  };

  const companyLogoFileRemove = (index: number): void => {
    const logoFile = formik.values.logoFile;
    const logo = formik.values.logo;

    const updatedLogoFile = [
      ...logoFile.slice(0, index),
      ...logoFile.slice(index + 1),
    ];

    console.log(updatedLogoFile, "UPDATED LOGO FILE");

    const updatedLogo = [...logo.slice(0, index), ...logo.slice(index + 1)];

    formik.setFieldValue("oldLogoFile", [...updatedLogoFile]);
    formik.setFieldValue("logoFile", [...updatedLogoFile]);
    formik.setFieldValue("logo", [...updatedLogo]);
  };

  const companyLogoFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }

    const uploadedNames = formik.values.logoFile.map((file) => file.name);

    const data = newFiles.filter((file: any) =>
      uploadedNames.includes(file.name)
    );

    if (data.length > 0) {
      toast.error(t("Same document can't be uploaded multiple times"));
    } else {
      const formikNewFile = formik.values.logoFile;
      formik.setFieldValue("oldLogoFile", formikNewFile);
      formik.setFieldValue("logoFile", [...formikNewFile, ...newFiles]);
    }
  };

  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("logo", []);
    formik.setFieldValue("logoFile", []);
    formik.setFieldValue("oldLogoFile", []);
  };

  const onSuccess = (fileName: string[] | undefined) => {
    const logo = formik.values.logo;
    formik.setFieldValue("logo", [...logo, ...fileName]);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const filteredFiles: any[] =
        formik.values.oldLogoFile?.length > 0 ? [] : files;

      if (formik.values.oldLogoFile?.length > 0) {
        const uploadedNames = formik.values.oldLogoFile.map(
          (file) => file.name
        );

        const data = files.filter(
          (file: any) => !uploadedNames.includes(file.name)
        );

        if (data?.length > 0) {
          filteredFiles.push(...data);
        }
      }

      const urls = await Promise.all(
        filteredFiles?.map(
          async (file: any) =>
            await upload([file], FileUploadNamespace["accounting-documents"])
        )
      );

      onSuccess(urls);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity) {
      formik.setFieldValue("transaction", entity?.transactionType);
      if (entity?.status == "paid") {
        formik.setFieldValue("paid", true);
      } else if (entity?.status == "received") {
        formik.setFieldValue("received", true);
      } else if (entity.status == "to_be_paid") {
        formik.setFieldValue("toBePaid", true);
      } else if (entity.status == "to_be_received") {
        formik.setFieldValue("toBeReceived", true);
      }
      console.log("userrr", entity?.userRef);

      formik.setFieldValue("name", entity?.name?.en);
      formik.setFieldValue("reason", entity?.reason);
      formik.setFieldValue("expenseDate", entity?.date);
      formik.setFieldValue("payments", entity?.transactions);
      formik.setFieldValue("location", entity?.location?.name);
      formik.setFieldValue("locationRef", entity?.locationRef);
      formik.setFieldValue("user", entity?.user?.name);
      formik.setFieldValue("userType", entity?.user?.type);
      formik.setFieldValue("userRef", entity?.userRef || undefined);
      formik.setFieldValue("vendorRef", entity?.vendorRef || undefined);
      formik.setFieldValue("referenceNumber", entity?.referenceNumber);
      formik.setFieldValue("logo", entity?.fileUrl || "");
      formik.setFieldValue("description", entity?.description);
      formik.setFieldValue("paymentDate", entity?.paymentDate);
      formik.setFieldValue("editable", entity?.editable);
    }
  }, [entity]);

  if (loading) {
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

  if (!canAccessModule("accounting")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["accounting:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Add Transaction")}`} />
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Typography variant="h4">
                {id != null ? t("Edit Transaction") : t("Add Transaction")}
              </Typography>

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
                    alignItems: "center",
                    flexDirection: "row",
                    width: 520,
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
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 2 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Transaction Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null}
                            error={Boolean(
                              formik.touched.transaction &&
                                formik.errors.transaction
                            )}
                            helperText={
                              (formik.touched.transaction &&
                                formik.errors.transaction) as any
                            }
                            fullWidth
                            label={t("Transaction Type")}
                            name="transaction"
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              // formik.handleChange("transaction");
                              formik.setFieldValue(
                                "transaction",
                                e.target.value
                              );
                              if (e.target.value == "debit") {
                                formik.setFieldValue("paid", true);
                                formik.setFieldValue("toBePaid", false);
                                formik.setFieldValue("received", false);
                                formik.setFieldValue("toBeReceived", false);
                              } else if (e.target.value == "credit") {
                                formik.setFieldValue("received", true);
                                formik.setFieldValue("paid", false);
                                formik.setFieldValue("toBePaid", false);
                                formik.setFieldValue("toBeReceived", false);
                              }
                            }}
                            select
                            value={formik.values.transaction}
                            // disabled
                            required
                          >
                            {transactionTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>

                        {formik.values.transaction == "debit" && (
                          <Box sx={{ display: "flex", mt: 3 }}>
                            <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                mr: 2,
                                pr: 2,
                                backgroundColor: formik.values.paid
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.paid
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (id != null) {
                                  return toast.error(
                                    t(
                                      "You can not change the status once it is set"
                                    )
                                  );
                                }
                                if (!formik.values.paid) {
                                  formik.setFieldValue("paid", true);
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBeReceived", false);
                                } else {
                                  formik.setFieldValue("paid", false);
                                  formik.setFieldValue("toBePaid", true);
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBeReceived", false);
                                }
                              }}
                              variant="outlined"
                            >
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}
                              >
                                <Radio
                                  color="primary"
                                  checked={formik.values.paid}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("Paid")}
                                  </Typography>
                                </div>
                              </Stack>
                            </Card>

                            <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                pr: 2,
                                backgroundColor: formik.values.toBePaid
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.toBePaid
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (id != null) {
                                  return toast.error(
                                    t(
                                      "You can not change the status once it set"
                                    )
                                  );
                                }
                                if (!formik.values.toBePaid) {
                                  formik.setFieldValue("toBePaid", true);
                                  formik.setFieldValue("paid", false);
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBeReceived", false);
                                } else {
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("paid", true);
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBeReceived", false);
                                }
                              }}
                              variant="outlined"
                            >
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}
                              >
                                <Radio
                                  color="primary"
                                  checked={formik.values.toBePaid}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("To be paid")}
                                  </Typography>
                                </div>
                              </Stack>
                            </Card>
                          </Box>
                        )}

                        {formik.values.transaction == "credit" && (
                          <Box sx={{ display: "flex", mt: 3 }}>
                            <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                mr: 2,
                                pr: 2,
                                backgroundColor: formik.values.received
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.received
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (id != null) {
                                  return toast.error(
                                    t(
                                      "You can not change the status once it is set"
                                    )
                                  );
                                }
                                if (!formik.values.received) {
                                  formik.setFieldValue("received", true);
                                  formik.setFieldValue("toBeReceived", false);
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("paid", false);
                                } else {
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBeReceived", true);
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("paid", false);
                                }
                              }}
                              variant="outlined"
                            >
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}
                              >
                                <Radio
                                  color="primary"
                                  checked={formik.values.received}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("Received")}
                                  </Typography>
                                </div>
                              </Stack>
                            </Card>

                            <Card
                              sx={{
                                alignItems: "center",
                                cursor: "pointer",
                                display: "flex",
                                p: 0,
                                pr: 2,
                                backgroundColor: formik.values.toBeReceived
                                  ? "primary.alpha12"
                                  : "transparent",
                                boxShadow: formik.values.toBeReceived
                                  ? (theme) =>
                                      `${theme.palette.primary.main} 0 0 0 1px`
                                  : "none",
                              }}
                              onClick={() => {
                                if (id != null) {
                                  return toast.error(
                                    t(
                                      "You can not change the status once it is set"
                                    )
                                  );
                                }
                                if (!formik.values.toBeReceived) {
                                  formik.setFieldValue("toBeReceived", true);
                                  formik.setFieldValue("received", false);
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("paid", false);
                                } else {
                                  formik.setFieldValue("toBeReceived", false);
                                  formik.setFieldValue("received", true);
                                  formik.setFieldValue("toBePaid", false);
                                  formik.setFieldValue("paid", false);
                                }
                              }}
                              variant="outlined"
                            >
                              <Stack
                                direction="row"
                                sx={{ alignItems: "center" }}
                                spacing={1}
                              >
                                <Radio
                                  color="primary"
                                  checked={formik.values.toBeReceived}
                                />
                                <div>
                                  <Typography variant="subtitle1">
                                    {t("To be received")}
                                  </Typography>
                                </div>
                              </Stack>
                            </Card>
                          </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                          <LocationAutoCompleteDropdown
                            disabled={id != null}
                            showAllLocation={false}
                            companyRef={user?.company?._id}
                            required
                            error={
                              formik?.touched?.locationRef &&
                              formik?.errors?.locationRef
                            }
                            onChange={(id, name) => {
                              formik.setFieldValue("locationRef", id);
                              formik.setFieldValue("location", name?.en);
                            }}
                            selectedId={formik?.values?.locationRef}
                            label={t("Location")}
                            id="locationRef"
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
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
                            label={t("User")}
                            id="userRef"
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Transaction Name")}
                            name="name"
                            error={Boolean(
                              formik.touched.name && formik.errors.name
                            )}
                            helperText={
                              formik.touched.name && formik.errors.name
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.name}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null}
                            error={Boolean(
                              formik.touched.reason && formik.errors.reason
                            )}
                            helperText={
                              (formik.touched.reason &&
                                formik.errors.reason) as any
                            }
                            fullWidth
                            label={t("Reason")}
                            name="reason"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.reason}
                            // disabled
                            required
                          >
                            {formik.values.transaction == "credit" ? (
                              CreditOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))
                            ) : formik.values.transaction == "debit" ? (
                              DebitOptions.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem>{"No Option!"}</MenuItem>
                            )}
                          </TextFieldWrapper>
                        </Box>

                        {formik.values.reason == "vendorPayments" && (
                          <Box sx={{ mt: 3 }}>
                            <VendorAutoCompleteDropdown
                              disabled={id != null}
                              showAllVendor={false}
                              companyRef={user.company._id}
                              required
                              error={
                                formik?.touched?.vendorRef &&
                                formik?.errors?.vendorRef
                              }
                              onChange={(id, name) => {
                                formik.handleChange("vendorRef")(id || "");
                                formik.handleChange("vendor")(name || "");
                              }}
                              selectedId={formik?.values?.vendorRef}
                              label={t("Vendor")}
                              id="vendor"
                              handleModalOpen={() => {
                                setOpenVendorCreateModal(true);
                              }}
                            />
                          </Box>
                        )}

                        <Box sx={{ mt: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={5.5}>
                              {/* tslint:disable */}
                              <TextFieldWrapper
                                disabled={
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  entity?.poRef ||
                                  formik.values?.editable == false
                                }
                                error={
                                  !!(
                                    formik.touched.paymentMethod &&
                                    formik.errors.paymentMethod
                                  )
                                }
                                fullWidth
                                label={t("Payment method")}
                                name="paymentMethod"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                select
                                value={formik.values.paymentMethod}
                                // disabled
                                required
                              >
                                {paymentMethodOptions.map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextFieldWrapper>
                            </Grid>

                            <Grid item xs={12} sm={5.5}>
                              {/* tslint:disable */}
                              <TextFieldWrapper
                                disabled={
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  entity?.poRef ||
                                  formik.values?.editable == false
                                }
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                autoComplete="off"
                                fullWidth
                                required
                                label="Amount"
                                name={"amount"}
                                onWheel={(event: any) => {
                                  event.preventDefault();
                                  event.target.blur();
                                }}
                                error={
                                  !!(
                                    formik.touched.amount &&
                                    formik.errors.amount
                                  ) as any
                                }
                                helperText={
                                  !!(
                                    formik.touched.amount &&
                                    formik.errors.amount
                                  ) as any
                                }
                                onKeyPress={(event): void => {
                                  const ascii = event.charCode;
                                  const value = (
                                    event.target as HTMLInputElement
                                  ).value;
                                  const decimalCheck =
                                    value.indexOf(".") !== -1;

                                  if (decimalCheck) {
                                    const decimalSplit = value.split(".");
                                    const decimalLength =
                                      decimalSplit[1].length;
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
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                value={formik.values.amount}
                                InputProps={{
                                  startAdornment: (
                                    <Typography
                                      color="textSecondary"
                                      variant="body2"
                                      sx={{ mr: 1, mt: 2.4 }}
                                    >
                                      {currency}
                                    </Typography>
                                  ),
                                }}
                                sx={{ mr: 2 }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={1}>
                              <IconButton
                                disabled={
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  (entity?.deviceRef &&
                                    entity?.status != "to_be_paid") ||
                                  entity?.poRef ||
                                  formik.values?.editable == false
                                }
                                sx={{ mt: 1 }}
                                color="primary"
                                onClick={() => {
                                  handleAddPayment();
                                }}
                              >
                                <AddCircleOutlineRounded />
                              </IconButton>
                            </Grid>
                          </Grid>

                          <Table
                            sx={{
                              mt: 3,
                              border:
                                theme?.palette?.mode == "dark"
                                  ? "1px solid #2D3748"
                                  : "1px solid #E5E7EB;",
                            }}
                          >
                            <TableHead>
                              <TableRow>
                                <TableCell>{t("Payment method")}</TableCell>
                                <TableCell>{t("Amount")}</TableCell>
                                <TableCell></TableCell>
                              </TableRow>
                            </TableHead>

                            <TableBody>
                              {formik.values.payments?.length > 0 ? (
                                formik.values.payments.map(
                                  (payment: any, idx: any) => {
                                    return (
                                      <TableRow key={idx}>
                                        <TableCell>
                                          <Typography
                                            sx={{ textTransform: "capitalize" }}
                                            variant="body2"
                                          >
                                            {payment?.paymentMethod}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Typography variant="body2">
                                            {`${currency} ${payment?.amount}`}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              justifyContent: "flex-end",
                                            }}
                                          >
                                            <IconButton
                                              disabled={
                                                (entity?.deviceRef &&
                                                  entity?.status !=
                                                    "to_be_paid") ||
                                                (entity?.deviceRef &&
                                                  entity?.status !=
                                                    "to_be_paid") ||
                                                entity?.poRef ||
                                                formik.values?.editable == false
                                              }
                                              color="error"
                                              onClick={() => {
                                                formik.values.payments.splice(
                                                  idx,
                                                  1
                                                );
                                                formik.setFieldValue(
                                                  "payments",
                                                  [...formik.values.payments]
                                                );
                                              }}
                                              style={{
                                                pointerEvents: "painted",
                                              }}
                                            >
                                              <DeleteOutlineTwoToneIcon />
                                            </IconButton>
                                          </Box>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  }
                                )
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={5}
                                    sx={{ py: 3 }}
                                    style={{ textAlign: "center" }}
                                  >
                                    {t("Currently, there are no payments")}
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>

                          {Boolean(
                            formik?.touched?.payments &&
                              formik?.errors?.payments
                          ) &&
                            formik.values.payments.length == 0 && (
                              <Typography
                                color="error.main"
                                sx={{
                                  mb: 2,
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  margin: "5px 14px 0 14px",
                                }}
                              >
                                {formik.errors.payments as any}
                              </Typography>
                            )}
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <TextField
                            disabled={id != null}
                            inputProps={{
                              style: { textTransform: "uppercase" },
                            }}
                            fullWidth
                            label={t("Reference No. / Transaction ID")}
                            value={formik.values.referenceNumber}
                            name={"referenceNumber"}
                            error={Boolean(
                              formik.touched.referenceNumber &&
                                formik.errors.referenceNumber
                            )}
                            helperText={
                              (formik.touched.referenceNumber &&
                                formik.errors.referenceNumber) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e: any) => {
                              formik.setFieldValue(
                                "referenceNumber",
                                e.target.value?.replace(/[^A-Za-z0-9]/, "")
                              );
                            }}
                            sx={{ mt: 3 }}
                            size="medium"
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextField
                            type="text"
                            disabled={id != null}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            error={Boolean(
                              formik.touched.description &&
                                formik.errors.description
                            )}
                            helperText={
                              (formik.touched.description &&
                                formik.errors.description) as any
                            }
                            autoComplete="off"
                            label={t("Description")}
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("description")}
                            value={formik.values.description}
                          />
                        </Box>

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <MultiFileDropzone
                            disableRemove={id != null}
                            disabled={
                              entity?.deviceRef ||
                              entity?.poRef ||
                              formik.values?.editable == false
                            }
                            accept={{
                              "image/*": [],
                            }}
                            files={formik.values.logoFile}
                            imageName={getMultipleUploadedDocNames(
                              formik?.values?.logo || []
                            )}
                            uploadedImageUrl={formik.values.logo}
                            onDrop={companyLogoFileDrop}
                            onUpload={handleUpload}
                            onRemove={companyLogoFileRemove}
                            onRemoveAll={logoFileRemoveAll}
                            maxFiles={4}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                            fileDataTestId="company-logo-file"
                          />
                        </Box>

                        {id != null &&
                          formik.values.transaction == "debit" &&
                          formik.values.toBePaid && (
                            <Box
                              sx={{
                                mt: 2,
                                mx: 0.5,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={Boolean(
                                        formik.values.dueStatus == "paid"
                                          ? true
                                          : false
                                      )}
                                      onChange={(e) => {
                                        if (formik.values.dueStatus == "due") {
                                          setOpenModal(true);
                                          // toast(
                                          //   `${t("Staus has been mark paid")}`
                                          // );
                                        } else {
                                          toast(
                                            `${t("Staus has been mark due")}`
                                          );
                                        }

                                        formik.setFieldValue(
                                          "dueStatus",
                                          e.target.checked ? "paid" : "due"
                                        );
                                      }}
                                      value={
                                        formik.values.dueStatus == "paid"
                                          ? true
                                          : false
                                      }
                                    />
                                  }
                                  label={t("Mark Paid")}
                                  sx={{
                                    flexGrow: 1,
                                    mr: 0,
                                  }}
                                />

                                <Tooltip
                                  sx={{ mx: 2 }}
                                  title={t(
                                    "You can change this status of this transaction when you update this"
                                  )}
                                >
                                  <SvgIcon color="action">
                                    <InfoCircleIcon />
                                  </SvgIcon>
                                </Tooltip>
                              </Box>
                            </Box>
                          )}

                        {id != null &&
                          formik.values.transaction == "credit" &&
                          formik.values.toBeReceived && (
                            <Box
                              sx={{
                                mt: 2,
                                mx: 0.5,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{ display: "flex", alignItems: "center" }}
                              >
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={Boolean(
                                        formik.values.receivedStatus == "paid"
                                          ? true
                                          : false
                                      )}
                                      onChange={(e) => {
                                        if (
                                          formik.values.receivedStatus == "due"
                                        ) {
                                          setOpenModal(true);
                                          // toast(
                                          //   `${t(
                                          //     "Staus has been mark received"
                                          //   )}`
                                          // );
                                        } else {
                                          toast(
                                            `${t("Staus has been mark due")}`
                                          );
                                        }

                                        formik.setFieldValue(
                                          "receivedStatus",
                                          e.target.checked ? "paid" : "due"
                                        );
                                      }}
                                      value={
                                        formik.values.receivedStatus == "paid"
                                          ? true
                                          : false
                                      }
                                    />
                                  }
                                  label={t("Mark Received")}
                                  sx={{
                                    flexGrow: 1,
                                    mr: 0,
                                  }}
                                />

                                <Tooltip
                                  sx={{ mx: 2 }}
                                  title={t(
                                    "You can change this status of this transaction when you update this"
                                  )}
                                >
                                  <SvgIcon color="action">
                                    <InfoCircleIcon />
                                  </SvgIcon>
                                </Tooltip>
                              </Box>
                            </Box>
                          )}

                        <Box sx={{ mt: 3 }}>
                          <DatePicker
                            disabled={id != null}
                            //@ts-ignore
                            inputProps={{ disabled: true }}
                            label="Date"
                            inputFormat="dd/MM/yyyy"
                            onChange={(date: Date): void => {
                              formik.setFieldValue("expenseDate", date);
                            }}
                            // minDate={new Date()}
                            disablePast={
                              (formik.values.transaction == "debit" &&
                                formik.values.toBePaid) ||
                              (formik.values.transaction == "credit" &&
                                formik.values.toBeReceived)
                            }
                            disableFuture={
                              (formik.values.transaction == "debit" &&
                                formik.values.paid) ||
                              (formik.values.transaction == "credit" &&
                                formik.values.received)
                            }
                            value={formik.values.expenseDate}
                            renderInput={(
                              params: JSX.IntrinsicAttributes & TextFieldProps
                            ) => (
                              <TextFieldWrapper
                                required
                                // disabled={!isEditing}
                                fullWidth
                                {...params}
                                error={Boolean(
                                  formik.touched.expenseDate &&
                                    formik.errors.expenseDate
                                )}
                                helperText={
                                  (formik.touched.expenseDate &&
                                    formik.errors.expenseDate) as any
                                }
                                onBlur={formik.handleBlur("expenseDate")}
                              />
                            )}
                          />
                        </Box>
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
                  <Button
                    color="inherit"
                    component={RouterLink}
                    href={tijarahPaths?.accounting.accounting?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      // if (id != null && !canUpdate) {
                      //   return toast.error(t("You don't have access"));
                      // } else if (!id && !canCreate) {
                      //   return toast.error(t("You don't have access"));
                      // }
                      if (
                        Boolean(
                          // entity?.deviceRef ||
                          //   entity?.poRef ||
                          //   formik.values?.editable == false
                          (entity?.deviceRef &&
                            entity?.status != "to_be_paid") ||
                            (entity?.deviceRef &&
                              entity?.status != "to_be_paid") ||
                            entity?.poRef ||
                            formik.values?.editable == false
                        )
                      ) {
                        return toast.error(
                          t(
                            "Transactions created from POS devices / PO / Day End Sales can not be updated!"
                          )
                        );
                      }
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {id != null ? t("Update") : t("Create")}
                  </LoadingButton>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
      {openVendorCreateModal && (
        <VendorCreateModal
          open={openVendorCreateModal}
          handleClose={() => {
            setOpenVendorCreateModal(false);
          }}
        />
      )}

      {openModal && (
        <PaymentDateModal
          modalData={{
            paymentDate: formik?.values.paymentDate,
            transactionDate: formik?.values.expenseDate,
          }}
          open={openModal}
          handleUpdate={(data: any) => {
            formik.setFieldValue("paymentDate", new Date(data));
            if (formik.values.toBePaid) {
              formik.setFieldValue("paid", true);
              formik.setFieldValue("toBePaid", false);
              formik.setFieldValue("received", false);
              formik.setFieldValue("toBeReceivd", false);
            } else if (formik.values.toBeReceived) {
              formik.setFieldValue("toBeReceived", false);
              formik.setFieldValue("received", true);
              formik.setFieldValue("paid", false);
              formik.setFieldValue("toBePaid", false);
            }
            formik.handleSubmit();
          }}
          handleClose={() => {
            formik.setFieldValue("dueStatus", "due");
            formik.setFieldValue("receivedStatus", "due");
            setOpenModal(false);
          }}
        />
      )}
    </>
  );
};

CreateMiscellaneousExpenses.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateMiscellaneousExpenses;
