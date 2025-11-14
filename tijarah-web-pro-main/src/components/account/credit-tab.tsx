import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Radio,
  Stack,
  SvgIcon,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import { useFormik } from "formik";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useFeatureModuleManager } from "src/hooks/use-feature-restriction";
import i18n from "src/i18n";
import { MoleculeType } from "src/permissionManager";
import type { Page as PageType } from "src/types/page";
import { USER_TYPES } from "src/utils/constants";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";
import ConfirmationDialog from "../confirmation-dialog";
import withPermission from "../permissionManager/restrict-page";

interface AccountGeneralProps {
  defaultSetting: boolean;
  enableCredit: boolean;
  limitType: string;
  maxCreditLimit: number;
  allowChangeCredit: string;
  maxCreditPercent: number;
}

const limitTypeOptions = [
  {
    label: i18n.t("No Limit"),
    value: "NO_LIMIT",
  },
  {
    label: i18n.t("Limit Credit"),
    value: "LIMIT_CREDIT",
  },
];

const validationSchema = Yup.object({
  limitType: Yup.string().required(`${i18n.t("Please select limit type")}`),
  maxCreditLimit: Yup.number().when("limitType", {
    is: "LIMIT_CREDIT",
    then: Yup.number()
      .required(i18n.t("Max credit limit is required"))
      .min(1, i18n.t("Max credit limit must be greater than 0"))
      .max(99999, i18n.t("Max credit limit must be less than 5 digits"))
      .test(
        i18n.t("Is valid limit?"),
        i18n.t("Max credit limit must be a valid amount with max 5 digits"),
        (value) => value > 0
      )
      .nullable(),
    otherwise: Yup.number().optional().nullable(),
  }),
  maxCreditPercent: Yup.number().when("allowChangeCredit", {
    is: "yes",
    then: Yup.number()
      .required(i18n.t("Max percentage is required"))
      .min(1, i18n.t("Max percentage must be greater than 0"))
      .max(100, i18n.t("Max percentage must be less than or equal to 100"))
      .test(
        i18n.t("Is valid percent?"),
        i18n.t("Max percent must be must be less than or equal to 100"),
        (value) => value > 0
      )
      .nullable(),
    otherwise: Yup.number().optional().nullable(),
  }),
});

