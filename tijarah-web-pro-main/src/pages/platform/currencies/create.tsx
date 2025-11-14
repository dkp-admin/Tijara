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
import getDuplicateErrorMsg from "src/utils/get-duplicate-message";
import * as Yup from "yup";

interface CreateCurrency {
  name: string;
  symbol: string;
  status: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();

  const { id } = router.query;

  const { findOne, create, updateEntity, entity, deleteEntity } =
    useEntity("currency");

  const initialValues: CreateCurrency = {
    name: "",
    symbol: "",
    status: "active",
  };

  const validationSchema = Yup.object({
    name: Yup.string().nullable().required(t("Name is required")),
    symbol: Yup.string().nullable().required(t("Symbol is required")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: values.name,
        symbol: values.symbol,
        status: values.status,
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Currency Updated").toString()
            : t("Currency Created").toString()
        );

        router.push(tijarahPaths?.platform?.currencies?.index);
      } catch (error) {
        if (error.code == "duplicate_record") {
          toast.error(getDuplicateErrorMsg(error));
        } else {
          toast.error(t(error.message).toString());
        }
      }
    },
  });

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity) {
      formik.setFieldValue("name", entity?.name);
      formik.setFieldValue("symbol", entity?.symbol);
      formik.setFieldValue("status", entity?.status);
    }
  }, [entity]);

  console.log(id, "ASDMKLADLM");

  return (
    <>
      <Seo title={`${t("Create Currency")}`} />
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
              <Box
                sx={{ cursor: "pointer", maxWidth: "9%" }}
                onClick={() => {
                  router.push({
                    pathname: tijarahPaths?.platform?.currencies?.index,
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
                  <Typography variant="subtitle2">{t("Currencies")}</Typography>
                </Link>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Currency") : t("Create Currency")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">{t("Name")}</Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box>
                          <TextFieldWrapper
                            fullWidth
                            label={`${t("Name")}`}
                            name="name"
                            type="text"
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            error={Boolean(
                              formik.touched.name && formik.errors.name
                            )}
                            helperText={
                              (formik.touched.name && formik.errors.name) as any
                            }
                            disabled={id !== undefined}
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.name}
                            onKeyDown={(event) => {
                              if (
                                event.key == "." ||
                                event.key === "+" ||
                                event.key === "-"
                              ) {
                                event.preventDefault();
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    <Grid sx={{ mt: 1 }} container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">{t("Symbol")}</Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box>
                          <TextFieldWrapper
                            fullWidth
                            disabled={id !== undefined}
                            label={`${t("Symbol")}`}
                            name="symbol"
                            placeholder="﷼"
                            type="text"
                            onWheel={(event: any) => {
                              event.preventDefault();
                              event.target.blur();
                            }}
                            error={Boolean(
                              formik.touched.symbol && formik.errors.symbol
                            )}
                            helperText={
                              (formik.touched.symbol &&
                                formik.errors.symbol) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.symbol}
                            onKeyDown={(event) => {
                              if (
                                event.key == "." ||
                                event.key === "+" ||
                                event.key === "-"
                              ) {
                                event.preventDefault();
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                    {id != null && (
                      <Grid sx={{ mt: 1 }} container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Status")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Change the status of the Currency")}
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
                                checked={formik.values.status === "active"}
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={(res) => {
                                  console.log(res?.target.checked, "ASDSAD");
                                  formik.setFieldValue(
                                    "status",
                                    res?.target.checked ? "active" : "inactive"
                                  );
                                }}
                                sx={{
                                  mr: 0.2,
                                }}
                              />
                            }
                            label={
                              formik.values.status === "active"
                                ? t("Active")
                                : t("Deactivated")
                            }
                          />
                        </Grid>
                      </Grid>
                    )}
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
                    href={tijarahPaths?.platform?.currencies?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <Box>
                    {id && (
                      <LoadingButton
                        onClick={async (e) => {
                          try {
                            e.preventDefault();
                            await deleteEntity(id.toString());
                            toast.success(t("Currency Deleted"));
                            router.push(
                              tijarahPaths?.platform?.currencies?.index
                            );
                          } catch (error) {
                            toast.error(t(error.message).toString());
                          }
                        }}
                        loading={formik.isSubmitting}
                        sx={{ m: 1 }}
                        variant="outlined"
                        color="error"
                      >
                        {t("Delete")}
                      </LoadingButton>
                    )}

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
                      {id != null ? t("Update") : t("Create")}
                    </LoadingButton>
                  </Box>
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
