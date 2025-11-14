import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  FormControl,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { BillingVerifcationCode } from "src/components/authentication/billing-verification-code-modal";
import { ResetPin } from "src/components/authentication/reset-pin";
import PhoneInput from "src/components/phone-input";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import Tijarah360VerticalGreen from "src/components/tijarah-360-logo/vertical-green";
import Tijarah360VerticalWhite from "src/components/tijarah-360-logo/vertical-white";
import { GuestGuard } from "src/guards/guest-guard";
import { IssuerGuard } from "src/guards/issuer-guard";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useMounted } from "src/hooks/use-mounted";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as AuthLayout } from "src/layouts/auth/classic-layout";
import { LanguageSwitch } from "src/layouts/dashboard/language-switch";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Issuer } from "src/utils/auth";
import { USER_TYPES } from "src/utils/constants";
import { ERRORS } from "src/utils/errors";
import { isSubscriptionValid } from "src/utils/isSubscriptionValid";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";

interface Values {
  tab: string;
  phone: string;
  password: string;
  submit: null;
  code: string;
  deviceName: string;
  deviceLogin: boolean;
  userRef: string;
}

const initialValues: Values = {
  tab: "login",
  phone: "",
  password: "",
  submit: null,
  code: "",
  deviceName: "",
  deviceLogin: false,
  userRef: "",
};

