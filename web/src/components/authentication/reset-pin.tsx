import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  Divider,
  FormControl,
  FormLabel,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";

interface ResetPinProps {
  open: boolean;
  users: any;
  selectedUser: any;
  handleClose: () => void;
}

export const ResetPin: React.FC<ResetPinProps> = ({
  open,
  users,
  selectedUser,
  handleClose,
}) => {
  const { t } = useTranslation();

  const [newPin, setNewPin] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpData, setShowOtpData] = useState(false);
  const [resendBtnTap, setResendBtnTap] = useState(true);
  const [timer, setTimer] = useState(60);

  const sendOTPForResetPin = async () => {
    if (newPin.length == 0 || newPin.length != 4) {
      toast.error(t("Invalid user or password"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.sendOtp.path, {
        method: endpoint.sendOtp.method,
        body: {
          phone: selectedUser.phone,
        },
      });

      if (res.code === "otp_sent") {
        setShowOtpData(true);
        setResendBtnTap(true);
        setTimer(60);
      }
    } catch (error: any) {
      toast.error(t("Invalid user or password"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTPForResetPin = async () => {
    if (otp.length == 0 || otp.length != 4) {
      toast.error(t("Invalid OTP"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.resetPassword.path, {
        method: endpoint.resetPassword.method,
        body: {
          phone: selectedUser.phone,
          otp: otp,
          newPassword: newPin,
        },
      });

      if (res?.code === "success") {
        handleClose();
      }
    } catch (error: any) {
      toast.error(t("Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setNewPin("");
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
              xs: "95vw",
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
                {t("Reset Pin")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="loginId-label">{t("Selected User")}</InputLabel>
              <Select
                labelId="loginId-label"
                id="loginId"
                name="loginId"
                value={selectedUser?._id}
                onChange={() => {}}
                label="Selected User"
                disabled
              >
                {users?.map((user: any) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ mt: 3 }}>
              <FormLabel
                sx={{
                  display: "block",
                  mb: 2,
                }}
              >
                {t("Please enter new login pin.")}
              </FormLabel>
              <MuiOtpInput
                length={4}
                onChange={(value) => setNewPin(value)}
                sx={{
                  "& .MuiFilledInput-input": {
                    p: "14px",
                  },
                }}
                value={newPin}
              />
            </FormControl>

            {showOtpData && (
              <FormControl sx={{ mt: 3 }}>
                <FormLabel
                  sx={{
                    display: "block",
                    mb: 2,
                  }}
                >
                  {`${t("Please enter the login code sent on")} ${
                    selectedUser?.phone
                  }`}
                </FormLabel>
                <MuiOtpInput
                  length={4}
                  onChange={(value) => setOtp(value)}
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
                    sendOTPForResetPin();
                  }}
                  sx={{ ml: -1 }}
                  disabled={resendBtnTap}
                >
                  {t("Resend OTP")}
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
            <LoadingButton
              variant="contained"
              loading={loading}
              onClick={() => {
                if (showOtpData) {
                  verifyOTPForResetPin();
                } else {
                  sendOTPForResetPin();
                }
              }}
              sx={{ ml: 1.5 }}
            >
              {showOtpData ? t("Verify") : t("Submit")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
