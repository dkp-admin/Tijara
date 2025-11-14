import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Grid,
  Link,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface UpdateCashManagement {
  location?: string;
  startCash: number;
  recipientEmail: string;
  autoEmail: boolean;
  cashManagementStatus: boolean;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();
  const currency = useCurrency();

  const initialValues: UpdateCashManagement = {
    location: "T-Mart Jeddah",
    startCash: 0,
    recipientEmail: "",
    autoEmail: false,
    cashManagementStatus: false,
  };

  const validationSchema = Yup.object({
    locationBusinessNameEng: Yup.string().required(
      `${t("Business Name is required")}`
    ),
    addressLine: Yup.string().required(`${t("Address Line is required")}`),
    postalCode: Yup.string().required(`${t("Postal Code is required")}`),
    city: Yup.string().required(`${t("City is required")}`),
    state: Yup.string().required(`${t("State is required")}`),
    country: Yup.string().required(`${t("Country is required")}`),
    vatPercentage: Yup.string().required(`${t("Country is required")}`),
    location: Yup.string().required(`${t("Please select the location")}`),
    commercialRegistrationNumber: Yup.string().required(
      "Please Upload Commercial Registration Document"
    ),
  });

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers): Promise<void> => {
      try {
        // NOTE: Make API request
        toast.success(`${t("Cash Management Settings Updated")}`);
        router.push(tijarahPaths?.management?.locations?.cashManagement?.index);
      } catch (err) {
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });

        // helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  return (
    <>
      <Seo title={`${t("Cash Management")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          mb: 4,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  router.push({
                    pathname:
                      tijarahPaths?.management?.locations?.cashManagement
                        ?.index,
                  });
                }}
              >
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Cash Management List")}
                  </Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {t("Cash Management Settings")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Cash Management")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Stack spacing={3}>
                          {/* Locations in this field will be autofilled based on location id */}
                          <TextFieldWrapper
                            disabled
                            required
                            error={
                              !!(
                                formik.touched.location &&
                                formik.errors.location
                              )
                            }
                            fullWidth
                            helperText={
                              formik.touched.location && formik.errors.location
                            }
                            label={t("Location")}
                            name="location"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="location"
                            value={formik.values.location}
                          />

                          <TextFieldWrapper
                            error={
                              !!(
                                formik.touched.startCash &&
                                formik.errors.startCash
                              )
                            }
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            onKeyDown={(event) => {
                              if (
                                event.key == "." ||
                                event.key === "+" ||
                                event.key === "-"
                              ) {
                                event.preventDefault();
                              }
                            }}
                            fullWidth
                            type="number"
                            helperText={
                              formik.touched.startCash &&
                              formik.errors.startCash
                            }
                            label={t(`Default Starting Cash (in ${currency})`)}
                            name="startCash"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            value={formik.values.startCash}
                            required
                          />

                          <TextFieldWrapper
                            required
                            error={
                              !!(
                                formik.touched.recipientEmail &&
                                formik.errors.recipientEmail
                              )
                            }
                            fullWidth
                            helperText={
                              formik.touched.recipientEmail &&
                              formik.errors.recipientEmail
                            }
                            label={t("Recipient Email")}
                            name="recipientEmail"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            type="email"
                            value={formik.values.recipientEmail}
                          />

                          <Stack
                            alignItems="center"
                            direction="row"
                            justifyContent="space-between"
                            spacing={3}
                          >
                            <Stack>
                              <Typography gutterBottom variant="subtitle1">
                                {t("Status")}
                              </Typography>
                              <Typography
                                color="text.secondary"
                                variant="body2"
                              >
                                {t(
                                  "Enabling this would show the cash management option"
                                )}
                              </Typography>
                            </Stack>

                            <Switch
                              checked={formik.values.cashManagementStatus}
                              color="primary"
                              edge="start"
                              name="cashManagementStatus"
                              onChange={formik.handleChange}
                              value={formik.values.cashManagementStatus}
                            />
                          </Stack>

                          <Stack alignItems="center" direction="row">
                            <Checkbox
                              checked={formik.values.autoEmail}
                              name="autoEmail"
                              onChange={formik.handleChange}
                              sx={{ ml: -1.3 }}
                            />
                            <Typography variant="body2">
                              {t("Auto-Email Report after ending a drawer")}
                            </Typography>
                          </Stack>
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

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
                    href={
                      tijarahPaths?.management?.locations?.cashManagement?.index
                    }
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      formik.handleSubmit();
                    }}
                    loading={formik.isSubmitting}
                    sx={{ m: 1 }}
                    variant="contained"
                  >
                    {t("Update")}
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
