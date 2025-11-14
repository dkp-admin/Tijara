import { LoadingButton } from "@mui/lab";
import { Button, Card, FormControl, FormLabel, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import parsePhoneNumber from "src/utils/parse-phone-number";
import PhoneInput from "../phone-input";

interface CustomerAuthModalProps {
  open: boolean;
  locationRef: string;
  handleClose: () => void;
  handleSuccess: () => void;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  open,
  locationRef,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { orderingSendCode, orderingVerifyOTP } = useAuth();

  const [country, setCountry] = useState("+966");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpData, setShowOtpData] = useState(false);
  const [resendBtnTap, setResendBtnTap] = useState(true);
  const [timer, setTimer] = useState(60);

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  const sendOTPForLogin = async () => {
    if (phone.length == 0) {
      toast.error(t("Phone number is required"));
      return;
    } else if (phone.length < 9) {
      toast.error(t("Phone Number should be minimum 9 digits"));
      return;
    } else if (phone.length > 12) {
      toast.error(t("Phone Number should not be maximum 12 digits"));
      return;
    }

    setLoading(true);

    try {
      const res = await orderingSendCode(parsePhoneNumber(country, phone));

      if (res?.code === "otp_sent") {
        setShowOtpData(true);
        setResendBtnTap(true);
        setTimer(60);
      }
    } catch (error: any) {
      toast.error(t("Invalid phone number"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPForLogin = async () => {
    if (otp.length == 0 || otp.length != 4) {
      toast.error(t("Invalid OTP"));
      return;
    }

    setLoading(true);

    try {
      const res = await orderingVerifyOTP(
        parsePhoneNumber(country, phone),
        otp,
        locationRef
      );

      if (res?.token) {
        handleSuccess();
      }
    } catch (error: any) {
      toast.error(t("Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setOtp("");
      setLoading(false);
      setShowOtpData(false);
      setResendBtnTap(false);
      setTimer(60);
    }
  }, [open]);

  useEffect(() => {
    let interval: any;

    if (resendBtnTap) {
      interval = setInterval(() => {
        if (timer > 0) {
          setTimer(timer - 1);
        } else {
          setResendBtnTap(false);
          clearInterval(interval);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [resendBtnTap, timer]);

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
              xs: "90vw",
              sm: "70vw",
              md: "55vw",
              lg: "40vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            px: 4,
            py: 3,
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
                {t("Login")}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="neutral.600" align="left">
              {t("Please help us with your phone number to get started")}
            </Typography>

            <PhoneInput
              error={""}
              value={phone}
              country={country}
              handleChangeCountry={handleChangeCountry}
              onChange={(e: any) => {
                setPhone(e.target.value);
                setShowOtpData(false);
              }}
              style={{}}
              required={true}
              label={t("Phone Number")}
            />

            {showOtpData && (
              <FormControl sx={{ mt: 2 }}>
                <FormLabel sx={{ mb: 1.25, display: "block" }}>
                  {t("Enter the OTP")}
                </FormLabel>

                <MuiOtpInput
                  length={4}
                  onChange={(value) => setOtp(value)}
                  TextFieldsProps={{
                    type: "number",
                    inputProps: {
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    },
                  }}
                  sx={{
                    "& .MuiFilledInput-input": {
                      p: "14px",
                    },
                  }}
                  value={otp}
                />
              </FormControl>
            )}
          </Box>

          {showOtpData && (
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Typography variant="body2">
                {t("Didn't receive the code?")}
              </Typography>

              {resendBtnTap ? (
                <Typography variant="body2" sx={{ ml: 1, mr: 2 }}>
                  {`(00:${timer})`}
                </Typography>
              ) : (
                <Button
                  variant="text"
                  onClick={() => {
                    sendOTPForLogin();
                  }}
                  sx={{ ml: -1 }}
                  disabled={resendBtnTap}
                >
                  {t("Resend OTP")}
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={() => {
                if (showOtpData) {
                  verifyOTPForLogin();
                } else {
                  sendOTPForLogin();
                }
              }}
              sx={{
                ml: 1.5,
                bgcolor: theme.palette.mode === "dark" ? "#0C9356" : "#006C35",
              }}
            >
              {showOtpData ? t("Verify") : t("Get OTP")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
