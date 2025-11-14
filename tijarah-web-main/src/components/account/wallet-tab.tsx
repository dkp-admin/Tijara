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
import ConfirmationDialog from "../confirmation-dialog";
import withPermission from "../permissionManager/restrict-page";
import { useCurrency } from "src/utils/useCurrency";

interface AccountGeneralProps {
  minimumRedeemAmount: number;
  loyaltyPercentage: number;
  enableLoyalty: boolean;
  enableBatch: boolean;
  enableInventoryTracking: boolean;
}

const validationSchema = Yup.object({
  loyaltyPercentage: Yup.number()
    .required(i18n.t("Loyalty Rate is required"))
    .test(
      "Is negative?",
      i18n.t("Loyalty Rate must be positive value"),
      (value) => value > -1
    )
    .test(
      "maxTwoDigits",
      i18n.t("Loyalty rate should be only two digits"),
      (number) => String(number).length <= 2
    )
    .nullable(),
  minimumRedeemAmount: Yup.number()
    .nullable()
    .required(i18n.t("Minimum redemption amount is required")),
});

const WalletManagementTab: PageType = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const authContext = useContext(AuthContext);
  const canAccess = usePermissionManager();
  const currency = useCurrency();
  const canUpdate =
    canAccess(MoleculeType["company:loyalty-setting"]) ||
    canAccess(MoleculeType["company:manage"]);
  const [showDialogCustomerEvent, setShowDialogCustomerEvent] = useState(false);
  const [editing, setEditing] = useState(false);

  const { updateEntity } = useEntity("company");

  const companyContext = useContext<any>(CompanyContext);

  const initialValues: AccountGeneralProps = {
    minimumRedeemAmount: null,
    loyaltyPercentage: null,
    enableLoyalty: false,
    enableBatch: true,
    enableInventoryTracking: true,
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data: any = {
        companyRef: companyContext._id,
        configuration: {
          ...companyContext.configuration,
          enableBatch: values.enableBatch,
          enableInventoryTracking: values.enableInventoryTracking,
          enableLoyalty: values.enableLoyalty,
          enableKitchenManagement:
            companyContext.configuration.enableKitchenManagement,
          loyaltyPercentage: values.loyaltyPercentage,
          minimumRedeemAmount: values.minimumRedeemAmount,
          nielsenReportEnabled:
            companyContext.configuration.nielsenReportEnabled,
          enableZatca: companyContext.configuration.enableZatca,
        },
      };

      try {
        const res = await updateEntity(companyContext._id.toString(), {
          ...data,
        });
        toast.success(t("Loyalty Updated").toString());
        companyContext.onRefresh();
        localStorage.setItem("user", JSON.stringify({ ...user, company: res }));
        if (user.userType != USER_TYPES.SUPERADMIN) {
          authContext.updateUser({ ...user, company: res });
        }
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleLoyaltyStatusChange = () => {
    if (formik.values.enableLoyalty === false) {
      formik.setFieldValue("enableLoyalty", true);

      formik.handleSubmit();

      return;
    } else {
      formik.setFieldValue("enableLoyalty", false);

      formik.handleSubmit();
    }
  };

  useEffect(() => {
    if (
      companyContext &&
      companyContext?.configuration?.loyaltyPercentage &&
      companyContext?.configuration?.minimumRedeemAmount
    ) {
      setEditing(false);
    } else {
      setEditing(true);
    }
  }, [companyContext]);

  useEffect(() => {
    if (companyContext && companyContext?.configuration) {
      formik.setFieldValue(
        "minimumRedeemAmount",
        companyContext.configuration.minimumRedeemAmount
      );
      formik.setFieldValue(
        "loyaltyPercentage",
        companyContext.configuration.loyaltyPercentage
      );
      formik.setFieldValue(
        "enableLoyalty",
        companyContext.configuration.enableLoyalty
      );
    }
  }, [companyContext?.configuration]);

  return (
    <>
      <Box sx={{ mt: 4, textAlign: "left" }}>
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Grid
              sx={{
                display: "flex",
                alignItems: "center",
                justifyItems: "center",
              }}
              container
              spacing={3}
            >
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                }}
                item
                md={4}
                xs={12}
              >
                <Stack spacing={1}>
                  <Typography align="left" variant="h6">
                    {t("Loyalty")}
                  </Typography>
                </Stack>
              </Grid>

              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                }}
                item
                md={8}
                xs={12}
              >
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        mr: 10,
                      }}
                    >
                      <Typography align="left" gutterBottom variant="subtitle1">
                        {t("Enable Loyalty")}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        variant="body2"
                      >
                        {t(
                          "Enabling this setting empowers you to take control of loyalty rewards by specifying the exact percentage of points customers can earn. Customize it to align perfectly with your business goals"
                        )}
                      </Typography>
                    </Box>
                    <Box>
                      <Switch
                        checked={formik.values.enableLoyalty}
                        color="primary"
                        edge="start"
                        name="importGlobalProducts"
                        onChange={() => {
                          if (!canUpdate) {
                            return toast.error(t("You don't have access"));
                          }
                          if (formik.values.enableLoyalty === true) {
                            return setShowDialogCustomerEvent(true);
                          }
                          handleLoyaltyStatusChange();
                        }}
                        value={formik.values.enableLoyalty}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {formik.values.enableLoyalty && (
          <Box>
            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Stack spacing={1}>
                      <Typography align="left" variant="h6">
                        {t("Loyalty Rate")}
                      </Typography>
                      <Typography
                        align="left"
                        color="text.secondary"
                        variant="body2"
                      >
                        {t(
                          "Choose how much Loyalty customers earn as a percentage of the retail price of every sale in-store."
                        )}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item md={8} xs={12}>
                    <Stack spacing={1}>
                      <Box>
                        <TextField
                          disabled={!editing}
                          fullWidth
                          label={`${t("Loyalty Rate (in %)")}`}
                          name="loyaltyPercentage"
                          onWheel={(event: any) => {
                            event.preventDefault();
                            event.target.blur();
                          }}
                          onBlur={formik.handleBlur}
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
                          error={Boolean(
                            formik.touched.loyaltyPercentage &&
                              formik.errors.loyaltyPercentage
                          )}
                          helperText={
                            (formik.touched.loyaltyPercentage &&
                              formik.errors.loyaltyPercentage) as any
                          }
                          required
                          value={formik.values.loyaltyPercentage}
                          onKeyDown={(event) => {
                            if (
                              event.key == "." ||
                              event.key === "+" ||
                              event.key === "-"
                            ) {
                              event.preventDefault();
                            }
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          {`${t(
                            "With this percentage, a customer will earn"
                          )} ${currency} ${
                            formik.values.loyaltyPercentage
                              ? formik.values.loyaltyPercentage
                              : ""
                          } ${t("Loyalty")} ${t("on a")} ${currency} 100.00 ${t(
                            "sale"
                          )}`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mt: 4 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item md={4} xs={12}>
                    <Stack spacing={1}>
                      <Typography align="left" variant="h6">
                        {t("Minimum Redemption Amount")}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item md={8} xs={12}>
                    <Stack spacing={1}>
                      <Box sx={{ mt: 3 }}>
                        <TextField
                          disabled={!editing}
                          fullWidth
                          label={`Redemption (in ${currency})`}
                          name="minimumRedeemAmount"
                          error={Boolean(
                            formik.touched.minimumRedeemAmount &&
                              formik.errors.minimumRedeemAmount
                          )}
                          helperText={
                            (formik.touched.minimumRedeemAmount &&
                              formik.errors.minimumRedeemAmount) as any
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
                          value={formik.values.minimumRedeemAmount}
                        />
                      </Box>
                      <Box>
                        <Typography color="text.secondary" variant="caption">
                          {t(
                            "This would be the minimum amount in the wallet to redeem. The redemption would happen with OTP verification at all the Location."
                          )}
                        </Typography>
                      </Box>
                    </Stack>
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

                    return;
                  } else {
                    formik.handleSubmit();
                    setEditing(false);
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
        show={showDialogCustomerEvent}
        toggle={() => setShowDialogCustomerEvent(!showDialogCustomerEvent)}
        onOk={(e: any) => {
          handleLoyaltyStatusChange();
          setShowDialogCustomerEvent(false);
        }}
        okButtonText={`${t("Yes")}, ${t("Disable")}`}
        cancelButtonText={t("Cancel")}
        title={t("You're about to disable Loyalty")}
        text={t(
          "You will lose access and customers won't be able to earn or redeem Loyalty. Customer wallet ballance will be saved and can be restored when Loyalty is re-enabled"
        )}
      />
    </>
  );
};

export default withPermission(
  WalletManagementTab,
  MoleculeType["account:read"]
);
