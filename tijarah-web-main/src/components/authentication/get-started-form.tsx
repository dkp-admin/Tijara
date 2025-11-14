import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  Unstable_Grid2 as Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { FC, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { FileDropzone } from "src/components/file-dropzone";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useRouter } from "src/hooks/use-router";
import { tijarahPaths } from "src/paths";
import { DropdownOptions } from "src/types/dropdown";
import countries from "src/utils/countries.json";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import parsePhoneNumber from "src/utils/parse-phone-number";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import BusinessTypeDropdown from "../input/business-type-complete";
import TaxDropdown from "../input/tax-auto-complete";
import PhoneInput from "../phone-input";
import TextFieldWrapper from "../text-field-wrapper";

interface Values {
  companyNameEng: string;
  companyNameAr: string;
  companyPhone: string;
  companyEmail: string;
  Industry: string;
  businessTypeRef: string;
  businessType: string;
  companyLogoFile: any[];
  companyLogoUrl: string;
  companyAddressLine1: string;
  companyAddressLine2?: string;
  companyCity: string;
  companyState: string;
  companyPostalCode: string;
  companyCountry: string;
  subscriptionExpiry: Date;
  importGlobalProducts: boolean;
  vatFile: any[];
  vatUrl: string;
  vatNumber: string;
  vatRef: string;
  Percentage: string;
}

