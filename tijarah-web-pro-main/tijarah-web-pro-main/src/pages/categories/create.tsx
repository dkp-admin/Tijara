import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CircularProgress,
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
import CompanyDropdown from "src/components/input/company-auto-complete";
import KitchenDropdown from "src/components/input/kitchen-auto-complete";
import { ImageCropModal } from "src/components/modals/image-crop-modal";
import { ProductDropzone } from "src/components/product-dropzone";
import { Seo } from "src/components/seo";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import { usePageView } from "src/hooks/use-page-view";
import { useUserType } from "src/hooks/use-user-type";
import { Layout as DashboardLayout } from "src/layouts/dashboard";
import NoPermission from "src/pages/no-permission";
import UpgradePackage from "src/pages/upgrade-package";
import { tijarahPaths } from "src/paths";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import { Screens } from "src/utils/screens-names";
import { FileUploadNamespace } from "src/utils/uploadToS3";
import useActiveTabs from "src/utils/use-active-tabs";
import * as Yup from "yup";
interface CreateCategoryProps {
  kitchens?: any[];
  kitchenRefs?: string[];
  categoryNameEn?: string;
  categoryNameAr?: string;
  description?: string;
  logoFile: any[];
  logo: string;
  status: boolean;
}

const CreateCategories: PageType = () => {
  const router = useRouter();
  const { id, companyRef, companyName, origin, industry } = router.query;
  const { t } = useTranslation();
  const { canAccessModule } = useFeatureModuleManager();
  const breadcrumbs = [
    <Link
      underline="hover"
      key="1"
      color="inherit"
      onClick={() => {
        router.push({
          pathname: tijarahPaths.dashboard.salesDashboard,
        });
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
    </Link>,
    <Link
      underline="hover"
      key="2"
      color="inherit"
      onClick={() => {
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }

        router.back();
      }}
    >
      {t("Categories")}
    </Link>,
    <Link underline="hover" key="2" color="inherit" href="#">
      {id != null ? t("Edit Category") : t("Create Category")}
    </Link>,
  ];

  const { userType } = useUserType();
  const { user } = useAuth();
  const { changeTab } = useActiveTabs();
  const [imgSrc, setImgSrc] = useState("");
  const [openCropModal, setOpenCropModal] = useState(false);
  usePageView();
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["category:update"]);
  const canCreate = canAccess(MoleculeType["category:create"]);

  const { create: assign } = useEntity("kitchen-management/assign");
  const { create: remove } = useEntity("kitchen-management/remove");

  const { mode } = router.query;
  const { findOne, create, updateEntity, deleteEntity, entity, loading } =
    useEntity("category");

  const [, setShowError] = useState(false);

  const initialValues: CreateCategoryProps = {
    kitchens: [],
    kitchenRefs: [],
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
        t("Enter valid category")
      )
      .required(`${t("Category Name is required in English")}`)
      .max(60, "Category name must not be greater than 60 characters"),
    categoryNameAr: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid category")
      )
      .required(`${t("Category Name is required in Arabic")}`)
      .max(60, "Category name must not be greater than 60 characters"),
  });

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
        companyRef: companyRef,
        company: {
          name: companyName,
        },
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...data });
        } else {
          await create({ ...data });
        }

        toast.success(
          id == null ? `${t("Category Created")}` : `${t("Category Updated")}`
        );
        if (origin == "company") {
          changeTab("catalogue", Screens?.companyDetail);
        }
        router.back();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  // const handleKitchenChange = async (kitchenId: string, name: any) => {

  //   const categoriesData = {
  //     categoryRef: id,
  //     name: formik.values.categoryNameEn,
  //   };

  //   // const removeData = {
  //   //   categoriesData: categoriesData,
  //   //   kitchenRef: formik.values.kitchenRefs[0]?.toString(),
  //   // };

  //   const assignData = {
  //     categoriesData: [categoriesData],
  //     kitchenRef: kitchenId,
  //     name: {
  //       en: name.en,
  //       ar: name.ar,
  //     },
  //   };
  //   if (formik.values?.kitchenRefs?.length > 0) {
  //     await assign({
  //       categoriesData: [],
  //       kitchenRef: kitchenId,
  //       name: {
  //         en: name.en,
  //         ar: name.ar,
  //       },
  //     });
  //   }
  //   await assign(assignData);
  //   toast.success(t("Kitchen has been assigned!"));
  // };

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

  const handleDeleteItem = async () => {
    try {
      await deleteEntity(id.toString());
      toast.success(`${t("Item Deleted")}`);
      setShowDialogDeleteItem(false);
      router.back();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
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
    if (entity != null) {
      formik.setFieldValue("kitchenRefs", entity?.kitchenRefs || []);
      formik.setFieldValue("kitchens", entity?.kitchens || []);
      formik.setFieldValue("logo", entity?.image || "");
      formik.setFieldValue("categoryNameEn", entity?.name?.en);
      formik.setFieldValue("categoryNameAr", entity?.name?.ar);
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

  if (!canAccessModule("categories")) {
    return <UpgradePackage />;
  }

  if (!canAccess(MoleculeType["category:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo
        title={
          id != null ? `${t("Edit Categories")}` : `${t("Create Categories")}`
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
            {/* <Stack spacing={1}>
              <Box
                sx={{
                  cursor: "pointer",
                  mb: 3,
                  maxWidth: "10%",
                }}
                onClick={() => {
                  if (origin == "company") {
                    changeTab("catalogue", Screens?.companyDetail);
                  }
                  router.back();
                }}>
                <Link
                  color="textPrimary"
                  component="a"
                  sx={{
                    alignItems: "center",
                    display: "flex",
                  }}>
                  <ArrowBackIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "#6B7280" }}
                  />
                  <Typography variant="subtitle2">{t("Categories")}</Typography>
                </Link>
              </Box>
              <Typography variant="h4">
                {id != null ? t("Edit Categories") : t("Create Categories")}
              </Typography>
            </Stack> */}

            <Stack spacing={4}>
              <Box
                sx={{
                  maxWidth: 80,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    width: 300,
                    mt: 1,
                  }}
                >
                  <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    aria-label="breadcrumb"
                  >
                    {breadcrumbs}
                  </Breadcrumbs>
                </Stack>
              </Box>

              <Typography variant="h4">
                {id != null ? t("Edit Category") : t("Create Category")}
              </Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">
                          {t("Category Details")}
                        </Typography>
                      </Grid>

                      <Grid item md={8} xs={12}>
                        {userType == USER_TYPES.SUPERADMIN && (
                          <Box sx={{ mb: 3 }}>
                            <CompanyDropdown
                              disabled
                              onChange={() => {}}
                              selectedId={companyRef as string}
                              label={t("Company")}
                              id="company"
                            />
                          </Box>
                        )}

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
                            <Box sx={{ mt: 2 }}>
                              <TextFieldWrapper
                                disabled={id != null && !canUpdate}
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
                              // @ts-ignore
                              accept={{
                                "image/*": [],
                              }}
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
                              fileDataTestId={
                                FileUploadNamespace["category-images"]
                              }
                            />
                          </Box>
                        </Box>
                        {id != null && industry == "restaurant" && (
                          <Box sx={{ mt: 3, mb: 3 }}>
                            <KitchenDropdown
                              disabled
                              companyRef={companyRef as string}
                              required
                              onChange={(id, name) => {
                                // handleKitchenChange(id, name);
                              }}
                              selectedId={
                                formik?.values?.kitchenRefs[0] as string
                              }
                              label={t("Kitchen")}
                              id="kitchen"
                            />
                          </Box>
                        )}

                        <Box sx={{ mt: 3, mb: 3 }}>
                          <TextFieldWrapper
                            disabled={id != null && !canUpdate}
                            autoComplete="off"
                            inputProps={{
                              style: { textTransform: "capitalize" },
                            }}
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
                  <Box>
                    {Boolean(!id) && (
                      <LoadingButton
                        color="inherit"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("catalogue", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                      >
                        {t("Cancel")}
                      </LoadingButton>
                    )}
                    <Box></Box>
                    {/* {id && (
                      <LoadingButton
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("catalogue", Screens?.companyDetail);
                          }
                          setShowDialogDeleteItem(true);
                        }}
                        sx={{ ml: 1 }}
                      >
                        {t("Delete")}
                      </LoadingButton>
                    )} */}
                  </Box>
                  <Box>
                    {id && (
                      <LoadingButton
                        color="inherit"
                        onClick={() => {
                          if (origin == "company") {
                            changeTab("catalogue", Screens?.companyDetail);
                          }
                          router.back();
                        }}
                      >
                        {t("Cancel")}
                      </LoadingButton>
                    )}
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
                  </Box>
                </Stack>
              </Stack>
            </form>
          </Stack>
        </Container>
      </Box>
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
      {/* <ConfirmationDialog
        show={showDialogDeleteItem}
        toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
        onOk={(e: any) => {
          handleDeleteItem();
        }}
        okButtonText={`${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirm Delete?")}
        text={t(
          "Are you sure you want to delete this? This action cannot be undone."
        )}
      /> */}
    </>
  );
};

CreateCategories.getLayout = (page) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default CreateCategories;
