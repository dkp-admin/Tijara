import {
  Box,
  Button,
  Card,
  CardContent,
  Link,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { Seo } from "src/components/seo";
import Tijarah360VerticalGreen from "src/components/tijarah-360-logo/vertical-green";
import Tijarah360VerticalWhite from "src/components/tijarah-360-logo/vertical-white";
import { useAuth } from "src/hooks/use-auth";
import { useMounted } from "src/hooks/use-mounted";
import { Layout as AuthLayout } from "src/layouts/auth/classic-layout";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";

interface Values {
  phone: string;
}

const initialValues: Values = {
  phone: "",
};

const Page: PageType = () => {
  const { t } = useTranslation();
  const isMounted = useMounted();
  const theme = useTheme();
  const { sendCode } = useAuth();
  const router = useRouter();

  const [country, setCountry] = useState("+966");
  const [, setShowError] = useState(false);

  const validationSchema = Yup.object({
    phone: Yup.string()
      .min(9, "Phone Number should be minimum 9 digits")
      .max(12, t("Phone Number should not be maximum 12 digits"))
      .required(`${t("Phone number is required")}`),
  });

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        await sendCode(parsePhoneNumber(country, values.phone));

        if (isMounted()) {
          sessionStorage.setItem(
            "mobile",
            parsePhoneNumber(country, values.phone)
          );

          router.push({
            pathname: tijarahPaths?.authentication?.resetPassword,
            query: {
              phone: parsePhoneNumber(country, values.phone),
            },
          });
        }
      } catch (err) {
        console.error(err);

        toast.error(err.message);

        if (isMounted()) {
          helpers.setStatus({ success: false });
          helpers.setSubmitting(false);
        }
      }
    },
  });

  return (
    <>
      <Seo title="Forgot Password" />
      <form onSubmit={formik.handleSubmit}>
        <div>
          <Card elevation={16}>
            <CardContent>
              <form noValidate onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
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
                    <Typography variant="h4">
                      {t("Forgot your password?")}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      sx={{ mt: 2 }}
                      variant="body2">
                      {t("Enter the phone number you used to register with us")}
                    </Typography>
                  </Box>

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
                </Stack>
                <Button
                  disabled={formik.isSubmitting}
                  fullWidth
                  size="large"
                  sx={{ mt: 4 }}
                  type="submit"
                  variant="contained"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowError(true);
                    formik.handleSubmit();
                  }}>
                  {t("Continue")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
