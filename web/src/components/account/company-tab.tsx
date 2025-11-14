import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  SvgIcon,
  Switch,
  TextFieldProps,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES, industryOptions } from "src/utils/constants";
import countries from "src/utils/countries.json";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import parsePhoneNumber from "src/utils/parse-phone-number";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import Timezones from "../../utils/timezone.json";
import TransactionVolumCategory from "../../utils/transaction-categories.json";
import BusinessTypeDropdown from "../input/business-type-complete";
import TaxDropdown from "../input/tax-auto-complete";
import { CompanyDeleteModal } from "../modals/account/company-delete-modal";
import { NewFileDropzone } from "../new-file-dropzone";
import withPermission from "../permissionManager/restrict-page";
import PhoneInput from "../phone-input";
import { ProfileChooser } from "../profile-chooser";
import TextFieldWrapper from "../text-field-wrapper";

interface AccountGeneralProps {
  email: string;
  phone: string;
  companyLogo: string;
  companyNameEng: string;
  companyNameAr: string;
  industry: string;
  businessTypeRef: string;
  businessType: string;
  companyAddressLine1: string;
  companyAddressLine2?: string;
  companyCity: string;
  companyState: string;
  companyPostalCode: string;
  companyCountry: string;
  subdomain: string;
  vatFile?: any[];
  vatUrl?: string;
  percentage: any;
  vatRef: string;
  vatNumber: string;
  vatExpiry?: Date;
  subscriptionExpiry?: Date;
  isInit?: any;
  nielsenReportEnabled?: boolean;
  noVat?: boolean;
  enableZatca?: boolean;
  saptcoEnabled?: boolean;
  timezone: string;
  transactionVolumeCategory: string;
  syncMethod?: string;
  currency?: string;
  currencyRef: any;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const authContext = useContext(AuthContext);
  const { userType } = useUserType();
  const [country, setCountry] = useState("+966");
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["account:update"]) ||
    canAccess(MoleculeType["account:manage"]);

  const companyContext = useContext<any>(CompanyContext);
  const lng = localStorage.getItem("currentLanguage");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isVatUploading, setIsVatUploading] = useState(false);
  const [openCompanyDeleteModal, setOpenCompanyDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { updateEntity } = useEntity("company");
  const { find, entities: taxes } = useEntity("tax");
  const { find: findCurrencies, entities: currencies } = useEntity("currency");

  const handleEdit = () => {
    if (!canUpdate) {
      return toast.error(t("You don't have access"));
    }
    setIsEditing(!isEditing);
  };

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const vatCertificateFileDrop = (newFiles: any): void => {
    const sizes: any[] = newFiles?.map((op: any) => op?.size);

    if (sizes.find((o: any) => o > 999999)) {
      toast.error("File size cannot be greater than 1MB");
      return;
    }
    formik.setFieldValue("vatFile", newFiles);
  };

  const vatCertificateFileRemove = (): void => {
    formik.setFieldValue("vatFile", []);
    formik.setFieldValue("vatUrl", "");
  };

  const vatCertificateFileRemoveAll = (): void => {
    formik.setFieldValue("vatFile", []);
  };

  const handleUploadVAT = async (files: any) => {
    setIsVatUploading(true);
    try {
      const url = await upload(files, FileUploadNamespace["vat-certificates"]);
      formik.setFieldValue("vatUrl", url);

      setIsUploaded(true);
      setIsVatUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const initialValues: AccountGeneralProps = {
    companyLogo: "",
    email: "",
    phone: "",
    companyNameEng: "",
    companyNameAr: "",
    industry: "retail",
    businessTypeRef: "",
    businessType: "",
    companyAddressLine1: "",
    companyAddressLine2: "",
    companyCity: "",
    companyState: "",
    companyPostalCode: "",
    companyCountry: "Saudi Arabia",
    subdomain: "",
    vatFile: [],
    vatUrl: "",
    percentage: "",
    vatRef: "",
    vatExpiry: null,
    vatNumber: "",
    subscriptionExpiry: null,
    nielsenReportEnabled: false,
    noVat: false,
    isInit: false,
    enableZatca: false,
    saptcoEnabled: false,
    timezone: "",
    transactionVolumeCategory: "",
    syncMethod: "",
    currency: "SAR",
    currencyRef: null,
  };

  const validationSchema = Yup.object({
    companyNameEng: Yup.string()
      .trim()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid company name")
      )
      .required(`${t("Company Name is required")}`)
      .max(60, t("Company name must not be greater than 60 characters")),
    companyNameAr: Yup.string()
      .trim()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid company name")
      )
      .required(`${t("Company Name is required")}`)
      .max(60, t("Company name must not be greater than 60 characters")),
    businessTypeRef: Yup.string().required(`${t("Business Type is required")}`),
    companyAddressLine1: Yup.string()
      .trim()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid address")
      )
      .required(t("Address Line is required"))
      .max(60, t("Address line 1 must not be greater than 60 characters")),
    companyCity: Yup.string()
      .trim()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid city")
      )
      .required(t("City is required"))
      .max(40, t("City name must not be greater than 40 characters")),
    companyPostalCode: Yup.string()
      .required(t("Postal Code is required"))
      .max(10, t("Postal code should not be greater than 10 digits")),
    companyCountry: Yup.string().required(t("Country is required")),
    subdomain: Yup.string()
      .trim()
      .matches(
        /^[a-z0-9-]+$/,
        t("Subdomain can only contain lowercase letters, numbers, and hyphens")
      )
      .min(3, t("Subdomain must be at least 3 characters"))
      .max(30, t("Subdomain must not be greater than 30 characters")),
    noVat: Yup.boolean(),
    vatRef: Yup.string().when("noVat", {
      is: true,
      then: Yup.string().required(t("ppppPlease select the VAT percentage")),
      otherwise: Yup.string(),
    }),
    vatExpiry: Yup.date().when("noVat", {
      is: true,
      then: Yup.date()
        .nullable()
        .typeError("Vat expiry Date is required")
        .required(t("Vat expiry Date is required"))
        .default(null),
      otherwise: Yup.date().nullable(),
    }),
    vatNumber: Yup.string().when("noVat", {
      is: true,
      then: Yup.string()
        .matches(
          /^3\d{13}3$/,

          `${t(
            "VAT Registartion Number must start and end with 3 and have 15 characters"
          )},` + ` ${t(" Hint")}: ${"3XXXXXXXXXXXXXX3"}`
        )
        .required(t("VAT Number is required")),
      otherwise: Yup.string(),
    }),
    phone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .max(12, `${t("Phone Number should be maximum 12 digits")}`)
      .required(`${t("Phone number is required")}`),
    email: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(70)
      .required(`${t("Email is required")}`),
    subscriptionExpiry:
      userType === USER_TYPES.SUPERADMIN &&
      Yup.date()
        .required(t("Expiry date is required"))
        .typeError(t("Expiry date is required")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data: any = {
        logo: values.companyLogo,
        name: {
          en: values.companyNameEng.trim(),
          ar: values.companyNameAr.trim(),
        },
        businessTypeRef: values.businessTypeRef,
        businessType: values.businessType,
        email: values.email,
        phone: parsePhoneNumber(country, values.phone),
        address: {
          address1: values.companyAddressLine1.trim(),
          address2: values.companyAddressLine2.trim(),
          state: values?.companyState,
          city: values.companyCity.trim(),
          postalCode: values.companyPostalCode,
          country: values.companyCountry,
        },
        subdomain: values.subdomain.trim(),
        vat: {
          percentage: values.percentage,
          docNumber: values.vatNumber,
          vatRef: values.vatRef || null,
          url: values.vatUrl,
          expiry: values.vatExpiry,
        },
        configuration: {
          ...companyContext?.configuration,
          nielsenReportEnabled: values.nielsenReportEnabled,
          minimumRedeemAmount: companyContext.configuration.minimumRedeemAmount,
          loyaltyPercentage: companyContext.configuration.loyaltyPercentage,
          enableLoyalty: companyContext.configuration.enableLoyalty,
          enableBatch: companyContext.configuration.enableBatch,
          enableInventoryTracking:
            companyContext.configuration.enableInventoryTracking,
          enableZatca: values.enableZatca,
          enableKitchenManagement:
            companyContext.configuration.enableKitchenManagement,
          nearpay: companyContext?.configuration?.nearpay,
          nearpayMerchantId: companyContext?.configuration?.nearpayMerchantId,
          enableStcPay: companyContext?.configuration?.enableStcPay,
        },
        saptcoCompany: values?.saptcoEnabled,
        timezone: values?.timezone || "",
        transactionVolumeCategory: Number(values?.transactionVolumeCategory),
        syncMethod: values?.syncMethod,
        currency: values?.currency,
        currencyRef: values?.currencyRef,
      };

      if (userType == USER_TYPES.SUPERADMIN) {
        data["subscriptionEndDate"] = new Date(values.subscriptionExpiry);
      }

      try {
        const res = await updateEntity(companyContext._id.toString(), {
          ...data,
        });
        toast.success(t("Company Details Updated").toString());
        companyContext.onRefresh();
        localStorage.setItem("user", JSON.stringify({ ...user, company: res }));
        authContext.updateUser({ ...user, company: res });
        handleEdit();
      } catch (err) {
        toast.error(err.error?.message || err?.message);
      }
    },
  });

  useEffect(() => {
    find({
      page: 0,
      limit: 10,
      _q: "",
      activeTab: "all",
      sort: "asc",
    });
    findCurrencies({
      page: 0,
      limit: 100,
      _q: "",
      activeTab: "all",
      sort: "asc",
    });
  }, []);

  useEffect(() => {
    if (companyContext._id && !formik.values.isInit) {
      const phoneNumber = companyContext.phone
        ? companyContext.phone.toString().split("-")[1]
        : "";

      setCountry(
        phoneNumber ? companyContext.phone.toString().split("-")[0] : "+966"
      );

      formik.setValues({
        companyLogo: companyContext.logo,
        companyNameEng: companyContext.name.en,
        companyNameAr: companyContext.name.ar,
        industry: companyContext.industry || "retail",
        businessTypeRef: companyContext.businessTypeRef,
        businessType: companyContext.businessType,
        companyAddressLine1: companyContext.address.address1,
        companyAddressLine2: companyContext.address.address2
          ? companyContext.address.address1
          : "",
        companyCity: companyContext.address.city,
        companyState: "",
        companyPostalCode: companyContext.address.postalCode,
        companyCountry: companyContext.address.country
          ? companyContext.address.country
          : "Saudi Arabia",
        subdomain: companyContext.subdomain || "",
        email: companyContext.email,
        phone: companyContext.phone.split("-")?.[1],
        vatUrl: companyContext.vat.url,
        vatRef: companyContext.vat.vatRef,
        vatExpiry: companyContext.vat.expiry,
        percentage: companyContext.vat.percentage,
        subscriptionExpiry: companyContext.subscriptionEndDate || null,
        vatNumber: companyContext.vat.docNumber || "NA",
        nielsenReportEnabled: Boolean(
          companyContext.configuration.nielsenReportEnabled
        ),
        enableZatca: Boolean(companyContext.configuration.enableZatca),

        noVat: Number(companyContext.vat.percentage) ? true : false,
        isInit: true,
        saptcoEnabled: Boolean(companyContext?.saptcoCompany),
        timezone: companyContext?.timezone || "Asia/Riyadh",
        transactionVolumeCategory:
          companyContext?.transactionVolumeCategory || 50000,
        syncMethod: companyContext?.syncMethod || "push-notification",
        currency: companyContext?.currency || "SAR",
        currencyRef: companyContext?.currencyRef || null,
      });
    }
  }, [companyContext._id && formik.values.isInit]);

  return (
    <>
      <Box sx={{ mt: 4 }}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography sx={{ textAlign: "left" }} variant="h6">
                  {t("Company Details")}
                </Typography>
              </Grid>

              <Grid item md={8} xs={12}>
                <ProfileChooser
                  disabled={!isEditing}
                  imageUploadUrl={
                    formik.values.companyLogo != null &&
                    formik.values.companyLogo
                  }
                  onSuccess={(url: string) =>
                    formik.handleChange("companyLogo")(url)
                  }
                  namespace={FileUploadNamespace["company-logos"]}
                />

                <TextFieldWrapper
                  required
                  fullWidth
                  disabled={!isEditing}
                  label={t("Company Name (English)")}
                  name="companyNameEng"
                  onChange={formik.handleChange}
                  error={Boolean(
                    formik.touched.companyNameEng &&
                      formik.errors.companyNameEng
                  )}
                  helperText={
                    formik.touched.companyNameEng &&
                    formik.errors.companyNameEng
                  }
                  onBlur={formik.handleBlur}
                  value={formik.values.companyNameEng}
                  sx={{ mt: 3 }}
                />

                <TextFieldWrapper
                  required
                  fullWidth
                  disabled={!isEditing}
                  label={t("Company Name (Arabic)")}
                  name="companyNameAr"
                  onChange={formik.handleChange}
                  error={Boolean(
                    formik.touched.companyNameAr && formik.errors.companyNameAr
                  )}
                  helperText={
                    formik.touched.companyNameAr && formik.errors.companyNameAr
                  }
                  onBlur={formik.handleBlur}
                  value={formik.values.companyNameAr}
                  sx={{ mt: 3 }}
                />

                <Box sx={{ mt: 3, alignItems: "center" }}>
                  <TextFieldWrapper
                    fullWidth
                    label={t("Industry")}
                    type="text"
                    name="industry"
                    onChange={formik.handleChange}
                    select
                    required
                    value={formik.values.industry}
                    sx={{ flexGrow: 1, textAlign: "left" }}
                    disabled
                  >
                    {industryOptions?.map((industry) => (
                      <MenuItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </MenuItem>
                    ))}
                  </TextFieldWrapper>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <BusinessTypeDropdown
                    required
                    disabled
                    error={
                      formik.touched.businessTypeRef &&
                      formik.errors.businessTypeRef
                    }
                    onChange={(id, name) => {
                      formik.handleChange("businessTypeRef")(id || "");
                      formik.handleChange("businessType")(name || "");
                    }}
                    selectedId={formik.values.businessTypeRef}
                    label={t("Business Type")}
                    id="businessTypeRef"
                    showAllBusinessTypes={false}
                    industry={formik?.values?.industry?.toString()}
                  />
                </Box>

                <Box sx={{ mt: 2 }}>
                  <TextFieldWrapper
                    disabled={!isEditing}
                    autoComplete="off"
                    fullWidth
                    required
                    label={t("Email")}
                    name="email"
                    error={Boolean(formik.touched.email && formik.errors.email)}
                    helperText={
                      (formik.touched.email && formik.errors.email) as any
                    }
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.email}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <PhoneInput
                    disabled={!isEditing}
                    touched={formik.touched.phone}
                    error={formik.errors.phone}
                    value={formik.values.phone}
                    onBlur={formik.handleBlur("phone")}
                    country={country}
                    handleChangeCountry={handleChangeCountry}
                    onChange={formik.handleChange("phone")}
                    required
                    label={t("Phone Number")}
                  />
                </Box>

                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3 }}>
                    <DatePicker
                      //@ts-ignore
                      inputProps={{ disabled: true }}
                      disabled={!isEditing}
                      label="Subscription Expiry"
                      inputFormat="dd/MM/yyyy"
                      onChange={(date: Date): void => {
                        formik.setFieldValue("subscriptionExpiry", date);
                      }}
                      minDate={new Date()}
                      disablePast
                      value={formik.values.subscriptionExpiry}
                      renderInput={(
                        params: JSX.IntrinsicAttributes & TextFieldProps
                      ) => (
                        <TextFieldWrapper
                          required
                          disabled={!isEditing}
                          fullWidth
                          {...params}
                          error={Boolean(
                            formik.touched.subscriptionExpiry &&
                              formik.errors.subscriptionExpiry
                          )}
                          helperText={
                            (formik.touched.subscriptionExpiry &&
                              formik.errors.subscriptionExpiry) as any
                          }
                          onBlur={formik.handleBlur("subscriptionExpiry")}
                        />
                      )}
                    />
                  </Box>
                )}

                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid ${
                          theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                        }`,
                        borderRadius: "8px",
                        paddingLeft: "8px",
                      }}
                    >
                      <Typography color="textSecondary" variant="body2">
                        {t("Nielsen Report")}
                      </Typography>

                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          disabled={!isEditing}
                          name="nielsenReportEnabled"
                          checked={formik.values.nielsenReportEnabled}
                          onChange={formik.handleChange}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )}

                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3, alignItems: "center" }}>
                    <TextFieldWrapper
                      fullWidth
                      disabled={!isEditing}
                      label={t("Timezone")}
                      type="text"
                      name="timezone"
                      onChange={formik.handleChange}
                      select
                      required
                      value={formik.values.timezone}
                      sx={{ flexGrow: 1, textAlign: "left" }}
                    >
                      {Timezones?.map((industry) => (
                        <MenuItem key={industry.offset} value={industry.id}>
                          {industry.display}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Box>
                )}

                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3, alignItems: "center" }}>
                    <TextFieldWrapper
                      fullWidth
                      disabled={!isEditing}
                      label={t("Transaction Volume Category")}
                      type="number"
                      name="transactionVolumeCategory"
                      onChange={formik.handleChange}
                      select
                      required
                      value={formik.values.transactionVolumeCategory}
                      sx={{ flexGrow: 1, textAlign: "left" }}
                    >
                      {TransactionVolumCategory?.map((volumne) => (
                        <MenuItem key={volumne.value} value={volumne.value}>
                          {volumne.label}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Box>
                )}

                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3, alignItems: "center" }}>
                    <TextFieldWrapper
                      fullWidth
                      disabled={!isEditing}
                      label={t("Sync Method")}
                      type="text"
                      name="syncMethod"
                      onChange={formik.handleChange}
                      select
                      required
                      value={formik.values.syncMethod}
                      sx={{ flexGrow: 1, textAlign: "left" }}
                    >
                      <MenuItem value={"push-notification"}>
                        {t("Push Notification")}
                      </MenuItem>
                      <MenuItem value={"sync-polling"}>
                        {t("Sync Polling")}
                      </MenuItem>
                    </TextFieldWrapper>
                  </Box>
                )}
                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3, alignItems: "center" }}>
                    <TextFieldWrapper
                      fullWidth
                      disabled={!isEditing}
                      label={t("Currency")}
                      type="text"
                      name="currency"
                      onChange={(e) => {
                        const selectedCurrency = currencies?.results?.find(
                          (c) => c.symbol === e.target.value
                        );
                        formik.setFieldValue("currency", e.target.value);
                        formik.setFieldValue(
                          "currencyRef",
                          selectedCurrency?._id || null
                        );
                      }}
                      select
                      required
                      value={formik.values.currency}
                      sx={{ flexGrow: 1, textAlign: "left" }}
                    >
                      {currencies?.results?.map((op) => {
                        return (
                          <MenuItem key={op._id} value={op?.symbol}>
                            {op?.name} ({op?.symbol})
                          </MenuItem>
                        );
                      })}
                    </TextFieldWrapper>
                  </Box>
                )}

                {/* {userType === USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mt: 3 }}>
                    <Box
                      sx={{
                        mt: 3,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid ${
                          theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                        }`,
                        borderRadius: "8px",
                        paddingLeft: "8px",
                      }}
                    >
                      <Typography color="textSecondary" variant="body2">
                        {t("Saptco")}
                      </Typography>

                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          disabled={!isEditing}
                          name="saptcoEnabled"
                          checked={formik.values.saptcoEnabled}
                          onChange={formik.handleChange}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                )} */}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {userType === USER_TYPES.SUPERADMIN && companyContext?.industry?.toLowerCase() === "restaurant" && (
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={4} xs={12}>
                  <Typography sx={{ textAlign: "left" }} variant="h6">
                    {t("Web Ordering (Subdomain)")}
                  </Typography>
                </Grid>

                <Grid
                  sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  item
                  md={8}
                  xs={12}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TextFieldWrapper
                      disabled={
                        !isEditing ||
                        (!!companyContext.subdomain &&
                          formik.values.subdomain === companyContext.subdomain)
                      }
                      error={
                        !!(formik.touched.subdomain && formik.errors.subdomain)
                      }
                      fullWidth
                      helperText={
                        formik.touched.subdomain && formik.errors.subdomain
                      }
                      label={t("Web Ordering (Subdomain)")}
                      name="subdomain"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "");
                        e.target.value = value;
                        formik.handleChange(e);
                      }}
                      value={formik.values.subdomain}
                      required={false}
                      placeholder="your-company-name"
                    />
                    <Tooltip title={"subdomain_info_message_company"}>
                      <SvgIcon color="primary">
                        <InfoCircleIcon />
                      </SvgIcon>
                    </Tooltip>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ textAlign: "left", color: "grey" }}
                  >
                    {`Your Ordering Urls will be ${
                      formik.values.subdomain
                        ? `${formik.values.subdomain}.ruyahdine.com`
                        : "https://companyName.ruyahdine.com"
                    }`}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography sx={{ textAlign: "left" }} variant="h6">
                  {t("Zatca P2")}
                </Typography>
              </Grid>
              <Grid item md={8} xs={12}>
                <Box sx={{ mt: 3 }}>
                  <Box
                    sx={{
                      mt: 3,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: `1px solid ${
                        theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                      }`,
                      borderRadius: "8px",
                      paddingLeft: "8px",
                    }}
                  >
                    <Typography color="textSecondary" variant="body2">
                      {t("Enable Zatca")}
                    </Typography>

                    <div
                      onClick={() => {
                        if (userType !== USER_TYPES.SUPERADMIN) {
                          toast.error(t("You don't have permission"));
                        }
                      }}
                    >
                      <Box sx={{ p: 1, display: "flex", alignItems: "center" }}>
                        <Switch
                          color="primary"
                          edge="end"
                          disabled={
                            !isEditing || userType !== USER_TYPES.SUPERADMIN
                          }
                          name="enableZatca"
                          checked={formik.values.enableZatca}
                          onChange={formik.handleChange}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                      </Box>
                    </div>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography sx={{ textAlign: "left" }} variant="h6">
                  {t("Company Address")}
                </Typography>
              </Grid>

              <Grid item md={8} xs={12}>
                <Box
                  sx={{
                    mt: 3,
                  }}
                >
                  <TextFieldWrapper
                    disabled={!isEditing}
                    error={
                      !!(
                        formik.touched.companyCountry &&
                        formik.errors.companyCountry
                      )
                    }
                    fullWidth
                    label={t("Country")}
                    name="companyCountry"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    select
                    value={formik.values.companyCountry}
                    required
                    sx={{ textAlign: "left" }}
                  >
                    {countries.map((country: any) => (
                      <MenuItem key={country.code} value={country.name.en}>
                        {country?.name?.[lng] || country?.name?.en}
                      </MenuItem>
                    ))}
                  </TextFieldWrapper>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextFieldWrapper
                    disabled={!isEditing}
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={
                      !!(
                        formik.touched.companyAddressLine1 &&
                        formik.errors.companyAddressLine1
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyAddressLine1 &&
                      formik.errors.companyAddressLine1
                    }
                    label={t("Address Line 1")}
                    name="companyAddressLine1"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyAddressLine1}
                    required
                  />
                </Box>

                <Box
                  sx={{
                    mt: 3,
                  }}
                >
                  <TextFieldWrapper
                    disabled={!isEditing}
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={
                      !!(
                        formik.touched.companyAddressLine2 &&
                        formik.errors.companyAddressLine2
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyAddressLine2 &&
                      formik.errors.companyAddressLine2
                    }
                    label={t("Address Line 2")}
                    name="companyAddressLine2"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyAddressLine2}
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextFieldWrapper
                    disabled={!isEditing}
                    error={
                      !!(
                        formik.touched.companyPostalCode &&
                        formik.errors.companyPostalCode
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyPostalCode &&
                      formik.errors.companyPostalCode
                    }
                    label={t("Postal Code")}
                    name="companyPostalCode"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value) {
                        // remove all non numeric characters
                        const cleanedNumber = e.target.value.replace(/\D/g, "");
                        e.target.value = cleanedNumber
                          ? (Number(cleanedNumber) as any)
                          : "";
                      }
                      formik.handleChange(e);
                    }}
                    value={formik.values.companyPostalCode}
                    required
                  />
                </Box>

                <Box sx={{ mt: 3 }}>
                  <TextFieldWrapper
                    disabled={!isEditing}
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={
                      !!(
                        formik.touched.companyCity && formik.errors.companyCity
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyCity && formik.errors.companyCity
                    }
                    label={t("City")}
                    name="companyCity"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyCity}
                    required
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Typography sx={{ textAlign: "left" }} variant="h6">
                  {t("VAT Details")}
                </Typography>
              </Grid>

              <Grid item md={8} xs={12}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!formik.values.noVat}
                        color="primary"
                        edge="end"
                        disabled={!isEditing}
                        name="haveVat"
                        onChange={() => {
                          if (!formik.values.noVat) {
                            const vat = taxes?.results?.find(
                              (tax: any) => tax.tax === 0
                            );
                            formik.setFieldValue("noVat", true);
                            formik.setFieldValue("vatNumber", "0");
                            formik.setFieldValue("percentage", "0");
                            formik.setFieldValue("vatRef", vat?._id);
                            formik.setFieldValue("vatExpiry", null);
                            formik.setFieldValue("vatFile", []);
                          } else {
                            formik.setFieldValue("noVat", false);
                            formik.setFieldValue("percentage", "");
                            formik.setFieldValue("vatRef", "");
                          }
                        }}
                        sx={{
                          mr: 0.2,
                        }}
                      />
                    }
                    label={t("I am not registered to VAT")}
                  />
                </Box>
                {formik.values?.noVat && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <TextFieldWrapper
                        inputProps={{
                          minLength: 15,
                          maxLength: 15,
                        }}
                        disabled={!isEditing}
                        error={
                          !!(
                            formik.touched.vatNumber && formik.errors.vatNumber
                          )
                        }
                        fullWidth
                        helperText={
                          formik.touched.vatNumber && formik.errors.vatNumber
                        }
                        label={t("VAT Registration Number")}
                        name="vatNumber"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange("vatNumber")(
                            e.target.value.trim()
                          );
                        }}
                        value={formik.values.vatNumber
                          .replace(/[^A-Za-z0-9]/, "")
                          .trim()}
                        required
                        sx={{ mt: 2 }}
                      />

                      <NewFileDropzone
                        disabled={!isEditing}
                        accept={{
                          "image/*": [],
                          "application/pdf": [],
                        }}
                        caption="(SVG, JPG, PNG, PDF, or gif)"
                        files={formik.values.vatFile}
                        imageName={getUploadedDocName(formik.values.vatUrl)}
                        uploadedImageUrl={formik.values.vatUrl}
                        onDrop={vatCertificateFileDrop}
                        onUpload={handleUploadVAT}
                        onRemove={vatCertificateFileRemove}
                        onRemoveAll={vatCertificateFileRemoveAll}
                        maxFiles={1}
                        isUploaded={isUploaded}
                        setIsUploaded={setIsUploaded}
                        isUploading={isVatUploading}
                        ImageURL={formik.values.vatUrl}
                      />

                      {Boolean(formik.touched.vatUrl) && (
                        <Typography
                          color="error.main"
                          sx={{
                            mb: 3,
                            fontSize: "12px",
                            fontWeight: 500,
                            margin: "5px 14px 0 14px",
                          }}
                        >
                          {formik.errors.vatUrl}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <TaxDropdown
                        required
                        disabled={!isEditing}
                        error={formik.touched.vatRef && formik.errors.vatRef}
                        onChange={(id, tax) => {
                          if (id && tax >= 0) {
                            formik.setFieldValue("vatRef", id || "");
                            formik.setFieldValue("percentage", tax || "");
                          }
                        }}
                        selectedId={formik.values.vatRef}
                        label={t("VAT Percentage")}
                        id="vatRef"
                      />
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <DatePicker
                        disabled={!isEditing}
                        //@ts-ignore
                        inputProps={{ disabled: true }}
                        label="Vat Expiry"
                        inputFormat="dd/MM/yyyy"
                        onChange={(date: Date): void => {
                          formik.setFieldValue("vatExpiry", date);
                        }}
                        minDate={new Date()}
                        disablePast
                        value={formik.values.vatExpiry}
                        renderInput={(
                          params: JSX.IntrinsicAttributes & TextFieldProps
                        ) => (
                          <TextFieldWrapper
                            required
                            fullWidth
                            {...params}
                            error={Boolean(
                              formik.touched.vatExpiry &&
                                formik.errors.vatExpiry
                            )}
                            helperText={
                              (formik.touched.vatExpiry &&
                                formik.errors.vatExpiry) as any
                            }
                            onBlur={formik.handleBlur("vatExpiry")}
                          />
                        )}
                      />
                    </Box>
                  </>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box
          sx={{
            my: 4,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {isEditing && (
            <Button
              sx={{
                mr: 2,
                borderColor: "neutral.500",
                color: "neutral.500",
                "&:hover": {
                  borderColor: "neutral.500",
                  color: "neutral.500",
                  backgroundColor: "neutral.100",
                },
              }}
              variant="outlined"
              onClick={() => {
                // formik.setFieldValue(
                //   "profilePicture",
                //   isCustomer
                //     ? context?.profilePicture
                //     : context?.owner?.profilePicture
                // );
                handleEdit();
              }}
            >
              {t("Cancel")}
            </Button>
          )}
          <Button
            onClick={() => {
              if (isEditing) {
                return formik.handleSubmit();
              }
              handleEdit();
            }}
            variant={isEditing ? "contained" : "outlined"}
          >
            {isEditing ? t("Save") : t("Edit")}
          </Button>
        </Box>

        {userType === "app:admin" && (
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6">{t("Delete Account")}</Typography>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack alignItems="flex-start" spacing={2}>
                    <Typography variant="h6">
                      {t(
                        "Are you sure you want to delete the company account?"
                      )}
                    </Typography>
                    <Typography variant="subtitle1">
                      {t(
                        "This will delete your company account and data on Tijarah360. This is irrevocable."
                      )}
                    </Typography>
                    <Button
                      color="error"
                      onClick={() => {
                        setOpenCompanyDeleteModal(true);
                      }}
                      variant="outlined"
                    >
                      {t("Delete Account")}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        <CompanyDeleteModal
          open={openCompanyDeleteModal}
          handleClose={() => {
            setOpenCompanyDeleteModal(false);
          }}
          id={companyContext._id}
        />
      </Box>
    </>
  );
};

export default withPermission(Page, MoleculeType["account:read"]);
