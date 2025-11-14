import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Button,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
  SvgIcon,
  Tooltip,
} from "@mui/material";
import countries from "src/utils/countries.json";

import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CompanyDropdown from "src/components/input/company-auto-complete";
import PhoneInput from "src/components/phone-input";
import { ProfileChooser } from "src/components/profile-chooser";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import i18n from "src/i18n";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import TextFieldWrapper from "../text-field-wrapper";
import { FileUploadNamespace } from "src/utils/uploadToS3";

interface OverviewTabsProps {}

interface VendorOverview {
  image?: string;
  company?: string;
  locationRefs?: string[];
  companyRef?: string;
  locations?: string[];
  fullName: string;
  tags?: string;
  website?: string;
  contactName?: string;
  orderEmail?: string;
  phone?: string;
  email?: string;
  vendorAverageFulfilment?: string;
  averageShippingDay?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  city?: string;
  state?: string;
  country?: string;
  note?: string;
  vatNumber?: string;
  status?: boolean;
}

const validationSchema = Yup.object({
  fullName: Yup.string()
    .max(60, i18n.t("Name should not exceed 60 letters"))
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    )
    .required(`${i18n.t("Name is required")}`),
  contactName: Yup.string()
    .max(60, i18n.t("Name should not exceed 60 letters"))
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    )
    .required(i18n.t("Enter valid name")),
  phone: Yup.string()
    .min(9, `${i18n.t("Phone Number should be minimum 9 digits")}`)
    .max(12, i18n.t("Phone Number should be maximum 12 digits"))
    .required(`${i18n.t("Phone is required")}`),
  vendorAverageFulfilment: Yup.string()
    .max(2, i18n.t("Days should be maximum 2 digits"))
    .nullable(),
  averageShippingDay: Yup.string()
    .max(2, i18n.t("Days should be maximum 2 digits"))
    .nullable(),
  website: Yup.string().max(
    90,
    i18n.t("Website should be maximum 90 character")
  ),
  tags: Yup.array().max(10, i18n.t("Tags Can be maximum 10")),
  city: Yup.string().max(40, i18n.t("City should be maximum 40 character")),
  postalCode: Yup.string()
    .max(10, i18n.t("Postal Code should be maximum 10 digits"))
    .nullable(),
  addressLine1: Yup.string().max(
    60,
    i18n.t("Address Line 1 should be maximum 60 digits")
  ),
  addressLine2: Yup.string().max(
    60,
    i18n.t("Address Line 2 should be maximum 60 digits")
  ),
  note: Yup.string().max(250, i18n.t("Note should be maximum 250 character")),
  vatNumber: Yup.string().matches(
    /^3\d{13}3$/,
    i18n.t(
      "VAT Registartion Number must start and end with 3 and have 15 numbers"
    )
  ),
  email: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(255)
    .required(`${i18n.t("Contact Person Email is required")}`),
  orderEmail: Yup.string()
    .email(`${i18n.t("Must be a valid email")}`)
    .max(255)
    .required(`${i18n.t("Order email is required")}`),
});

