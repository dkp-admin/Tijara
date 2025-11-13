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
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import * as Yup from "yup";

interface CreateIndustry {
  industryEng: string;
  industryAr: string;
  status: boolean;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();

  const [, setShowError] = useState(false);

  const { findOne, create, updateEntity, entity } = useEntity("business-type");

  const initialValues: CreateIndustry = {
    industryEng: "",
    industryAr: "",
    status: true,
  };

  const validationSchema = Yup.object({
    industryEng: Yup.string().required(t("Industry (English) is required")),
    industryAr: Yup.string().required(t("Industry (Arabic) is required")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.industryEng,
          ar: values.industryAr,
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
            ? t("Industry Updated").toString()
            : t("Industry Created").toString()
        );

        router.push(tijarahPaths?.platform?.industries?.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, []);

  useEffect(() => {
    if (entity) {
      delete entity?._id;
      formik.setValues({
        industryEng: entity?.name?.en,
        industryAr: entity?.name?.ar,
        status: entity?.status == "active" ? true : false,
      });
    }
  }, [entity]);

  return (
    <>
      <Seo title={`${t("Create Industry")}`} />
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
              <Box sx={{ cursor: "pointer" }}>
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
                      pathname: tijarahPaths?.platform?.industries?.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Industries")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Industry") : t("Create Industry")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Industry Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Industry (English)")}
                            name="industryEng"
                            error={Boolean(
                              formik.touched.industryEng &&
                                formik.errors.industryEng
                            )}
                            helperText={
                              (formik.touched.industryEng &&
                                formik.errors.industryEng) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            disabled={id != null}
                            value={formik.values.industryEng}
                          />
                        </Box>
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Industry (Arabic)")}
                            name="industryAr"
                            error={Boolean(
                              formik.touched.industryAr &&
                                formik.errors.industryAr
                            )}
                            helperText={
                              (formik.touched.industryAr &&
                                formik.errors.industryAr) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            disabled={id != null}
                            value={formik.values.industryAr}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={8}>
                        <Stack spacing={1}>
                          <Typography variant="h6">{t("Status")}</Typography>
                          <Typography color="text.secondary" variant="body2">
                            {t("Change the status of the Industry")}
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
                    href={tijarahPaths?.platform?.industries?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={() => {
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