export const GetStartedForm: FC = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const authContext = useContext(AuthContext);

  const [country, setCountry] = useState("+966");
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const lng = localStorage.getItem("currentLanguage");
  const { find, entities: businessTypes } = useEntity("business-type");

  const IndustryOptions: DropdownOptions[] = [
    {
      label: t("Retail"),
      value: "retail",
    },
    {
      label: t("Food"),
      value: "food",
    },
    {
      label: t("Services"),
      value: "services",
    },
  ];

  const today = new Date();
  today.setMonth(today.getMonth() + 1);

  const oneMonthExpiry = new Date(today);
  oneMonthExpiry.setHours(0, 0, 0, 0);

  const initialValues: Values = {
    companyNameEng: "",
    companyNameAr: "",
    companyPhone: "",
    companyEmail: "",
    Industry: "retail",
    businessTypeRef: "",
    businessType: "",
    companyLogoFile: [],
    companyLogoUrl: "",
    companyAddressLine1: "",
    companyAddressLine2: "",
    companyCity: "",
    companyState: "",
    companyPostalCode: "",
    companyCountry: "Saudi Arabia",
    subscriptionExpiry: oneMonthExpiry,
    importGlobalProducts: false,
    vatFile: [],
    vatUrl: "",
    vatNumber: "",
    vatRef: "",
    Percentage: "",
  };

  const validationSchema = Yup.object({
    companyNameEng: Yup.string()
      .required(t("Company Name is required"))
      .max(60),
    companyNameAr: Yup.string().required(t("Company Name is required")).max(60),
    companyEmail: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(70)
      .required(`${t("Email is required")}`),
    companyPhone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .max(12, t("Phone Number should not be maximum 12 digits"))
      .required(`${t("Phone number is required")}`),
    Industry: Yup.string().required(t("Industry is required")),
    businessTypeRef: Yup.string().required(t("Business Type is required")),
    companyAddressLine1: Yup.string()
      .required(t("Address Line 1 is required"))
      .max(60, t("Address line 1 must not be greater than 60 characters")),
    companyCity: Yup.string()
      .required(t("City is required"))
      .max(40, t("City name must not be greater than 40 characters")),
    // companyState: Yup.string().required(t("State is required")),
    companyPostalCode: Yup.string()
      .required(t("Postal Code is required"))
      .max(10, t("Postal code should not be greater than 10 digits")),
    companyCountry: Yup.string().required(t("Country is required")),
    vatUrl: Yup.string().required(t("Please Upload VAT Document")),
    vatNumber: Yup.string()
      .matches(
        /^3\d{13}3$/,

        `${t(
          "VAT Registartion Number must start and end with 3 and have 15 numbers"
        )},` + ` ${t(" Hint")}: ${"3XXXXXXXXXXXXXX3"}`
      )
      .required(t("VAT Number is required")),
    vatRef: Yup.string().required(t("Please select the VAT percentage")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      const data = {
        logo: values.companyLogoUrl,
        name: {
          en: values.companyNameEng,
          ar: values.companyNameAr,
        },
        phone: parsePhoneNumber(country, values.companyPhone),
        email: values.companyEmail,
        businessType: values.businessType,
        businessTypeRef: values.businessTypeRef,
        address: {
          address1: values.companyAddressLine1,
          address2: values.companyAddressLine2,
          state: values?.companyState,
          city: values.companyCity,
          postalCode: values.companyPostalCode,
          country: values.companyCountry,
        },
        subscriptionEndDate: new Date(values.subscriptionExpiry),
        vat: {
          url: values.vatUrl,
          docNumber: values.vatNumber,
          percentage: values.Percentage,
          vatRef: values.vatRef,
        },
        importGlobalProducts: values.importGlobalProducts,
      };

      try {
        const res = await serviceCaller(endpoint.onboard.path, {
          method: endpoint.onboard.method,
          body: { ...data },
        });

        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, company: res.user })
        );
        localStorage.setItem("currentLanguage", "en");

        toast.success(
          t("Your account has been created successfully!").toString()
        );

        router.push(tijarahPaths.dashboard.salesDashboard);
        // router.push(tijarahPaths.orders);

        authContext.updateUser({ ...user, company: res.user });
      } catch (error) {
        setLoading(false);

        if (
          error.error.code == "duplicate_record" &&
          error.error.field == "vat.docNumber"
        ) {
          toast.error(t("VAT number already exists"));
        } else {
          toast.error(t(error.message).toString());
        }
      }
    },
  });

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const companyLogoFileDrop = (newFiles: any): void => {
    formik.setFieldValue("companyLogoFile", newFiles);
  };

  const companyLogoFileRemove = (): void => {
    formik.setFieldValue("companyLogoFile", []);
    formik.setFieldValue("companyLogoUrl", "");
  };

  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("companyLogoFile", []);
  };

  const vatCertificateFileDrop = (newFiles: any): void => {
    formik.setFieldValue("vatFile", newFiles);
  };

  const vatCertificateFileRemove = (): void => {
    formik.setFieldValue("vatFile", []);
    formik.setFieldValue("vatUrl", "");
  };

  const vatCertificateFileRemoveAll = (): void => {
    formik.setFieldValue("vatFile", []);
  };

  const handleUploadLogo = async (files: any) => {
    setIsUploading(true);
    try {
      const url = await upload(files, FileUploadNamespace["company-logos"]);
      formik.setFieldValue("companyLogoUrl", url);

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUploadVAT = async (files: any) => {
    setIsUploading(true);
    try {
      const url = await upload(files, FileUploadNamespace["vat-certificates"]);
      formik.setFieldValue("vatUrl", url);

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    find({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 100,
      _q: "",
    });
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Basic Details")}</Typography>
              </Grid>
              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6">{t("Logo")}</Typography>
                    {/* <Typography
                      color="textSecondary"
                      sx={{ mt: 1 }}
                      variant="body2"
                    >
                      {t("Please upload the company logo")}
                    </Typography> */}

                    <Box sx={{ my: 2 }}>
                      <FileDropzone
                        accept={{ "image/*": [] }}
                        caption="(SVG, JPG, PNG, or gif)"
                        files={formik.values.companyLogoFile}
                        imageName={getUploadedDocName(
                          formik.values.companyLogoUrl
                        )}
                        uploadedImageUrl={getUploadedDocName(
                          formik.values.companyLogoUrl
                        )}
                        onDrop={companyLogoFileDrop}
                        onUpload={handleUploadLogo}
                        onRemove={companyLogoFileRemove}
                        onRemoveAll={logoFileRemoveAll}
                        maxFiles={1}
                        isUploaded={isUploaded}
                        setIsUploaded={setIsUploaded}
                        isUploading={isUploading}
                        fileDataTestId="company-logo-file"
                      />

                      {Boolean(formik.touched.companyLogoUrl) && (
                        <Typography
                          color="error.main"
                          sx={{
                            fontSize: "12px",
                            fontWeight: 500,
                            margin: "5px 14px 0 14px",
                          }}
                        >
                          {formik.errors.companyLogoUrl}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <TextFieldWrapper
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={
                      !!(
                        formik.touched.companyNameEng &&
                        formik.errors.companyNameEng
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyNameEng &&
                      formik.errors.companyNameEng
                    }
                    label={t("Company Name (English)")}
                    name="companyNameEng"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyNameEng}
                    required
                  />

                  <TextFieldWrapper
                    inputProps={{ style: { textTransform: "capitalize" } }}
                    error={
                      !!(
                        formik.touched.companyNameAr &&
                        formik.errors.companyNameAr
                      )
                    }
                    fullWidth
                    helperText={
                      formik.touched.companyNameAr &&
                      formik.errors.companyNameAr
                    }
                    label={t("Company Name (Arabic)")}
                    name="companyNameAr"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.companyNameAr}
                    required
                  />

                  <PhoneInput
                    onChange={formik.handleChange("companyPhone")}
                    touched={formik.touched.companyPhone}
                    error={formik.errors.companyPhone}
                    value={formik.values.companyPhone}
                    onBlur={formik.handleBlur("companyPhone")}
                    country={country}
                    handleChangeCountry={handleChangeCountry}
                    label={t("Phone")}
                    required={true}
                    style={{ mt: 1.5 }}
                  />

                  <TextFieldWrapper
                    fullWidth
                    required
                    label={t("Email")}
                    name="companyEmail"
                    onChange={formik.handleChange}
                    error={Boolean(
                      formik.touched.companyEmail && formik.errors.companyEmail
                    )}
                    helperText={
                      formik.touched.companyEmail && formik.errors.companyEmail
                    }
                    onBlur={formik.handleBlur}
                    value={formik.values.companyEmail}
                    sx={{ mt: 3 }}
                  />

                  <TextFieldWrapper
                    error={
                      !!(formik.touched.Industry && formik.errors.Industry)
                    }
                    fullWidth
                    label={t("Industry")}
                    name="Industry"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    select
                    value={formik.values.Industry}
                    disabled
                    required
                  >
                    {IndustryOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextFieldWrapper>

                  <Box>
                    <BusinessTypeDropdown
                      required
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
                    />
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Company Address")}</Typography>
              </Grid>
              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <TextFieldWrapper
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
                  >
                    {countries.map((country: any) => (
                      <MenuItem key={country.code} value={country.name.en}>
                        {country?.name?.[lng] || country?.name?.en}
                      </MenuItem>
                    ))}
                  </TextFieldWrapper>
                  <TextFieldWrapper
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

                  <TextFieldWrapper
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

                  <TextFieldWrapper
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

                  <TextFieldWrapper
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

                  {formik.values.companyCountry == "Saudi Arabia" ? (
                    <></>
                  ) : (
                    <TextFieldWrapper
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      fullWidth
                      label={t("State")}
                      name="companyState"
                      error={Boolean(
                        formik.touched.companyState &&
                          formik.errors.companyState
                      )}
                      helperText={
                        (formik.touched.companyState &&
                          formik.errors.companyState) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.companyState}
                      // required
                    />
                  )}
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Stack spacing={1}>
                  <Typography variant="h6">{t("VAT Details")}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {t("Upload VAT certificate with number")}
                  </Typography>
                </Stack>
              </Grid>
              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <Box>
                    <FileDropzone
                      accept={{ "image/*": [] }}
                      caption="(SVG, JPG, PNG, or gif)"
                      files={formik.values.vatFile}
                      imageName=""
                      uploadedImageUrl=""
                      onDrop={vatCertificateFileDrop}
                      onUpload={handleUploadVAT}
                      onRemove={vatCertificateFileRemove}
                      onRemoveAll={vatCertificateFileRemoveAll}
                      maxFiles={1}
                      isUploaded={isUploaded}
                      setIsUploaded={setIsUploaded}
                      isUploading={isUploading}
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

                  <TextFieldWrapper
                    inputProps={{
                      minLength: 15,
                      maxLength: 15,
                      style: { textTransform: "uppercase" },
                    }}
                    error={
                      !!(formik.touched.vatNumber && formik.errors.vatNumber)
                    }
                    fullWidth
                    helperText={
                      formik.touched.vatNumber && formik.errors.vatNumber
                    }
                    label={t("VAT Registration Number")}
                    name="vatNumber"
                    onBlur={formik.handleBlur}
                    onChange={(e) => {
                      formik.handleChange("vatNumber")(e.target.value.trim());
                    }}
                    value={formik.values.vatNumber
                      .replace(/[^A-Za-z0-9]/, "")
                      .trim()}
                    required
                  />

                  <TaxDropdown
                    required
                    error={formik.touched.vatRef && formik.errors.vatRef}
                    onChange={(id, tax) => {
                      if (id && tax >= 0) {
                        formik.setFieldValue("vatRef", id || "");
                        formik.setFieldValue("Percentage", tax || "");
                      }
                    }}
                    selectedId={formik.values.vatRef}
                    label={t("VAT Percentage")}
                    id="vatRef"
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Grid container spacing={3}>
              <Grid xs={12} md={4}>
                <Typography variant="h6">{t("Global Products")}</Typography>
              </Grid>
              <Grid xs={12} md={8}>
                <Stack spacing={3}>
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="space-between"
                    spacing={3}
                  >
                    <Stack spacing={1}>
                      <Typography gutterBottom variant="subtitle1">
                        {t("Import Global Products")}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {formik.values.importGlobalProducts
                          ? t(
                              "Enabling this feature will import all global products and their variants from the selected business type to your products list"
                            )
                          : t(
                              "When this feature is disabled, importing global products in bulk will not be possible. However, you can still import them individually by navigating to the global products page"
                            )}
                      </Typography>
                    </Stack>
                    <Switch
                      checked={formik.values.importGlobalProducts}
                      color="primary"
                      edge="start"
                      name="importGlobalProducts"
                      onChange={formik.handleChange}
                      value={formik.values.importGlobalProducts}
                    />
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <LoadingButton
            loading={loading}
            disabled={loading}
            onClick={formik.handleSubmit as any}
            size="large"
            variant="contained"
            sx={{ width: "50%" }}
            type="submit"
            data-testid="get-started"
          >
            {t("Get Started")}
          </LoadingButton>
        </Box>
      </Stack>
    </form>
  );
};
