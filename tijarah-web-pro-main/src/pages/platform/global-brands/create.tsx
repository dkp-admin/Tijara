import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { ProductDropzone } from "src/components/product-dropzone";
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
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
interface CreateGlobalBrandProps {
  brandNameEn?: string;
  brandNameAr?: string;
  description?: string;
  logoFile: any[];
  logo: string;
  status: boolean;
}

const CreateGlobalBrands: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["brand:update"]);
  const canCreate = canAccess(MoleculeType["brand:create"]);

  const { id } = router.query;
  usePageView();
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("brands");

  const initialValues: CreateGlobalBrandProps = {
    brandNameEn: "",
    brandNameAr: "",
    description: "",
    logoFile: [],
    logo: "",
    status: true,
  };

  const validationSchema = Yup.object({
    brandNameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid brand name")
      )
      .required(`${t("Global Brand Name in english is required")}`)
      .max(60, t("Global brands must not be greater than 60 characters")),
    brandNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid brand name")
      )
      .required(`${t("Global Brand Name in Arabic is required")}`)

      .max(60, t("Global brands must not be greater than 60 characters")),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.brandNameEn.trim(),
          ar: values.brandNameAr.trim(),
        },
        image: values.logo,
        description: values.description,
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
            ? t("Global Brands Updated").toString()
            : t("Global Brands Created").toString()
        );

        router.push(tijarahPaths?.platform?.globalBrands?.index);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const companyLogoFileRemove = (): void => {
    formik.setFieldValue("logoFile", []);
    formik.setFieldValue("logo", "");
  };

  const companyLogoFileDrop = (newFiles: any): void => {
    if (newFiles?.length > 1) {
      toast.error(t("Please select one image to upload"));
      return;
    }

    formik.setFieldValue("logoFile", newFiles);
    if (newFiles[0]) {
      setOpenCropModal(true);
    } else {
      toast.error(
        `${t("File type not supported or limit the image size within 1 MB")}`
      );
    }
  };

  const logoFileRemoveAll = (): void => {
    formik.setFieldValue("logoFile", []);
  };

  const handleUpload = async (files: any) => {
    setIsUploading(true);
    try {
      const file = files[0];
      const tempUrl = URL.createObjectURL(file);
      setImgSrc(tempUrl);
      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
      setIsUploading(false);
    }
  };

  const handleCroppedImage = (croppedImageUrl: any) => {
    formik.setFieldValue("logo", croppedImageUrl);
  };

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity) {
      delete entity?._id;

      formik.setFieldValue("logo", entity?.image || "");
      formik.setFieldValue("brandNameEn", entity?.name?.en);
      formik.setFieldValue("brandNameAr", entity?.name?.ar);
      formik.setFieldValue("description", entity?.description);
      formik.setFieldValue("status", entity?.status == "active" ? true : false);
    }
  }, [entity]);

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!canAccess(MoleculeType["brand:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Create Global Brands")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Box
              sx={{
                cursor: "pointer",
                mb: 3,
                maxWidth: "11%",
              }}
            >
              <Link
                color="textPrimary"
                component="a"
                sx={{
                  alignItems: "center",
                  display: "flex",
                }}
                onClick={() => {
                  router.push({
                    pathname: tijarahPaths?.platform?.globalBrands?.index,
                  });
                }}
              >
                <ArrowBackIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "#6B7280" }}
                />
                <Typography variant="subtitle2">
                  {t("Global Brands")}
                </Typography>
              </Link>
            </Box>
            <Stack spacing={1}>
              <Typography variant="h4">
                {id != null ? t("Edit Global Brand") : t("Create Global Brand")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Brand Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        {/* <Box sx={{ mt: 3 }}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="h6">{t("Logo")}</Typography>
                            <Typography
                              color="textSecondary"
                              sx={{ mt: 1 }}
                              variant="body2"
                            >
                              {t("Please upload the Global Brand Logo")}
                            </Typography>
                          </Box> */}

                        {/* <ProductDropzone
                            disabled={id != null && !canUpdate}
                            accept={{
                              "image/*": [],
                            }}
                            caption="(SVG, JPG, PNG, or gif)"
                            files={formik.values.logoFile}
                            imageName={getUploadedDocName(formik.values.logo)}
                            uploadedImageUrl={formik.values.logo}
                            onDrop={companyLogoFileDrop}
                            onUpload={handleUpload}
                            onRemove={companyLogoFileRemove}
                            onRemoveAll={logoFileRemoveAll}
                            maxFiles={1}
                            maxSize={999999}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                            fileDataTestId="company-logo-file"
                          /> */}

                        {/* {Boolean(formik.touched.logo) && (
                            <Typography
                              color="error.main"
                              sx={{
                                fontSize: "12px",
                                fontWeight: 500,
                                margin: "5px 14px 0 14px",
                              }}
                            >
                              {formik.errors.logo}
                            </Typography>
                          )} */}
                        {/* </Box> */}
                        {/* <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Global Brand Name (English)")}
                            name="brandNameEn"
                            error={Boolean(
                              formik.touched.brandNameEn &&
                                formik.errors.brandNameEn
                            )}
                            helperText={
                              formik.touched.brandNameEn &&
                              formik.errors.brandNameEn
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.brandNameEn}
                          />
                        </Box> */}

                        {/* <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            fullWidth
                            label={t("Global Brand Name (Arabic)")}
                            name="brandNameAr"
                            error={Boolean(
                              formik.touched.brandNameAr &&
                                formik.errors.brandNameAr
                            )}
                            helperText={
                              formik.touched.brandNameAr &&
                              formik.errors.brandNameAr
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.brandNameAr}
                          />
                        </Box> */}
                        <Box
                          sx={{
                            mt: 3,
                            display: "flex",
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box sx={{ flex: 0.9, pr: 1 }}>
                            <Box sx={{ mt: 2 }}>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                autoComplete="off"
                                fullWidth
                                label={t("Global Brand Name (English)")}
                                name="brandNameEn"
                                error={Boolean(
                                  formik.touched.brandNameEn &&
                                    formik.errors.brandNameEn
                                )}
                                helperText={
                                  formik.touched.brandNameEn &&
                                  formik.errors.brandNameEn
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.brandNameEn}
                              />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
                                inputProps={{
                                  style: { textTransform: "capitalize" },
                                }}
                                autoComplete="off"
                                fullWidth
                                label={t("Global Brand Name (Arabic)")}
                                name="brandNameAr"
                                error={Boolean(
                                  formik.touched.brandNameAr &&
                                    formik.errors.brandNameAr
                                )}
                                helperText={
                                  formik.touched.brandNameAr &&
                                  formik.errors.brandNameAr
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.brandNameAr}
                              />
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flex: 0.2,
                              mt: 2,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <ProductDropzone
                              disabled={id != null && !canUpdate}
                              accept={{
                                "image/*": [],
                              }}
                              // caption="(SVG, JPG, PNG, or gif)"
                              files={formik.values.logoFile}
                              imageName={getUploadedDocName(formik.values.logo)}
                              uploadedImageUrl={formik.values.logo}
                              onDrop={companyLogoFileDrop}
                              onUpload={handleUpload}
                              onRemove={companyLogoFileRemove}
                              onRemoveAll={logoFileRemoveAll}
                              maxFiles={1}
                              maxSize={999999}
                              isUploaded={isUploaded}
                              setIsUploaded={setIsUploaded}
                              isUploading={isUploading}
                              fileDataTestId="company-logo-file"
                            />
                          </Box>
                        </Box>

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
                            autoComplete="off"
                            label={t("Description")}
                            name="description"
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("description")}
                            value={formik.values.description}
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
                              {t("Change the status of the brand")}
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
                    href={tijarahPaths?.platform?.globalBrands?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      if (id != null && !canUpdate) {
                        return toast.error(t("You don't have access"));
                      } else if (!id && !canCreate) {
                        return toast.error(t("You don't have access"));
                      }
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
          <ImageCropModal
            open={openCropModal}
            handleClose={() => {
              setOpenCropModal(false);
              setImgSrc(null);
            }}
            handleCroppedImage={handleCroppedImage}
            imgSrcUrl={imgSrc}
            fileUploadNameSpace={FileUploadNamespace["brand-images"]}
          />
        </Container>
      </Box>
    </>
  );
};

CreateGlobalBrands.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateGlobalBrands;
