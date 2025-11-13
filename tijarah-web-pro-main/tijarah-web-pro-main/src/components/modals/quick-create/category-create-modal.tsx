import { LoadingButton } from "@mui/lab";
import {
  Autocomplete,
  Card,
  Grid,
  MenuItem,
  Modal,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import countries from "src/utils/countries.json";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PhoneInput from "src/components/phone-input";
import { ProfileChooser } from "src/components/profile-chooser";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import parsePhoneNumber from "src/utils/parse-phone-number";
import { Screens } from "src/utils/screens-names";
import useActiveTabs from "src/utils/use-active-tabs";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import * as Yup from "yup";
import { t } from "i18next";
import TextFieldWrapper from "src/components/text-field-wrapper";

interface CategoryCreateModalProps {
  open: boolean;
  handleClose: any;
}
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
    .required(`${t("Category Name is required in English")}`)
    .max(60, "Category name must not be greater than 60 characters"),
  categoryNameAr: Yup.string()
    .required(`${t("Category Name is required in Arabic")}`)
    .max(60, "Category name must not be greater than 60 characters"),
});

export const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
  open,
  handleClose,
}) => {
  const { t } = useTranslation();

  const theme = useTheme();
  const router = useRouter();
  const { id, companyRef, companyName, origin } = router.query;
  const [showError, setShowError] = useState(false);
  const { changeTab } = useActiveTabs();
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["category:update"]) ||
    canAccess(MoleculeType["category:manage"]);

  const { mode } = router.query;
  const { create, entity, loading } = useEntity("category");

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
        companyRef: companyRef,
        company: {
          name: companyName,
        },
      };

      try {
        await create({ ...data });
        toast.success(t("Category Created").toString());

        handleClose();
      } catch (err) {
        toast.error(err.message);
        handleClose();
      }
    },
  });

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: "background.paper",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}
          >
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    handleClose();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Create Category")}
                  </Typography>
                </Box>
                <LoadingButton
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!canUpdate) {
                      return toast.error(t("You don't have access"));
                    }
                    setShowError(true);
                    formik.handleSubmit();
                  }}
                  loading={formik.isSubmitting}
                  sx={{ m: 1 }}
                  variant="contained"
                >
                  {t("Create")}
                </LoadingButton>
              </Box>
            </Box>
            <Box
              style={{
                flex: "1 1 auto",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}
            >
              <Stack spacing={1} sx={{ mt: 2, mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box sx={{ p: 1 }}>
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
                  </Grid>

                  <Grid item md={12} xs={12}>
                    <Box sx={{ p: 1 }}>
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
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </Card>
        </Modal>
      </Box>
    </>
  );
};
