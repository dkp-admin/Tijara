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
import BusinessTypeMultiSelect from "src/components/input/business-type-multiSelect";
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
import { industryOptions } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

interface CreateGLobalCategoryProps {
  businessTypeRef: string[];
  businessType: string[];
  industry: string;
  categoryNameEn?: string;
  categoryNameAr?: string;
  description?: string;
  logoFile: any[];
  logo: string;
  status: boolean;
}

const CreateCategories: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = router.query;
  usePageView();

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["global-category:update"]);
  const canCreate = canAccess(MoleculeType["global-category:create"]);

  const [, setShowError] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);

  const { findOne, create, updateEntity, entity, loading } =
    useEntity("global-categories");
  const { find, entities: businessTypes } = useEntity("business-type");

  const initialValues: CreateGLobalCategoryProps = {
    industry: "retail",
    businessType: [],
    businessTypeRef: [],
    categoryNameEn: "",
    categoryNameAr: "",
    description: "",
    logoFile: [],
    logo: "",
    status: true,
  };

  const validationSchema = Yup.object({
    categoryNameEn: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid category name")
      )
      .required(`${t("Category Name is required in English")}`)
      .max(60, t("Category name must not be greater than 60 characters")),
    categoryNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid category name")
      )
      .required(`${t("Category Name is required in Arabic")}`)
      .max(60, t("Category name must not be greater than 60 characters")),
    businessTypeRef: Yup.array()
      .required(`${t("Business Type is required")}`)
      .min(1, `${t("Business Type is required")}`),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        image: values.logo,
        name: {
          en: values.categoryNameEn,
          ar: values.categoryNameAr,
        },
        description: values.description,
        status: values.status ? "active" : "inactive",
        businessTypeRefs: values?.businessTypeRef,
        businessTypes: values.businessType,
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id != null
            ? t("Global Categories Updated").toString()
            : t("Global Categories Created").toString()
        );

        router.push(tijarahPaths?.platform?.globalCategories?.index);
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
    find({
      page: 0,
      limit: 30,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
    });
  }, [inputValue]);

  useEffect(() => {
    if (id != null) {
      findOne(id?.toString());
    }
  }, [id]);

  useEffect(() => {
    if (entity) {
      delete entity?._id;

      formik.setFieldValue("logo", entity?.image || "");
      formik.setFieldValue("categoryNameEn", entity?.name?.en);
      formik.setFieldValue("categoryNameAr", entity?.name?.ar);
      formik.setFieldValue("description", entity?.description);
      formik.setFieldValue("businessTypeRef", entity?.businessTypeRefs);
      formik.setFieldValue("businessType", entity?.businessType);
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

  if (!canAccess(MoleculeType["global-category:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null
            ? `${t("Edit Global Categories")}`
            : `${t("Create Global Categories")}`
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
            <Stack spacing={1}>
              <Box
                sx={{
                  cursor: "pointer",
                  mb: 3,
                  maxWidth: "13%",
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
                      pathname: tijarahPaths?.platform?.globalCategories?.index,
                    });
                  }}
                >
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">
                    {t("Global Categories")}
                  </Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null
                  ? t("Edit Global Categories")
                  : t("Create Global Categories")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Global Category Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        <Box>
                          <Box sx={{ mt: 3 }}>
                            <TextFieldWrapper
                              disabled
                              error={
                                !!(
                                  formik.touched.industry &&
                                  formik.errors.industry
                                )
                              }
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
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
                            </TextFieldWrapper>
                          </Box>
                          <Box sx={{ mt: 3 }}>
                            <BusinessTypeMultiSelect
                              disabled={id != null && !canUpdate}
                              error={
                                formik?.touched?.businessTypeRef &&
                                formik.errors.businessTypeRef
                              }
                              selectedIds={formik?.values?.businessTypeRef}
                              required
                              id={"business-multi-select"}
                              onChange={(option) => {
                                if (option?.length > 0) {
                                  const ids = option?.map((option: any) => {
                                    return option._id;
                                  });

                                  const names = option?.map((option: any) => {
                                    return option.name.en;
                                  });

                                  formik.setFieldValue("businessTypeRef", ids);
                                  formik.setFieldValue("businessType", names);
                                } else {
                                  formik.setFieldValue("businessTypeRef", []);
                                  formik.setFieldValue("businessType", []);
                                }
                              }}
                            />
                          </Box>
                          {/* <Box sx={{ mb: 1, mt: 3 }}>
                            <Typography variant="h6">{t("Icon")}</Typography>
                            <Typography
                              color="textSecondary"
                              sx={{ mt: 1 }}
                              variant="body2">
                              {t("Please upload the category Icon")}
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
                                margin: "5px 14px 0 14px",
                              }}>
                              {formik.errors.logo}
                            </Typography>
                          )} */}
                        </Box>

                        {/* <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Category (English)")}
                            name="categoryNameEn"
                            error={Boolean(
                              formik.touched.categoryNameEn &&
                                formik.errors.categoryNameEn
                            )}
                            helperText={
                              formik.touched.categoryNameEn &&
                              formik.errors.categoryNameEn
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.categoryNameEn}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            fullWidth
                            label={t("Category (Arabic)")}
                            name="categoryNameAr"
                            error={Boolean(
                              formik.touched.categoryNameAr &&
                                formik.errors.categoryNameAr
                            )}
                            helperText={
                              formik.touched.categoryNameAr &&
                              formik.errors.categoryNameAr
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.categoryNameAr}
                          />
                        </Box> */}

                        <Box
                          sx={{
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
                                fullWidth
                                label={t("Category (English)")}
                                name="categoryNameEn"
                                error={Boolean(
                                  formik.touched.categoryNameEn &&
                                    formik.errors.categoryNameEn
                                )}
                                helperText={
                                  formik.touched.categoryNameEn &&
                                  formik.errors.categoryNameEn
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.categoryNameEn}
                              />
                            </Box>

                            <Box sx={{ mt: 2 }}>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
                                fullWidth
                                label={t("Category (Arabic)")}
                                name="categoryNameAr"
                                error={Boolean(
                                  formik.touched.categoryNameAr &&
                                    formik.errors.categoryNameAr
                                )}
                                helperText={
                                  formik.touched.categoryNameAr &&
                                  formik.errors.categoryNameAr
                                }
                                onBlur={formik.handleBlur}
                                onChange={(e) => {
                                  formik.handleChange(e);
                                }}
                                required
                                value={formik.values.categoryNameAr}
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
                    <Box></Box>
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
                              {t("Change the status of the Global Category")}
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
                    href={tijarahPaths?.platform?.globalCategories?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowError(true);
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
            fileUploadNameSpace={FileUploadNamespace["category-images"]}
          />
        </Container>
      </Box>
    </>
  );
};

CreateCategories.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateCategories;