const CreditManagementTab: PageType = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const authContext = useContext(AuthContext);
  const canAccess = usePermissionManager();
  const canUpdate =
    canAccess(MoleculeType["company:credit-setting"]) ||
    canAccess(MoleculeType["company:manage"]);
  const [showDialogCreditEvent, setShowDialogCreditEvent] = useState(false);
  const [editing, setEditing] = useState(false);
  const currency = useCurrency();
  const { updateEntity } = useEntity("company");
  const { canAccessModule } = useFeatureModuleManager();

  const companyContext = useContext<any>(CompanyContext);

  const initialValues: AccountGeneralProps = {
    defaultSetting: false,
    enableCredit: false,
    limitType: "",
    maxCreditLimit: null,
    allowChangeCredit: "",
    maxCreditPercent: null,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        companyRef: companyContext._id,
        credit: {
          defaultCreditSetting: values.defaultSetting,
          enableCredit: values.enableCredit,
          limitType: values.limitType,
          maximumCreditLimit: values.maxCreditLimit,
          allowChangeCredit: values.allowChangeCredit === "yes",
          maximumCreditPercent: values.maxCreditPercent,
        },
      };

      try {
        const res = await updateEntity(companyContext._id.toString(), {
          ...data,
        });
        toast.success(t("Credit Updated").toString());
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
    if (companyContext && companyContext?.credit?.limitType) {
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [companyContext]);

  useEffect(() => {
    if (companyContext && companyContext?.credit) {
      formik.setValues({
        defaultSetting: companyContext?.credit?.defaultCreditSetting,
        enableCredit: companyContext?.credit?.enableCredit,
        limitType: companyContext?.credit?.limitType,
        maxCreditLimit: companyContext?.credit?.maximumCreditLimit,
        allowChangeCredit: companyContext?.credit?.allowChangeCredit
          ? "yes"
          : "no",
        maxCreditPercent: companyContext?.credit?.maximumCreditPercent,
      });
    }
  }, [companyContext?.credit]);

  return (
    <>
      <Box sx={{ mt: 4, textAlign: "left" }}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item md={4} xs={12}>
                <Stack spacing={1}>
                  <Typography align="left" variant="h6">
                    {t("Credit")}
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
                        {t("Enable Credit")}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        variant="body2"
                      >
                        {t("credit_enabled_msg_for_merchant_account")}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Switch
                        checked={formik.values.enableCredit}
                        color="primary"
                        edge="start"
                        name="enableCredit"
                        disabled={!canAccessModule("credit_management")}
                        onChange={() => {
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          if (formik.values.enableCredit) {
                            return setShowDialogCreditEvent(true);
                          }
                          formik.setFieldValue(
                            "enableCredit",
                            !formik.values.enableCredit
                          );
                          formik.handleSubmit();
                        }}
                        value={formik.values.enableCredit}
                      />
                      <Tooltip
                        title={
                          !canAccessModule("credit_management")
                            ? t(
                                "Upgrade your subscription to access this module"
                              )
                            : ""
                        }
                      >
                        <SvgIcon
                          color="action"
                          fontSize="small"
                          sx={{ ml: 0.5 }}
                        >
                          <InfoCircleIcon />
                        </SvgIcon>
                      </Tooltip>
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {formik.values.enableCredit && (
          <Box>
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Stack spacing={1}>
                      <Typography align="left" variant="h6">
                        {t("Credit Management")}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item md={8} xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        border: `1px solid ${
                          theme.palette.mode !== "dark" ? "#E5E7EB" : "#2D3748"
                        }`,
                        borderRadius: "8px",
                        paddingLeft: "8px",
                      }}
                    >
                      <Typography color="textSecondary">
                        {t("Customer's Default Setting")}
                      </Typography>

                      <Box
                        sx={{
                          p: 1,
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Switch
                          color="primary"
                          edge="end"
                          name="defaultSetting"
                          checked={formik.values.defaultSetting}
                          onChange={(e) => {
                            formik.handleChange(e);
                          }}
                          sx={{ mr: 1 }}
                          disabled={!editing}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography color="text.secondary" variant="caption">
                        {t(
                          "msg_default_customer_credit_setting_for_merchant_account"
                        )}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                      <TextField
                        fullWidth
                        label={t("Limit Type")}
                        name="limitType"
                        helperText={
                          (formik.touched.limitType &&
                            formik.errors.limitType) as any
                        }
                        error={
                          !!(
                            formik.touched.limitType && formik.errors.limitType
                          )
                        }
                        onBlur={formik.handleBlur}
                        onChange={formik.handleChange}
                        select
                        value={formik.values.limitType}
                        disabled={!editing}
                        required
                      >
                        {limitTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>

                    {formik.values.limitType === "LIMIT_CREDIT" && (
                      <Box>
                        <Box sx={{ mt: 3 }}>
                          <TextField
                            sx={{
                              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                {
                                  display: "none",
                                },
                              "& input[type=number]": {
                                MozAppearance: "textfield",
                              },
                            }}
                            disabled={!editing}
                            fullWidth
                            required
                            label={t("Max credit limit (in ") + currency + ")"}
                            name="maxCreditLimit"
                            error={Boolean(
                              formik.touched.maxCreditLimit &&
                                formik.errors.maxCreditLimit
                            )}
                            helperText={
                              (formik.touched.maxCreditLimit &&
                                formik.errors.maxCreditLimit) as any
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                // remove all non numeric characters
                                const cleanedNumber = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                e.target.value = cleanedNumber
                                  ? (Number(cleanedNumber) as any)
                                  : "";
                              }
                              formik.handleChange(e);
                            }}
                            value={formik.values.maxCreditLimit}
                          />
                        </Box>

                        <Box>
                          <Typography color="text.secondary" variant="caption">
                            {t(
                              "max_credit_limit_message_per_customer_for_mechant_account"
                            )}
                          </Typography>
                        </Box>

                        <Box>
                          <Box sx={{ mt: 2.5, mb: 1 }}>
                            <Typography variant="body1">
                              {t(
                                "Allowed to change the credit limit at customer level beyond company default?"
                              )}
                            </Typography>
                          </Box>

                          <Grid container spacing={1}>
                            <Grid item md={3} xs={5}>
                              <Box
                                sx={{
                                  alignItems: "center",
                                  cursor: "pointer",
                                  display: "flex",
                                }}
                                onClick={() => {
                                  if (editing) {
                                    formik.setFieldValue(
                                      "allowChangeCredit",
                                      "yes"
                                    );
                                  }
                                }}
                              >
                                <Stack
                                  direction="row"
                                  sx={{ alignItems: "center" }}
                                  spacing={2}
                                >
                                  <Radio
                                    color="primary"
                                    checked={
                                      formik.values.allowChangeCredit === "yes"
                                    }
                                    disabled={!editing}
                                  />
                                  <div>
                                    <Typography variant="subtitle1">
                                      {t("Yes")}
                                    </Typography>
                                  </div>
                                </Stack>
                              </Box>
                            </Grid>

                            <Grid item md={3} xs={5}>
                              <Box
                                sx={{
                                  alignItems: "center",
                                  cursor: "pointer",
                                  display: "flex",
                                }}
                                onClick={() => {
                                  if (editing) {
                                    formik.setFieldValue(
                                      "allowChangeCredit",
                                      "no"
                                    );
                                  }
                                }}
                              >
                                <Stack
                                  direction="row"
                                  sx={{ alignItems: "center" }}
                                  spacing={2}
                                >
                                  <Radio
                                    color="primary"
                                    checked={
                                      formik.values.allowChangeCredit === "no"
                                    }
                                    disabled={!editing}
                                  />
                                  <div>
                                    <Typography variant="subtitle1">
                                      {t("No")}
                                    </Typography>
                                  </div>
                                </Stack>
                              </Box>
                            </Grid>
                          </Grid>

                          {formik.values.allowChangeCredit === "yes" && (
                            <Box>
                              <Box sx={{ mt: 2.5 }}>
                                <TextField
                                  sx={{
                                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                      {
                                        display: "none",
                                      },
                                    "& input[type=number]": {
                                      MozAppearance: "textfield",
                                    },
                                  }}
                                  disabled={!editing}
                                  fullWidth
                                  required
                                  label={t("Max percentage")}
                                  name="maxCreditPercent"
                                  error={Boolean(
                                    formik.touched.maxCreditPercent &&
                                      formik.errors.maxCreditPercent
                                  )}
                                  helperText={
                                    (formik.touched.maxCreditPercent &&
                                      formik.errors.maxCreditPercent) as any
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) {
                                      // remove all non numeric characters
                                      const cleanedNumber =
                                        e.target.value.replace(/\D/g, "");
                                      e.target.value = cleanedNumber
                                        ? (Number(cleanedNumber) as any)
                                        : "";
                                    }
                                    formik.handleChange(e);
                                  }}
                                  value={formik.values.maxCreditPercent}
                                />
                              </Box>

                              <Box>
                                <Typography
                                  color="text.secondary"
                                  variant="caption"
                                >
                                  {t(
                                    "max_credit_percent_message_at_customer_level_for_mechant_account"
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
            <Box
              sx={{
                my: 4,
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <LoadingButton
                loading={formik.isSubmitting}
                onClick={() => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  if (!editing) {
                    setEditing(true);
                  } else {
                    formik.handleSubmit();
                  }
                }}
                variant={editing ? "contained" : "outlined"}
              >
                {editing ? t("Save") : t("Edit")}
              </LoadingButton>
            </Box>
          </Box>
        )}
      </Box>

      <ConfirmationDialog
        show={showDialogCreditEvent}
        toggle={() => setShowDialogCreditEvent(!showDialogCreditEvent)}
        onOk={() => {
          formik.setFieldValue("enableCredit", !formik.values.enableCredit);
          formik.handleSubmit();
          setShowDialogCreditEvent(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Disable")}`}
        cancelButtonText={t("Cancel")}
        title={t("You're about to disable Credit")}
        text={t("disable_credit_alert_msg_for_merchant_account")}
      />
    </>
  );
};

export default withPermission(
  CreditManagementTab,
  MoleculeType["account:read"]
);
