import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Checkbox,
  Divider,
  MenuItem,
  Modal,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import InfoCircle from "@untitled-ui/icons-react/build/esm/InfoCircle";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import generateOrderNumber from "src/utils/generate-unique-order-code";
import { getItemVAT } from "src/utils/get-price";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";
// import { updateProductRefundRestock } from "../billing/right-tab/update-product-restock";

interface IssueRefundModalProps {
  open: boolean;
  data: any;
  handleClose: () => void;
  handleIssueRefund: () => void;
}

let refundThroughOptions = [
  { label: "Cash", value: "cash" },
  { label: "Original", value: "original" },
];

const refundThroughWalletWithCustomer = [
  { label: "Cash", value: "cash" },
  { label: "Wallet", value: "wallet" },
  { label: "Original", value: "original" },
];

const refundThroughCreditWithCustomer = [
  { label: "Cash", value: "cash" },
  { label: "Credit", value: "credit" },
  { label: "Original", value: "original" },
];

const refundThroughOptionsWithCustomer = [
  { label: "Cash", value: "cash" },
  { label: "Wallet", value: "wallet" },
  { label: "Credit", value: "credit" },
  { label: "Original", value: "original" },
];

const reasonOptions = [
  { label: "Goods returned", value: "goodsReturned" },
  { label: "Accidental charge", value: "accidentalCharge" },
  { label: "Cancelled order", value: "cancelledOrder" },
  { label: "Other", value: "other" },
];

const refundName: any = {
  cash: "Cash",
  wallet: "Wallet",
  credit: "Credit",
  original: "Original",
};

const reasonName: any = {
  goodsReturned: "Goods returned",
  accidentalCharge: "Accidental charge",
  cancelledOrder: "Cancelled order",
  other: "Other",
};

