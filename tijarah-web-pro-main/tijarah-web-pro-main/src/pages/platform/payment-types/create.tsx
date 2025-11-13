import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Link,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import * as Yup from "yup";

interface CreatePaymentTypesProps {
  paymentTypeEng: string;
  paymentTypeAr: string;
  status: boolean;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();

  const canAccess = usePermissionManager();
  const canUpdate = true;
  const canCreate = canAccess(MoleculeType["payment-type:create"]);

  const { findOne, create, updateEntity, entity } = useEntity("payment-type");

  const initialValues: CreatePaymentTypesProps = {
    paymentTypeEng: "",
    paymentTypeAr: "",
    status: true,
  };

  const validationSchema = Yup.object({
    paymentTypeEng: Yup.string()
      .max(255)
      .required(t("Payment Type English is required")),
    paymentTypeAr: Yup.string()
      .max(255)
      .required(t("Payment Type Arabic is required")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.paymentTypeEng.trim(),
          ar: values.paymentTypeAr.trim(),
        },
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
            ? t("Payment Type Updated").toString()
            : t("Payment Type Created").toString()
        );

        router.push(tijarahPaths?.platform?.paymentTypes?.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (id) {
      findOne(id.toString());
    }
  }, [id]);

  useEffect(() => {
    if (id && entity) {
      formik.setFieldValue("paymentTypeEng", entity?.name?.en || "");
      formik.setFieldValue("paymentTypeAr", entity?.name?.ar || "");
      formik.setFieldValue("status", entity?.status === "active");
    }
  }, [entity, id]);

  // if (id && !canUpdate) {
  //   return <NoPermission />;
  // }

  // if (!id && !canCreate) {
  //   return <NoPermission />;
  // }

  // if (!canAccess(MoleculeType["payment-type:read"])) {
  //   return <NoPermission />;
  // }

  return (
    <>
      <Seo
        title={
          id != null
            ? `${t("Edit Payment Type")}`
            : `${t("Create Payment Type")}`
        }
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box sx={{ cursor: "pointer", maxWidth: "12%" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    maxWidth: 140,
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    router.push({
                      pathname: tijarahPaths?.platform?.paymentTypes?.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Payment Types")}
                  </Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Payment Type") : t("Create Payment Type")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Payment Type Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Payment Type (English)")}
                            name="paymentTypeEng"
                            error={Boolean(
                              formik.touched.paymentTypeEng &&
                                formik.errors.paymentTypeEng
                            )}
                            helperText={
                              (formik.touched.paymentTypeEng &&
                                formik.errors.paymentTypeEng) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.paymentTypeEng}
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            label={t("Payment Type (Arabic)")}
                            name="paymentTypeAr"
                            error={Boolean(
                              formik.touched.paymentTypeAr &&
                                formik.errors.paymentTypeAr
                            )}
                            helperText={
                              (formik.touched.paymentTypeAr &&
                                formik.errors.paymentTypeAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.paymentTypeAr}
                          />
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
                              {t("Change the status of the Payment Type")}
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
                                    return toast.error(
                                      t("You don't have access")
                                    );
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
                    href={tijarahPaths?.platform?.paymentTypes?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    onClick={() => {
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
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
