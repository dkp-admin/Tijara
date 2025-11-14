import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Modal,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
import calculateCart from "src/utils/calculate-cart";
import getNearbyAmountOptions from "src/utils/tender-cash-option";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface CashPaymentModalProps {
  open: boolean;
  handleClose: any;
  handleSubmit: any;
  totalAmount: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  open = false,
  handleClose,
  handleSubmit,
  totalAmount,
  isOnlineOrder = false,
  breakup = [],
}) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  const theme = useTheme();
  const { setScan } = useScanStore();
  const [selectedCash, setSelectedCash] = useState<any | null>(null);
  const [customPrice, setCustomPrice] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const { totalPaidAmount } = useCartStore();

  const handlePriceChange = (event: any) => {
    setCustomPrice(event.target.value);
  };

  useEffect(() => {
    if (open) {
      calculateCart(isOnlineOrder, breakup);
      setSelectedCash("");
      setCustomPrice(0);
    }
  }, [open]);

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="sm"
          open={open && !showSuccess}
          onClose={() => {
            handleClose();
            setSelectedCash(null);
          }}
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
              {t("Cash")}
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
                  setSelectedCash(null);
                }}
              />
            </Box>
          </Box>
          <Divider />
          {/* body */}
          <DialogContent>
            <Grid container spacing={2} sx={{ p: 1 }}>
              {[
                ...getNearbyAmountOptions(
                  totalPaidAmount
                    ? (totalAmount - totalPaidAmount).toFixed(2)
                    : totalAmount.toFixed(2)
                ),
                "Other",
              ]?.map((amount: any) => {
                return (
                  <Grid key={amount} item md={4} xs={6}>
                    {selectedCash == "Other" && amount == "Other" ? (
                      <Card
                        sx={{
                          borderRadius: 1,
                          border:
                            selectedCash === "Other"
                              ? theme.palette.mode === "dark"
                                ? "1px solid #0C9356"
                                : "1px solid #006C35"
                              : "1px solid transparent",
                        }}
                      >
                        <CardContent
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                              cursor: "pointer",
                            },
                          }}
                          style={{
                            textAlign: "center",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px",
                          }}
                        >
                          <Typography variant="body2">
                            {t("Custom Price")}
                          </Typography>
                          <TextField
                            name="price"
                            variant="standard"
                            InputProps={{
                              startAdornment: (
                                <Typography
                                  color="textSecondary"
                                  variant="body2"
                                  sx={{ mr: 1 }}
                                >
                                  {currency}
                                </Typography>
                              ),
                            }}
                            onFocus={() => setScan(true)}
                            onBlur={() => setScan(false)}
                            style={{ width: "100px" }}
                            value={customPrice}
                            onChange={handlePriceChange}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <Card
                        sx={{
                          borderRadius: 1,
                          border: selectedCash === 1 && "#006C35",
                        }}
                        onClick={() => {
                          setCustomPrice(0);
                          setSelectedCash(amount);
                          if (amount !== "Other") {
                            handleSubmit({
                              providerName: "cash",
                              cardType: "Cash",
                              transactionNumber: "Cash",
                              amount: Number(amount),
                              change:
                                Number(amount) -
                                (Number(totalAmount - (totalPaidAmount || 0)) ||
                                  0),
                            });
                            handleClose();
                          }
                        }}
                      >
                        <CardContent
                          sx={{
                            "&:hover": {
                              backgroundColor: "action.hover",
                              cursor: "pointer",
                            },
                          }}
                          style={{
                            textAlign: "center",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "12px",
                          }}
                        >
                          <Typography variant="body2">
                            {amount === "Other"
                              ? t("Other")
                              : `${currency} ${amount}`}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
            }}
          >
            <LoadingButton
              sx={{ borderRadius: 1 }}
              onClick={(e) => {
                e.preventDefault();

                if (selectedCash === "Other" && Number(customPrice) > 0) {
                  handleSubmit({
                    providerName: "cash",
                    cardType: "Cash",
                    transactionNumber: "Cash",
                    amount: Number(customPrice),
                    change:
                      Number(customPrice) -
                      (Number(totalAmount - (totalPaidAmount || 0)) || 0),
                  });
                  handleClose();
                } else {
                  toast.error(t("Amount should be greater than 0"));
                }
              }}
              variant="contained"
              type="submit"
              disabled={selectedCash !== "Other"}
            >
              {t("Continue")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
