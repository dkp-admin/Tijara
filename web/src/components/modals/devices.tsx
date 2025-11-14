import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import PhoneInput from "../phone-input";

interface DevicesModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
}

export const DevicesModal: React.FC<DevicesModalProps> = ({
  open,
  modalData,
  handleClose,
}) => {
  const { t } = useTranslation();

  const [, setBackDrop] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [showPhoneField, setShowPhoneField] = useState(false);
  const [country, setCountry] = useState("+966");
  const theme = useTheme();

  const formik = useFormik({
    initialValues: {
      email: "",
      phone: "",
    },

    onSubmit: async (values) => {
      if (showEmailField && values.email == "") {
        toast.error(`${t("Email should not be empty")}`);
        return;
      }

      if (showPhoneField && values.phone == "") {
        toast.error(`${t("Phone should not be empty")}`);
        return;
      }

      try {
        const res = await serviceCaller(endpoint.deviceSendCode.path, {
          method: endpoint.deviceSendCode.method,
          body: {
            type: showEmailField ? "email" : "phone",
            value: showEmailField ? values.email : values.phone,
            deviceCode: modalData?.deviceCode,
            devicePin: modalData?.devicePassword,
          },
        });

        if (res) {
          toast.success(
            showEmailField
              ? `${"Device code and password sent to email"}`
              : `${"Device code and password send to phone"}`
          );

          handleClose();
        }
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
    formik.setFieldValue("phone", "");
  };

  const onClose = (event: {}, reason: "backdropClick" | "escapeKeyDown") => {
    if (reason === "backdropClick") {
      console.log(reason);
    } else {
      setBackDrop(false);
    }
    setShowEmailField(false);
    setShowPhoneField(false);
  };

  const handleBackdropClick = (event: any) => {
    event.stopPropagation();
    return false;
  };

  return (
    <>
      <Dialog
        open={open}
        onBackdropClick={handleBackdropClick}
        onClose={onClose}
        disableEscapeKeyDown
      >
        {/* header */}
        <Box
          sx={{
            display: "flex",
            p: 2,
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
            {t("Sign in using these code")}
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
            <CloseIcon
              fontSize="medium"
              onClick={() => {
                handleClose();
                setShowEmailField(false);
                setShowPhoneField(false);
              }}
            />
          </Box>
        </Box>
        <Divider />
        <Typography
          variant="body2"
          color="gray"
          align="center"
          sx={{ fontSize: "13px", px: 3, mt: 2 }}
        >
          {t("Use Device Code & Device Password to sign in to your POS app")}
        </Typography>

        <DialogContent>
          <Box>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("Device Code")}
              </Typography>
              <Typography
                variant="h3"
                style={{
                  borderRadius: 5,
                  background:
                    theme.palette.mode === "light" ? "#f8f9fa" : "#2D3748",
                  width: "100%",
                  border: "none",
                  padding: "13px 4px",
                  fontWeight: "bold",
                  fontSize: "30px",
                  textAlign: "center",
                }}
              >
                {modalData?.deviceCode}
              </Typography>
            </Box>
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("Device Password")}
              </Typography>
              <Typography
                variant="h3"
                style={{
                  borderRadius: 5,
                  background:
                    theme.palette.mode === "light" ? "#f8f9fa" : "#2D3748",
                  width: "100%",
                  border: "none",
                  padding: "13px 4px",
                  fontWeight: "bold",
                  fontSize: "30px",
                  textAlign: "center",
                }}
              >
                {modalData?.devicePassword}
              </Typography>
            </Box>
          </Box>

          {showPhoneField && (
            <Box>
              <PhoneInput
                touched={formik.touched.phone}
                error={formik.errors.phone}
                value={formik.values.phone}
                onBlur={formik.handleBlur("phone")}
                country={country}
                handleChangeCountry={handleChangeCountry}
                onChange={formik.handleChange("phone")}
                required
                label={t("Phone")}
              />
            </Box>
          )}

          {showEmailField && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t("Email")}
                name="email"
                sx={{ flexGrow: 1 }}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.email}
              />
            </Box>
          )}
        </DialogContent>

        <Divider />
        <DialogActions>
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
            {(showEmailField || showPhoneField) && (
              <Button
                sx={{ borderRadius: 1, mr: 1 }}
                size="small"
                color="inherit"
                onClick={() => {
                  if (showPhoneField) {
                    setShowPhoneField(false);
                  }

                  if (showEmailField) {
                    setShowEmailField(false);
                  }
                }}
              >
                {t("Back")}
              </Button>
            )}

            {!showEmailField && (
              <Button
                sx={{ borderRadius: 1, mr: !showPhoneField ? 1 : 0 }}
                size="small"
                variant="outlined"
                disabled={formik.isSubmitting}
                onClick={() => {
                  if (showPhoneField) {
                    formik.handleSubmit();
                  } else {
                    setShowPhoneField(true);
                  }
                }}
              >
                {t("Send to Phone")}
              </Button>
            )}

            {!showPhoneField && (
              <Button
                sx={{ borderRadius: 1 }}
                size="small"
                variant="contained"
                disabled={formik.isSubmitting}
                onClick={() => {
                  if (showEmailField) {
                    formik.handleSubmit();
                  } else {
                    setShowEmailField(true);
                  }
                }}
              >
                {t("Send to Email")}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};
