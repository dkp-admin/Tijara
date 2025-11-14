import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { LogoUploader } from "src/components/print-template-logo-uploader";
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
import { industryOptions } from "src/utils/constants";
import * as Yup from "yup";

interface CreateBusinessTypesProps {
  businessTypeEng: string;
  businessTypeAr: string;
  industry: string;
  status: boolean;
  logo?: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();

  const [, setShowError] = useState(false);
  const canAccess = usePermissionManager();
  const canUpdate = true;
  const canCreate = canAccess(MoleculeType["business-type:create"]);

  const { findOne, create, updateEntity, entity } = useEntity("business-type");

  const initialValues: CreateBusinessTypesProps = {
    businessTypeEng: "",
    businessTypeAr: "",
    industry: "",
    status: true,
    logo: "",
  };

  const validationSchema = Yup.object({
    businessTypeEng: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid business type")
      )
      .required(t("Business Type (English) is required"))
      .max(60, t("Business type must not be greater than 60 characters")),
    businessTypeAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid business type")
      )
      .required(t("Business Type (Arabic) is required"))
      .max(60, t("Business type must not be greater than 60 characters")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.businessTypeEng.trim(),
          ar: values.businessTypeAr.trim(),
        },
        industry: values.industry,
        status: values.status ? "active" : "inactive",
        logo: values?.logo || "",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Business Type Updated").toString()
            : t("Business Type Created").toString()
        );

        router.push(tijarahPaths?.platform?.businessTypes?.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);
  console.log(formik);

  useEffect(() => {
    if (entity) {
      delete entity?._id;
      formik.setValues({
        businessTypeEng: entity?.name?.en,
        businessTypeAr: entity?.name?.ar,
        industry: entity?.industry,
        status: entity?.status == "active" ? true : false,
        logo: entity?.logo || "",
      });
    }
  }, [entity]);

  if (!canAccess(MoleculeType["business-type:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null
            ? `${t("Edit Business Type")}`
            : `${t("Create Business Type")}`
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
                      pathname: tijarahPaths?.platform?.businessTypes?.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Business Types")}
                  </Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null
                  ? t("Edit Business Type")
                  : t("Create Business Type")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Business Type Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box sx={{ mb: 3 }}>
                          <LogoUploader
                            origin="business-type-logo"
                            imageUploadUrl={
                              formik.values.logo != null && formik.values.logo
                            }
                            onSuccess={(url: string) =>
                              formik.handleChange("logo")(url)
                            }
                          />
                        </Box>
                        <Box
                          data-testid="businessType"
                          sx={{
                            alignItems: "center",
                          }}
                        >
                          <TextFieldWrapper
                            disabled={id != null}
                            error={Boolean(
                              !!(
                                formik.touched.industry &&
                                formik.errors.industry
                              )
                            )}
                            fullWidth
                            label={t("Industry")}
                            name="industry"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.industry}
                            required
                          >
                            {industryOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Business Type (English)")}
                            name="businessTypeEng"
                            error={Boolean(
                              formik.touched.businessTypeEng &&
                                formik.errors.businessTypeEng
                            )}
                            helperText={
                              (formik.touched.businessTypeEng &&
                                formik.errors.businessTypeEng) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.businessTypeEng}
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
                            label={t("Business Type (Arabic)")}
                            name="businessTypeAr"
                            error={Boolean(
                              formik.touched.businessTypeAr &&
                                formik.errors.businessTypeAr
                            )}
                            helperText={
                              (formik.touched.businessTypeAr &&
                                formik.errors.businessTypeAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.businessTypeAr}
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
                              {t("Change the status of the Business Type")}
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
                    href={tijarahPaths?.platform?.businessTypes?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    onClick={() => {
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
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
