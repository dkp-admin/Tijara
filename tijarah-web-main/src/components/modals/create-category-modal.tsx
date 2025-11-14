import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FileDropzone } from "src/components/file-dropzone";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";
import CompanyDropdown from "../input/company-auto-complete";
import { Seo } from "../seo";
import TextFieldWrapper from "../text-field-wrapper";
import { ImageCropModal } from "./image-crop-modal";

interface CreateCategoryProps {
  categoryNameEn?: string;
  categoryNameAr?: string;
  description?: string;
  logoFile: any[];
  logo: string;
  status: boolean;
}

const validationSchema = Yup.object({
  categoryNameEn: Yup.string()
    .required(`${i18n.t("Category Name is required in English")}`)
    .max(60, i18n.t("Category name must not be greater than 60 characters")),
  categoryNameAr: Yup.string()
    .required(`${i18n.t("Category Name is required in Arabic")}`)
    .max(60, i18n.t("Category name must not be greater than 60 characters")),
});

const CreateCategoryModal = (props: any) => {
  const { setCreateCategory, createCategory } = props;

  const { t } = useTranslation();
  const { user } = useAuth();
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["category:update"]) ||
    canAccess(MoleculeType["category:manage"]);
  const { findOne, create, loading } = useEntity("category");

  usePageView();

  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
    formik.setFieldValue("logoFile", croppedImageUrl);
  };

  const initialValues: CreateCategoryProps = {
    categoryNameEn: "",
    categoryNameAr: "",
    description: "",
    logoFile: [],
    logo: "",
    status: true,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        image: values?.logo,
        name: {
          en: values.categoryNameEn,
          ar: values.categoryNameAr,
        },
        description: values.description,
        status: values.status ? "active" : "inactive",
        companyRef: user.company._id,
        company: {
          name: user.company.name.en,
        },
      };

      try {
        await create({ ...data });

        toast.success(`${t("Category Created")}`);
        setCreateCategory(false);
        formik.resetForm();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

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
    <Modal open={createCategory}>
      <Box>
        <Card
          sx={{
            visibility: "visible",
            position: "fixed ",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "70vw",
              md: "65vw",
            },
            bgcolor: "background.paper",
            overflow: "hidden",
            height: {
              xs: "80vh",
              md: "85vh",
              lg: "89vh",
            },
          }}
        >
          <Box
            style={{
              zIndex: 99,
              position: "fixed",
              width: "100%",
              display: "flex",
              padding: 20,
            }}
          >
            <XCircle
              fontSize="small"
              onClick={() => {
                setCreateCategory(false);
                formik.resetForm();
              }}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                {t("Add Category")}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mt: 5,
              overflow: "auto",
              height: "100%",
              width: "100%",
            }}
          >
            <>
              <Seo title={`${t("Create Categories")}`} />
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  py: 8,
                }}
              >
                <Container maxWidth="xl">
                  <Stack spacing={3}>
                    <form noValidate onSubmit={formik.handleSubmit}>
                      <Stack spacing={4} sx={{ mt: 3 }}>
                        <Card
                          style={{
                            boxShadow: "none",
                          }}
                        >
                          <CardContent>
                            <Grid container spacing={3}>
                              <Grid item md={4} xs={12}>
                                <Typography variant="h6">
                                  {t("Category Details")}
                                </Typography>
                              </Grid>

                              <Grid item md={8} xs={12}>
                                {user.userType == USER_TYPES.SUPERADMIN && (
                                  <Box sx={{ mb: 3 }}>
                                    <CompanyDropdown
                                      disabled
                                      onChange={() => {}}
                                      selectedId={user.company._id as string}
                                      label={t("Company")}
                                      id="company"
                                    />
                                  </Box>
                                )}

                                <Box>
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="h6">
                                      {t("Icon")}
                                    </Typography>
                                    <Typography
                                      color="textSecondary"
                                      sx={{ mt: 1 }}
                                      variant="body2"
                                    >
                                      {t("Please upload the category Icon")}
                                    </Typography>
                                  </Box>

                                  <FileDropzone
                                    // @ts-ignore
                                    accept={{
                                      "image/*": [],
                                    }}
                                    caption="(SVG, JPG, PNG, or gif)"
                                    files={formik.values.logoFile}
                                    imageName={getUploadedDocName(
                                      formik.values.logo
                                    )}
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

                                <Box sx={{ mt: 3 }}>
                                  <TextFieldWrapper
                                    autoComplete="off"
                                    inputProps={{
                                      style: { textTransform: "capitalize" },
                                    }}
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
                                    autoComplete="off"
                                    inputProps={{
                                      style: { textTransform: "capitalize" },
                                    }}
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

                                <Box sx={{ mt: 3, mb: 3 }}>
                                  <TextFieldWrapper
                                    autoComplete="off"
                                    inputProps={{
                                      style: { textTransform: "capitalize" },
                                    }}
                                    label={t("Description")}
                                    name="description"
                                    multiline
                                    rows={4}
                                    fullWidth
                                    onChange={formik.handleChange(
                                      "description"
                                    )}
                                    value={formik.values.description}
                                  />
                                </Box>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </Stack>
                    </form>
                    <Stack
                      alignItems="center"
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                      sx={{
                        mt: 10,
                        bgcolor: "background.paper",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "space-between",
                        zIndex: 99,
                        position: "fixed",
                        bottom: 5,
                        width: "95%",
                      }}
                    >
                      <Button
                        color="inherit"
                        onClick={() => {
                          setCreateCategory(false);
                          formik.resetForm();
                        }}
                      >
                        {t("Cancel")}
                      </Button>

                      <LoadingButton
                        type="submit"
                        onClick={(e) => {
                          e.preventDefault();
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          formik.handleSubmit();
                        }}
                        loading={formik.isSubmitting}
                        sx={{ m: 1 }}
                        variant="contained"
                      >
                        {t("Create")}
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </Container>
              </Box>
            </>
          </Box>
        </Card>
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
      </Box>
    </Modal>
  );
};

export default CreateCategoryModal;
