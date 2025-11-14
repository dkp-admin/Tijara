import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import * as Yup from "yup";
import withPermission from "../permissionManager/restrict-page";
import serviceCaller from "src/api/serviceCaller";

interface AccountGeneralProps {
  nearpay: boolean;
  merchantId: string;
}

const validationSchema = Yup.object({
  merchantId: Yup.string().when("nearpay", {
    is: true,
    then: Yup.string().required(
      `${i18n.t("Please enter merchant client code.")}`
    ),
  }),
});

const NearPayTab: PageType = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const authContext = useContext(AuthContext);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["company:credit-setting"]) ||
    canAccess(MoleculeType["company:manage"]);
  const [editing, setEditing] = useState(false);

  const { updateEntity } = useEntity("company");

  const companyContext = useContext<any>(CompanyContext);

  const initialValues: AccountGeneralProps = {
    nearpay: false,
    merchantId: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values): Promise<void> => {
      const data = {
        companyRef: companyContext._id,
        configuration: {
          ...companyContext.configuration,
          nearpay: values.nearpay,
          nearpayMerchantId: values.merchantId,
        },
      };

      try {
        const res = await updateEntity(companyContext._id.toString(), {
          ...data,
        });
        toast.success(t("Nearpay details updated").toString());
        companyContext.onRefresh();
        localStorage.setItem("user", JSON.stringify({ ...user, company: res }));
        if (user.userType != USER_TYPES.SUPERADMIN) {
          authContext.updateUser({ ...user, company: res });
        }
        setEditing(false);
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (companyContext) {
      formik.setValues({
        nearpay: companyContext?.configuration?.nearpay,
        merchantId:
          companyContext?.configuration?.nearpayMerchantId?.length > 0
            ? companyContext?.configuration?.nearpayMerchantId
            : "",
      });
    }
  }, [companyContext?.configuration]);

  const handleToggleStcPay = () => {
    if (!canUpdate) {
      return toast.error(t("You don't have access"));
    }

    if (!formik.values.nearpay) {
      serviceCaller("/nearpay-sdk/createMerchant", {
        body: {
          id:
            companyContext?.configuration?.nearpayMerchantId?.length > 0
              ? companyContext?.configuration?.nearpayMerchantId
              : null,
          name: companyContext?.name?.en,
          name_ar: companyContext?.name?.ar,
          reference_id: companyContext?._id?.toString(),
          user: {
            name: companyContext?.owner?.name,
            email: companyContext?.email,
            mobile: companyContext?.phone?.replace("-", ""),
          },
        },
        method: "POST",
      })
        .then((r) => {
          formik.setFieldValue("merchantId", r.id);
          formik.setFieldValue("nearpay", true);
        })
        .catch((err) => {
          toast.error(err.message[0]);
        });
    }

    formik.setFieldValue("nearpay", false);

    setEditing(true);
  };

  const handleSaveClick = () => {
    if (!canUpdate) {
      return toast.error(t("You don't have access"));
    }
    if (!editing) {
      setEditing(true);
    } else {
      formik.validateForm().then((errors: any) => {
        if (Object.keys(errors).length === 0) {
          formik.handleSubmit();
        } else {
          // Display errors if validation fails
          formik.setTouched(errors);
          formik.setErrors(errors);
        }
      });
    }
  };

  return (
    <>
      <Box sx={{ mt: 4, textAlign: "left" }}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Stack spacing={1}>
                  <Typography align="left" variant="h6">
                    {t("Nearpay")}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item md={8} xs={12}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ mr: 10 }}>
                      <Typography align="left" gutterBottom variant="subtitle1">
                        {t("Enable Nearpay")}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        variant="body2"
                      >
                        {t("Enable this to accept payment via Nearpay")}
                      </Typography>
                    </Box>
                    <Box>
                      <Switch
                        checked={formik.values.nearpay}
                        color="primary"
                        edge="start"
                        name="nearpay"
                        onChange={handleToggleStcPay}
                        value={formik.values.nearpay}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {formik.values.nearpay && (
          <Box>
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Stack spacing={1}>
                      <Typography align="left" variant="h6">
                        {t("Merchant Id")}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item md={8} xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        disabled={true}
                        label={t("Merchant ID")}
                        name="merchantId"
                        helperText={
                          formik.touched.merchantId && formik.errors.merchantId
                        }
                        error={
                          !!(
                            formik.touched.merchantId &&
                            formik.errors.merchantId
                          )
                        }
                        onChange={formik.handleChange}
                        value={formik.values.merchantId}
                        required
                      />
                      <small>This ID is generated by nearpay</small>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
        <Box
          sx={{
            my: 4,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <LoadingButton
            loading={formik.isSubmitting}
            onClick={handleSaveClick}
            variant={editing ? "contained" : "outlined"}
          >
            {editing ? t("Save") : t("Edit")}
          </LoadingButton>
        </Box>
      </Box>
    </>
  );
};

export default withPermission(NearPayTab, MoleculeType["account:read"]);
