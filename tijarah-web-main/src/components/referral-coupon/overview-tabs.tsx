import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { ChangeEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import CompanyDropdown from "src/components/input/company-auto-complete";
import PhoneInput from "src/components/phone-input";
import { ProfileChooser } from "src/components/profile-chooser";
import { RouterLink } from "src/components/router-link";
// import OrderListTab from "src/components/vendor/orderlist-tabs";
// import OverviewTab from "src/components/vendor/overview-tabs";
// import PaymentTab from "src/components/vendor/payment-tabs";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";

// const TabContents: any = {
//   overview: OverviewTab,
//   orderlist: OrderListTab,
//   payment: PaymentTab,
// };

interface CreateLocation {
  company?: string;
  locationRefs?: string[];
  locations?: string[];
  fullName: string;
  vendorId: string;
  tags: string[];
  website: string;
  contactName: string;
  contactEmail: string;
  phone: string;
  email: string;
  vendorAF: string;
  shippingDays: string;
  address: string;
  note: string;
  status: boolean;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();
  const router = useRouter();
  const { id, companyRef, companyName } = router.query;
  usePageView();

  const [country, setCountry] = useState("+966");
  const [formValues, setFormValues] = useState("");
  const [showError, setShowError] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [openDatePickernew, setOpenDatePickernew] = useState(false);
  const [load, setLoad] = useState(false);
  const [openCustomerEventModal, setOpenCustomerEventModal] = useState(false);
  const [customerEventID, setCustomerEventID] = useState(-1);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("customer");

  const handleDeleteCustomerEvent = () => {
    if (customerEventID != null) {
      const data = formik.values.specialEvents;
      data.splice(customerEventID, 1);
      formik.setFieldValue("specialEvents", data);
      setShowDialogCustomerEvent(false);
      toast.success("Vendor Event Deleted!");
    }
  };
  const [tags, setTags] = React.useState([]);
  const [inputValue, setInputValue] = React.useState("");

  const handleTagsChange = (
    event: React.SyntheticEvent<Element, Event>,
    values: string[]
  ) => {
    setTags(values);
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => {
    if (value.endsWith(",")) {
      setTags([...tags, value.slice(0, -1)]);
      setInputValue("");
    } else {
      setInputValue(value);
    }
  };
  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const handleChangevID = (event: any) => {
    setFormValues(event.target.value);
  };

  const generateNumber = () => {
    const min = 10000;
    const max = 99999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const initialValues: CreateLocation = {
    company: "",
    locationRefs: [],
    locations: [],
    fullName: "",
    vendorId: "",
    tags: [],
    website: "",
    contactName: "",
    contactEmail: "",
    phone: "",
    email: "",
    vendorAF: "",
    shippingDays: "",
    address: "",
    note: "",
    status: true,
  };

  const validationSchema = Yup.object({
    fullName: Yup.string().required(`${t("Name is required")}`),
    contactName: Yup.string().required(`${t("Customer name is required")}`),
    tags: Yup.string().required(`${t("Tags name is required")}`),
    website: Yup.string().required(`${t("Website name is required")}`),
    shippingDays: Yup.string().required(`${t("Average Shipping is required")}`),
    vendorAF: Yup.string().required(`${t("Vendor Shipping is required")}`),
    locationRefs: Yup.array()
      .required(`${t("Please Select Locations")}`)
      .min(1, `${t("Please Select Locations")}`),
    phone: Yup.string()
      .min(9, `${t("Phone Number should be minimum 9 digits")}`)
      .required(`${t("Phone number is required")}`),
    email: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(255)
      .required(`${t("Order Email is required")}`),
    contactEmail: Yup.string()
      .email(`${t("Must be a valid email")}`)
      .max(255)
      .required(`${t("Customer Email is required")}`),
    address: Yup.string().required(`${t("Address Line is required")}`),
  });

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      console.log("Create CS", values);
      const data = {
        name: values.fullName,
        vendorid: values.vendorId,
        tags: values.tags,
        companyRef:
          userType == USER_TYPES.ADMIN ? user.company?._id : companyRef,
        company: {
          name:
            userType == USER_TYPES.ADMIN ? user.company.name.en : companyName,
        },
        locationRefs: values?.locationRefs,
        locations: [
          {
            name: {
              en: values.locations,
            },
          },
        ],
        website: values.website,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        phone: parsePhoneNumber(country, values.phone),
        email: values.email,
        vendorAF: values.vendorAF,
        shippingDays: values.shippingDays,
        address: values.address,
        status: values.status ? "active" : "inactive",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Vendor Details Updated").toString()
            : t("New Vendor Created").toString()
        );

        router.back();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoad(false);
      }
    },
  });

  const [currentTab, setCurrentTab] = useState<string>("overview");

  // let Component = TabContents[currentTab];

  const tabs = [
    {
      label: t("Overview"),
      value: "overview",
    },
    {
      label: t("Order List"),
      value: "orderlist",
    },
    {
      label: t("Payment"),
      value: "payment",
    },
  ];

  useEffect(() => {
    setCurrentTab(
      typeof router.query.tab === "string" ? router.query.tab : currentTab
    );
  }, [router.query.tab]);

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity != null) {
      console.log(entity);
      const phoneNumber = entity.phone
        ? entity.phone?.toString().split("-")[1]
        : "";

      setCountry(phoneNumber ? entity.phone?.toString().split("-")[0] : "+966");

      formik.setValues({
        locationRefs: entity.locationRefs,
        locations: entity.locations[0]?.name.en,
        fullName: entity.name,
        vendorId: entity.vaendorId,
        tags: entity.tags,
        phone: phoneNumber,
        email: entity.email,
        website: "www.tijarah.com",
        contactName: "Shiraj",
        contactEmail: "email@gmail.com",
        shippingDays: entity.shippingDays,
        vendorAF: entity.vendorAF,
        address: "addrss",
        note: "hello",
        status: entity?.status == "active" ? true : false,
      });
    }
  }, [entity]);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={12} xs={12}>
                        <Typography variant="h6">
                          {t("Vendor Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={12} xs={12}>
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mb: 3 }}>
                            <CompanyDropdown
                              disabled
                              onChange={() => {}}
                              selectedId={companyRef as string}
                              label={t("Company")}
                              id="company"
                            />
                          </Box>
                        )}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box
                              sx={{
                                alignItems: "center",
                                display: "flex",
                                mt: 3,
                              }}
                            >
                              <ProfileChooser onSuccess={{}} />
                            </Box>

                            {showError && formik.errors.profilePicture && (
                              <Box sx={{ mt: 3 }}>
                                <FormHelperText error>
                                  {formik.errors.profilePicture}
                                </FormHelperText>
                              </Box>
                            )}
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                fullWidth
                                disabled
                                label={t("Vandor ID")}
                                name="vendorId"
                                onBlur={formik.handleBlur}
                                onChange={handleChangevID}
                                value={generateNumber()}
                              />
                            </Box>
                          </Grid>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.fullName &&
                                    formik.errors.fullName
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.fullName &&
                                  formik.errors.fullName
                                }
                                label={t("Vandor")}
                                name="fullName"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.fullName}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.location &&
                                    formik.errors.location
                                  )
                                }
                                fullWidth
                                label={t("Location")}
                                name="location"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                select
                                value={formik.values.location}
                                required
                              >
                                {[].map((option) => (
                                  <MenuItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Box>
                          </Grid>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              {/* <TextField
                            error={
                              !!(
                                formik.touched.tags &&
                                formik.errors.tags
                              )
                            }
                            fullWidth
                            helperText={
                              formik.touched.tags && formik.errors.tags
                            }
                            label={t("Tags")}
                            name="tags"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.tags}
                          /> */}
                              <Autocomplete
                                freeSolo
                                multiple
                                options={[]}
                                value={tags}
                                inputValue={inputValue}
                                onInputChange={handleInputChange}
                                onChange={handleTagsChange}
                                renderInput={(params) => (
                                  <TextField {...params} label="Tags" />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.website &&
                                    formik.errors.website
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.website &&
                                  formik.errors.website
                                }
                                label={t("Website")}
                                name="website"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.website}
                              />
                            </Box>
                          </Grid>
                        </Box>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mt: 3 }}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Profile Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={12} xs={12}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.contactName &&
                                    formik.errors.contactName
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.contactName &&
                                  formik.errors.contactName
                                }
                                label={t("Contact Name")}
                                name="contactName"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                value={formik.values.contactName}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.contactEmail &&
                                    formik.errors.contactEmail
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.contactEmail &&
                                  formik.errors.contactEmail
                                }
                                label={t("Email Address")}
                                name="contactEmail"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                type="email"
                                value={formik.values.contactEmail}
                              />
                            </Box>
                          </Grid>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 1.3 }}>
                              <PhoneInput
                                touched={formik.touched.phone}
                                error={formik.errors.phone}
                                value={formik.values.phone}
                                onBlur={formik.handleBlur("phone")}
                                country={country}
                                handleChangeCountry={handleChangeCountry}
                                onChange={formik.handleChange("phone")}
                                style={{}}
                                required={true}
                                label={t("Phone Number")}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.email && formik.errors.email
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.email && formik.errors.email
                                }
                                label={t("Order Email")}
                                name="email"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                type="email"
                                value={formik.values.email}
                              />
                            </Box>
                          </Grid>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <DatePicker
                                open={openDatePickernew}
                                onOpen={() => setOpenDatePickernew(true)}
                                onClose={() => setOpenDatePickernew(false)}
                                label="Vendor Average Fulfilment"
                                inputFormat="dd/MM/yyyy"
                                onChange={(date: Date | null): void => {
                                  formik.setFieldValue("vendorAF", date);
                                }}
                                //{/*
                                // @ts-ignore */}
                                inputProps={{ disabled: true }}
                                minDate={new Date()}
                                disablePast
                                value={formik.values.vendorAF}
                                renderInput={(
                                  params: JSX.IntrinsicAttributes &
                                    TextFieldProps
                                ) => (
                                  <TextField
                                    required
                                    fullWidth
                                    onClick={() =>
                                      setOpenDatePickernew(!openDatePickernew)
                                    }
                                    {...params}
                                    error={Boolean(
                                      formik.touched.vendorAF &&
                                        formik.errors.vendorAF
                                    )}
                                    helperText={
                                      (formik.touched.vendorAF &&
                                        formik.errors.vendorAF) as any
                                    }
                                    onBlur={formik.handleBlur("vendorAF")}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <DatePicker
                                open={openDatePicker}
                                onOpen={() => setOpenDatePicker(true)}
                                onClose={() => setOpenDatePicker(false)}
                                label="Average Shipping Days"
                                inputFormat="dd/MM/yyyy"
                                onChange={(date: Date | null): void => {
                                  formik.setFieldValue("shippingDays", date);
                                }}
                                //{/*
                                // @ts-ignore */}
                                inputProps={{ disabled: true }}
                                minDate={new Date()}
                                disablePast
                                value={formik.values.shippingDays}
                                renderInput={(
                                  params: JSX.IntrinsicAttributes &
                                    TextFieldProps
                                ) => (
                                  <TextField
                                    required
                                    fullWidth
                                    onClick={() =>
                                      setOpenDatePicker(!openDatePicker)
                                    }
                                    {...params}
                                    error={Boolean(
                                      formik.touched.shippingDays &&
                                        formik.errors.shippingDays
                                    )}
                                    helperText={
                                      (formik.touched.shippingDays &&
                                        formik.errors.shippingDays) as any
                                    }
                                    onBlur={formik.handleBlur("shippingDays")}
                                  />
                                )}
                              />
                            </Box>
                          </Grid>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                error={
                                  !!(
                                    formik.touched.address &&
                                    formik.errors.address
                                  )
                                }
                                fullWidth
                                helperText={
                                  formik.touched.address &&
                                  formik.errors.address
                                }
                                label={t("Address")}
                                name="address"
                                multiline
                                rows={4}
                                onChange={formik.handleChange("address")}
                                value={formik.values.address}
                              />
                            </Box>
                          </Grid>
                          <Grid item md={6} xs={12}>
                            <Box sx={{ mt: 3 }}>
                              <TextField
                                label={t("Note")}
                                name="notes"
                                multiline
                                rows={4}
                                fullWidth
                                onChange={formik.handleChange("notes")}
                                value={formik.values.notes}
                              />
                            </Box>
                          </Grid>
                        </Box>
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
                                onChange={() =>
                                  formik.setFieldValue(
                                    "status",
                                    !formik.values.status
                                  )
                                }
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              formik.values.status
                                ? t("Active")
                                : t("Deactivated")
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
                  <Button
                    color="inherit"
                    component={RouterLink}
                    href={tijarahPaths?.management?.customers?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowError(true);
                      formik.handleSubmit();
                    }}
                    loading={load}
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

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
