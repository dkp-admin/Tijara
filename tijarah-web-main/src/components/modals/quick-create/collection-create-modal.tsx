import { LoadingButton } from "@mui/lab";
import { Card, Grid, Modal, Stack, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { t } from "i18next";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { MoleculeType } from "src/permissionManager";
import * as Yup from "yup";

interface CollectionCreateModalProps {
  open: boolean;
  handleClose: any;
}
interface CreateCategoryProps {
  collectionNameEn: string;
  collectionNameAr: string;
}

const validationSchema = Yup.object({
  collectionNameEn: Yup.string()
    .required(`${t("Collection Name is required in English")}`)
    .max(60, "Collection name must not be greater than 60 characters"),
  collectionNameAr: Yup.string()
    .required(`${t("Collection Name is required in Arabic")}`)
    .max(60, "Collection name must not be greater than 60 characters"),
});

export const CollectionCreateModal: React.FC<CollectionCreateModalProps> = ({
  open,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { companyRef, companyName } = router.query;
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["collection:update"]) ||
    canAccess(MoleculeType["collection:manage"]);

  const { create } = useEntity("collection");

  const initialValues: CreateCategoryProps = {
    collectionNameEn: "",
    collectionNameAr: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        name: {
          en: values.collectionNameEn,
          ar: values.collectionNameAr,
        },
        status: "active",
        companyRef: companyRef,
        company: { name: companyName },
      };

      try {
        await create({ ...data });
        toast.success(t("Collection Created").toString());
        handleClose();
      } catch (err) {
        toast.error(err.message);
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
              display: "flex",
              overflow: "inherit",
              flexDirection: "column",
              bgcolor: "background.paper",
              px: 3,
              py: 4,
            }}
          >
            <Box
              style={{
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                flex: "0 0 auto",
                position: "fixed",
                paddingTop: "10px",
                paddingLeft: "30px",
                paddingRight: "30px",
                borderRadius: "20px",
                paddingBottom: "12px",
                background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                    {t("Create Collection")}
                  </Typography>
                </Box>

                <LoadingButton
                  sx={{ m: 1 }}
                  type="submit"
                  variant="contained"
                  loading={formik.isSubmitting}
                  onClick={(e) => {
                    e.preventDefault();
                    if (!canUpdate) {
                      return toast.error(t("You don't have access"));
                    }
                    formik.handleSubmit();
                  }}
                >
                  {t("Create")}
                </LoadingButton>
              </Box>
            </Box>

            <Box
              style={{
                padding: 3,
                height: "100%",
                flex: "1 1 auto",
                paddingTop: "35px",
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
                        label={t("Collection (English)")}
                        name="collectionNameEn"
                        error={Boolean(
                          formik.touched.collectionNameEn &&
                            formik.errors.collectionNameEn
                        )}
                        helperText={
                          formik.touched.collectionNameEn &&
                          formik.errors.collectionNameEn
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                        }}
                        required
                        value={formik.values.collectionNameEn}
                      />
                    </Box>
                  </Grid>

                  <Grid item md={12} xs={12}>
                    <Box sx={{ p: 1, mt: 1.5 }}>
                      <TextFieldWrapper
                        autoComplete="off"
                        inputProps={{
                          style: { textTransform: "capitalize" },
                        }}
                        fullWidth
                        label={t("Collection (Arabic)")}
                        name="collectionNameAr"
                        error={Boolean(
                          formik.touched.collectionNameAr &&
                            formik.errors.collectionNameAr
                        )}
                        helperText={
                          formik.touched.collectionNameAr &&
                          formik.errors.collectionNameAr
                        }
                        onBlur={formik.handleBlur}
                        onChange={(e) => {
                          formik.handleChange(e);
                        }}
                        required
                        value={formik.values.collectionNameAr}
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
