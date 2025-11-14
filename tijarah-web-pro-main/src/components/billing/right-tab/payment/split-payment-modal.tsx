import CreditCardIcon from "@mui/icons-material/CreditCard";
import PaymentsIcon from "@mui/icons-material/Payments";
import WalletIcon from "@mui/icons-material/Wallet";
import CreditIcon from "@mui/icons-material/CreditScore";
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Modal,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useCartStore from "src/store/cart-item";
import calculateCart from "src/utils/calculate-cart";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";
interface SplitPaymentModalProps {
  handleClose?: any;
  open: boolean;
  company: any;
  device: any;
  totalPaidAmount: any;
  total: any;
  handleSubmit: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}

const cardName: any = {
  Mada: "Mada",
  Visa: "Visa",
  "Master Card": "Master Card",
  "american-express": "American Express",
  sadad: "Sadad",
  ensan: "Ensan",
  tasawaq: "Tasawaq",
  classic: "Classic",
  platinum: "Platinum",
};

export const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  handleClose,
  open = false,
  company,
  device,
  totalPaidAmount,
  total,
  handleSubmit,
  isOnlineOrder = false,
  breakup = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { order } = useCartStore() as any;
  const currency = useCurrency();

  const [selectedPayment, setSelectedPayment] = useState("");

  const getPaymentIcon = (payment: any) => {
    if (payment == "Cash") {
      return <PaymentsIcon />;
    } else if (payment == "Card") {
      return <CreditCardIcon />;
    } else if (payment === "Credit") {
      return <CreditIcon />;
    } else {
      return <WalletIcon />;
    }
  };

  const paymentData = useMemo(() => {
    const data: any[] = [];

    if (device?.configuration?.paymentTypes?.length > 0) {
      device?.configuration?.paymentTypes?.forEach((type: any) => {
        if (type.name === "Wallet" && !company?.configuration?.enableLoyalty) {
          return <></>;
        }

        if (type.name === "Credit" && !company?.credit?.enableCredit) {
          return <></>;
        }

        if (type.status) {
          data.push({ label: type.name, value: type.name });
        }
      });
    }

    if (data?.length > 0) {
      setSelectedPayment(data[0].label);
    }

    return data;
  }, [device, company]);

  useEffect(() => {
    if (open) {
      calculateCart(isOnlineOrder, breakup);
      setSelectedPayment("");
    }
  }, [open]);

  return (
    <>
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
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}>
            <Box
              sx={{
                bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              }}
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}>
                <Typography> </Typography>
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Payment Status")}
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ textAlign: "right" }}>
                  {`${currency} ${total.toFixed(2)}`}
                </Typography>
              </Box>
            </Box>

            <Box
              style={{
                flex: "1 1 auto",
                padding: 3,
                maxHeight: "70vh",
                overflowY: "auto",
                marginTop: "50px",
              }}>
              <Typography variant="h6"> {t("Payment Type")}</Typography>
              <Grid container spacing={2} sx={{ mt: 2, mb: 1, px: 0 }}>
                <Grid
                  item
                  md={12}
                  xs={12}
                  sx={{
                    p: 0,
                  }}>
                  <Card
                    sx={{
                      p: 0,
                    }}>
                    {(isOnlineOrder ? breakup : order?.payment?.breakup)?.map(
                      (pbreakup: any, index: number) => {
                        return (
                          <Box key={index}>
                            <CardContent
                              style={{
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                              }}>
                              <Box>
                                <Typography variant="h6">
                                  {Object.keys(cardName || {}).includes(
                                    pbreakup.name
                                  )
                                    ? cardName[pbreakup.name]
                                    : pbreakup.name}
                                </Typography>
                                <Typography variant="body2">
                                  {format(
                                    new Date(pbreakup.createdAt),
                                    "dd/MM/yyyy, h:mma"
                                  )}
                                </Typography>
                              </Box>

                              <Typography variant="body2">{`${t(
                                "SAR"
                              )} ${Number(pbreakup.total)?.toFixed(
                                2
                              )}`}</Typography>
                            </CardContent>
                            <Divider />
                          </Box>
                        );
                      }
                    )}

                    <CardContent
                      style={{
                        textAlign: "center",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        marginTop: 2,
                        marginBottom: 2,
                      }}>
                      <Typography variant="h6">{t("Balance")}</Typography>
                      <Typography variant="body2">{`${currency} ${(
                        total - totalPaidAmount
                      ).toFixed(2)}`}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Box
              style={{
                flex: "1 1 auto",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}>
              <Typography variant="h6"> {t("Balance payment")}</Typography>
              <Grid container spacing={2} sx={{ mt: 2, mb: 1, px: 1.5 }}>
                {paymentData?.map((data: any) => (
                  <Button
                    key={data.label}
                    sx={{ mr: 1 }}
                    variant={
                      selectedPayment === data.label ? "contained" : "outlined"
                    }
                    startIcon={getPaymentIcon(data.label)}
                    onClick={() => {
                      if (data.name === "Wallet" && !navigator.onLine) {
                        toast.error(t("Please connect with internet"));
                        return;
                      }

                      if (data.name === "Credit" && !navigator.onLine) {
                        toast.error(t("Please connect with internet"));
                        return;
                      }

                      setSelectedPayment(data.name);

                      handleSubmit({
                        method: data.label.toLowerCase(),
                      });
                    }}>
                    {data.value === "Wallet"
                      ? t("Wallet Payment")
                      : t(data.value)}
                  </Button>
                ))}
              </Grid>
            </Box>
          </Card>
        </Modal> */}

        <Dialog fullWidth maxWidth="sm" open={open}>
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
            >
              {`${currency} ${total.toFixed(2)}`}
            </Box>

            <Typography sx={{ ml: 2 }} variant="h6">
              {t("Payment Status")}
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
              <CloseIcon fontSize="medium" onClick={handleClose} />
            </Box>
          </Box>

          <Divider />
          <DialogContent>
            <Box>
              <Typography variant="h6"> {t("Payment Type")}</Typography>
              <Grid container spacing={2} sx={{ mt: 2, mb: 1, px: 0 }}>
                <Grid item md={12} xs={12}>
                  <Card
                    sx={{
                      borderRadius: 1,
                    }}
                  >
                    {(isOnlineOrder ? breakup : order?.payment?.breakup)?.map(
                      (pbreakup: any, index: number) => {
                        return (
                          <Box key={index}>
                            <CardContent
                              style={{
                                borderRadius: 1,

                                // cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "12px",
                              }}
                            >
                              <Box>
                                <Typography variant="h6">
                                  {Object.keys(cardName || {}).includes(
                                    pbreakup.name
                                  )
                                    ? cardName[pbreakup.name]
                                    : pbreakup.name}
                                </Typography>
                                <Typography variant="body2">
                                  {format(
                                    new Date(pbreakup.createdAt),
                                    "dd/MM/yyyy, h:mma"
                                  )}
                                </Typography>
                              </Box>

                              <Typography variant="body2">{`${currency} ${Number(
                                pbreakup.total
                              )?.toFixed(2)}`}</Typography>
                            </CardContent>
                            <Divider />
                          </Box>
                        );
                      }
                    )}

                    <CardContent
                      style={{
                        borderRadius: 1,
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px",
                        marginTop: 2,
                      }}
                    >
                      <Typography variant="h6">{t("Balance")}</Typography>
                      <Typography variant="body2">{`${currency} ${(
                        total - totalPaidAmount
                      ).toFixed(2)}`}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Box>
              <Grid container spacing={0} sx={{ mt: 2 }}>
                {paymentData?.map((data: any) => (
                  <Button
                    key={data.label}
                    sx={{
                      width: paymentData?.length > 3 ? "23%" : "auto",
                      mr: paymentData?.length > 3 ? 0 : 1,
                      ml: paymentData?.length > 3 ? 1 : 0,
                    }}
                    variant={
                      selectedPayment === data.label ? "contained" : "outlined"
                    }
                    startIcon={getPaymentIcon(data.label)}
                    onClick={() => {
                      if (data.name === "Wallet" && !navigator.onLine) {
                        toast.error(t("Please connect with internet"));
                        return;
                      }

                      if (data.name === "Credit" && !navigator.onLine) {
                        toast.error(t("Please connect with internet"));
                        return;
                      }

                      setSelectedPayment(data.name);

                      handleSubmit({
                        method: data.label.toLowerCase(),
                      });
                    }}
                  >
                    {data.value === "Wallet"
                      ? t("Wallet Payment")
                      : t(data.value)}
                  </Button>
                ))}
              </Grid>
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
