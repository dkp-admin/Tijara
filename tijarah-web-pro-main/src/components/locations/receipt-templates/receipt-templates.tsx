import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { t } from "i18next";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LocationAutoCompleteDropdown from "src/components/input/location-singleSelect";
import PhoneInput from "src/components/phone-input";
import { LogoUploader } from "src/components/print-template-logo-uploader";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { MoleculeType } from "src/permissionManager";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";

interface ReceiptTemplatesProps {
  companyRef?: string;
  companyName?: string;
  vatRef?: any;
}

interface Values {
  location: string;
  locationRef: string;
  companyRef: string;
  locationNameEng: string;
  locationNameAr: string;
  vatNumber: string;
  address: string;
  invoiceFooter: string;
  noOfBillPrints?: number;
  returnPolicy: string;
  customText: string;
  receiptBarcode: boolean;
  showToken: boolean;
  resetCounterDaily: boolean;
  showOrderType: boolean;
  showCustomerInfo: boolean;
  emptyVat: boolean;
  email: string;
  phone: string;
  logo: string;
}

const initialValues: Values = {
  location: "",
  locationRef: "",
  companyRef: "",
  locationNameEng: "",
  locationNameAr: "",
  vatNumber: "",
  address: "",
  invoiceFooter: "",
  noOfBillPrints: 0,
  returnPolicy: "",
  customText: "",
  receiptBarcode: false,
  showToken: false,
  resetCounterDaily: false,
  showOrderType: false,
  showCustomerInfo: false,
  emptyVat: false,
  email: "",
  phone: "",
  logo: "",
};

const validationSchema = Yup.object({
  noVat: Yup.boolean(),
  locationNameEng: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      t("Enter valid location/business")
    )
    .required("Location/Business Name is required"),
  locationNameAr: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      t("Enter valid location/business")
    )
    .required("Location/Business Name is required"),
  emptyVat: Yup.boolean(),
  vatNumber: Yup.string().when("emptyVat", {
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
  address: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      t("Enter valid address")
    )
    .required("Address is required"),
  invoiceFooter: Yup.string()
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      t("Enter valid footer name")
    )
    .required("Invoice Footer is required")
    .max(60),
  returnPolicy: Yup.string().max(600),
  customText: Yup.string().max(600),
});

