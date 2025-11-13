import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Modal,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { tijarahPaths } from "src/paths";
import useScanStore from "src/store/scan-store";
import cart from "src/utils/cart";
import { toFixedNumber } from "src/utils/toFixedNumber";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface StartShiftModalProps {
  open: boolean;
  location: any;
  defaultCash: number;
  handleClose: any;
}

export const StartShiftModal: React.FC<StartShiftModalProps> = ({
  open = false,
  location,
  defaultCash = 0,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { setScan } = useScanStore();
  const { device, deviceLogout, userDeviceLogout } = useAuth();
  const currency = useCurrency();

  const [amount, setAmount] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [difference, setDifference] = useState(0);
  const [availableSystemAmount, setAvailableSystemAmount] = useState("0");

  const startShiftData = JSON.parse(localStorage.getItem("openShiftDrawer"));

  const handleSubmit = async () => {
    if (amount == -1) {
      toast.error(t("Please enter actual cash available"));
      return;
    }

    setLoading(true);

    try {
      const cashTxnData = {
        openingActual: Number(amount),
        openingExpected: Number(availableSystemAmount),
        closingActual: 0,
        closingExpected: 0,
        difference: difference,
        shiftStarted: true,
        dayEnd: false,
        transactionType: "open",
        description: "Cash Drawer Open",
        shiftIn: new Date(),
        shiftOut: startShiftData?.shiftOut || new Date(),
      };

      localStorage.setItem("openShiftDrawer", JSON.stringify(cashTxnData));
      localStorage.setItem("cashDrawer", "close");

      handleClose();
      toast.success(t("Shift Started"));
    } catch (err) {
      toast.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const login = localStorage.getItem("login");

    setAmount(-1);
    setLoading(false);
    setDifference(0);
    setAvailableSystemAmount("0");
    handleClose();

    if (login === "user") {
      router.back();
      await userDeviceLogout(device?.deviceRef, device?.phone);
      cart.clearCart();
      localStorage.removeItem("device");
      localStorage.removeItem("accessDeviceToken");
    } else {
      await deviceLogout();
      localStorage.removeItem("user");
      localStorage.removeItem("userType");
      localStorage.removeItem("accessToken");
      router.push(tijarahPaths.authentication.login);
      toast.success(t("Logout successfully!"));
    }
  };

  useEffect(() => {
    const systemCash = startShiftData?.closingActual;

    setLoading(false);

    if (startShiftData?.dayEnd) {
      setAvailableSystemAmount(defaultCash?.toFixed(2));
    } else {
      setAvailableSystemAmount(Number(systemCash || defaultCash)?.toFixed(2));
    }
  }, [open, defaultCash, startShiftData]);

  useEffect(() => {
    const diff = amount - Number(availableSystemAmount);
    setDifference(diff);
  }, [amount, availableSystemAmount]);

  return (
    <Box>
      {/* <Modal open={open}>
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "40vw",
            },
            maxHeight: "90%",
            bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
            overflow: "inherit",
            display: "flex",
            flexDirection: "column",
            px: 4,
            py: 3,
          }}>
          <Box
            sx={{
              bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
            }}
            style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleLogout}
              style={{ cursor: "pointer" }}
            />

            <Box sx={{ flex: 1, pl: "20px" }}>
              <Typography variant="h6" style={{ textAlign: "center" }}>
                {t("Shift in - Start Cash Drawer")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontSize: 14 }} variant="body2">
              {`${t("Available as per system")}.`}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 0.5, fontSize: 20 }}>
              {`${currency} ${toFixedNumber(availableSystemAmount || 0.0)}`}
            </Typography>

            <Divider sx={{ mt: 1 }} />

            <TextField
              sx={{
                mt: 2.5,
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
              type="number"
              fullWidth
              required
              label={t("Actual Cash Available (in ${currency})")}
              name="actualCash"
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onChange={(e: any) => {
                const val = e.target.value;
                const regex = /^[0-9]*(\.[0-9]{0,2})?$/;

                if (val?.length < 10 && (val === "" || regex.test(val))) {
                  setAmount(e.target.value);
                }
              }}
              value={amount === -1 ? "" : `${amount}`}
            />

            {amount > 0 && (
              <Box>
                <Divider sx={{ mt: 3 }} />

                <Typography sx={{ mt: 2, fontSize: 14 }}>
                  {t("Difference")}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ mt: 0.5, fontSize: 18 }}
                  color={difference >= 0 ? "primary" : "error"}>
                  {`${currency} ${difference > 0 ? "+" : ""}${toFixedNumber(
                    difference || 0.0
                  )}`}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3.5 }}>
            <LoadingButton
              onClick={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              sx={{ mb: 1 }}
              variant="contained"
              type="submit"
              loading={loading}>
              {t("Start")}
            </LoadingButton>
          </Box>
        </Card>
      </Modal> */}

      <Dialog fullWidth maxWidth="sm" open={open}>
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
            {t("Shift in - Start Cash Drawer")}
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
            <CloseIcon fontSize="medium" onClick={handleLogout} />
          </Box>
        </Box>
        <Divider />
        {/* body */}
        <DialogContent>
          <Box>
            <Typography sx={{ fontSize: 14 }} variant="body2">
              {`${t("Available as per system")}.`}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 0.5, fontSize: 20 }}>
              {`${currency} ${toFixedNumber(availableSystemAmount || 0.0)}`}
            </Typography>

            <TextField
              sx={{
                mt: 2.5,
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    display: "none",
                  },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
              type="number"
              fullWidth
              required
              label={t(`Actual Cash Available (in ${currency})`)}
              name="actualCash"
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onChange={(e: any) => {
                const val = e.target.value;
                const regex = /^[0-9]*(\.[0-9]{0,2})?$/;

                if (val?.length < 10 && (val === "" || regex.test(val))) {
                  setAmount(e.target.value);
                }
              }}
              value={amount === -1 ? "" : `${amount}`}
            />

            {amount > 0 && (
              <Box>
                <Typography sx={{ mt: 2, fontSize: 14 }}>
                  {t("Difference")}
                </Typography>

                <Typography
                  variant="subtitle1"
                  sx={{ mt: 0.5, fontSize: 18 }}
                  color={difference >= 0 ? "primary" : "error"}
                >
                  {`${currency} ${difference > 0 ? "+" : ""}${toFixedNumber(
                    difference || 0.0
                  )}`}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <Divider />

        {/* footer */}
        <DialogActions
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "end",
            p: 2,
          }}
        >
          <LoadingButton
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            sx={{ borderRadius: 1 }}
            variant="contained"
            type="submit"
            loading={loading}
          >
            {t("Start")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
