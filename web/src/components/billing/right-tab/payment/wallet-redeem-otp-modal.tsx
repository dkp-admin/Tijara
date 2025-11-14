import { LoadingButton } from "@mui/lab";
import { Card, Divider, FormControl, FormLabel } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { MuiOtpInput } from "mui-one-time-password-input";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import useScanStore from "src/store/scan-store";
import { useCurrency } from "src/utils/useCurrency";

interface WalletRedeemOTPProps {
  open: boolean;
  data: any;
  handleClose: () => void;
  handleRedeem: any;
}

export const WalletRedeemOTPModal: React.FC<WalletRedeemOTPProps> = ({
  open,
  data,
  handleClose,
  handleRedeem,
}) => {
  const { t } = useTranslation();
  const { setScan } = useScanStore();
  const currency = useCurrency();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRedeemWallet = async () => {
    if (otp.length == 0) {
      toast.error(t("Invalid OTP"));
      return;
    }

    if (otp.length != 4) {
      toast.error(t("Invalid OTP"));
      return;
    }

    if (!navigator.onLine) {
      toast.error(t("Please connect with the internet"));
      return;
    }

    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.walletVerifyOTP.path, {
        method: endpoint.walletVerifyOTP.method,
        body: {
          phone: data.phone,
          otp: otp,
        },
      });

      if (res.code === "success") {
        handleRedeem();
      }
    } catch (error: any) {
      toast.error(t("Invalid OTP"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setOtp("");
    setLoading(false);
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
                {t("OTP Verification")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 3 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, mr: 4 }}>
              {`${t("Redeeming")} ${currency} ${data?.walletAmount}`}
            </Typography>

            <FormControl>
              <FormLabel
                sx={{
                  display: "block",
                  mb: 2,
                }}
              >
                {`${t("Please enter customer’s OTP to redeem")}.`}
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
                onFocus={() => setScan(true)}
                onBlur={() => setScan(false)}
              />
            </FormControl>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
            <LoadingButton
              loading={loading}
              variant="contained"
              onClick={() => {
                handleRedeemWallet();
              }}
              sx={{ ml: 1.5 }}
            >
              {t("Redeem")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
