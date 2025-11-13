import { ArrowBack, Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormHelperText,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  SvgIcon,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import { GuestGuard } from "src/guards/guest-guard";
import { IssuerGuard } from "src/guards/issuer-guard";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { Layout as AuthLayout } from "src/layouts/auth/classic-layout";
import { LanguageSwitch } from "src/layouts/dashboard/language-switch";
import { paths, tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { Issuer } from "src/utils/auth";
import { TERMS_CONDITIONS_URL } from "src/utils/constants";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";
import Tijarah360HorizontalGreen from "src/components/tijarah-360-logo/horizontal-green";
import Tijarah360HorizontalWhite from "src/components/tijarah-360-logo/horizontal-whilte";
import countries from "src/utils/country_code.json";

interface Values {
  email: string;
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
  policy: boolean;
  submit: null;
}

const initialValues: Values = {
  email: "",
  name: "",
  phone: "",
  password: "",
  confirmPassword: "",
  policy: false,
  submit: null,
};

const getValidationSchema = (country: string) => {
  const countryObj = countries.find((c) => c.dial_code === country);
  const phoneLength = countryObj?.phLength || 9;

  return Yup.object({
    name: Yup.string()
      .trim()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        i18n.t("Enter valid name")
      )
      .max(60)
      .required(`${i18n.t("Name is required")}`),
    email: Yup.string()
      .trim()
      .max(70)
      .required(`${i18n.t("Email is required")}`)
      .email(`${i18n.t("Must be a valid email")}`)
      .matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i,
        `${i18n.t("Must be a valid email")}`
      ),
    phone: Yup.string()
      .test(
        "phone-length",
        `${i18n.t(
          `Phone Number should be exactly ${phoneLength} digits for ${
            countryObj?.name || "this country"
          }`
        )}`,
        (value) => !value || value.length === phoneLength
      )
      .required(`${i18n.t("Phone number is required")}`),
    password: Yup.string()
      .min(8, `${i18n.t("Password must be at least 8 characters")}`)
      .max(20, `${i18n.t("Password must be at most 20 characters")}`)
      .required(`${i18n.t("Password is required")}`)
      .matches(/^\S*$/, `${i18n.t("Password cannot contain spaces")}`),
    confirmPassword: Yup.string()
      .required(`${i18n.t("Please confirm the password")}`)
      .oneOf([Yup.ref("password")], `${i18n.t("Passwords must match")}`),
    policy: Yup.boolean().oneOf(
      [true],
      i18n.t("Please accept the terms and conditions")
    ),
  });
};

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    existingEmail,
    existingName,
    existingPassword,
    existingPhone,
    isFromOTP,
  } = router.query;

  const isMounted = useMounted();
  const { register } = useAuth();
  const theme = useTheme();
  const [country, setCountry] = useState("+966");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangeCountry = (event: any) => {
    const newCountry = event.target.value;
    setCountry(newCountry);
  };

  const countryRef = React.useRef(country);

  const formik = useFormik({
    initialValues,
    validationSchema: getValidationSchema(country),
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const res = await register(
          values.name.trim(),
          values.email.trim(),
          parsePhoneNumber(country, values.phone),
          "",
          values.password
        );

        if (isMounted() && res.code === "success") {
          toast.success(t("OTP sent successfully"));
          router.push({
            pathname: tijarahPaths.authentication.otpVerification,
            query: {
              email: values.email,
              name: values.name,
              password: values.password,
              phone: values.phone,
              country,
            },
          });
        }
      } catch (err) {
        if (
          err?._err?.code == "duplicate_record" &&
          err?._err?.field == "phone"
        ) {
          toast.error(t("Phone number already exist"));
        } else if (err?._err?.code == "account_exists") {
          toast.error(t("Account already exist"));
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

  useEffect(() => {
    if (isFromOTP) {
      formik.setValues({
        email: existingEmail as any,
        name: existingName as any,
        phone: existingPhone as any,
        password: existingPassword as any,
        confirmPassword: existingPassword as any,
        policy: false,
        submit: null,
      });
    }
  }, [isFromOTP]);

  useEffect(() => {
    if (typeof window !== undefined) {
      localStorage.clear();
      sessionStorage.clear();
    }
  }, []);

  // Effect to update validation schema when country changes
  useEffect(() => {
    formik.validateForm();

    if (countryRef.current !== country) {
      const countryObj = countries.find((c) => c.dial_code === country);
      if (
        countryObj &&
        formik.values.phone &&
        formik.values.phone.length !== countryObj.phLength
      ) {
        formik.setFieldValue("phone", "");
      }
      countryRef.current = country;
    }
  }, [country]);

  return (
    <>
      <Seo title={`${t("Register")}`} />
      <div>
        <Box
          sx={{
            position: "absolute",
            top: {
              xs: "4%",
              sm: "7%",
            },
            left: {
              xs: "4%",
              sm: "7%",
            },
          }}
        >
          <Link
            color="textPrimary"
            component="a"
            sx={{
              alignItems: "center",
              display: "flex",
              cursor: "pointer",
            }}
            onClick={() => router.push(tijarahPaths.authentication.packages)}
          >
            <ArrowBack fontSize="small" color="primary" />
          </Link>
        </Box>
        <Card elevation={16}>
          <Stack spacing={0}>
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
                      height: 100,
                    }}
                  >
                    <Tijarah360HorizontalWhite />
                  </SvgIcon>
                ) : (
                  <SvgIcon
                    sx={{
                      width: 130,
                      height: 100,
                    }}
                  >
                    <Tijarah360HorizontalGreen />
                  </SvgIcon>
                )}
              </Link>
            </Box>
          </Stack>
          <CardHeader
            subheader={
              <Box
                sx={{
                  pt: 0,
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
                    {t("Already have an account?")} &nbsp;
                    <Link
                      component={RouterLink}
                      href={paths.index}
                      underline="hover"
                      variant="subtitle2"
                    >
                      {t("Log in")}
                    </Link>
                  </Typography>
                </Box>

                <LanguageSwitch />
              </Box>
            }
            sx={{ pb: 0, pt: 0 }}
            title={t("Register")}
          />
          <CardContent>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  inputProps={{ style: { textTransform: "capitalize" } }}
                  required
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label={t("Name")}
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.name}
                />
                <TextField
                  required
                  error={!!(formik.touched.email && formik.errors.email)}
                  fullWidth
                  helperText={formik.touched.email && formik.errors.email}
                  label={t("Email Address")}
                  name="email"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type="email"
                  value={formik.values.email}
                />

                <PhoneInput
                  touched={formik.touched.phone}
                  error={formik.errors.phone}
                  value={formik.values.phone}
                  onBlur={formik.handleBlur("phone")}
                  country={country}
                  handleChangeCountry={handleChangeCountry}
                  onChange={formik.handleChange("phone")}
                  style={{}}
                  required
                  label={t("Phone Number")}
                />

                <TextField
                  required
                  error={!!(formik.touched.password && formik.errors.password)}
                  fullWidth
                  helperText={formik.touched.password && formik.errors.password}
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
                          {!showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  required
                  error={
                    !!(
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                    )
                  }
                  fullWidth
                  helperText={
                    formik.touched.confirmPassword &&
                    formik.errors.confirmPassword
                  }
                  label={t("Confirm Password")}
                  name="confirmPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          onMouseDown={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {!showConfirmPassword ? (
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
              <Box
                sx={{
                  alignItems: "center",
                  display: "flex",
                  ml: -1,
                  mt: 1,
                }}
              >
                <Checkbox
                  checked={formik.values.policy}
                  name="policy"
                  onChange={formik.handleChange}
                />
                <Typography color="text.secondary" variant="body2">
                  {`${t("I have read the")} `}
                  <Link
                    component="a"
                    target="_blank"
                    href={TERMS_CONDITIONS_URL}
                  >
                    {t("Terms and Conditions")}
                  </Link>
                </Typography>
              </Box>
              {!!(formik.touched.policy && formik.errors.policy) && (
                <FormHelperText error>{formik.errors.policy}</FormHelperText>
              )}
              <Button
                disabled={formik.isSubmitting}
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                type="submit"
                variant="contained"
              >
                {t("Register")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

Page.getLayout = (page) => (
  <IssuerGuard issuer={Issuer.JWT}>
    <GuestGuard>
      <AuthLayout>{page}</AuthLayout>
    </GuestGuard>
  </IssuerGuard>
);

export default Page;