export const OverviewTabs: FC<OverviewTabsProps> = (props) => {
  const { t } = useTranslation();
  const { userType } = useUserType();
  const router = useRouter();
  const { id, companyRef, companyName, origin } = router.query;
  const [country, setCountry] = useState("+966");
  const [showError, setShowError] = useState(false);
  const { changeTab } = useActiveTabs();
  const canAccess = usePermissionManager();

  const canUpdate = canAccess(MoleculeType["vendor:update"]);
  const canCreate = canAccess(MoleculeType["vendor:create"]);
  const lng = localStorage.getItem("currentLanguage");
  const { findOne, create, updateEntity, entity, loading } =
    useEntity("vendor");

  usePageView();

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const initialValues: VendorOverview = {
    company: "",
    locationRefs: [],
    locations: [],
    companyRef: "",
    image: "",
    fullName: "",
    tags: "",
    website: "",
    contactName: "",
    orderEmail: "",
    phone: "",
    email: "",
    vendorAverageFulfilment: "",
    averageShippingDay: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    city: "",
    state: "",
    country: "Saudi Arabia",
    note: "",
    vatNumber: "",
    status: true,
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        image: values.image,
        companyRef: companyRef,
        name: values.fullName.trim(),
        tags: values.tags,
        website: values.website.trim(),
        contactName: values.contactName.trim(),
        email: values.email.trim(),
        phone: parsePhoneNumber(country, values.phone),
        orderEmail: values.orderEmail.trim(),
        vendorAverageFulfilment: values.vendorAverageFulfilment,
        averageShippingDay: values.averageShippingDay,
        address: {
          address1: values.addressLine1.trim(),
          address2: values.addressLine2.trim(),
          postalCode: values.postalCode,
          city: values.city.trim(),
          country: values.country,
          state: values.state,
        },
        note: values.note.trim(),
        vat: {
          docNumber: values.vatNumber,
        },
        status: values.status ? "active" : "inactive",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
          toast.success(t("Vendor Details Updated").toString());
        } else {
          await create({ ...data });
          toast.success(t("New Vendor Created").toString());
        }
        if (origin == "company") {
          changeTab("inventoryManagement", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        if (err.message == "duplicate_record_message") {
          toast.error(`${"Email or Phone alredy exists"}`);
        } else {
          toast.error(err.message || err.code);
        }
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity != null) {
      const phoneNumber = entity.phone
        ? entity.phone?.toString().split("-")[1]
        : "";

      setCountry(phoneNumber ? entity.phone?.toString().split("-")[0] : "+966");

      formik.setValues({
        fullName: entity.name,
        image: entity.image,
        tags: entity.tags || "",
        phone: phoneNumber,
        email: entity.email,
        website: entity.website,
        contactName: entity.contactName,
        orderEmail: entity.orderEmail,
        averageShippingDay: entity.averageShippingDay,
        vendorAverageFulfilment: entity.vendorAverageFulfilment,
        addressLine1: entity.address?.address1,
        addressLine2: entity.address?.address2 || "",
        postalCode: entity.address?.postalCode || "",
        city: entity.address.city,
        state: entity.address.state,
        country: entity?.address?.country,
        note: entity?.note,
        vatNumber: entity?.vat?.docNumber,
        status: entity?.status == "active" ? true : false,
      });
    }
  }, [entity, countries]);

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

  return (
    <>
      <form noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={4}>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">
                    {t("Vendor/Company Details")}
                  </Typography>
                </Grid>
                <Grid item container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(formik.touched.fullName && formik.errors.fullName)
                      }
                      fullWidth
                      helperText={
                        formik.touched.fullName && formik.errors.fullName
                      }
                      label={t("Vendor/Company Name")}
                      name="fullName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.fullName}
                      required
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      inputProps={{
                        minLength: 15,
                        maxLength: 15,
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
                        ?.replace(/[^A-Za-z0-9]/, "")
                        ?.trim()}
                    />
                  </Grid>
                  <Grid
                    item
                    md={6}
                    xs={12}
                    alignItems="center"
                    style={{ display: "inline-flex" }}
                  >
                    <Autocomplete
                      disabled={id != null && !canUpdate}
                      freeSolo
                      multiple
                      fullWidth
                      options={[]}
                      value={
                        Array.isArray(formik.values.tags)
                          ? formik.values.tags.filter(
                              (tag: any) => tag.trim() !== ""
                            )
                          : []
                      }
                      inputValue={formik.values.inputValue}
                      onInputChange={(_, value) =>
                        formik.setFieldValue("inputValue", value)
                      }
                      onChange={(_, values) =>
                        formik.setFieldValue(
                          "tags",
                          Array.isArray(values)
                            ? values.filter((value) => value.trim() !== "")
                            : []
                        )
                      }
                      renderInput={(params) => (
                        <TextFieldWrapper
                          disabled={id != null && !canUpdate}
                          {...params}
                          label={t("Tags")}
                          helperText={formik.touched.tags && formik.errors.tags}
                          error={!!(formik.touched.tags && formik.errors.tags)}
                        />
                      )}
                    />
                    <Tooltip
                      title={t(
                        "Type a word and press ‘Enter’ to create the tag"
                      )}
                      style={{ marginLeft: "6px" }}
                    >
                      <SvgIcon color="action">
                        <InfoCircleIcon />
                      </SvgIcon>
                    </Tooltip>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      error={
                        !!(formik.touched.website && formik.errors.website)
                      }
                      fullWidth
                      helperText={
                        formik.touched.website && formik.errors.website
                      }
                      label={t("Website")}
                      name="website"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.website}
                    />
                  </Grid>
                  {/* <Grid item md={6} xs={12}></Grid> */}

                  <Grid item md={6} xs={12}>
                    <Typography
                      sx={{ mb: 2 }}
                      color="text.secondary"
                      variant="h6"
                    >
                      {t("Company logo")}
                    </Typography>
                    <ProfileChooser
                      disabled={id != null && !canUpdate}
                      imageUploadUrl={
                        formik.values.image != null && formik.values.image
                      }
                      onSuccess={(url: any) =>
                        formik.handleChange("image")(url)
                      }
                      namespace={FileUploadNamespace["vendor-profile-images"]}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item md={12} xs={12}>
                  <Typography variant="h6">{t("Other Details")}</Typography>
                </Grid>
                <Grid item container spacing={3}>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      inputProps={{ style: { textTransform: "capitalize" } }}
                      error={
                        !!(
                          formik.touched.contactName &&
                          formik.errors.contactName
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.contactName && formik.errors.contactName
                      }
                      label={t("Contact Name")}
                      name="contactName"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      value={formik.values.contactName}
                      required
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      error={!!(formik.touched.email && formik.errors.email)}
                      fullWidth
                      helperText={formik.touched.email && formik.errors.email}
                      label={t("Contact Person Email")}
                      name="email"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      value={formik.values.email}
                      required
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PhoneInput
                      disabled={id != null && !canUpdate}
                      touched={formik.touched.phone}
                      error={formik.errors.phone}
                      value={formik.values.phone}
                      onBlur={formik.handleBlur("phone")}
                      country={country}
                      handleChangeCountry={handleChangeCountry}
                      onChange={formik.handleChange("phone")}
                      style={{ mt: "-16px", mb: "-8px" }}
                      required={true}
                      label={t("Phone Number")}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      error={
                        !!(
                          formik.touched.orderEmail && formik.errors.orderEmail
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.orderEmail && formik.errors.orderEmail
                      }
                      label={t("Order Email Address")}
                      name="orderEmail"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type="email"
                      required
                      value={formik.values.orderEmail}
                    />
                  </Grid>

                  <Grid
                    item
                    md={6}
                    xs={12}
                    alignItems="center"
                    style={{ display: "inline-flex" }}
                  >
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      error={
                        !!(
                          formik.touched.vendorAverageFulfilment &&
                          formik.errors.vendorAverageFulfilment
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.vendorAverageFulfilment &&
                        formik.errors.vendorAverageFulfilment
                      }
                      label={t("Vendor Average Fulfilment")}
                      name="vendorAverageFulfilment"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const cleanedNumber = e.target.value.replace(
                            /\D/g,
                            ""
                          );
                          e.target.value = cleanedNumber
                            ? (Number(cleanedNumber) as any)
                            : "";
                        }
                        formik.handleChange(e);
                      }}
                      InputProps={{
                        endAdornment: (
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mr: 1 }}
                          >
                            {t("Days")}
                          </Typography>
                        ),
                      }}
                      value={formik.values.vendorAverageFulfilment}
                    />
                    <Tooltip
                      title={t("Info vendor average fulfilment")}
                      style={{ paddingLeft: 1 }}
                    >
                      <SvgIcon color="action">
                        <InfoCircleIcon />
                      </SvgIcon>
                    </Tooltip>
                  </Grid>
                  <Grid
                    item
                    md={6}
                    xs={12}
                    alignItems="center"
                    style={{ display: "inline-flex" }}
                  >
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      error={
                        !!(
                          formik.touched.averageShippingDay &&
                          formik.errors.averageShippingDay
                        )
                      }
                      fullWidth
                      helperText={
                        formik.touched.averageShippingDay &&
                        formik.errors.averageShippingDay
                      }
                      label={t("Average Shipping")}
                      name="averageShippingDay"
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          const cleanedNumber = e.target.value.replace(
                            /\D/g,
                            ""
                          );
                          e.target.value = cleanedNumber
                            ? (Number(cleanedNumber) as any)
                            : "";
                        }
                        formik.handleChange(e);
                      }}
                      InputProps={{
                        endAdornment: (
                          <Typography
                            color="textSecondary"
                            variant="body2"
                            sx={{ mr: 1 }}
                          >
                            {t("Days")}
                          </Typography>
                        ),
                      }}
                      value={formik.values.averageShippingDay}
                    />
                    <Tooltip
                      title={t("Info average shipping")}
                      style={{ marginLeft: "6px" }}
                    >
                      <SvgIcon color="action">
                        <InfoCircleIcon />
                      </SvgIcon>
                    </Tooltip>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      autoComplete="off"
                      inputProps={{
                        style: {
                          textTransform: "capitalize",
                        },
                      }}
                      error={
                        !!(formik.touched.country && formik.errors.country)
                      }
                      helperText={
                        (formik.touched.country && formik.errors.country) as any
                      }
                      fullWidth
                      label={t("Country")}
                      name="country"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      select
                      style={{ height: "55px" }}
                      value={formik.values.country}
                    >
                      {countries?.map((countryData: any) => (
                        <MenuItem
                          key={countryData.code}
                          value={countryData.name.en}
                        >
                          {countryData?.name?.[lng] || countryData?.name?.en}
                        </MenuItem>
                      ))}
                    </TextFieldWrapper>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      fullWidth
                      label={t("Address Line 1")}
                      name="addressLine1"
                      error={Boolean(
                        formik.touched.addressLine1 &&
                          formik.errors.addressLine1
                      )}
                      helperText={
                        (formik.touched.addressLine1 &&
                          formik.errors.addressLine1) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.addressLine1}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      fullWidth
                      autoComplete="off"
                      error={Boolean(
                        formik.touched.addressLine1 &&
                          formik.errors.addressLine1
                      )}
                      helperText={
                        (formik.touched.addressLine1 &&
                          formik.errors.addressLine1) as any
                      }
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      label={t("Address Line 2")}
                      name="addressLine2"
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.addressLine2}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      fullWidth
                      label={t("Postal Code")}
                      name="postalCode"
                      error={Boolean(
                        formik.touched.postalCode && formik.errors.postalCode
                      )}
                      helperText={
                        (formik.touched.postalCode &&
                          formik.errors.postalCode) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value) {
                          // remove all non numeric characters
                          const cleanedNumber = e.target.value.replace(
                            /\D/g,
                            ""
                          );
                          e.target.value = cleanedNumber
                            ? (Number(cleanedNumber) as any)
                            : "";
                        }
                        formik.handleChange(e);
                      }}
                      value={formik.values.postalCode?.replace(
                        /[^A-Za-z0-9]/,
                        ""
                      )}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      autoComplete="off"
                      inputProps={{
                        style: { textTransform: "capitalize" },
                      }}
                      fullWidth
                      label={t("City")}
                      name="city"
                      error={Boolean(formik.touched.city && formik.errors.city)}
                      helperText={
                        (formik.touched.city && formik.errors.city) as any
                      }
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                        formik.handleChange(e);
                      }}
                      value={formik.values.city}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TextFieldWrapper
                      disabled={id != null && !canUpdate}
                      label={t("Note")}
                      name="note"
                      multiline
                      rows={4}
                      fullWidth
                      onChange={formik.handleChange("note")}
                      value={formik.values.note}
                      error={Boolean(formik.touched.note && formik.errors.note)}
                      helperText={
                        (formik.touched.note && formik.errors.note) as any
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {id != null && (
            <Card>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={8}>
                    <Stack spacing={1}>
                      <Typography variant="h6">{t("Status")}</Typography>
                      <Typography color="text.secondary" variant="body2">
                        {t("Change the status of the Vendor")}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formik.values.status}
                          color="primary"
                          edge="end"
                          name="status"
                          onChange={() => {
                            if (id != null && !canUpdate) {
                              return toast.error(t("You don't have access"));
                            }
                            formik.setFieldValue(
                              "status",
                              !formik.values.status
                            );
                          }}
                          sx={{
                            mr: 0.2,
                          }}
                        />
                      }
                      label={
                        formik.values.status ? t("Active") : t("Deactivated")
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

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
                    changeTab("inventoryManagement", Screens?.companyDetail);
                  }
                  router.back();
                }}
              >
                {t("Cancel")}
              </Button>
            </Stack>

            <LoadingButton
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                if (id != null && !canUpdate) {
                  return toast.error(t("You don't have access"));
                } else if (!id && !canCreate) {
                  return toast.error(t("You don't have access"));
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
          </Stack>
        </Stack>
      </form>
    </>
  );
};
