import { ArrowBack } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PackageAddonsTable } from "src/components/packages/package-addon-table";
import { PackageHardwaresTable } from "src/components/packages/package-hardwares-table";
import { PackagePricesTable } from "src/components/packages/package-prices-table";
import { PackageSummaryCard } from "src/components/packages/package-summary-card";
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

interface CreatePackageProps {
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  prices: Array<{ type: string; price: number; discountPercentage: number }>;
  modules: Array<{
    name: string;
    key: string;
    subModules: { key: string; name: string }[];
  }>;
  addons: Array<{
    key: string;
    monthlyPrice: number;
    annualPrice: number;
    quarterlyPrice: number;
  }>;
  hardwares: Array<{ name: string; price: number }>;
  status: string;
  trialDays: number;
  locationLimit: number;
  deviceLimit: number;
  tag: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["package:update"]);
  const canCreate = canAccess(MoleculeType["package:create"]);
  const { findOne, create, updateEntity, entity } = useEntity("package");
  const { find, entities: modulesList } = useEntity("authentication/modules");
  const [moduleInputValue, setModuleInputValue] = useState("");
  const [isImageUpload, setIsImageUpload] = useState(false);

  const initialValues: CreatePackageProps = {
    name: entity?.name || { en: "", ar: "" },
    description: entity?.description || { en: "", ar: "" },
    prices:
      entity?.prices?.map((p: any) => ({
        ...p,
        discountPercentage: p.discountPercentage ?? 0,
      })) || [],
    modules: entity?.modules || [],
    addons: entity?.addons || [],
    hardwares: entity?.hardwares || [],
    status: entity?.status || "active",
    trialDays: entity?.trialDays || 0,
    locationLimit: entity?.locationLimit || 0,
    deviceLimit: entity?.deviceLimit || 0,
    tag: entity?.tag || "",
  };

  const validationSchema = Yup.object({
    name: Yup.object({
      en: Yup.string().required(t("English name is required")),
      ar: Yup.string().required(t("Arabic name is required")),
    }),
    description: Yup.object({
      en: Yup.string().required(t("English description is required")),
      ar: Yup.string().required(t("Arabic description is required")),
    }),
    prices: Yup.array()
      .min(1, t("At least one price must be added"))
      .of(
        Yup.object().shape({
          type: Yup.string().required(t("Price type is required")),
          price: Yup.number()
            .required(t("Price is required"))
            .min(1, t("Price must be greater than 0")),
          discountPercentage: Yup.number()
            .min(0, t("Discount percentage cannot be negative"))
            .max(100, t("Discount percentage cannot exceed 100%")),
        })
      ),
    modules: Yup.array()
      .min(1, t("At least one module must be selected"))
      .of(
        Yup.object().shape({
          name: Yup.string().required(t("Module name is required")),
          key: Yup.string().required(t("Module key is required")),
          subModules: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required(t("Submodule key is required")),
              name: Yup.string().required(t("Submodule name is required")),
            })
          ),
        })
      )
      .required(t("Modules are required")),
    trialDays: Yup.number()
      .required(t("Trial days is required"))
      .min(0, t("Trial days cannot be negative"))
      .integer(t("Trial days must be a whole number")),
    locationLimit: Yup.number()
      .required(t("Location limit is required"))
      .min(1, t("Location limit must be greater than 0"))
      .integer(t("Location limit must be a whole number")),
    deviceLimit: Yup.number()
      .required(t("Device limit is required"))
      .min(1, t("Device limit must be greater than 0"))
      .integer(t("Device limit must be a whole number")),
    addons: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(t("Module name is required")),
          key: Yup.string().required(t("Module key is required")),
          subModules: Yup.array().of(
            Yup.object().shape({
              key: Yup.string().required(t("Submodule key is required")),
              name: Yup.string().required(t("Submodule name is required")),
            })
          ),
        })
      )
      .required(t("Modules are required")),
    hardwares: Yup.array().of(
      Yup.object().shape({
        name: Yup.object({
          en: Yup.string().required(t("English hardware name is required")),
          ar: Yup.string().required(t("Arabic hardware name is required")),
        }),
        price: Yup.number()
          .required(t("Price is required"))
          .min(0, t("Price cannot be negative")),
      })
    ),
    tag: Yup.string(),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (id) {
          if (!canUpdate) {
            toast.error(t("You don't have access"));
            return;
          }
          await updateEntity(id.toString(), values);
          if (isImageUpload) {
            toast.success(t("Image Uploaded"));
          } else {
            toast.success(t("Package Updated"));
          }
        } else {
          if (!canCreate) {
            toast.error(t("You don't have access"));
            return;
          }
          await create(values);
          toast.success(t("Package Created"));
        }
        if (!isImageUpload) {
          router.push(tijarahPaths.platform.packages.index);
        }

        if (isImageUpload) {
          setIsImageUpload(false);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    find({});
  }, []);

  useEffect(() => {
    if (id) {
      findOne(id.toString());
    }
  }, [id]);

  if (!canAccess(MoleculeType["package:create"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={id ? t("Edit Package") : t("Create Package")} />
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={4}>
              <Box sx={{ cursor: "pointer", maxWidth: "12%" }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{ maxWidth: 140, alignItems: "center", display: "flex" }}
                  onClick={() =>
                    router.push(tijarahPaths.platform.packages.index)
                  }
                >
                  <ArrowBack
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Packages")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id ? t("Edit Package") : t("Create Package")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6">
                          {t("Package Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Name (English)")}
                          name="name.en"
                          error={
                            formik.touched.name?.en &&
                            Boolean(formik.errors.name?.en)
                          }
                          helperText={
                            formik.touched.name?.en && formik.errors.name?.en
                          }
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.name.en}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Name (Arabic)")}
                          name="name.ar"
                          error={
                            formik.touched.name?.ar &&
                            Boolean(formik.errors.name?.ar)
                          }
                          helperText={
                            formik.touched.name?.ar && formik.errors.name?.ar
                          }
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.name.ar}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Description (English)")}
                          name="description.en"
                          error={
                            formik.touched.description?.en &&
                            Boolean(formik.errors.description?.en)
                          }
                          helperText={
                            formik.touched.description?.en &&
                            formik.errors.description?.en
                          }
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.description.en}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Description (Arabic)")}
                          name="description.ar"
                          error={
                            formik.touched.description?.ar &&
                            Boolean(formik.errors.description?.ar)
                          }
                          helperText={
                            formik.touched.description?.ar &&
                            formik.errors.description?.ar
                          }
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          required
                          value={formik.values.description.ar}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <Autocomplete
                          multiple
                          options={(modulesList as any) || []}
                          getOptionLabel={(option) => option.name}
                          isOptionEqualToValue={(option, value) =>
                            option.key === value.key
                          }
                          value={formik.values.modules}
                          onChange={(_, newValue) =>
                            formik.setFieldValue("modules", newValue)
                          }
                          disableCloseOnSelect
                          renderInput={(params) => (
                            <TextFieldWrapper
                              {...params}
                              error={
                                formik.touched.modules &&
                                Boolean(formik.errors.modules)
                              }
                              helperText={
                                formik.touched.modules && formik.errors.modules
                                  ? Array.isArray(formik.errors.modules)
                                    ? formik.errors.modules.join(", ")
                                    : formik.errors.modules
                                  : undefined
                              }
                              label={t("Modules")}
                              required
                            />
                          )}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Checkbox checked={selected} sx={{ p: 1 }} />
                              <Typography variant="body2">
                                {option.name}
                              </Typography>
                            </li>
                          )}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          type="number"
                          label={t("Trial Days")}
                          name="trialDays"
                          error={
                            formik.touched.trialDays &&
                            Boolean(formik.errors.trialDays)
                          }
                          helperText={
                            formik.touched.trialDays && formik.errors.trialDays
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "trialDays",
                              Number(e.target.value)
                            )
                          }
                          value={formik.values.trialDays}
                          required
                          inputProps={{ step: 1, min: 0 }}
                          onKeyPress={(e) => {
                            if (e.key === "." || e.key === ",")
                              e.preventDefault();
                          }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          type="number"
                          label={t("Device Limit")}
                          name="deviceLimit"
                          error={
                            formik.touched.deviceLimit &&
                            Boolean(formik.errors.deviceLimit)
                          }
                          helperText={
                            formik.touched.deviceLimit &&
                            formik.errors.deviceLimit
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "deviceLimit",
                              Number(e.target.value)
                            )
                          }
                          value={formik.values.deviceLimit}
                          required
                          inputProps={{ step: 1, min: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === "." || e.key === ",")
                              e.preventDefault();
                          }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          type="number"
                          label={t("Location Limit")}
                          name="locationLimit"
                          error={
                            formik.touched.locationLimit &&
                            Boolean(formik.errors.locationLimit)
                          }
                          helperText={
                            formik.touched.locationLimit &&
                            formik.errors.locationLimit
                          }
                          onBlur={formik.handleBlur}
                          onChange={(e) =>
                            formik.setFieldValue(
                              "locationLimit",
                              Number(e.target.value)
                            )
                          }
                          value={formik.values.locationLimit}
                          required
                          inputProps={{ step: 1, min: 1 }}
                          onKeyPress={(e) => {
                            if (e.key === "." || e.key === ",")
                              e.preventDefault();
                          }}
                        />
                      </Grid>
                      <Grid item md={6} xs={12}>
                        <TextFieldWrapper
                          fullWidth
                          label={t("Tag")}
                          name="tag"
                          error={
                            formik.touched.tag && Boolean(formik.errors.tag)
                          }
                          helperText={formik.touched.tag && formik.errors.tag}
                          onBlur={formik.handleBlur}
                          onChange={formik.handleChange}
                          value={formik.values.tag}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {t("Package Prices")}
                        </Typography>
                        <Stack>
                          <Box sx={{ my: 2, p: 1 }}>
                            <Autocomplete
                              id="pricing-period-autocomplete"
                              fullWidth
                              disablePortal
                              options={[
                                // { label: "Monthly", value: "monthly" }, // Monthly package temporarily disabled
                                { label: "Quarterly", value: "quarterly" },
                                { label: "Annually", value: "annually" },
                              ].filter(
                                (option) =>
                                  !formik.values.prices.some(
                                    (price) =>
                                      price.type.toLowerCase() === option.value
                                  )
                              )}
                              value={null}
                              onChange={(_, newValue) => {
                                if (newValue) {
                                  formik.setFieldValue("prices", [
                                    ...formik.values.prices,
                                    {
                                      type: newValue.value,
                                      price: 0,
                                      discountPercentage: 0,
                                    },
                                  ]);
                                }
                              }}
                              getOptionLabel={(option) => option.label}
                              noOptionsText={t("No Options")}
                              renderInput={(params) => (
                                <TextFieldWrapper
                                  {...params}
                                  label={t("Add Pricing Period")}
                                  fullWidth
                                  error={
                                    formik.touched.prices &&
                                    Boolean(formik.errors.prices) &&
                                    typeof formik.errors.prices === "string"
                                  }
                                  helperText={
                                    formik.touched.prices &&
                                    formik.errors.prices
                                      ? typeof formik.errors.prices === "string"
                                        ? formik.errors.prices
                                        : ""
                                      : ""
                                  }
                                />
                              )}
                            />
                          </Box>
                        </Stack>
                        <PackagePricesTable formik={formik} />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1}>
                          <Typography variant="h6">
                            {t("Package Addons")}
                          </Typography>
                        </Stack>
                        <Stack>
                          <Box sx={{ my: 2, p: 1 }}>
                            <Autocomplete
                              id="modules-autocomplete"
                              fullWidth
                              disablePortal
                              getOptionLabel={(option) => option.name}
                              options={[
                                {
                                  name: "Location Addon",
                                  key: "location_addon",
                                },
                                { name: "Device Addon", key: "device_addon" },
                                ...((modulesList as any) || []),
                              ].filter(
                                (module) =>
                                  !formik.values.addons.some(
                                    (addon) => addon.key === module.key
                                  ) &&
                                  !formik.values.modules.some(
                                    (md) => module.key === md.key
                                  )
                              )}
                              value={null}
                              onChange={(_, newValue) => {
                                if (newValue) {
                                  const newAddon: any = {
                                    name: newValue.name,
                                    key: newValue.key,
                                    subModules: newValue.subModules,
                                    prices: [],
                                    tag: newValue?.tag || "",
                                  };
                                  formik.setFieldValue("addons", [
                                    ...formik.values.addons,
                                    newAddon,
                                  ]);
                                  setModuleInputValue("");
                                }
                              }}
                              inputValue={moduleInputValue}
                              onInputChange={(_, newInputValue) =>
                                setModuleInputValue(newInputValue)
                              }
                              noOptionsText={t("No Options")}
                              renderInput={(params) => (
                                <TextFieldWrapper
                                  data-testid="modules-autocomplete-input"
                                  {...params}
                                  label={t("Search and add module")}
                                  fullWidth
                                />
                              )}
                            />
                          </Box>
                        </Stack>
                        <PackageAddonsTable
                          formik={formik}
                          modulesList={modulesList as any}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Stack spacing={1} sx={{ my: 2 }}>
                          <Typography variant="h6">
                            {t("Package Hardware")}
                          </Typography>
                        </Stack>
                        <PackageHardwaresTable
                          formik={formik}
                          setIsImageUpload={setIsImageUpload}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <PackageSummaryCard formik={formik} />

                {id && (
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={8}>
                          <Stack spacing={1}>
                            <Typography variant="h6">{t("Status")}</Typography>
                            <Typography color="text.secondary" variant="body2">
                              {t("Change the status of the Package")}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={4}
                          sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                          <FormControlLabel
                            control={
                              <Switch
                                checked={formik.values.status === "active"}
                                color="primary"
                                edge="end"
                                name="status"
                                onChange={() =>
                                  formik.setFieldValue(
                                    "status",
                                    formik.values.status === "active"
                                      ? "inactive"
                                      : "active"
                                  )
                                }
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
                    </CardContent>
                  </Card>
                )}

                <Stack
                  alignItems="center"
                  direction="row"
                  justifyContent="space-between"
                  spacing={1}
                  sx={{ mx: 6 }}
                >
                  <Button
                    color="inherit"
                    component={RouterLink}
                    href={tijarahPaths.platform.packages.index}
                  >
                    {t("Cancel")}
                  </Button>
                  <LoadingButton
                    type="submit"
                    loading={formik.isSubmitting}
                    variant="contained"
                  >
                    {id ? t("Update") : t("Create")}
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
