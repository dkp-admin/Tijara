import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Modal,
  SvgIcon,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import { XCircle as RemoveIcon } from "src/icons/x-circle";
import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
import calculateCart from "src/utils/calculate-cart";
import { toFixedNumber } from "src/utils/toFixedNumber";
import CustomerDropdown from "../customer-singleSelect";
import { WalletRedeemOTPModal } from "./wallet-redeem-otp-modal";
import { useCurrency } from "src/utils/useCurrency";

interface WalletPaymentModalProps {
  open: boolean;
  handleClose: any;
  company: any;
  totalPaidAmount: any;
  totalAmount: any;
  handleSubmit: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}

export const WalletPaymentModal: React.FC<WalletPaymentModalProps> = ({
  open = false,
  handleClose,
  company,
  totalPaidAmount = 0,
  totalAmount,
  handleSubmit,
  isOnlineOrder = false,
  breakup = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setScan } = useScanStore();
  const currency = useCurrency();
  const { order, customer, customerRef, setCustomer, setCustomerRef } =
    useCartStore() as any;

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [walletAmount, setWalletAmount] = useState<string>("");
  const [customerWallet, setCustomerWallet] = useState<number>(0);
  const [openWalletRedeemModal, setOpenWalletRedeemModal] = useState(false);

  const getTotalAmount = () => {
    let total = 0;

    if (Number(totalAmount - totalPaidAmount) > customerWallet) {
      total = customerWallet;
    } else {
      total = Number(totalAmount - totalPaidAmount);
    }

    return (total || 0)?.toFixed(2);
  };

  const walletData = useMemo(() => {
    const data = [
      {
        _id: 0,
        text: t("Total bill/Maximum in wallet"),
      },
    ];

    data.push({ _id: 1, text: t("Custom") });

    return data;
  }, [totalAmount, totalPaidAmount, customer]);

  const sendOTPForWallet = async () => {
    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.walletSendOTP.path, {
        method: endpoint.walletSendOTP.method,
        body: {
          customerRef: customer._id,
        },
      });

      if (res.code === "otp_sent") {
        setOpenWalletRedeemModal(true);
      }
    } catch (error: any) {
      toast.error(error?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      calculateCart(isOnlineOrder, breakup);
      setLoading(false);
      setSelected({});
      setWalletAmount("");
      setCustomerWallet(0);
      setOpenWalletRedeemModal(false);
    }
  }, [open]);

  useEffect(() => {
    (async () => {
      if (customer?._id && company?._id) {
        setLoading(true);

        try {
          const res = await serviceCaller(endpoint.singleWallet.path, {
            method: endpoint.singleWallet.method,
            query: {
              customerRef: customer._id,
              companyRef: company._id,
            },
          });

          if (res) {
            const walletBalance = order?.payment?.breakup
              ?.filter((p: any) => p.providerName === "wallet")
              ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

            setCustomerWallet(
              Number(res.closingBalance || 0) - Number(walletBalance || 0)
            );
          }
        } catch (error: any) {
          setCustomerWallet(0);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [open, customer, company]);

  return (
    <>
      <Box>
        <Modal
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
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
            }}
          >
            <Box
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
              }}
            >
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => {
                    handleClose();
                  }}
                  style={{ cursor: "pointer" }}
                />
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Wallet Transaction")}
                  </Typography>
                </Box>
                <LoadingButton
                  loading={loading}
                  onClick={(e) => {
                    e.preventDefault();

                    if (!customerRef) {
                      toast.error(t("Please Select Customer"));
                      return;
                    } else if (!selected?.text) {
                      toast.error(t("Please Select Type"));
                      return;
                    } else if (
                      Number(
                        company?.configuration?.minimumRedeemAmount || 10
                      ) > Number(customerWallet)
                    ) {
                      toast.error(
                        `${t(
                          "To redeem, minimum wallet amount should be"
                        )} ${currency} ${Number(
                          company?.configuration?.minimumRedeemAmount || 10
                        )?.toFixed(2)}`
                      );
                      return;
                    } else if (Number(walletAmount) === 0) {
                      toast.error(t("Redeem amount must be greater than 0"));
                      return;
                    } else if (
                      Number(walletAmount) >
                        Number(
                          Number(totalAmount - totalPaidAmount)?.toFixed(2)
                        ) ||
                      Number(walletAmount) > customerWallet
                    ) {
                      toast.error(
                        `${t(
                          "Redeem amount upto"
                        )} ${currency} ${getTotalAmount()}`
                      );
                      return;
                    }

                    sendOTPForWallet();
                  }}
                  sx={{ mb: 1 }}
                  variant="contained"
                  type="submit"
                >
                  {t("Continue")}
                </LoadingButton>
              </Box>
            </Box>
            <Box
              style={{
                flex: "1 1 auto",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
              }}
            >
              <Grid container spacing={2} sx={{ mt: 1, mb: 1, px: 1 }}>
                <Grid
                  item
                  md={12}
                  xs={12}
                  sx={{
                    p: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t("Customer")}
                  </Typography>

                  {customerRef ? (
                    <Box
                      sx={{
                        py: 1,
                        borderRadius: 2,
                        border: "1px solid #A2A0A8",
                        display: "flex",
                        flexDirection: "row",
                        position: "relative",
                        justifyContent: "space-around",
                      }}
                    >
                      {customer.totalOrder !== 0 && (
                        <Box
                          sx={{
                            top: 0,
                            left: 0,
                            width: "3.25%",
                            height: "100%",
                            position: "absolute",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderTopLeftRadius: 15,
                            borderBottomLeftRadius: 15,
                            backgroundColor:
                              customer.totalOrder === 0
                                ? "#F44837"
                                : theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35",
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 10,
                              writingMode: "vertical-rl",
                              transform: "rotate(180deg)",
                            }}
                            align="right"
                            variant="subtitle1"
                            color="#fff"
                          >
                            {customer.totalOrder === 1
                              ? t("One Timer")
                              : t("Regular")}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          ml: customer.totalOrder !== 0 ? 4.5 : 2,
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                        }}
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 30,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor:
                              theme.palette.mode === "dark"
                                ? "#0C935680"
                                : "#006C3580",
                          }}
                        >
                          <Typography variant="h6" color="#fff">
                            {customer.name?.charAt(0)?.toUpperCase()}
                          </Typography>
                        </Box>
                        <Box sx={{ ml: 1.5 }}>
                          <Typography variant="subtitle1">
                            {customer.name}
                          </Typography>
                          <Typography variant="body2">
                            {customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{ mr: 2, display: "flex", flexDirection: "row" }}
                      >
                        <Box
                          sx={{
                            my: "2px",
                            mr: 2,
                            borderLeftWidth: 1,
                            border: "1px dashed #A2A0A8",
                          }}
                        />
                        <Box sx={{ mr: 1.5, flex: 1 }}>
                          <Typography align="right" variant="subtitle1">
                            {`${currency} ${toFixedNumber(customerWallet)}`}
                          </Typography>
                          <Typography
                            align="right"
                            variant="body2"
                            color="neutral.600"
                          >
                            {t("Wallet")}
                          </Typography>
                        </Box>
                        <Button
                          sx={{
                            p: 1,
                            borderRadius: 50,
                            minWidth: "auto",
                            opacity: totalPaidAmount === 0 ? 1 : 0.5,
                          }}
                          onClick={() => {
                            setSelected({});
                            setCustomer({});
                            setCustomerRef("");
                          }}
                          disabled={totalPaidAmount !== 0}
                        >
                          <SvgIcon
                            color={"error"}
                            fontSize="medium"
                            sx={{
                              m: "auto",
                              cursor: "pointer",
                            }}
                          >
                            <RemoveIcon sx={{ color: "#687086" }} />
                          </SvgIcon>
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <CustomerDropdown
                      companyRef={company?._id}
                      required={true}
                      onChange={(id, customer) => {
                        if (id) {
                          setCustomerRef(id || "");
                          setCustomer(customer);
                        } else {
                          setCustomerRef("");
                          setCustomer({});
                        }
                      }}
                      selectedId={customerRef || ""}
                      id="expiry"
                      label={t("Select Customer")}
                      disabled={
                        customerRef && Number(totalPaidAmount || 0) !== 0
                      }
                    />
                  )}
                </Grid>
              </Grid>
              {customerRef && (
                <Grid container spacing={2} sx={{ mt: 2, mb: 1, px: 1 }}>
                  {walletData?.map((data: any) => {
                    return (
                      <Grid
                        key={data._id}
                        item
                        md={6}
                        xs={6}
                        sx={{
                          p: 1,
                        }}
                      >
                        <Card
                          sx={{
                            p: 1,
                            border:
                              selected._id === data._id
                                ? theme.palette.mode === "dark"
                                  ? "1px solid #0C9356"
                                  : "1px solid #006C35"
                                : "1px solid #fff",
                          }}
                          onClick={() => {
                            setSelected(data);

                            if (data._id === 0) {
                              setWalletAmount(getTotalAmount());
                            } else {
                              setWalletAmount("");
                            }
                          }}
                        >
                          <CardContent
                            style={{
                              textAlign: "center",
                              cursor: "pointer",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              padding: "12px",
                            }}
                          >
                            <Typography variant="body2">{data.text}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
              {selected?.text && (
                <Grid container spacing={2} sx={{ mt: 1, mb: 1, px: 1 }}>
                  <Grid
                    item
                    md={12}
                    xs={12}
                    sx={{
                      p: 1,
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ ml: 2, mb: 1 }}>
                      {t("Transaction Details")}
                    </Typography>

                    <TextField
                      name="price"
                      type="number"
                      fullWidth
                      label={`${t("Amount")} (${t("in")} ${currency})`}
                      value={walletAmount}
                      onChange={(e) => setWalletAmount(e.target.value)}
                      disabled={selected.text !== t("Custom")}
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
                  </Grid>
                </Grid>
              )}
            </Box>
          </Card>
        </Modal>
      </Box>

      <WalletRedeemOTPModal
        open={openWalletRedeemModal}
        data={{
          ...customer,
          walletAmount: Number(walletAmount)?.toFixed(2),
        }}
        handleClose={() => setOpenWalletRedeemModal(false)}
        handleRedeem={() => {
          setLoading(true);
          handleSubmit({
            providerName: "wallet",
            cardType: "Wallet",
            transactionNumber: "Wallet",
            amount: Number(walletAmount),
          });
          setOpenWalletRedeemModal(false);
          handleClose();
          setLoading(false);
          toast.success(t("Wallet Redeemed Successfully"));
        }}
      />
    </>
  );
};
