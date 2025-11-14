import { LoadingButton } from "@mui/lab";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { CreditOTPModal } from "./credit-otp-modal";
import { useCurrency } from "src/utils/useCurrency";

interface CreditPaymentModalProps {
  open: boolean;
  handleClose: any;
  company: any;
  totalPaidAmount: any;
  totalAmount: any;
  handleSubmit: any;
  isOnlineOrder?: boolean;
  breakup?: any[];
}

export const CreditPaymentModal: React.FC<CreditPaymentModalProps> = ({
  open = false,
  handleClose,
  company,
  totalPaidAmount = 0,
  totalAmount = 0,
  handleSubmit,
  isOnlineOrder = false,
  breakup = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { setScan } = useScanStore();
  const { order, customer, customerRef, setCustomer, setCustomerRef } =
    useCartStore() as any;
  const currency = useCurrency();

  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>({});
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [customerData, setCustomerData] = useState<any>({});
  const [openCreditOTPModal, setOpenCreditOTPModal] = useState(false);

  const getTotalAmount = () => {
    let total = 0;

    if (
      Number(totalAmount - totalPaidAmount) >
      Number(customerData?.availableCredit)
    ) {
      total = Number(customerData?.availableCredit);
    } else {
      total = Number(totalAmount - totalPaidAmount);
    }

    return (total || 0)?.toFixed(2);
  };

  const creditData = useMemo(() => {
    const data = [
      {
        _id: 0,
        text: t("Total bill/Maximum in credit"),
      },
    ];

    data.push({ _id: 1, text: t("Custom") });

    return data;
  }, [totalAmount, totalPaidAmount, customer]);

  const sendOTPForCredit = async () => {
    setLoading(true);

    try {
      const res = await serviceCaller(endpoint.walletSendOTP.path, {
        method: endpoint.walletSendOTP.method,
        body: {
          customerRef: customer._id,
        },
      });

      if (res.code === "otp_sent") {
        setOpenCreditOTPModal(true);
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
      setCreditAmount("");
      setCustomerData(null);
      setOpenCreditOTPModal(false);
    }
  }, [open]);

  useEffect(() => {
    (async () => {
      if (customer?._id) {
        setLoading(true);

        try {
          const res = await serviceCaller(`/customer/${customer._id}`, {
            method: "GET",
          });

          if (res) {
            const creditBalance = order?.payment?.breakup
              ?.filter((p: any) => p.providerName === "credit")
              ?.reduce((pv: any, cv: any) => pv + cv.total, 0);

            setCustomerData({
              allowCredit: res?.credit?.allowCredit,
              maximumCredit: res?.credit?.maximumCredit,
              usedCredit:
                Number(res?.credit?.usedCredit || 0) +
                Number(creditBalance || 0),
              availableCredit:
                res?.credit?.maximumCredit > 0
                  ? Number(res?.credit?.availableCredit || 0) -
                    Number(creditBalance || 0)
                  : Number(totalAmount - totalPaidAmount),
              blockedCredit: res?.credit?.blockedCredit,
              blacklistCredit: res?.credit?.blacklistCredit,
            });
          }
        } catch (error: any) {
          setCustomerData({
            allowCredit: false,
            maximumCredit: customer?.credit?.maximumCredit,
            usedCredit: 0,
            availableCredit: 0,
            blockedCredit: false,
            blacklistCredit: false,
          });
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [open, customer]);

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
                    {t("Credit Transaction")}
                  </Typography>
                </Box>
                <LoadingButton
                  loading={loading}
                  onClick={(e) => {
                    e.preventDefault();

                    if (!customerRef) {
                      toast.error(t("Please Select Customer"));
                      return;
                    } else if (!customerData?.allowCredit) {
                      toast.error(
                        t("Please enabled credit for selected customer")
                      );
                      return;
                    } else if (customerData?.blockedCredit) {
                      toast.error(
                        t("Please unblock credit for selected customer")
                      );
                      return;
                    } else if (customerData?.blacklistCredit) {
                      toast.error(
                        t("Please disabled blacklist customer to use credit")
                      );
                      return;
                    } else if (!selected?.text) {
                      toast.error(t("Please Select Type"));
                      return;
                    } else if (
                      Number(customerData?.availableCredit || 0) <= 0
                    ) {
                      toast.error(
                        t("Available credit limit should be greater than 0")
                      );
                      return;
                    } else if (Number(creditAmount || 0) === 0) {
                      toast.error(t("Credit amount should be greater than 0"));
                      return;
                    } else if (
                      Number(creditAmount) >
                        Number(
                          Number(totalAmount - totalPaidAmount)?.toFixed(2)
                        ) ||
                      Number(creditAmount) >
                        Number(customerData?.availableCredit)
                    ) {
                      toast.error(
                        `${t(
                          "Used amount upto"
                        )} ${currency} ${getTotalAmount()}`
                      );
                      return;
                    }

                    sendOTPForCredit();
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
                      {(customerData?.allowCredit ||
                        customerData?.blockedCredit ||
                        customerData?.blacklistCredit) && (
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
                            backgroundColor: customerData?.blacklistCredit
                              ? "#F44837"
                              : customerData?.blockedCredit
                              ? "#FFB200"
                              : customerData?.allowCredit
                              ? theme.palette.mode === "dark"
                                ? "#0C9356"
                                : "#006C35"
                              : "transparent",
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
                            {customerData?.blacklistCredit
                              ? t("Blacklist")
                              : customerData?.blockedCredit
                              ? t("Blocked")
                              : customerData?.allowCredit
                              ? t("Activated")
                              : ""}
                          </Typography>
                        </Box>
                      )}
                      <Box
                        sx={{
                          ml:
                            customerData?.allowCredit ||
                            customerData?.blockedCredit ||
                            customerData?.blacklistCredit
                              ? 4.5
                              : 2,
                          flex: 1,
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
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
                        <Box sx={{ mr: 2, flex: 1, alignItems: "center" }}>
                          {customerData ? (
                            customerData?.maximumCredit > 0 ? (
                              <Typography variant="subtitle1">
                                {`${currency} ${toFixedNumber(
                                  Number(
                                    customerData?.availableCredit
                                  )?.toFixed(2)
                                )}`}
                              </Typography>
                            ) : (
                              <Typography variant="subtitle1">
                                {t("Unlimited")}
                              </Typography>
                            )
                          ) : (
                            <CircularProgress size={18} />
                          )}
                          <Typography
                            sx={{ textWrap: "nowrap" }}
                            align="right"
                            variant="body2"
                            color="neutral.600"
                          >
                            {t("Available Credit")}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            my: "2px",
                            mr: 2,
                            borderLeftWidth: 1,
                            border: "1px dashed #A2A0A8",
                          }}
                        />
                        <Box sx={{ mr: 2 }}>
                          {customerData ? (
                            <Typography align="right" variant="subtitle1">
                              {`${currency} ${toFixedNumber(
                                Number(customerData?.usedCredit)?.toFixed(2)
                              )}`}
                            </Typography>
                          ) : (
                            <CircularProgress size={18} />
                          )}
                          <Typography variant="body2" color="neutral.600">
                            {t("Credit Due")}
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
                  {creditData?.map((data: any) => {
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
                              setCreditAmount(getTotalAmount());
                            } else {
                              setCreditAmount("");
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
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
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

      <CreditOTPModal
        open={openCreditOTPModal}
        data={{
          ...customer,
          creditAmount: Number(creditAmount)?.toFixed(2),
        }}
        handleClose={() => setOpenCreditOTPModal(false)}
        handleCreditUsed={() => {
          setLoading(true);
          handleSubmit({
            providerName: "credit",
            cardType: "Credit",
            transactionNumber: "Credit",
            amount: Number(creditAmount),
          });
          setOpenCreditOTPModal(false);
          handleClose();
          setLoading(false);
          toast.success(t("Credit used successfully"));
        }}
      />
    </>
  );
};
