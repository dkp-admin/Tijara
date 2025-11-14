import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { FormikProps, useFormik } from "formik";
import { useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import {
  CompanyOtherChannels,
  CompanyRestaurantChannels,
  USER_TYPES,
} from "src/utils/constants";
import * as Yup from "yup";

interface OrderTypeDocsProps {
  open: boolean;
  modalData: any;
  handleClose: () => void;
}

interface OrderTypeDataProps {
  name: string;
  status: boolean;
}

const initialValues: OrderTypeDataProps = {
  name: "",
  status: true,
};

const validationSchema = Yup.object({
  name: Yup.string()
    .required(i18n.t("Order type name is required"))
    .max(20, i18n.t("Order type name should not more than 20 characters")),
});

export const AccountOrderTypeModal = (props: OrderTypeDocsProps) => {
  const theme = useTheme();
  const { user } = useAuth();
  const { t } = useTranslation();
  const { open, modalData, handleClose } = props;

  const authContext = useContext(AuthContext);
  const companyContext = useContext<any>(CompanyContext);

  const canAccess = usePermissionManager();
  const canCreateUpdate =
    canAccess(MoleculeType["company:loyalty-setting"]) ||
    canAccess(MoleculeType["company:manage"]);

  const { updateEntity } = useEntity("company");

  const formik: FormikProps<OrderTypeDataProps> = useFormik<OrderTypeDataProps>(
    {
      initialValues,
      validationSchema,
      onSubmit: async (values) => {
        const orderTypes =
          companyContext?.channel && companyContext?.channel?.length > 0
            ? companyContext?.channel
            : companyContext?.industry?.toLowerCase() === "restaurant"
            ? CompanyRestaurantChannels
            : CompanyOtherChannels;

        if (modalData) {
          orderTypes.splice(modalData.id, 1, {
            name: values.name,
            status: values.status,
          });
        } else {
          orderTypes.push({
            name: values.name,
            status: values.status,
          });
        }

        const data: any = {
          companyRef: companyContext._id,
          channel: orderTypes,
        };

        try {
          const res = await updateEntity(companyContext._id.toString(), {
            ...data,
          });
          companyContext.onRefresh();
          localStorage.setItem(
            "user",
            JSON.stringify({ ...user, company: res })
          );

          if (user.userType != USER_TYPES.SUPERADMIN) {
            authContext.updateUser({ ...user, company: res });
          }

          if (modalData) {
            toast.success(t("Order type updated"));
          } else {
            toast.success(t("Order type created"));
          }

          handleClose();
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  useEffect(() => {
    formik.resetForm();

    if (modalData) {
      formik.setValues({
        name: modalData.name,
        status: modalData.status,
      });
    }
  }, [open, modalData]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
        {/* header */}
        <Box
          sx={{
            px: 2,
            mt: 2,
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor:
              theme.palette.mode === "light" ? "#fff" : "#111927",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></Box>

          <Typography sx={{ ml: 2 }} variant="h6">
            {modalData ? t("Edit Order Type") : t("Create Order Type")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                backgroundColor: "action.hover",
                cursor: "pointer",
                opacity: 0.5,
              },
            }}
          >
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />

        {/* body */}
        <DialogContent>
          <form onSubmit={() => formik.handleSubmit()}>
            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                name="name"
                label={t("Order Type Name")}
                error={!!(formik.touched.name && formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                value={formik.values.name}
                onBlur={formik.handleBlur}
                onChange={(e) => {
                  formik.handleChange("name")(e.target.value);
                }}
              />

              {modalData && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={8}>
                      <Typography sx={{ ml: 1 }} variant="subtitle1">
                        {t("Status")}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={4}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            edge="end"
                            name="status"
                            color="primary"
                            sx={{ mr: 0.2 }}
                            checked={formik.values.status}
                            onChange={() => {
                              formik.setFieldValue(
                                "status",
                                !formik.values.status
                              );
                            }}
                          />
                        }
                        label={
                          formik.values.status ? t("Active") : t("Deactivated")
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </form>
        </DialogContent>

        <Divider sx={{ mt: -1 }} />

        {/* footer */}
        <DialogActions
          sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}
        >
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              if (!canCreateUpdate) {
                return toast.error(t("You don't have access"));
              }
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {modalData ? t("Update") : t("Create")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
