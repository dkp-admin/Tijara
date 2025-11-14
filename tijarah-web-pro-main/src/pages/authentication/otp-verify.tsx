import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormHelperText,
  FormLabel,
  Link,
  SvgIcon,
  Typography,
} from "@mui/material";
import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import { useFormik } from "formik";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { Seo } from "src/components/seo";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { Layout as AuthLayout } from "src/layouts/auth/classic-layout";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";

interface Values {
  code: string;
  submit: null;
}

const initialValues: Values = {
  code: "",
  submit: null,
};

const validationSchema = Yup.object({
  code: Yup.string().min(4).max(4).required("Code is required"),
});

const OtpVerification: PageType = () => {
  const { t } = useTranslation();
  const { register, verifyOTP } = useAuth();
  const router = useRouter();
  const isMounted = useMounted();

  const { email, name, password, phone, country } = router.query;

  const [loading, setLoading] = useState(false);
  const [resendBtnTap, setResendBtnTap] = useState(true);
  const [timer, setTimer] = useState(60);
  const [planData, setPlanData] = useState<any>();
  console.log(planData);

  const formik = useFormik({
    initialValues,
    // validationSchema,
    onSubmit: async (values, helpers) => {
      try {
        const res = await verifyOTP(
          email as any,
          name.toString(),
          values.code,
          password.toString(),
          parsePhoneNumber(country as any, phone as any),
          ""
        );

        if (isMounted() && res.token) {
          // router.push(tijarahPaths.signup.steps);
          router.push({
            pathname: tijarahPaths.authentication.paymentGateway,
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
        } else if (err.code === "wrong_otp") {
          toast.error(t("Invalid OTP"));
        } else {
          toast.error(t("Something went wrong"));
        }

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setErrors({ submit: err.message });
          helpers.setSubmitting(false);
        }
      }
    },
  });
  const sendOTPForResetPin = async () => {
    setLoading(true);

    try {
      const res = await register(
        name.toString(),
        email as any,
        parsePhoneNumber(country as any, phone as any),
        "",
        password.toString()
      );

      if (res.code === "success") {
        setResendBtnTap(true);
        setTimer(60);
      }
    } catch (error: any) {
      toast.error(t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    setResendBtnTap(true);
    setTimer(60);
  }, []);

  useEffect(() => {
    let interval: any;

    if (resendBtnTap) {
      interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          setResendBtnTap(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [resendBtnTap, timer]);

  useEffect(() => {
    const newArr = localStorage.getItem("selectedHardware");
    setPlanData(JSON.parse(newArr));
  }, []);

  return (
    <>
      <Seo title="Verify Code" />
      <div>
        <Box sx={{ mb: 4 }}>
          <Link
            color="text.primary"
            onClick={() => {
              router.push({
                pathname: tijarahPaths.authentication.register,
                query: {
                  existingEmail: email,
                  existingName: name,
                  existingPassword: password,
                  existingPhone: phone,
                  isFromOTP: true,
                },
              });
            }}
            sx={{
              alignItems: "center",
              display: "inline-flex",
            }}
            underline="hover"
          >
            <SvgIcon sx={{ mr: 1 }}>
              <ArrowLeftIcon />
            </SvgIcon>
            <Typography variant="subtitle2">{t("Register")}</Typography>
          </Link>
        </Box>
        <Card elevation={16}>
          <CardHeader sx={{ pb: 0 }} title={t("Verify code")} />
          <CardContent>
            <form noValidate onSubmit={formik.handleSubmit}>
              <FormControl
                error={!!(formik.touched.code && formik.errors.code)}
              >
                <FormLabel
                  sx={{
                    display: "block",
                    mb: 2,
                  }}
                >
                  {t("Code")}
                </FormLabel>
                <MuiOtpInput
                  length={4}
                  onBlur={() => formik.handleBlur("code")}
                  onChange={(value) => formik.setFieldValue("code", value)}
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

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <Typography variant="body2">
                  {t("Didn't receive the code?")}
                </Typography>

                {resendBtnTap ? (
                  <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                    {`(00:${timer})`}
                  </Typography>
                ) : (
                  <LoadingButton
                    variant="text"
                    onClick={() => {
                      sendOTPForResetPin();
                    }}
                    sx={{ ml: -1 }}
                    disabled={resendBtnTap}
                    loading={loading}
                  >
                    {t("Resend OTP")}
                  </LoadingButton>
                )}
              </Box>

              <LoadingButton
                fullWidth
                loading={formik.isSubmitting}
                size="large"
                sx={{ mt: 4 }}
                type="submit"
                variant="contained"
                disabled={formik.isSubmitting}
              >
                {t("Verify")}
              </LoadingButton>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

OtpVerification.getLayout = (page: any) => <AuthLayout>{page}</AuthLayout>;

export default OtpVerification;
