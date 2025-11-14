import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { OgFileDropzone } from "src/components/original-File-dropzone";
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
import { DropdownOptions } from "src/types/dropdown";
import type { Page as PageType } from "src/types/page";
import { getUploadedDocName } from "src/utils/get-uploaded-file-name";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

interface CreateAPK {
  versionNumber: string;
  updateType: string;
  targetApp: string;
  apkFile: any[];
  apk: string;
}

const Page: PageType = () => {
  const { t } = useTranslation();
  const router = useRouter();
  usePageView();

  const [showError, setShowError] = useState(false);
  const [load, setLoad] = useState(false);
  const token = localStorage.getItem("accessToken") || "";

  const { create, loading } = useEntity("apk-management");
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["apk-management:create"]);

  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const initialValues: CreateAPK = {
    versionNumber: "",
    updateType: "",
    targetApp: "retail",
    apkFile: [],
    apk: "",
  };

  const validationSchema = Yup.object({
    versionNumber: Yup.string()
      .matches(
        /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
        t("Enter valid App Version Number")
      )
      .required(`${t("App Version Number is required")}`),
    updateType: Yup.string().required(`${t("Update Type is required")}`),
    targetApp: Yup.string().required(`${t("Target App is required")}`),
    // apk: Yup.string().required("Please Upload APK"),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      setLoad(true);

      const data = {
        url: values.apk,
        version: values.versionNumber,
        updateType: values.updateType,
        targetApp: values.targetApp,
      };

      try {
        await create({ ...data });
        toast.success(t("New App Version Created").toString());
        router.back();
      } catch (err) {
        if (err.error.codes == "apk_version_already_exists") {
          toast.error(t("APK Version already exists"));
        }
      }
    },
  });

  console.log(formik.values);

  const fileRemove = (): void => {
    formik.setFieldValue("apkFile", []);
    formik.setFieldValue("apk", "");
  };
  const fileDrop = (newFiles: any): void => {
    formik.setFieldValue("apkFile", newFiles);
  };
  const fileRemoveAll = (): void => {
    formik.setFieldValue("apkFile", []);
  };

  const handleUpload = async (files: any) => {
    console.log("==> here");

    setIsUploading(true);

    try {
      const url = await upload(
        files,
        FileUploadNamespace["apk-management-files"]
      );
      formik.setFieldValue("apk", url);

      setIsUploaded(true);
      setIsUploading(false);
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  const updateTypeOptions: DropdownOptions[] = [
    {
      label: "Mandatory",
      value: "mandatory",
    },
    // {
    //   label: "Optional",
    //   value: "optional",
    // },
  ];

  const sourceOptions: DropdownOptions[] = [
    {
      label: "Retail",
      value: "retail",
    },
    {
      label: "Restaurant",
      value: "restaurant",
    },
  ];

  if (!canAccess(MoleculeType["apk-management:read"])) {
    return <NoPermission />;
  }

  return (
    <>
      <Seo title={`${t("Create APK")}`} />
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
                sx={{ cursor: "pointer", maxWidth: "10%" }}
                onClick={() => {
                  router.push({
                    pathname: tijarahPaths?.platform?.apkManagement?.index,
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
                  <Typography variant="subtitle2">
                    {t("APK Versions")}
                  </Typography>
                </Link>
              </Box>

              <Typography variant="h4">{t("Create APK Version")}</Typography>
            </Stack>

            <form noValidate onSubmit={formik.handleSubmit}>
              <Stack spacing={4} sx={{ mt: 3 }}>
                <Card>
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item md={4} xs={12}>
                        <Typography variant="h6">{t("APK Details")}</Typography>
                      </Grid>
                      <Grid item md={8} xs={12}>
                        {/* <Box>
                          <OgFileDropzone
                            // @ts-ignore
                            accept={{
                              "application/vnd.android.package-archive": [],
                            }}
                            files={formik.values.apkFile}
                            imageName={getUploadedDocName(formik.values.apk)}
                            uploadedImageUrl={formik.values.apk}
                            onDrop={fileDrop}
                            onUpload={handleUpload}
                            onRemove={fileRemove}
                            onRemoveAll={fileRemoveAll}
                            maxFiles={1}
                            isUploaded={isUploaded}
                            setIsUploaded={setIsUploaded}
                            isUploading={isUploading}
                            fileDataTestId="apk"
                          />
                          {Boolean(formik.touched.apk) && (
                            <Typography
                              color="error.main"
                              sx={{
                                mb: 3,
                                fontSize: "12px",
                                fontWeight: 500,
                                margin: "5px 14px 0 14px",
                              }}>
                              {formik.errors.apk}
                            </Typography>
                          )}
                        </Box> */}
                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            fullWidth
                            label={t("App Version Number")}
                            name="versionNumber"
                            error={Boolean(
                              formik.touched.versionNumber &&
                                formik.errors.versionNumber
                            )}
                            helperText={
                              (formik.touched.versionNumber &&
                                formik.errors.versionNumber) as any
                            }
                            onBlur={formik.handleBlur}
                            onChange={(e) => {
                              formik.handleChange(e);
                            }}
                            required
                            value={formik.values.versionNumber}
                          />
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            error={
                              !!(
                                formik.touched.updateType &&
                                formik.errors.updateType
                              )
                            }
                            fullWidth
                            label={t("Update Type")}
                            name="updateType"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.updateType}
                            required
                          >
                            {updateTypeOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <TextFieldWrapper
                            error={
                              !!(
                                formik.touched.targetApp &&
                                formik.errors.targetApp
                              )
                            }
                            fullWidth
                            label={t("Target App")}
                            name="targetApp"
                            onBlur={formik.handleBlur}
                            onChange={formik.handleChange}
                            select
                            value={formik.values.targetApp}
                            required
                          >
                            {sourceOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextFieldWrapper>
                        </Box>
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
                    href={tijarahPaths?.platform?.apkManagement?.index}
                  >
                    {t("Cancel")}
                  </Button>

                  <LoadingButton
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowError(true);
                      if (!canCreate) {
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
            </form>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
