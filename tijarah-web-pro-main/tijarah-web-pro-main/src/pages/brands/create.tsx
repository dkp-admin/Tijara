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
  MenuItem,
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
import { FileDropzone } from "src/components/file-dropzone";
import { RouterLink } from "src/components/router-link";
import { Seo } from "src/components/seo";
import { usePageView } from "src/hooks/use-page-view";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import { paths, tijarahPaths } from "src/paths";
import type { Page as PageType } from "src/types/page";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useEntity } from "src/hooks/use-entity";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import UpgradePackage from "src/pages/upgrade-package";
interface CreateBrandProps {
  brandNameEn?: string;
  brandNameAr?: string;
  description?: string;
  logoFile: any[];
  logo: string;
  status: boolean;
}

const CreateBrands: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  const { canAccessModule } = useFeatureModuleManager();
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [, setShowError] = useState(false);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("brands");

  const initialValues: CreateBrandProps = {
    brandNameEn: "",
    brandNameAr: "",
    description: "",
    logoFile: [],
    logo: "",
    status: true,
  };

  const validationSchema = Yup.object({
    brandNameEn: Yup.string().required(
      `${t("Brand Name is required in English")}`
    ),
    brandNameAr: Yup.string().required(
      `${t("Brand Name is required in Arabic")}`
    ),
    logo: Yup.string().required("Please Upload the Brand Logo"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.brandNameEn,
          ar: values.brandNameAr,
        },
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
            ? t("Brands Updated").toString()
            : t("Brands Created").toString()
        );

        router.push(tijarahPaths?.catalogue?.brands?.index);
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
  }, []);

  useEffect(() => {
    if (entity) {
      delete entity?._id;

      formik.setFieldValue("logo", entity?.logo || "");
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

  return (
    <>
      <Seo title={`${t("Create Brands")}`} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack spacing={1}>
              <Box sx={{ cursor: "pointer", mb: 3 }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    maxWidth: 60,
                    alignItems: "center",
                    display: "flex",
                  }}
                  onClick={() => {
                    router.push({
                      pathname: tijarahPaths?.catalogue?.brands?.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Brands")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Brands") : t("Create Brands")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Brands Details")}
                        </Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        <Box>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="h6">{t("Logo")}</Typography>
                            <Typography
                              color="textSecondary"
                              sx={{ mt: 1 }}
                              variant="body2"
                            >
                              {t("Please upload the brand logo")}
                            </Typography>
                          </Box>

                          <FileDropzone
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
                          />

                          {Boolean(formik.touched.logo) && (
                            <Typography
                              color="error.main"
                              sx={{
                                fontSize: "12px",
                                margin: "5px 14px 0 14px",
                              }}
                            >
                              {formik.errors.logo}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Brand Name (English)")}
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
                            disabled={id != null}
                            value={formik.values.brandNameEn}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("Brand Name (Arabic)")}
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
                            disabled={id != null}
                            value={formik.values.brandNameAr}
                          />
                        </Box>

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <TextFieldWrapper
                            variant="outlined"
                            label={t("Description")}
                            multiline
                            rows={4}
                            fullWidth
                            onChange={formik.handleChange("description")}
                            sx={{ height: 100 }}
                            value={formik.values.description}
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
                            {t("Change the status of the Category")}
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
                    href={tijarahPaths?.catalogue?.brands?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
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

CreateBrands.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default CreateBrands;
