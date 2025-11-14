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
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  TextFieldProps,
  Typography,
  useTheme,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import UserAutoCompleteDropdown from "src/components/input/user-auto-complete";
import { MultiFileDropzone } from "src/components/multiple-upload-file-dropzone";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

export const expenseTypeOptions = [
  {
    value: "administrative",
    label: "Administrative",
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
    value: "other",
    label: "Other",
  },
];

const paymentMethodOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Credit", value: "credit" },
];

interface CreateGlobalBrandProps {
  miscExpenseName?: string;
  expenseType?: string;
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
  // multipay?: boolean;
  description?: string;
  oldLogoFile: any[];
  logoFile: any[];
  logo: string[];
  status: boolean;
}

const CreateMiscellaneousExpenses: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["brand:update"]);
  const canCreate = canAccess(MoleculeType["brand:create"]);
  const { id } = router.query;
  const { user } = useAuth();
  const theme = useTheme();
  const currency = useCurrency();

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
        router.back();
      }}
    >
      {t("Accounting")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Deposit") : t("Create Deposit")}
    </Link>,
  ];
  usePageView();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentIndex, setPaymentIndex] = useState(-1);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("misc-expenses");

  const initialValues: CreateGlobalBrandProps = {
    miscExpenseName: "",
    expenseType: "",
    expenseDate: null,
    paymentMethod: "",
    locationRef: "",
    location: "",
    user: "",
    userType: "",
    userRef: "",
    referenceNumber: "",
    amount: "",
    // multipay: false,
    payments: [],
    description: "",
    oldLogoFile: [],
    logoFile: [],
    logo: [],
    status: true,
  };

  const validationSchema = Yup.object({
    miscExpenseName: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid expense name")
      )
      .required(`${t("Expense name is required")}`)
      .max(60, t("Expense name must not be greater than 60 characters")),
    locationRef: Yup.string().required(`${t("Location is required")}`),
    payments: Yup.array()
      .required(t("Payment is required"))
      .min(1, t("Pyament should not be empty")),
    expenseType: Yup.string().required(t("Expense type is required")),
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
      const data: any = {
        name: {
          en: values.miscExpenseName,
          ar: values.miscExpenseName,
        },
        date: values.expenseDate,
        expenseType: values.expenseType,
        company: {
          name: user?.company?.name?.en,
        },
        companyRef: user?.company?._id,
        // paymentMethod: values.paymentMethod,
        locationRef: values.locationRef,
        location: { name: values.location },
        userRef: values?.userRef || null,
        user: {
          name: values?.user || "",
          type: values?.userType || "",
        },

        referenceNumber: values.referenceNumber,
        // amount: values.amount,
        fileUrl: values.logo,
        // multipay: values.multipay,
        payments: values?.payments?.map((d) => {
          return {
            paymentMethod: d?.paymentMethod,
            amount: d?.amount,
          };
        }),
        description: values.description,
      };

      // if (values?.userRef || values.userRef === undefined) {
      //   data["userRef"] = values.userRef;
      // }

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Expense Updated").toString()
            : t("Expense Created").toString()
        );

        router.push(tijarahPaths?.accounting.accounting.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

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
    const updatedLogo = [...logo.slice(0, index), ...logo.slice(index + 1)];

    formik.setFieldValue("oldLogoFile", [...updatedLogoFile]);
    formik.setFieldValue("logoFile", [...updatedLogoFile]);
    formik.setFieldValue("logo", [...updatedLogo]);
  };

  const companyLogoFileDrop = (newFiles: any): void => {
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
            await upload([file], FileUploadNamespace["misc-expense-images"])
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
      delete entity?._id;

      formik.setFieldValue("miscExpenseName", entity?.name?.en);
      formik.setFieldValue("expenseType", entity?.expenseType);
      formik.setFieldValue("expenseDate", entity?.date);
      formik.setFieldValue("payments", entity?.payments);
      formik.setFieldValue("location", entity?.location?.name);
      formik.setFieldValue("locationRef", entity?.locationRef);
      formik.setFieldValue("user", entity?.user?.name);
      formik.setFieldValue("userType", entity?.user?.type);
      formik.setFieldValue("userRef", entity?.userRef || undefined);
      formik.setFieldValue("referenceNumber", entity?.referenceNumber);
      formik.setFieldValue("logo", entity?.fileUrl || "");
      formik.setFieldValue("description", entity?.description);
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

  if (!canAccess(MoleculeType["brand:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Create Deposit")}`} />
      <Box component="main" sx={{ flexGrow: 1, py: 2 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Typography variant="h4">
                {id != null ? t("Edit Deposit") : t("Create Deposit")}
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
                          {t("Deposit Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <LocationAutoCompleteDropdown
                            disabled={Boolean(entity?.deviceRef)}
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
                            disabled={Boolean(entity?.deviceRef)}
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
                            disabled={Boolean(entity?.deviceRef)}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Deposit")}
                            name="miscExpenseName"
                            error={Boolean(
                              formik.touched.miscExpenseName &&
                                formik.errors.miscExpenseName
                            )}
                            helperText={
                              formik.touched.miscExpenseName &&
                              formik.errors.miscExpenseName
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.miscExpenseName}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={Boolean(entity?.deviceRef)}
                            error={Boolean(
                              formik.touched.expenseType &&
                                formik.errors.expenseType
                            )}
                            helperText={
                              (formik.touched.expenseType &&
                                formik.errors.expenseType) as any
                            }
                            fullWidth
                            label={t("Type")}
                            name="expenseType"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.expenseType}
                            // disabled
                            required
                          >
                            {expenseTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <DatePicker
                            disabled={Boolean(entity?.deviceRef)}
                            //@ts-ignore
                            inputProps={{ disabled: true }}
                            label="Date"
                            inputFormat="dd/MM/yyyy"
                            onChange={(date: Date): void => {
                              formik.setFieldValue("expenseDate", date);
                            }}
                            // minDate={new Date()}
                            // disablePast
                            disableFuture
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

                        <Box sx={{ mt: 3 }}>
                          <Grid container spacing={3}>
                            <Grid item xs={12} sm={5.5}>
                              {/* tslint:disable */}
                              <TextFieldWrapper
                                disabled={Boolean(entity?.deviceRef)}
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
                                disabled={Boolean(entity?.deviceRef)}
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
                                sx={{ mt: 1 }}
                                color="primary"
                                onClick={() => {
                                  handleAddPayment();
                                }}
                                // disabled={
                                //   !formik.values.startTime ||
                                //   !formik.values.endTime
                                // }
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
                            disabled={Boolean(entity?.deviceRef)}
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
                            // disabled={id != null && !canUpdate}
                            disabled={Boolean(entity?.deviceRef)}
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
                            disabled={id != null && !canUpdate}
                            // @ts-ignore
                            accept={{
                              "image/*": [],
                            }}
                            files={formik.values.logoFile}
                            // imageName={getUploadedDocName(
                            //   formik?.values?.logo || ""
                            // )}
                            uploadedImageUrl={formik.values.logo}
                            onDrop={companyLogoFileDrop}
                            onUpload={handleUpload}
                            onRemove={companyLogoFileRemove}
                            onRemoveAll={logoFileRemoveAll}
                            maxFiles={4}
                            maxSize={9999999}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                            fileDataTestId="company-logo-file"
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
                      if (Boolean(entity?.deviceRef)) {
                        return toast.error(
                          t(
                            "Expense created from POS devices can only be updated from POS device"
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
    </>
  );
};

CreateMiscellaneousExpenses.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateMiscellaneousExpenses;
