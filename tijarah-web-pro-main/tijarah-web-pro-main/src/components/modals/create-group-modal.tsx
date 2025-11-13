import { LoadingButton } from "@mui/lab";
import { Button, Card, Divider, TextField, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { FormikProps, useFormik } from "formik";
import * as React from "react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import * as Yup from "yup";
import CompanyDropdown from "../input/company-auto-complete";

interface GroupEventModalProps {
  id?: string;
  open: boolean;
  data: any;
  handleClose: () => void;
}

interface GroupProps {
  groupName: string;
}

const validationSchema = Yup.object({
  groupName: Yup.string()
    .required(i18n.t("Name is required"))
    .max(60, i18n.t("Name must not be greater than 60 characters"))
    .matches(
      /^[\u0080-\uFFFFa-zA-Z0-9].*[\u0080-\uFFFFa-zA-Z0-9]$/,
      i18n.t("Enter valid name")
    ),
});

export const GroupCreateModal: React.FC<GroupEventModalProps> = ({
  id,
  open,
  data,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { userType } = useUserType();
  const canAccess = usePermissionManager();
  const canCreate = canAccess(MoleculeType["group:create"]);
  const canUpdate = canAccess(MoleculeType["group:update"]);

  const { findOne, create, updateEntity, entity } = useEntity("customer-group");

  const initialValues: GroupProps = {
    groupName: "",
  };

  const formik: FormikProps<GroupProps> = useFormik<GroupProps>({
    initialValues,
    validationSchema,

    onSubmit: async (values) => {
      const dataObj = {
        companyRef: data?.companyRef,
        company: {
          name: data?.companyName,
        },
        name: values.groupName,
        status: "active",
      };

      try {
        if (id) {
          await updateEntity(id?.toString(), { ...dataObj });
        } else {
          await create({ ...dataObj });
        }

        toast.success(id ? `${t("Group Updated")}` : `${t("Group Created")}`);

        handleClose();
      } catch (error) {
        toast.error(error.message);
      }
    },
  });

  useEffect(() => {
    formik.resetForm();

    if (id !== "" && id !== undefined) {
      findOne(id?.toString());
    }
  }, [open, id]);

  useEffect(() => {
    if (entity !== null) {
      formik.setFieldValue("groupName", entity?.name);
    }
  }, [entity]);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transparent",
            scrollBehavior: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "50vw",
              lg: "50vw",
            },
            maxHeight: {
              xs: "100vh",
              sm: "100vh",
              md: "90vh",
              lg: "90vh",
            },
            borderRadius: {
              xs: "0px",
              sm: "0px",
              md: "20px",
              lg: "20px",
            },
            py: 2,
          }}>
          <Box
            sx={{
              py: 2,
              pl: 2.5,
              pr: 2.5,
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              height: "60px",
              flex: "0 0 auto",
              position: "fixed",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}>
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}>
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
              />

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                  {id ? `${t("Edit Group")}` : `${t("Create Group")}`}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ mt: 6 }} />

          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 3,
              maxHeight: {
                xs: "85vh",
                sm: "85vh",
                md: "80vh",
                lg: "80vh",
              },
              width: "100%",
              flex: "1 1 auto",
              overflow: "scroll",
              overflowX: "hidden",
            }}>
            <form noValidate onSubmit={formik.handleSubmit}>
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  pb: 4,
                  mb: 4,
                }}>
                {userType == USER_TYPES.SUPERADMIN && (
                  <Box sx={{ mb: 2 }}>
                    <CompanyDropdown
                      disabled
                      onChange={() => {}}
                      selectedId={data?.companyRef as string}
                      label={t("Company")}
                      id="company"
                    />
                  </Box>
                )}

                <TextField
                  fullWidth
                  required
                  label={t("Name")}
                  name="groupName"
                  sx={{ mt: 1, flexGrow: 1 }}
                  error={Boolean(
                    formik.touched.groupName && formik.errors.groupName
                  )}
                  helperText={
                    formik.touched.groupName && formik.errors.groupName
                  }
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  value={formik.values.groupName}
                />
              </Box>
            </form>
          </Box>

          <Box
            sx={{
              py: 3,
              px: 3,
              bottom: 0,
              zIndex: 999,
              width: "100%",
              height: "95px",
              display: "flex",
              position: "absolute",
              justifyContent: "flex-end",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}>
            <Button onClick={handleClose} variant="outlined" sx={{ mr: 3 }}>
              {t("Cancel")}
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              loading={formik.isSubmitting}
              onClick={() => {
                // if ((id != null && !canUpdate) || !canCreate) {
                //   return toast.error(t("You don't have access"));
                // }
                formik.handleSubmit();
              }}>
              {id ? t("Update") : t("Create")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
