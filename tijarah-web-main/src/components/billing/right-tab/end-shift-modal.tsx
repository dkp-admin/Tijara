import { InfoTwoTone } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  MenuItem,
  SvgIcon,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import generate from "bson-objectid";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { tijarahPaths } from "src/paths";
import useScanStore from "src/store/scan-store";
import cart from "src/utils/cart";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";
import * as Yup from "yup";

interface EndShiftModalProps {
  open: boolean;
  location: any;
  shiftEnd: boolean;
  defaultCash: number;
  onlineOrderData: any;
  handleClose: any;
}

type EndShiftProps = {
  reason: string;
  isOther: boolean;
  otherReason: string;
  openOrders: boolean;
  otherOrders: boolean;
};

const positiveReasonOptions = [
  { label: "Cash added by the owner", value: "Cash added by the owner" },
  { label: "Other", value: "Other" },
];

const negativeReasonOptions = [
  { label: "Purchase Expenses", value: "Purchase Expenses" },
  {
    label: "Cashier used cash as petty cash",
    value: "Cashier used cash as petty cash",
  },
  { label: "Other", value: "Other" },
];

export const EndShiftModal: React.FC<EndShiftModalProps> = ({
  open = false,
  location,
  shiftEnd = true,
  defaultCash = 0,
  onlineOrderData,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { setScan } = useScanStore();
  const { user, device, deviceLogout, userDeviceLogout } = useAuth();

  const [amount, setAmount] = useState<number>(-1);
  const [difference, setDifference] = useState(0);
  const [expectedCash, setExpectedCash] = useState(0);
  const currency = useCurrency();

  const startShiftData = JSON.parse(localStorage.getItem("openShiftDrawer"));

  const { find: findPrintTemplate, entities: printtemplates } =
    useEntity("print-template");

  const getValidationSchema = () => {
    return Yup.object().shape({
      reason:
        difference !== 0
          ? Yup.string().required(t("Please Select Reason")).nullable()
          : Yup.object().nullable(),
      otherReason: Yup.string()
        .when("isOther", {
          is: true,
          then: Yup.string().required(t("Other reason is required")),
          otherwise: Yup.string().optional(),
        })
        .nullable(),
    });
  };

  const formik: FormikProps<EndShiftProps> = useFormik<EndShiftProps>({
    initialValues: {
      reason: "",
      isOther: false,
      otherReason: "",
      openOrders: false,
      otherOrders: false,
    },

    onSubmit: async (values) => {
      if (!shiftEnd && (values.openOrders || values.otherOrders)) {
        const openOrderIds = onlineOrderData?.openOrders?.map((order: any) => {
          return order._id;
        });

        const otherOrderIds = onlineOrderData?.otherOrders?.map(
          (order: any) => {
            return order._id;
          }
        );

        const dataObj =
          values.openOrders && values.otherOrders
            ? [...openOrderIds, ...otherOrderIds]
            : values.openOrders
            ? openOrderIds
            : otherOrderIds;

        await serviceCaller("/ordering/cancel", {
          method: "POST",
          body: { refs: dataObj },
        });
      }

      const objectId = generate();

      const cashDrawerData: any = {
        _id: objectId.toString(),
        userRef: user._id,
        user: { name: user.name },
        location: { name: location?.name?.en },
        locationRef: location?._id,
        company: { name: location?.company?.name?.en },
        companyRef: location?.companyRef,
        openingActual: startShiftData?.openingActual,
        openingExpected: startShiftData?.openingExpected,
        closingActual: Number(amount),
        closingExpected: expectedCash,
        difference: difference,
        totalSales: onlineOrderData.sales - onlineOrderData.refund,
        transactionType: "close",
        description:
          values.reason === "Other" ? values.otherReason : values.reason,
        shiftIn: false,
        dayEnd: !shiftEnd,
        started: startShiftData?.shiftIn || new Date(),
        ended: new Date(),
        source: "local",
      };

      const id = generate();

      const pendingOperations = [
        {
          id: 1,
          requestId: id.toString(),
          data: JSON.stringify({
            insertOne: {
              document: {
                ...cashDrawerData,
              },
            },
          }),
          tableName: "cash-drawer-txns",
          action: "INSERT",
          timestamp: new Date().toISOString(),
          status: "pending",
        },
      ];

      try {
        const res = await serviceCaller("/push/cash-drawer-txn", {
          method: "POST",
          body: {
            requestId: id.toString(),
            operations: pendingOperations,
          },
        });

        if (res?.message === "accepted") {
          // if (onlineOrderData?.sales > 0 || onlineOrderData.refund > 0) {
          //   const dataObj = {
          //     name: { en: "Shift end sales", ar: "Shift end sales" },
          //     date: new Date()?.toISOString(),
          //     reason: "sales",
          //     companyRef: location?.companyRef,
          //     company: { name: location?.company?.name?.en },
          //     locationRef: location?._id,
          //     location: { name: location?.name?.en },
          //     transactionType: "credit",
          //     userRef: user._id,
          //     user: {
          //       name: user.name,
          //       type: user.userType,
          //     },
          //     deviceRef: device.deviceRef,
          //     device: { deviceCode: device.phone },
          //     referenceNumber: "",
          //     fileUrl: [] as any,
          //     transactions: [
          //       {
          //         paymentMethod: "all",
          //         amount: onlineOrderData.sales - onlineOrderData.refund,
          //       },
          //     ],
          //     description: "",
          //     paymentDate: new Date()?.toISOString(),
          //     status: "received",
          //   };

          //   try {
          //     await serviceCaller("/accounting", {
          //       method: "POST",
          //       body: { ...dataObj },
          //     });
          //   } catch (err: any) {
          //     console.log(err);
          //   }
          // }

          if (!shiftEnd) {
            const printTemplate = printtemplates.results?.[0];

            if (printTemplate?.resetCounterDaily) {
              localStorage.setItem("orderTokenCount", `1`);
            }
          }

          const cashTxnData = {
            openingActual: Number(startShiftData?.openingActual),
            openingExpected: Number(startShiftData?.openingExpected),
            closingActual: Number(amount),
            closingExpected: Number(expectedCash),
            difference: difference,
            shiftStarted: false,
            dayEnd: !shiftEnd,
            transactionType: "close",
            description: "Cash Drawer Close",
            shiftIn: startShiftData?.shiftIn || new Date(),
            shiftOut: new Date(),
          };

          localStorage.setItem("openShiftDrawer", JSON.stringify(cashTxnData));
          localStorage.setItem("cashDrawer", "open");

          handleLogout();

          toast.success(
            shiftEnd
              ? t("Shift Ended and Logout Successfully")
              : t("Day Ended and Logout Successfully")
          );
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    },

    validationSchema: getValidationSchema(),
  });

  const handleLogout = async () => {
    const login = localStorage.getItem("login");

    setAmount(-1);
    setDifference(0);
    setExpectedCash(0);
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

  const updatedExpectedAmount = async () => {
    let totalAmount = 0;
    let salesAmount = 0;
    let refundedAmount = 0;

    const startDate = new Date(startShiftData?.shiftIn);
    const endDate = new Date();

    if (Number(startShiftData?.openingActual) >= 0) {
      totalAmount = Number(startShiftData.openingActual);
    } else {
      totalAmount = defaultCash;
    }

    if (open) {
      let orderPage = 0;
      let orderLength = 0;
      let orderTotalCount = 0;
      const orders: any[] = [];

      do {
        const data = await serviceCaller("/order", {
          method: "GET",
          query: {
            page: 0,
            sort: "desc",
            activeTab: "all",
            limit: 100,
            _q: "",
            companyRef: location?.companyRef,
            locationRef: location?._id,
            deviceRef: device?.deviceRef,
            paymentMethod: "cash",
            dateRange: {
              from: startDate?.toISOString(),
              to: endDate?.toISOString(),
            },
          },
        });

        if (data?.results?.length > 0) {
          orderPage = orderPage + 1;
          orderTotalCount = data?.total || 0;
          orderLength += data?.results?.length;
          orders.push(...orders, ...data?.results);
        } else {
          break;
        }
      } while (orderLength < orderTotalCount);

      let onlinePage = 0;
      let onlineLength = 0;
      let onlineTotalCount = 0;
      const onlineOrders: any[] = [];

      do {
        const data = await serviceCaller("/order", {
          method: "GET",
          query: {
            page: 0,
            sort: "desc",
            activeTab: "all",
            limit: 100,
            _q: "",
            companyRef: location?.companyRef,
            locationRef: location?._id,
            deviceRef: device?.deviceRef,
            paymentMethod: "cash",
            acceptedAt: {
              from: startDate?.toISOString(),
              to: endDate?.toISOString(),
            },
          },
        });

        if (data?.results?.length > 0) {
          onlinePage = onlinePage + 1;
          onlineTotalCount = data?.total || 0;
          onlineLength += data?.results?.length;
          onlineOrders.push(...onlineOrders, ...data?.results);
        } else {
          break;
        }
      } while (onlineLength < onlineTotalCount);

      let refundPage = 0;
      let refundLength = 0;
      let refundTotalCount = 0;
      const refundData: any[] = [];

      do {
        const data = await serviceCaller("/order", {
          method: "GET",
          query: {
            page: 0,
            sort: "desc",
            activeTab: "all",
            limit: 100,
            _q: "",
            companyRef: location?.companyRef,
            locationRef: location?._id,
            deviceRef: device?.deviceRef,
            paymentType: "refund",
            dateRange: {
              from: startDate?.toISOString(),
              to: endDate?.toISOString(),
            },
          },
        });

        if (data?.results?.length > 0) {
          refundPage = refundPage + 1;
          refundTotalCount = data?.total || 0;
          refundLength += data?.results?.length;
          refundData.push(...refundData, ...data?.results);
        } else {
          break;
        }
      } while (refundLength < refundTotalCount);

      let expensePage = 0;
      let expenseLength = 0;
      let expenseTotalCount = 0;
      const expenses: any[] = [];

      do {
        const data = await serviceCaller("/accounting", {
          method: "GET",
          query: {
            _q: "",
            page: 0,
            limit: 100,
            sort: "desc",
            activeTab: "paid",
            userRef: user._id,
            paymentMethod: "cash",
            transactionType: "debit",
            locationRef: location?._id,
            deviceRef: device.deviceRef,
            companyRef: location?.companyRef,
            paymentDate: {
              from: startDate?.toISOString(),
              to: endDate?.toISOString(),
            },
          },
        });

        if (data?.results?.length > 0) {
          expensePage = expensePage + 1;
          expenseTotalCount = data?.total || 0;
          expenseLength += data?.results?.length;
          refundData.push(...refundData, ...data?.results);
        } else {
          break;
        }
      } while (expenseLength < expenseTotalCount);

      if (orders?.length > 0) {
        salesAmount +=
          orders?.reduce((amount: number, order: any) => {
            return amount + calculateCashTotal(order.payment.breakup);
          }, 0) || 0;
      }

      if (onlineOrders?.length > 0) {
        salesAmount +=
          onlineOrders?.reduce((amount: number, order: any) => {
            return amount + calculateCashTotal(order.payment.breakup);
          }, 0) || 0;
      }

      if (refundData?.length > 0) {
        refundedAmount +=
          refundData?.reduce((amount: number, order: any) => {
            return amount + calculateRefundTotal(order.refunds[0].refundedTo);
          }, 0) || 0;
      }

      if (expenses?.length > 0) {
        totalAmount -=
          expenses?.reduce((amount: number, expense: any) => {
            return amount + calculateExpenseCashTotal(expense.transactions);
          }, 0) || 0;
      }
    }

    setExpectedCash(totalAmount + salesAmount - refundedAmount);
  };

  function calculateCashTotal(breakup: any): number {
    return breakup.reduce((total: number, payment: any) => {
      if (payment.providerName === "cash") {
        const change = Math.max(payment.change || 0, 0);
        return total + Number(payment.total) - change || 0;
      }
      return total;
    }, 0);
  }

  function calculateRefundTotal(refunds: any): number {
    return refunds.reduce((total: number, refund: any) => {
      if (refund.refundedTo === "cash") {
        return total + Number(refund.amount || 0);
      }
      return total;
    }, 0);
  }

  function calculateExpenseCashTotal(payments: any): number {
    return payments.reduce((total: number, payment: any) => {
      if (payment.paymentMethod === "cash") {
        return total + Number(payment.amount || 0);
      }
      return total;
    }, 0);
  }

  const getOpenOrderNumber = () => {
    const orderNum = onlineOrderData?.openOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  const getOtherOrderNumber = () => {
    const orderNum = onlineOrderData?.otherOrders
      ?.map((order: any) => order.orderNum)
      ?.join(", ");

    return orderNum;
  };

  useEffect(() => {
    const diff = amount - expectedCash;
    setDifference(diff);
  }, [amount, expectedCash]);

  useEffect(() => {
    if (formik.values.reason === "Other") {
      formik.setFieldValue("isOther", true);
    } else {
      formik.setFieldValue("isOther", false);
    }
  }, [formik.values.reason]);

  useEffect(() => {
    setAmount(-1);
    formik.resetForm();
    updatedExpectedAmount();
  }, [open]);

  useEffect(() => {
    if (device?.locationRef) {
      findPrintTemplate({
        page: 0,
        sort: "asc",
        activeTab: "all",
        limit: 10,
        locationRef: device.locationRef,
      });
    }
  }, [open, device]);

  return (
    <Box>
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
            {shiftEnd ? t("End Shift - Close cash drawer") : t("Day End")}
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
        <DialogContent>
          <Box>
            <Typography sx={{ fontSize: 14 }} variant="body2">
              {`${t("Available as per system")}.`}
            </Typography>

            <Typography variant="subtitle1" sx={{ mt: 0.5, fontSize: 20 }}>
              {`${currency} ${toFixedNumber(expectedCash || 0.0)}`}
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
              label={t(`Actual Cash Available (in ${currency})`)}
              name="actualCash"
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onChange={(e: any) => {
                const val = e.target.value;
                const regex = /^[0-9]*(\.[0-9]{0,2})?$/;

                if (val?.length < 10 && (val === "" || regex.test(val))) {
                  const newCount = val === "" || val === "0" ? "1" : val;

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
                  color={difference >= 0 ? "primary" : "error"}
                >
                  {`${currency} ${difference > 0 ? "+" : ""}${toFixedNumber(
                    difference || 0.0
                  )}`}
                </Typography>
              </Box>
            )}

            {amount !== -1 && (
              <Box>
                <TextField
                  sx={{ mt: 3 }}
                  error={!!(formik.touched.reason && formik.errors.reason)}
                  helperText={
                    (formik.touched.reason && formik.errors.reason) as any
                  }
                  fullWidth
                  required={difference !== 0}
                  label={t("Reason")}
                  name="reason"
                  onChange={formik.handleChange}
                  onFocus={() => setScan(true)}
                  onBlur={() => {
                    formik.handleBlur("reason");
                    setScan(false);
                  }}
                  select
                  value={formik.values.reason}
                >
                  {(difference > 0
                    ? positiveReasonOptions
                    : negativeReasonOptions
                  ).map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>

                {formik.values.reason === "Other" && (
                  <TextField
                    sx={{ mt: 3 }}
                    fullWidth
                    required
                    label={t("Enter the reason")}
                    name="otherReason"
                    error={Boolean(
                      formik.touched.otherReason && formik.errors.otherReason
                    )}
                    helperText={
                      (formik.touched.otherReason &&
                        formik.errors.otherReason) as any
                    }
                    onFocus={() => setScan(true)}
                    onBlur={() => {
                      formik.handleBlur("otherReason");
                      setScan(false);
                    }}
                    onChange={(e) => {
                      formik.handleChange(e);
                    }}
                    value={formik.values.otherReason}
                  />
                )}
              </Box>
            )}

            {(onlineOrderData?.openOrders?.length > 0 ||
              onlineOrderData?.otherOrders?.length > 0) && (
              <Box sx={{ mt: 3, display: "flex", flexDirection: "row" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoTone color="primary" />
                </SvgIcon>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    pl: 0.7,
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t(
                    "Please choose the order option(s) to cancel the orders within it before day end."
                  )}
                </Typography>
              </Box>
            )}

            {onlineOrderData?.openOrders?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  label={t("Open Orders: All the open orders are listed here")}
                  value={formik.values.openOrders}
                  control={
                    <Checkbox
                      checked={formik.values.openOrders}
                      onChange={(e) => {
                        formik.handleChange("openOrders")(e);
                      }}
                    />
                  }
                />

                <Box
                  sx={{
                    mt: 1,
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    background: theme.palette.neutral[50],
                  }}
                >
                  <Typography fontSize="16px" variant="subtitle1">
                    {getOpenOrderNumber()}
                  </Typography>
                </Box>
              </Box>
            )}

            {onlineOrderData?.otherOrders?.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  label={t(
                    "Ongoing Orders: All the ongoing orders are listed here"
                  )}
                  value={formik.values.otherOrders}
                  control={
                    <Checkbox
                      checked={formik.values.otherOrders}
                      onChange={(e) => {
                        formik.handleChange("otherOrders")(e);
                      }}
                    />
                  }
                />

                <Box
                  sx={{
                    mt: 1,
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    background: theme.palette.neutral[50],
                  }}
                >
                  <Typography fontSize="16px" variant="subtitle1">
                    {getOtherOrderNumber()}
                  </Typography>
                </Box>
              </Box>
            )}

            {formik.values.openOrders && formik.values.otherOrders ? (
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoTone color="primary" />
                </SvgIcon>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    pl: 0.7,
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("All the open & ongoing orders would be cancelled")}
                </Typography>
              </Box>
            ) : formik.values.openOrders ? (
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoTone color="primary" />
                </SvgIcon>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    pl: 0.7,
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("All the open orders would be cancelled")}
                </Typography>
              </Box>
            ) : formik.values.otherOrders ? (
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                <SvgIcon fontSize="small">
                  <InfoTwoTone color="primary" />
                </SvgIcon>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{
                    pl: 0.7,
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {t("Note: ")}
                </Typography>

                <Typography
                  variant="body2"
                  color="gray"
                  sx={{ fontSize: "13px", pl: 0.5 }}
                >
                  {t("All the ongoing orders would be cancelled")}
                </Typography>
              </Box>
            ) : (
              <></>
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
            onClick={() => {
              if (amount == -1) {
                toast.error(t("Please enter actual cash available"));
              } else {
                formik.handleSubmit();
              }
            }}
            sx={{ mb: 1 }}
            variant="contained"
            type="submit"
            loading={formik.isSubmitting}
          >
            {shiftEnd ? t("End Shift and logout") : t("Day end and logout")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
