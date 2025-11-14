import { Button, Card, Divider, FormControl, FormLabel } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { MuiOtpInput } from "mui-one-time-password-input";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useUserType } from "src/hooks/use-user-type";
import { USER_TYPES } from "src/utils/constants";
import { isSubscriptionValid } from "src/utils/isSubscriptionValid";
import * as Yup from "yup";

const bcrypt = require("bcryptjs");

interface BillingVerifcationCodeProps {
  open?: boolean;
  handleClose?: () => void;
  handleSuccess: any;
  handleResetPin?: () => void;
  modalData?: any;
}

export const BillingVerifcationCode: React.FC<BillingVerifcationCodeProps> = ({
  open,
  modalData,
  handleClose,
  handleSuccess,
  handleResetPin,
}) => {
  const { t } = useTranslation();
  const { updateUser } = useAuth();
  const { setUserType } = useUserType();
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      code: "",
    },

    onSubmit: async (values) => {
      if (values.code.length === 0 || values.code.length !== 4) {
        toast.error(t("Login Pin is required"));
        return;
      }

      if (modalData.user.pin?.length === 4) {
        if (modalData.user?.pin === values.code) {
          handleUserLogin();
        } else {
          return toast.error(t("Invalid user or password"));
        }
      } else {
        bcrypt.compare(
          values.code,
          modalData.user.pin,
          function (err: any, res: any) {
            if (res) {
              handleUserLogin();
            } else {
              return toast.error(t("Invalid user or password"));
            }
          }
        );
      }
    },

    validationSchema: Yup.object().shape({}),
  });

  const handleUserLogin = () => {
    const accessDeviceToken = window.localStorage.getItem("accessDeviceToken");
    const device = JSON.parse(window.localStorage.getItem("device"));
    const user = { ...modalData.user, company: device.company };
    const subscription = JSON.parse(
      localStorage.getItem("subscription") || "{}"
    );

    const accessToken =
      window.localStorage.getItem("accessToken") || accessDeviceToken;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userType", modalData.user?.userType);
    setUserType(modalData.user?.userType);

    updateUser({
      user: user,
      device,
      token: accessToken,
      deviceToken: accessDeviceToken,
    });
    localStorage.setItem("cashDrawer", "open");
    toast.success(`${"User Login Successfully"}`);

    const needsSubscription =
      !isSubscriptionValid(subscription?.subscriptionEndDate) &&
      user?.userType !== USER_TYPES.SUPERADMIN;

    handleSuccess(needsSubscription);
  };

  useEffect(() => {
    formik.resetForm();
  }, [open]);

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "45vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 4,
          }}
        >
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                {t("Login Pin")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 3 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, mr: 4 }}>
              {`${modalData?.user?.name},`}
            </Typography>

            <FormControl>
              <FormLabel
                sx={{
                  display: "block",
                  mb: 2,
                }}
              >
                {t("Please enter your login pin.")}
              </FormLabel>
              <MuiOtpInput
                length={4}
                onBlur={() => formik.handleBlur("code")}
                onChange={(value) => formik.setFieldValue("code", value)}
                onFocus={() => formik.setFieldTouched("code")}
                sx={{
                  "& .MuiFilledInput-input": {
                    p: "14px",
                  },
                }}
                value={formik.values.code.toUpperCase()}
              />
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
            <Button
              color="inherit"
              disabled={formik.isSubmitting}
              sx={{ mr: 2 }}
              onClick={handleResetPin}
            >
              {t("Reset PIN")}
            </Button>

            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
              sx={{ ml: 1.5 }}
            >
              {t("Login")}
            </Button>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
