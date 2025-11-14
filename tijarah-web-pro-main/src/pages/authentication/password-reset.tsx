import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
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
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { VerificationCode } from "src/components/authentication/verification-code";
import { Seo } from "src/components/seo";
import Tijarah360VerticalGreen from "src/components/tijarah-360-logo/vertical-green";
import Tijarah360VerticalWhite from "src/components/tijarah-360-logo/vertical-white";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { Layout as AuthLayout } from "src/layouts/auth/classic-layout";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { ERRORS } from "src/utils/errors";
import * as Yup from "yup";

interface Values {
  code: string;
  newPassword: string;
  repeatPassword: string;
}

const initialValues: Values = {
  code: "",
  newPassword: "",
  repeatPassword: "",
};

const Page: PageType = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const isMounted = useMounted();
  const { passwordReset } = useAuth();

  const router = useRouter();
  const { phone } = router.query;
  const [mobile, setMobile] = useState<string>();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const validationSchema = Yup.object({
    code: Yup.string()
      .required(t("Verification Code is required"))
      .test(
        "len",
        "Verification Code must be exactly 4 digits",
        (val) => String(val).length === 4
      )
      .nullable(),
    newPassword: Yup.string()
      .min(8, t("New Password must be at least 8 characters"))
      .max(20)
      .required(t("New Password is required"))
      .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
    repeatPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], t("Both Password must be match"))
      .required(t("Repeat Password is required"))
      .matches(/^\S*$/, `${t("Password cannot contain spaces")}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        const res = await passwordReset(
          mobile,
          values.code,
          values.newPassword
        );

        if (isMounted() && res) {
          toast.success(t("Password reset successfully").toString());
          router.push(tijarahPaths.authentication.login);
        }
      } catch (err) {
        if (err.code == "wrong_otp") {
          toast.error(t(ERRORS.WRONG_OTP).toString());
        } else {
          toast.success(err.message.toString());
        }

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  useEffect(() => {
    const storedMobile = phone?.toString() || "";

    if (storedMobile) {
      setMobile(storedMobile);
    }
  }, [phone]);

  return (
    <>
      <Seo title="Recover Password" />
      <div>
        <Card elevation={16}>
          <CardContent>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack>
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}>
                  <Link href="/">
                    {theme?.palette?.mode === "dark" ? (
                      <SvgIcon
                        sx={{
                          width: 130,
                          height: 130,
                        }}>
                        <Tijarah360VerticalWhite />
                      </SvgIcon>
                    ) : (
                      <SvgIcon
                        sx={{
                          width: 130,
                          height: 130,
                        }}>
                        <Tijarah360VerticalGreen />
                      </SvgIcon>
                    )}
                  </Link>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}>
                  <Typography variant="h4">{t("Recover Password")}</Typography>
                  <Typography
                    color="textSecondary"
                    sx={{ mt: 2 }}
                    variant="body2">
                    {t("Please enter the verification code received on")}{" "}
                    {mobile}
                  </Typography>
                </Box>

                <VerificationCode
                  onValueChange={(val) => formik.handleChange("code")(val)}
                  value={formik.values.code}
                  errors={formik.errors.code}
                  touched={formik.touched.code}
                />

                <TextField
                  error={Boolean(
                    formik.touched.newPassword && formik.errors.newPassword
                  )}
                  fullWidth
                  required
                  helperText={
                    formik.touched.newPassword && formik.errors.newPassword
                  }
                  label={t("New Password")}
                  margin="normal"
                  name="newPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type={showNewPassword ? "text" : "password"}
                  value={formik.values.newPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          onMouseDown={() =>
                            setShowNewPassword(!showNewPassword)
                          }>
                          {!showNewPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  error={Boolean(
                    formik.touched.repeatPassword &&
                      formik.errors.repeatPassword
                  )}
                  fullWidth
                  required
                  helperText={
                    formik.touched.repeatPassword &&
                    formik.errors.repeatPassword
                  }
                  label={t("Repeat Password")}
                  margin="normal"
                  name="repeatPassword"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  type={showRepeatPassword ? "text" : "password"}
                  value={formik.values.repeatPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowRepeatPassword(!showRepeatPassword)
                          }
                          onMouseDown={() =>
                            setShowRepeatPassword(!showRepeatPassword)
                          }>
                          {!showRepeatPassword ? (
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
                sx={{ mt: 4 }}
                type="submit"
                variant="contained">
                {t("Reset Password")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