const JWTLogin: PageType = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [country, setCountry] = useState("+966");
  const [openResetPin, setOpenResetPin] = useState(false);
  const [openBillingVerifcationCodeModal, setOpenBillingVerifcationCodeModal] =
    useState(false);

  const tabs = [
    {
      label: t("Admin Panel"),
      value: "login",
    },
    {
      label: t("Billing"),
      value: "billing",
    },
  ];

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const validationSchema = Yup.object({
    phone: Yup.string().when("tab", {
      is: "login",
      then: Yup.string()
        .min(9, `${t("Phone Number should be minimum 9 digits")}`)
        .max(12, t("Phone Number should not be maximum 12 digits"))
        .required(`${t("Phone number is required")}`),
      otherwise: Yup.string().optional(),
    }),
    password: Yup.string().when("tab", {
      is: "login",
      then: Yup.string()
        .min(8, t("password should be at least 8 characters"))
        .max(20, t("password should noy be greater than 20 characters"))
        .required(`${t("Password is required")}`)
        .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
      otherwise: Yup.string().optional(),
    }),
    deviceName: Yup.string().when("tab", {
      is: "billing",
      then: Yup.string().required(`${t("Device code is required")}`),
      otherwise: Yup.string().optional(),
    }),
    code: Yup.string().when("tab", {
      is: "billing",
      then: Yup.string()
        .min(6, `${t("Device password is required")}`)
        .max(6, t("Device password is required"))
        .required(`${t("Device password is required")}`),
      otherwise: Yup.string().optional(),
    }),
    userRef: Yup.string().when(["tab", "deviceLogin"], {
      is: (tab: any, deviceLogin: any) => tab === "billing" && deviceLogin,
      then: Yup.string().required(`${t("Please select user")}`),
      otherwise: Yup.string().optional(),
    }),
  });

  const [showPassword, setShowPassword] = useState(false);

  const isMounted = useMounted();
  const { login, deviceLogin, device, user } = useAuth();
  const { findOne, entity } = useEntity("user");
  const router = useRouter();

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        if (values.tab === "login") {
          const res = await login(
            parsePhoneNumber(country, values.phone),
            values.password
          );

          if (isMounted() && res.token && res.user) {
            localStorage.setItem("login", "user");

            if (
              !res.user.onboarded &&
              res?.subscription &&
              res.user.userType !== USER_TYPES.SUPERADMIN
            ) {
              router.push(tijarahPaths.signup.steps);
            } else if (
              !res.user.onboarded &&
              !res?.subscription &&
              res.user.userType !== USER_TYPES.SUPERADMIN
            ) {
              router.push(tijarahPaths.authentication.packages);
            } else if (
              !isSubscriptionValid(res?.subscription?.subscriptionEndDate) &&
              res.user.userType !== USER_TYPES.SUPERADMIN
            ) {
              router.push(`${tijarahPaths?.authentication?.subcription}`);
            } else if (res?.user?.userType !== USER_TYPES.SUPERADMIN) {
              router.push(tijarahPaths.dashboard.salesDashboard);
            } else {
              router.push(tijarahPaths.dashboard.salesDashboard);
            }
          }
        } else if (values.tab === "billing") {
          await deviceLogin(values.deviceName, values.code);
          localStorage.setItem("login", "billing");
        }
      } catch (err) {
        if (values.tab === "login") {
          if (err?.code == "not_found") {
            toast.error(ERRORS.USER_NOT_FOUND);
          } else if (err?.code == "bad_password") {
            toast.error(ERRORS.INVALID_PASSWORD);
          } else if (err.code == "user_inactive") {
            toast.error(ERRORS.USER_INACTIVE);
          }
        } else if (values.tab === "billing" && !device) {
          toast.error(t("Invalid device code or password"));
        }

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  usePageView();

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void => {
    formik.resetForm();
    formik.setFieldValue("tab", value);
    formik.setFieldValue("deviceName", device?.phone || "");
  };

  useEffect(() => {
    const token = localStorage.getItem("accessDeviceToken");

    if (token && device?.locationRef && !user) {
      findOne(`fetch-pos-user?locationRef=${device.locationRef}`);
    }
  }, [device, user]);

  return (
    <>
      <Seo title={`${"Login"}`} />
      <div>
        <Card elevation={16}>
          <CardHeader
            subheader={
              <Box
                sx={{
                  mt: -1,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Typography color="text.secondary" variant="body2">
                    {t("Don't have an account?")} &nbsp;
                    <Link
                      component={RouterLink}
                      href={tijarahPaths?.authentication?.packages}
                      underline="hover"
                      variant="subtitle2"
                    >
                      {t("Register")}
                    </Link>
                  </Typography>
                </Box>

                <LanguageSwitch />
              </Box>
            }
            sx={{ pb: 0 }}
            title={t("Log in")}
          />
          <CardContent>
            <Stack spacing={3}>
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Link href="/">
                  {theme?.palette?.mode === "dark" ? (
                    <SvgIcon
                      sx={{
                        width: 130,
                        height: 130,
                      }}
                    >
                      <Tijarah360VerticalWhite />
                    </SvgIcon>
                  ) : (
                    <SvgIcon
                      sx={{
                        width: 130,
                        height: 130,
                      }}
                    >
                      <Tijarah360VerticalGreen />
                    </SvgIcon>
                  )}
                </Link>
              </Box>
            </Stack>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Tabs
                  indicatorColor="primary"
                  onChange={handleTabsChange}
                  scrollButtons="auto"
                  textColor="primary"
                  value={formik.values.tab}
                  variant="scrollable"
                  sx={{ width: "100%", px: 1 }}
                >
                  {tabs.map((tab) => (
                    <Tab
                      sx={{ width: "46%" }}
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                    />
                  ))}
                </Tabs>
                <Divider />
              </Box>
              {formik.values.tab === "login" && (
                <>
                  <Stack spacing={3}>
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
                    <TextField
                      required
                      error={
                        !!(formik.touched.password && formik.errors.password)
                      }
                      fullWidth
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      label={t("Password")}
                      name="password"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={() => setShowPassword(!showPassword)}
                              onMouseDown={() => setShowPassword(!showPassword)}
                            >
                              {!showPassword ? (
                                <Visibility />
                              ) : (
                                <VisibilityOff />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                  <Button
                    disabled={formik.isSubmitting}
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                    type="submit"
                    variant="contained"
                  >
                    {t("Log In")}
                  </Button>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 3,
                    }}
                  >
                    <Link
                      href={tijarahPaths?.authentication?.forgotPassword}
                      underline="hover"
                      variant="subtitle2"
                    >
                      {t("Forgot password?")}
                    </Link>
                  </Box>
                </>
              )}
              {formik.values.tab === "billing" && (
                <>
                  {!device?._id ? (
                    <Stack spacing={3}>
                      <TextField
                        sx={{ mt: 2 }}
                        error={
                          !!(
                            formik.touched.deviceName &&
                            formik.errors.deviceName
                          )
                        }
                        required
                        fullWidth
                        helperText={
                          formik.touched.deviceName && formik.errors.deviceName
                        }
                        label={t("Device Name")}
                        name="deviceName"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                          e.target.value = e.target.value.toUpperCase();
                        }}
                        value={formik.values.deviceName.toUpperCase()}
                        placeholder="X X X X X X X X"
                      />
                      <Typography
                        sx={{
                          mb: 2,
                        }}
                        variant="body2"
                      >
                        {t(
                          "Enter the code & password generated for the device on Tijarah Merchant panel to connect."
                        )}
                      </Typography>
                      <FormControl
                        error={!!(formik.touched.code && formik.errors.code)}
                      >
                        <MuiOtpInput
                          length={6}
                          onBlur={() => formik.handleBlur("code")}
                          onChange={(value) =>
                            formik.setFieldValue("code", value)
                          }
                          onFocus={() => formik.setFieldTouched("code")}
                          sx={{
                            "& .MuiFilledInput-input": {
                              p: "14px",
                            },
                          }}
                          value={formik.values.code}
                        />
                        {!!(formik.touched.code && formik.errors.code) && (
                          <FormHelperText>{formik.errors.code}</FormHelperText>
                        )}
                      </FormControl>
                      <Button
                        disabled={formik.isSubmitting}
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                        type="submit"
                        variant="contained"
                        onClick={() => {
                          formik.handleSubmit();
                        }}
                      >
                        {t("Next")}
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={3}>
                      <TextField
                        sx={{ mt: 2 }}
                        error={
                          !!(
                            formik.touched.deviceName &&
                            formik.errors.deviceName
                          )
                        }
                        fullWidth
                        helperText={
                          formik.touched.deviceName && formik.errors.deviceName
                        }
                        disabled
                        label={t("Device Name")}
                        name="deviceName"
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                          e.target.value = e.target.value.toUpperCase();
                        }}
                        value={device.phone}
                        placeholder="X X X X X X X X"
                      />
                      <TextField
                        select
                        required
                        fullWidth
                        name="userRef"
                        label={t("Select User Login ID")}
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        value={formik.values.userRef}
                      >
                        {entity?.users?.map((user: any) => (
                          <MenuItem key={user._id} value={user._id}>
                            {user.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Button
                        disabled={formik.isSubmitting}
                        fullWidth
                        size="large"
                        sx={{ mt: 2 }}
                        type="button"
                        variant="contained"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!formik.values.userRef) {
                            toast.error(t("Please select user"));
                            return;
                          }
                          setOpenBillingVerifcationCodeModal(true);
                        }}
                      >
                        {t("Verify and Login")}
                      </Button>
                    </Stack>
                  )}
                </>
              )}
            </form>
          </CardContent>
        </Card>
        <BillingVerifcationCode
          modalData={{
            user: entity?.users?.find(
              (ent: any) => ent?._id === formik.values.userRef
            ),
          }}
          open={openBillingVerifcationCodeModal}
          handleClose={() => {
            setOpenBillingVerifcationCodeModal(false);
          }}
          handleSuccess={(subscription: boolean) => {
            if (subscription) {
              router.push(tijarahPaths.authentication.subcription);
            } else {
              router.push(tijarahPaths.billing.index);
            }
          }}
          handleResetPin={() => {
            setOpenResetPin(true);
            setOpenBillingVerifcationCodeModal(false);
          }}
        />
        <ResetPin
          users={entity?.users || []}
          selectedUser={entity?.users?.find(
            (ent: any) => ent?._id === formik.values.userRef
          )}
          open={openResetPin}
          handleClose={() => {
            setOpenResetPin(false);
          }}
        />
      </div>
    </>
  );
};

JWTLogin.getLayout = (page) => (
  <IssuerGuard issuer={Issuer.JWT}>
    <GuestGuard>
      <AuthLayout>{page}</AuthLayout>
    </GuestGuard>
  </IssuerGuard>
);

export default JWTLogin;
