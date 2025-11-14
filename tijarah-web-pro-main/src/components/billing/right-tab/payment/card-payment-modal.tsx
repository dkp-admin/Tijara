import { LoadingButton } from "@mui/lab";
import {
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  MenuItem,
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
import MadaIcon from "src/icons/mada";
import MasterCardIcon from "src/icons/master-card";
import VisaIcon from "src/icons/visa";
import useScanStore from "src/store/scan-store";
import calculateCart from "src/utils/calculate-cart";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface CardPaymentModalProps {
  open: boolean;
  handleClose: any;
  handleSubmit: any;
  totalAmount: any;
  totalPaidAmount: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}

const cardTypeOptions = [
  { label: "American Express", value: "American Express" },
  { label: "Sadad", value: "Sadad" },
  { label: "Ensan", value: "Ensan" },
  { label: "Tasawaq", value: "Tasawaq" },
  { label: "Classic", value: "Classic" },
  { label: "Platinum", value: "Platinum" },
];

export const CardPaymentModal: React.FC<CardPaymentModalProps> = ({
  open = false,
  handleClose,
  handleSubmit,
  totalAmount,
  totalPaidAmount,
  isOnlineOrder = false,
  breakup = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setScan } = useScanStore();
  const currency = useCurrency();

  const [selectedCard, setSelectedCard] = useState("");
  const [transactionNumber, setTransactionNumber] = useState("");
  const [amount, setAmount] = useState<string>("0");
  const [selectedType, setSelectedType] = useState("");

  const isSelected = (item: any) => {
    return item == selectedCard;
  };

  const getCardIcon = (card: any) => {
    if (card == "Mada") {
      return <MadaIcon color={isSelected(card) ? "primary" : "default"} />;
    } else if (card == "Visa") {
      return <VisaIcon color={isSelected(card) ? "primary" : "default"} />;
    } else if (card == "Master Card") {
      return (
        <MasterCardIcon color={isSelected(card) ? "primary" : "default"} />
      );
    }
  };

  const getTotalAmount = () => {
    if (totalPaidAmount) {
      return `${currency} ${(totalAmount - totalPaidAmount).toFixed(2)}`;
    } else {
      return `${currency} ${totalAmount.toFixed(2)}`;
    }
  };

  useEffect(() => {
    if (open) {
      calculateCart(isOnlineOrder, breakup);
      setSelectedCard("");
      setTransactionNumber("");
      setSelectedType("");
      setAmount(
        totalPaidAmount
          ? `${(totalAmount - totalPaidAmount).toFixed(2) || "0"}`
          : `${totalAmount.toFixed(2) || "0"}`
      );
    }
  }, [open]);

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="sm"
          open={open}
          onClose={() => {
            handleClose();
            setSelectedCard(null);
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
              {t("Card")}
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
                  setSelectedCard(null);
                }}
              />
            </Box>
          </Box>
          <Divider />
          {/* body */}
          <DialogContent>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {["Mada", "Visa", "Master Card"].map((card) => {
                return (
                  <Grid
                    key={card}
                    item
                    md={4}
                    xs={6}
                    sx={{
                      p: 1,
                    }}
                  >
                    <Card
                      sx={{
                        borderRadius: 1,
                        border:
                          selectedCard === card
                            ? theme.palette.mode === "dark"
                              ? "1px solid #0C9356"
                              : "1px solid #006C35"
                            : "1px solid action.hover",
                      }}
                      onClick={() => {
                        setSelectedCard(card);
                        setSelectedType("");
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
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "0px",
                        }}
                      >
                        {getCardIcon(card)}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
              <Grid item md={12} xs={12}>
                <TextField
                  sx={{ mt: 1 }}
                  fullWidth
                  label={t("Select Other Card Type")}
                  name="card-selection"
                  onChange={(e) => {
                    setSelectedCard("");
                    setSelectedType(e.target.value);
                  }}
                  select
                  value={selectedType}
                  onFocus={() => setScan(true)}
                  onBlur={() => setScan(false)}
                >
                  {cardTypeOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item md={12} xs={12}>
                <Box sx={{ flex: 1, mt: 2, ml: 2 }}>
                  <Typography variant="body2">
                    {t("Transaction Details")}
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    required
                    label={t(`Amount (in ${currency})`)}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onFocus={() => setScan(true)}
                    onBlur={() => setScan(false)}
                    onKeyPress={(event): void => {
                      const ascii = event.charCode;
                      const value = (event.target as HTMLInputElement).value;
                      const decimalCheck = value.indexOf(".") !== -1;

                      if (decimalCheck) {
                        const decimalSplit = value.split(".");
                        const decimalLength = decimalSplit[1].length;

                        if (decimalLength > 1 || ascii === 46) {
                          event.preventDefault();
                        } else if (ascii < 48 || ascii > 57) {
                          event.preventDefault();
                        }
                      } else if (value.length > 8 && ascii !== 46) {
                        event.preventDefault();
                      } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                        event.preventDefault();
                      }
                    }}
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label={t("Transaction Ref No.")}
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    onFocus={() => setScan(true)}
                    onBlur={() => setScan(false)}
                    onKeyPress={(event): void => {
                      const ascii = event.charCode;
                      const value = (event.target as HTMLInputElement).value;

                      if (ascii >= 48 && ascii <= 57) {
                        if (value.length > 30) {
                          event.preventDefault();
                        }
                      } else {
                        event.preventDefault();
                      }
                    }}
                  />
                </Box>
              </Grid>
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
              onClick={(e) => {
                e.preventDefault();

                if (
                  Number(Number(amount)?.toFixed(2)) <=
                    Number(totalAmount?.toFixed(2)) &&
                  (selectedCard || selectedType)
                ) {
                  handleSubmit({
                    providerName: "card",
                    cardType: selectedCard || selectedType || "Visa",
                    transactionNumber: transactionNumber,
                    amount: Number(amount),
                  });
                  handleClose();
                } else {
                  if (selectedCard == "" && selectedType == "") {
                    toast.error(t("Please Select Card Type"));
                  } else if (!amount) {
                    toast.error(`${t("Amount should not be empty")}`);
                  } else if (Number(amount || 0) === 0) {
                    toast.error(`${t("Amount should not be 0")}`);
                  } else {
                    toast.error(
                      `${t(
                        "Amount should be less than or equal to"
                      )} ${getTotalAmount()}`
                    );
                  }
                }
              }}
              sx={{ borderRadius: 1 }}
              variant="contained"
              type="submit"
            >
              {t("Continue")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