const RefundReasonModal: React.FC<IssueRefundModalProps> = ({
  open,
  data,
  handleClose,
  handleIssueRefund,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { findOne: findOneLocation, entity } = useEntity("location");

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";
  const currency = useCurrency();

  const { findOne: findCompany, entity: company } = useEntity("company");
  const {
    findOne,
    entity: customer,
    updateEntity: updateCustomer,
  } = useEntity("customer");

  const [refunds, setRefunds] = useState([
    { index: -1, amount: 0, maxAmount: 0 },
  ]);

  const [charges, setCharges] = useState<any[]>([]);
  const [refundThrough, setRefundThrough] = useState("");
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [loading, setLoading] = useState(false);

  const isNearpay =
    data?.order?.payment?.breakup?.findIndex(
      (t: any) => t.providerName === "nearpay"
    ) !== -1;

  if (isNearpay) {
    refundThroughOptions = [{ label: "Cash", value: "cash" }];
  }

  usePageView();

  const updateChargeCheckbox = (chargeData: any, val: boolean) => {
    let maxAmount = 0;

    const chargesData = charges.map((charge: any) => {
      if (charge.chargeId == chargeData.chargeId) {
        maxAmount = Number(charge.total?.toFixed(2));

        return {
          ...charge,
          selected: val,
          amount: val ? charge.total?.toFixed(2) : -1,
        };
      } else {
        return charge;
      }
    });

    if (refunds?.length > 1) {
      const refundData: any = refunds.map((refund: any, index: number) => {
        if (index === 0) {
          return {
            index: 0,
            amount: -1,
            maxAmount: Number(refund.maxAmount) + maxAmount,
          };
        } else {
          return refund;
        }
      });

      setRefunds(refundData);
    }

    setCharges(chargesData);
  };

  const updateChargeAmount = (chargeData: any, enterAmount: any) => {
    let amount = 0;
    const maxAmount = Number(chargeData.total);

    if (enterAmount && maxAmount >= Number(enterAmount)) {
      amount = enterAmount;
    } else if (maxAmount < Number(enterAmount)) {
      amount = Number(maxAmount?.toFixed(2));
    } else {
      amount = -1;
    }

    const chargesData = charges.map((charge: any) => {
      if (charge.chargeId == chargeData.chargeId) {
        return { ...charge, amount };
      } else {
        return charge;
      }
    });

    if (refunds?.length > 1) {
      const refundData: any = refunds.map((refund: any, index: number) => {
        if (index === 0) {
          return {
            index: 0,
            amount: -1,
            maxAmount: Number(refund.maxAmount) + maxAmount,
          };
        } else {
          return refund;
        }
      });

      setRefunds(refundData);
    }

    setCharges(chargesData);
  };

  const updateRefundAmount = (enterAmount: any, idx: number) => {
    let amount = 0;
    const maxAmount = refunds[idx].maxAmount;

    amount = enterAmount;

    const refundData: any = refunds.map((refund: any) => {
      if (refund.index == idx) {
        return { index: idx, amount, maxAmount };
      } else {
        return refund;
      }
    });

    setRefunds(refundData);
  };

  const totalRefundedAmount = useMemo(() => {
    if (charges?.length > 0) {
      const amount = charges?.reduce((total: number, charge: any) => {
        if (charge?.amount > 0) {
          return total + Number(charge.amount || 0);
        }
        return total;
      }, 0);

      return (Number(data.amount) + amount)?.toFixed(2);
    }

    return Number(data.amount)?.toFixed(2);
  }, [charges]);

  const remainingBalance = useMemo(() => {
    if (refunds?.length > 0) {
      if (refundThrough === "original") {
        let amount = 0;

        refunds.forEach((refund: any) => {
          if (refund?.amount > 0) {
            amount += Number(refund.amount);
          }
        });

        return Number(totalRefundedAmount) - amount;
      } else {
        return 0;
      }
    }

    return 0;
  }, [refunds]);

  const onIssueRefund = async () => {
    const length = data.order.payment.breakup.length;

    if (refundThrough === "") {
      toast.error(t("Please Select Refund Through"));
      return;
    }

    if (length > 1 && remainingBalance !== 0) {
      toast.error(
        `${t(
          "Refund amount should be equal to"
        )} ${currency} ${totalRefundedAmount}`
      );
      return;
    }

    if (reason === "") {
      toast.error(t("Please Select Refund Reason"));
      return;
    }

    if (reason === "other" && otherReason === "") {
      toast.error(t("Other Reason is required"));
      return;
    }

    setLoading(true);

    let chargesVAT = 0;
    let chargesTotal = 0;

    const selectedItems = data.selectedItems.filter(
      (item: any) => item.selected
    );

    const chargesList: any[] = [];

    charges?.forEach((data: any) => {
      if (data.selected && Number(data.amount) > 0) {
        const vat =
          Number(data.total) === Number(data.amount)
            ? Number(data.vat)
            : getItemVAT(Number(data.amount), Number(company.vat.percentage));

        chargesVAT += vat;
        chargesTotal += Number(data.amount);

        chargesList.push({
          chargeId: data.chargeId,
          name: { en: data.name.en, ar: data.name.ar },
          totalCharge: Number(Number(data.amount)?.toFixed(2)),
          totalVatOnCharge: vat,
        });
      }
    });

    const itemList = selectedItems.map((items: any) => {
      return {
        _id: items.productRef,
        categoryRef: items.categoryRef,
        name: { en: items.nameEn, ar: items.nameAr },
        category: { name: items?.category?.name || "" },
        amount: Number(items.amount),
        vat: Number(items.vat),
        discountAmount: Number(items.discountAmount),
        discountPercentage: Number(items.discountPercentage),
        qty: items.qty,
        unit: items.unit,
        isOpenItem: items.isOpenItem,
        sku: items.sku,
        parentSku: items.parentSku,
        boxSku: items.boxSku,
        crateSku: items.crateSku,
        boxRef: items.boxRef,
        crateRef: items.crateRef,
        hasMultipleVariants: items.hasMultipleVariants,
        modifiers: items?.modifiers || [],
      };
    });

    let refundedData: any[] = [];

    if (refundThrough === "original") {
      data.order.payment.breakup.map((breakup: any, index: number) => {
        if (refunds[index].amount > 0) {
          refundedData.push({
            refundTo: breakup.providerName,
            amount: refunds[index].amount,
          });
        }
      });
    } else {
      refundedData.push({
        refundTo: refundThrough,
        amount: Number(data.amount) + chargesTotal,
      });
    }

    const refundToList = refundedData.filter((list: any) => {
      return list !== undefined;
    });

    const refundToListBackend: any = refundToList.map((refundToList: any) => {
      return {
        refundedTo: refundToList.refundTo,
        amount: refundToList.amount,
      };
    });

    const cashRefund = refundToList?.some(
      (refund: any) => refund.refundTo === "cash"
    );

    try {
      const res = await serviceCaller(`/order/${data.order._id}/refund`, {
        method: "POST",
        body: {
          reason: reason == "other" ? otherReason : reasonName[reason],
          amount: Number(data.amount) + Number(chargesTotal),
          vat: Number(data.vat) + Number(chargesVAT),
          discountAmount: Number(data.discountAmount),
          vatWithoutDiscount: Number(data.vatWithoutDiscount),
          discountPercentage: Number(data.order.payment.discountPercentage),
          charges: chargesList || [],
          items: itemList,
          refundedTo: refundToListBackend,
          cashier: { name: user.name },
          cashierRef: user._id,
          date: new Date(),
          device: { deviceCode: data.order.device.deviceCode },
          deviceRef: data.order.deviceRef,
          referenceNumber: `R-${data.order.orderNum}`,
          source: "web",
        },
      });

      queryClient.invalidateQueries("find-order");
      queryClient.invalidateQueries("find-one-order");

      if (res) {
        if (data.order?.customerRef) {
          await updateCustomer(customer._id, {
            totalRefunded:
              Number(customer?.totalRefunded || 0) +
              Number(totalRefundedAmount || 0),
          });
        }

        if (data.restockItems?.length > 0) {
          await serviceCaller(`/order/${data.order._id}/restock`, {
            method: "POST",
            body: {
              items: data.restockItems.map((t: any) => t.productRef),
            },
          });
        }

        // if (cashRefund) {
        //   openKickDrawer();
        // }

        handleIssueRefund();
        toast.success(t("Refund issued for the order"));
      }
    } catch (error: any) {
      toast.error(t("Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const getRefundOptions = () => {
    if (
      data?.order?.customerRef &&
      company?.configuration?.enableLoyalty &&
      company?.credit?.enableCredit
    ) {
      return refundThroughOptionsWithCustomer;
    } else if (
      data?.order?.customerRef &&
      company?.configuration?.enableLoyalty
    ) {
      return refundThroughWalletWithCustomer;
    } else if (data?.order?.customerRef && company?.credit?.enableCredit) {
      return refundThroughCreditWithCustomer;
    } else {
      return refundThroughOptions;
    }
  };

  const validatePaymentMethods = (breakup: any, availableMethods: any) => {
    const breakupMethods = new Set(
      breakup.map((item: any) => item?.providerName?.toLowerCase())
    );
    const availableMethodValues = new Set(
      availableMethods.map((method: any) => method?.toLowerCase())
    );

    for (const method of breakupMethods) {
      if (!availableMethodValues.has(method)) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    if (open) {
      setLoading(false);
      setReason("");
      setOtherReason("");
      setRefundThrough("");
      findOneLocation(data?.order?.locationRef);

      let total = 0;
      const length = data?.order?.payment?.breakup?.length;

      const refunData = data?.order?.payment?.breakup?.map(
        (breakup: any, index: number) => {
          if (index == length - 1) {
            const maxAmount =
              data.amount > total
                ? data.amount - total
                : data.order.payment.total - total;

            return {
              index: index,
              amount: length == 1 ? maxAmount : -1,
              maxAmount: breakup.total,
            };
          } else {
            total += breakup.total;
            return { index: index, amount: -1, maxAmount: breakup.total };
          }
        }
      );

      const chargeData = data?.order?.payment?.charges?.map((charge: any) => {
        return {
          ...charge,
          selected: false,
          amount: -1,
        };
      });

      setRefunds(refunData);
      setCharges(chargeData || []);

      if (data.order?.customerRef) {
        findOne(data.order.customerRef);
      }

      if (data.order?.companyRef) {
        findCompany(data.order.companyRef);
      }
    }
  }, [open]);

  useEffect(() => {
    if (reason) {
      setOtherReason("");
    }
  }, [reason]);

  return (
    <Modal open={open} hideBackdrop>
      <Box>
        <Card
          sx={{
            visibility: "visible",
            scrollbarColor: "transparent",
            scrollBehavior: "auto",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "100vw",
              sm: "100vw",
              md: "70vw",
              lg: "50vw",
            },
            bgcolor: "background.paper",
            maxHeight: {
              xs: "100vh",
              sm: "100vh",
              md: "90vh",
              lg: "90vh",
            },
            borderRadius: {
              xs: "0px",
              sm: "0px",
              md: "20px",
              lg: "20px",
            },
            py: 2,
          }}
        >
          {/* header */}
          {/* <Box
            sx={{
              pl: 2.5,
              pr: 2.5,
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              flex: "0 0 auto",
              position: "fixed",
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
            }}>
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-evenly",
              }}>
              <XCircle
                fontSize="small"
                onClick={handleClose}
                style={{ cursor: "pointer" }}
              />

              <Box
                sx={{
                  flex: 1,
                  pl: {
                    xs: 11,
                    sm: 11,
                    md: 15,
                    lg: 15,
                  },
                }}>
                <Typography
                  variant="h6"
                  align="center"
                  sx={{
                    mr: {
                      xs: 1,
                      sm: 1,
                      md: 3,
                      lg: 3,
                    },
                  }}>
                  {`${t("Refunding")} SAR ${totalRefundedAmount}`}
                </Typography>
              </Box>
            </Box>
          </Box> */}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              mt: -2,

              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",

              borderRadius: "20px",
            }}
          >
            <Box
              style={{
                display: "flex",
              }}
            ></Box>

            <Typography variant="h6" sx={{ mr: 0 }}>
              {`${t("Refunding")} ${currency} ${totalRefundedAmount}`}
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
          {/* body */}
          <Box
            sx={{
              px: 3,
              pt: 3,
              pb: 3,
              height: {
                xs: "100vh",
                sm: "100vh",
                md: "73vh",
                lg: "75vh",
              },
              width: "100%",
              flex: "1 1 auto",
              overflow: "scroll",
              overflowX: "hidden",
            }}
          >
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                pb: 4,
                mb: 10,
              }}
            >
              <Typography variant="subtitle1" color="neutral.600">
                {`#${data.order?.orderNum}`}
              </Typography>

              {charges?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      mt: 3,
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ pb: 0.6 }} variant="h6">
                      {t("Custom Charges")}
                    </Typography>

                    <Tooltip
                      sx={{ ml: 1 }}
                      title={t("info_msg_refund_charges")}
                    >
                      <SvgIcon color="primary">
                        <InfoCircle />
                      </SvgIcon>
                    </Tooltip>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    {charges.map((charge: any) => {
                      return (
                        <Box key={charge.chargeId}>
                          <Card key={charge.chargeId}>
                            <Box
                              sx={{
                                py: 2,
                                display: "flex",
                                justifyContent: "space-around",
                                flexDirection: "row",
                              }}
                            >
                              <Box sx={{ ml: 2.5, flex: 1 }}>
                                <Typography variant="subtitle1">
                                  {isRTL ? charge.name.ar : charge.name.en}
                                </Typography>
                              </Box>

                              <Box
                                sx={{
                                  mr: 2.5,
                                  flex: 1,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Typography
                                  align="right"
                                  variant="subtitle1"
                                  color="neutral.500"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {t("Refund")}
                                </Typography>

                                <Checkbox
                                  sx={{ py: 0 }}
                                  checked={charge.selected}
                                  onChange={(e) => {
                                    updateChargeCheckbox(
                                      charge,
                                      !charge.selected
                                    );
                                  }}
                                />
                              </Box>
                            </Box>

                            <Divider />

                            <Box
                              sx={{
                                py: 2,
                                display: "flex",
                                justifyContent: "space-around",
                                flexDirection: "row",
                              }}
                            >
                              <Box sx={{ ml: 2.5, flex: 1 }}>
                                <Typography variant="subtitle1">
                                  {t("Amount")}
                                </Typography>
                              </Box>

                              <TextField
                                sx={{
                                  mx: 2.5,
                                  width: "150px",
                                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                    {
                                      display: "none",
                                    },
                                  "& input[type=number]": {
                                    MozAppearance: "textfield",
                                  },
                                }}
                                variant="standard"
                                type="number"
                                fullWidth
                                placeholder={t("Enter Amount")}
                                name="amount"
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
                                onChange={(e) => {
                                  const val = e.target.value;

                                  if (
                                    val === "" ||
                                    /^[0-9]*(\.[0-9]{0,2})?$/.test(val)
                                  ) {
                                    updateChargeAmount(charge, val);
                                  }
                                }}
                                value={`${
                                  charge.amount > 0 ? charge.amount : ""
                                }`}
                                disabled={!charge.selected}
                              />
                            </Box>
                          </Card>

                          <Typography
                            sx={{ mt: 1, mb: 2, mr: 1, fontSize: 12 }}
                            variant="body2"
                            align="right"
                            color="neutral.600"
                          >
                            {`${t("Maximum of")} ${currency} ${toFixedNumber(
                              charge.total
                            )} ${t("can be issued by this charge")}`}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Typography sx={{ mt: 5, mb: 2 }} variant="h6">
                {t("Select Refund Reason")}
              </Typography>

              <TextField
                sx={{ mt: 2 }}
                fullWidth
                label={t("Refund Through")}
                placeholder={t("Select Refund Through")}
                name="refundThrough"
                onChange={async (e) => {
                  if (entity?.enableRefundModesRestriction) {
                    const availableMethods = entity?.refundModes
                      .filter((op: any) => op?.status)
                      ?.map((op: any) => op?.value);

                    // breakup chcek for original option

                    const result = validatePaymentMethods(
                      data.order.payment.breakup,
                      availableMethods
                    );

                    // non-original option (e.g cash, wallet etc)

                    const otherPaymentMethodCheck = availableMethods?.includes(
                      e.target?.value?.toLowerCase()
                    );

                    if (e.target?.value === "original" && !result) {
                      toast.error(
                        t("Please select some other payment method for refund")
                      );

                      setRefundThrough("");

                      return;
                    }

                    if (
                      e.target?.value !== "original" &&
                      !otherPaymentMethodCheck
                    ) {
                      toast.error(
                        t("Please select some other payment method for refund")
                      );

                      setRefundThrough("");

                      return;
                    }
                  }
                  setRefundThrough(e.target.value);
                }}
                select
                required
                value={refundThrough}
              >
                {getRefundOptions().map((option: any) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              {(refundThrough === "cash" ||
                refundThrough === "credit" ||
                refundThrough === "wallet") && (
                <Box sx={{ mt: 4 }}>
                  <Card>
                    <Box
                      sx={{
                        py: 2,
                        display: "flex",
                        justifyContent: "space-around",
                        flexDirection: "row",
                      }}
                    >
                      <Box sx={{ ml: 2.5, flex: 1 }}>
                        <Typography variant="subtitle1">
                          {t("Refund to")}
                        </Typography>
                      </Box>

                      <Box sx={{ mr: 2.5, flex: 1 }}>
                        <Typography
                          align="right"
                          variant="subtitle1"
                          color="neutral.600"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {refundThrough === "cash"
                            ? t("Cash")
                            : refundThrough === "credit"
                            ? t("Credit")
                            : refundThrough === "wallet"
                            ? t("Wallet")
                            : t(refundThrough)}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider />

                    <Box
                      sx={{
                        py: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-around",
                        flexDirection: "row",
                      }}
                    >
                      <Box sx={{ ml: 2.5, flex: 1 }}>
                        <Typography align="left" variant="subtitle1">
                          {t("Amount")}
                        </Typography>
                      </Box>

                      <Box sx={{ mr: 2.5, flex: 1 }}>
                        <Typography
                          align="right"
                          variant="subtitle1"
                          color="neutral.600"
                        >
                          {`${currency} ${totalRefundedAmount}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  <Typography
                    sx={{ mt: 1, mb: 2, mr: 1, fontSize: 12 }}
                    variant="body2"
                    align="right"
                    color="neutral.600"
                  >
                    {`${t("Maximum of")} ${currency} ${totalRefundedAmount} ${t(
                      "can be issued by this payment method"
                    )}`}
                  </Typography>
                </Box>
              )}

              {refundThrough === "original" && (
                <Box sx={{ mt: 4 }}>
                  {data.order.payment.breakup.map(
                    (breakup: any, index: number) => {
                      return (
                        <Box key={index}>
                          <Card key={index}>
                            <Box
                              sx={{
                                py: 2,
                                display: "flex",
                                justifyContent: "space-around",
                                flexDirection: "row",
                              }}
                            >
                              <Box sx={{ ml: 2.5, flex: 1 }}>
                                <Typography variant="subtitle1">
                                  {t("Refund to")}
                                </Typography>
                              </Box>

                              <Box sx={{ mr: 2.5, flex: 1 }}>
                                <Typography
                                  align="right"
                                  variant="subtitle1"
                                  color="neutral.600"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {breakup.providerName === "cash"
                                    ? t("Cash")
                                    : breakup.providerName === "card"
                                    ? t("Card")
                                    : breakup.providerName === "credit"
                                    ? t("Credit")
                                    : breakup.providerName === "wallet"
                                    ? t("Wallet")
                                    : t(breakup.name)}
                                </Typography>
                              </Box>
                            </Box>

                            <Divider />

                            {data.order.payment.breakup.length === 1 ? (
                              <Box
                                sx={{
                                  py: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-around",
                                  flexDirection: "row",
                                }}
                              >
                                <Box sx={{ ml: 2.5, flex: 1 }}>
                                  <Typography align="left" variant="subtitle1">
                                    {t("Amount")}
                                  </Typography>
                                </Box>

                                <Box sx={{ mr: 2.5, flex: 1 }}>
                                  <Typography
                                    align="right"
                                    variant="subtitle1"
                                    color="neutral.600"
                                  >
                                    {`${currency} ${totalRefundedAmount}`}
                                  </Typography>
                                </Box>
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  py: 2,
                                  display: "flex",
                                  justifyContent: "space-around",
                                  flexDirection: "row",
                                }}
                              >
                                <Box sx={{ ml: 2.5, flex: 1 }}>
                                  <Typography variant="subtitle1">
                                    {t("Amount")}
                                  </Typography>
                                </Box>

                                <TextField
                                  sx={{
                                    mx: 2.5,
                                    width: "150px",
                                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                      {
                                        display: "none",
                                      },
                                    "& input[type=number]": {
                                      MozAppearance: "textfield",
                                    },
                                  }}
                                  variant="standard"
                                  type="number"
                                  fullWidth
                                  placeholder={t("Enter Amount")}
                                  name="amount"
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
                                  onChange={(e) => {
                                    updateRefundAmount(e.target.value, index);
                                  }}
                                  value={`${
                                    refunds[index]?.amount > 0
                                      ? refunds[index].amount
                                      : ""
                                  }`}
                                  onKeyPress={(event): void => {
                                    const ascii = event.charCode;
                                    const value = (
                                      event.target as HTMLInputElement
                                    ).value;
                                    const decimalCheck =
                                      value.indexOf(".") !== -1;

                                    if (decimalCheck) {
                                      const decimalSplit = value.split(".");
                                      const decimalLength =
                                        decimalSplit[1].length;

                                      if (decimalLength > 1 || ascii === 46) {
                                        event.preventDefault();
                                      } else if (ascii < 48 || ascii > 57) {
                                        event.preventDefault();
                                      }
                                    } else if (
                                      value.length > 8 &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    } else if (
                                      (ascii < 48 || ascii > 57) &&
                                      ascii !== 46
                                    ) {
                                      event.preventDefault();
                                    }
                                  }}
                                />
                              </Box>
                            )}
                          </Card>

                          <Typography
                            sx={{ mt: 1, mb: 2, mr: 1, fontSize: 12 }}
                            variant="body2"
                            align="right"
                            color="neutral.600"
                          >
                            {`${t("Maximum of")} ${currency} ${toFixedNumber(
                              data?.order?.payment?.breakup?.length === 1
                                ? totalRefundedAmount
                                : Number(refunds[index]?.maxAmount)?.toFixed(2)
                            )} ${t("can be issued by this payment method")}`}
                          </Typography>
                        </Box>
                      );
                    }
                  )}
                </Box>
              )}

              {refundThrough && (
                <TextField
                  sx={{ mt: 2.5 }}
                  fullWidth
                  label={t("Reason for refund")}
                  placeholder={t("Select Reason")}
                  name="refundReason"
                  onChange={(e) => {
                    setReason(e.target.value);
                  }}
                  select
                  required
                  value={reason}
                >
                  {reasonOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {reason === "other" && (
                <TextField
                  sx={{ mt: 3 }}
                  fullWidth
                  label={t("Enter the reason")}
                  name="otherReason"
                  onChange={(e) => {
                    setOtherReason(e.target.value);
                  }}
                  required
                  value={otherReason}
                />
              )}
            </Box>
          </Box>

          <Divider />

          {/* footer */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
              zIndex: 1,
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
              borderRadius: "5px",
            }}
          >
            <LoadingButton
              size="medium"
              variant="contained"
              type="submit"
              sx={{ borderRadius: 1 }}
              loading={loading}
              onClick={() => {
                onIssueRefund();
              }}
            >
              {t("Issue Refund")}
            </LoadingButton>
          </Box>
        </Card>
      </Box>
    </Modal>
  );
};

export default RefundReasonModal;