export const ReceiptTemplates: FC<ReceiptTemplatesProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { changeTab } = useActiveTabs();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["receipt-template:update"]);
  const { user } = useAuth();
  const [country, setCountry] = useState("+966");

  const { id, origin, companyRef } = router.query;

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const { entities, create, updateEntity, find } = useEntity("print-template");

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        locationRef: id,
        companyRef: companyRef,
        name: values?.locationNameEng.trim(),
        location: {
          name: {
            en: values?.locationNameEng.trim(),
            ar: values?.locationNameAr.trim(),
          },
          address: values.address.trim(),
          vat: values.vatNumber,
        },

        footer: values.invoiceFooter.trim(),
        returnPolicy: values.returnPolicy,
        customText: values.customText,
        showToken: values.showToken,
        resetCounterDaily: values.resetCounterDaily,
        showOrderType: values.showOrderType,
        showCustomerInfo: values.showCustomerInfo,
        email: values?.email?.trim() || "",
        phone: parsePhoneNumber(country, values.phone),
        logo: values?.logo?.trim() || "",
      };

      try {
        if (entities?.results?.length > 0) {
          await updateEntity(entities?.results[0]?._id, { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          entities?.results?.length > 0
            ? t("receipt template updated info messages").toString()
            : t("Details Created").toString()
        );
        setIsEditing(false);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      find({
        page: 0,
        limit: 100,
        _q: "",
        activeTab: "active",
        sort: "asc",
        locationRef: id.toString(),
      });
    }
  }, [id]);

  useEffect(() => {
    if (id && entities?.results?.length > 0) {
      const locationData = entities.results[0];

      formik.setValues({
        location: "",
        locationRef: locationData?.locationRef,
        companyRef: locationData?.companyRef,
        locationNameEng: locationData?.location?.name?.en,
        locationNameAr: locationData?.location?.name?.ar,
        vatNumber: locationData?.location?.vat,
        address: locationData?.location?.address,
        invoiceFooter: locationData?.footer,
        returnPolicy: locationData.returnPolicy,
        customText: locationData?.customText,
        receiptBarcode: locationData?.printBarcode,
        showToken: locationData?.showToken,
        resetCounterDaily: locationData?.resetCounterDaily,
        showOrderType: locationData?.showOrderType,
        showCustomerInfo: locationData?.showCustomerInfo ?? false,
        emptyVat: Boolean(Number(user?.company?.vat?.percentage)),
        email: locationData?.email?.trim() || "",
        phone: locationData?.phone?.split("-")?.[1],
        logo: locationData?.logo?.trim() || "",
      });
    } else {
      formik.resetForm();
    }
  }, [entities?.results, id]);

  useEffect(() => {
    if (!user?.company?.vat?.vatRef) {
      formik.setFieldValue("noVat", true);
    } else {
      formik.setFieldValue("noVat", false);
    }
  }, []);

  return (
    <>
      <Box>
        <Box sx={{ maxWidth: 60, cursor: "pointer" }}>
          <Link
            color="textPrimary"
            component="a"
            sx={{
              alignItems: "center",
              display: "flex",
            }}
            onClick={() => {
              if (origin == "company") {
                changeTab("locations", Screens?.companyDetail);
              }
              router.back();
            }}
          >
            <ArrowBackIcon fontSize="small" sx={{ mr: 1, color: "#6B7280" }} />
            <Typography variant="subtitle2">{t("Locations")}</Typography>
          </Link>
        </Box>
        <Typography variant="h4" sx={{ my: 3 }}>
          {t("Receipt Template")}
        </Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Grid container>
                <Grid xs={12} md={4}>
                  <Typography variant="h6">{t("Location Details")}</Typography>
                </Grid>

                <Grid xs={12} md={8}>
                  <Stack spacing={3}>
                    <LogoUploader
                      origin="print-template"
                      disabled={!isEditing}
                      imageUploadUrl={
                        formik.values.logo != null && formik.values.logo
                      }
                      onSuccess={(url: string) =>
                        formik.handleChange("logo")(url)
                      }
                    />

                    <Box>
                      <LocationAutoCompleteDropdown
                        showAllLocation={false}
                        companyRef={companyRef}
                        required
                        onChange={(id, name) => {
                          formik.handleChange("locationRef")(id || "");
                          formik.handleChange("location")(name || "");
                        }}
                        selectedId={formik?.values?.locationRef}
                        label={t("Location")}
                        id="locationRef"
                        disabled={true}
                      />
                    </Box>

                    <TextFieldWrapper
                      disabled={isEditing == false}
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(
                          formik.touched.locationNameEng &&
                          formik.errors.locationNameEng
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.locationNameEng &&
                        formik.errors.locationNameEng
                      }
                      label={t("Location/Business Name (English)")}
                      name="locationNameEng"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.locationNameEng}
                      required
                    />

                    <TextFieldWrapper
                      disabled={isEditing == false}
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(
                          formik.touched.locationNameAr &&
                          formik.errors.locationNameAr
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.locationNameAr &&
                        formik.errors.locationNameAr
                      }
                      label={t("Location/Business Name (Arabic)")}
                      name="locationNameAr"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.locationNameAr}
                      required
                    />

                    <TextFieldWrapper
                      disabled={isEditing == false}
                      error={
                        !!(formik.touched.vatNumber && formik.errors.vatNumber)
                      }
                      fullWidth
                      helperText={
                        formik.touched.vatNumber && formik.errors.vatNumber
                      }
                      label={t("VAT Number")}
                      name="vatNumber"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange("vatNumber")(
                          e.target.value?.trim()
                        );
                      }}
                      value={formik.values.vatNumber
                        ?.replace(/[^A-Za-z0-9]/, "")
                        ?.trim()}
                      required={!!Number(user?.company?.vat?.percentage)}
                    />

                    <TextFieldWrapper
                      disabled={isEditing == false}
                      error={!!(formik.touched.email && formik.errors.email)}
                      fullWidth
                      helperText={formik.touched.email && formik.errors.email}
                      label={t("Email")}
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange("email")(e.target.value?.trim());
                      }}
                      value={formik.values.email?.trim()}
                      required={false}
                    />
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

                    <TextFieldWrapper
                      disabled={isEditing == false}
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(formik.touched.address && formik.errors.address)
                      }
                      fullWidth
                      helperText={
                        formik.touched.address && formik.errors.address
                      }
                      label={t("Address")}
                      name="address"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.address}
                      required
                    />

                    <Grid container>
                      <Grid
                        md={3}
                        xs={6}
                        item
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                color="primary"
                                disabled={!isEditing}
                                name="showToken"
                                checked={formik.values.showToken}
                                onChange={formik.handleChange}
                                value={formik.values.showToken}
                              />
                            }
                            label={t("Show Token")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                            }}
                          />
                        </Box>
                      </Grid>

                      {formik.values.showToken && (
                        <Grid
                          md={4}
                          xs={6}
                          item
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  color="primary"
                                  disabled={!isEditing}
                                  name="resetCounterDaily"
                                  checked={formik.values.resetCounterDaily}
                                  onChange={formik.handleChange}
                                  value={formik.values.resetCounterDaily}
                                />
                              }
                              label={t("Reset Counter Daily")}
                              sx={{
                                flexGrow: 1,
                                mr: 0,
                              }}
                            />
                          </Box>
                        </Grid>
                      )}

                      <Grid
                        md={4}
                        xs={6}
                        item
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formik.values.showOrderType}
                                color="primary"
                                name="showOrderType"
                                onChange={formik.handleChange}
                                value={formik.values.showOrderType}
                                disabled={!isEditing}
                              />
                            }
                            label={t("Show Order Type")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                            }}
                          />
                        </Box>
                      </Grid>

                      <Grid
                        md={4}
                        xs={6}
                        item
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={formik.values.showCustomerInfo}
                                color="primary"
                                name="showCustomerInfo"
                                onChange={formik.handleChange}
                                value={formik.values.showCustomerInfo}
                                disabled={!isEditing}
                              />
                            }
                            label={t("Show Customer Info")}
                            sx={{
                              flexGrow: 1,
                              mr: 0,
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Grid container>
                <Grid
                  // xs={12}
                  md={4}
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexDirection: "row",
                  }}
                >
                  <Typography variant="h6">{t("Other Details")}</Typography>
                  <Tooltip
                    sx={{ ml: 1 }}
                    title={t(
                      "You can add other details in Englis and Arabic as well!"
                    )}
                  >
                    <SvgIcon color="action">
                      <InfoCircleIcon />
                    </SvgIcon>
                  </Tooltip>
                </Grid>

                <Grid xs={12} md={8}>
                  <Stack spacing={4}>
                    <Box>
                      <TextFieldWrapper
                        disabled={isEditing == false}
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        label={t("Invoice Footer")}
                        name="invoiceFooter"
                        multiline
                        rows={2}
                        fullWidth
                        value={formik.values.invoiceFooter}
                        onChange={formik.handleChange("invoiceFooter")}
                        onBlur={formik.handleBlur}
                        error={
                          !!(
                            formik.touched.invoiceFooter &&
                            formik.errors.invoiceFooter
                          )
                        }
                        helperText={
                          formik.touched.invoiceFooter &&
                          formik.errors.invoiceFooter
                        }
                        required
                      />
                    </Box>
                    <Box>
                      <TextFieldWrapper
                        disabled={isEditing == false}
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        label={t("Return Policy")}
                        name="returnPolicy"
                        multiline
                        rows={4}
                        fullWidth
                        onChange={formik.handleChange("returnPolicy")}
                        value={formik.values.returnPolicy}
                        error={
                          !!(
                            formik.touched.returnPolicy &&
                            formik.errors.returnPolicy
                          )
                        }
                        helperText={
                          formik.touched.returnPolicy &&
                          formik.errors.returnPolicy
                        }
                      />
                    </Box>

                    <Box>
                      <TextFieldWrapper
                        disabled={isEditing == false}
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        label={t("Custom Text")}
                        name="customText"
                        multiline
                        rows={4}
                        fullWidth
                        onChange={formik.handleChange("customText")}
                        value={formik.values.customText}
                        error={
                          !!(
                            formik.touched.customText &&
                            formik.errors.customText
                          )
                        }
                        helperText={
                          formik.touched.customText && formik.errors.customText
                        }
                      />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* <Card>
                <CardContent>
                  <Grid container>
                    <Grid xs={12} md={4}>
                      <Typography variant="h6">
                        {t("Barcode Details")}
                      </Typography>
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
                              {t("Barcodes")}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t(
                                "Enabling this would show the barcode at the bottom of receipt"
                              )}
                            </Typography>
                          </Stack>

                          <Switch
                            checked={formik.values.receiptBarcode}
                            color="primary"
                            edge="start"
                            name="receiptBarcode"
                            onChange={formik.handleChange}
                            value={formik.values.receiptBarcode}
                          />
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card> */}

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
                  setIsEditing(false);
                }}
              >
                {t("Cancel")}
              </Button>
            )}
            <Button
              onClick={() => {
                if (!canUpdate) {
                  return toast.error(t("You don't have access"));
                }
                if (isEditing == true) {
                  return formik.handleSubmit();
                }
                setIsEditing(true);
              }}
              variant={isEditing == true ? "contained" : "outlined"}
            >
              {isEditing == true ? t("Save") : t("Edit")}
            </Button>
          </Box>
        </Stack>
      </form>
    </>
  );
};
