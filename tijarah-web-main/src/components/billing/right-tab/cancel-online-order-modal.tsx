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
  SvgIcon,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import generate from "bson-objectid";
import { FormikProps, useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { tijarahPaths } from "src/paths";
import cart from "src/utils/cart";
import * as Yup from "yup";

interface CancelOnlineModalProps {
  open: boolean;
  location: any;
  onlineOrderData: any;
  handleClose: any;
  handleSuccess: any;
}

type CancelOnlineProps = {
  openOrders: boolean;
  otherOrders: boolean;
};

export const CancelOnlineOrderModal: React.FC<CancelOnlineModalProps> = ({
  open = false,
  location,
  onlineOrderData,
  handleClose,
  handleSuccess,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { user, device, deviceLogout, userDeviceLogout } = useAuth();

  const startShiftData = JSON.parse(localStorage.getItem("openShiftDrawer"));

  const { find: findPrintTemplate, entities: printtemplates } =
    useEntity("print-template");

  const getValidationSchema = () => {
    return Yup.object().shape({});
  };

  const formik: FormikProps<CancelOnlineProps> = useFormik<CancelOnlineProps>({
    initialValues: {
      openOrders: false,
      otherOrders: false,
    },

    onSubmit: async (values) => {
      if (values.openOrders || values.otherOrders) {
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
        openingActual: undefined,
        openingExpected: undefined,
        closingActual: undefined,
        closingExpected: undefined,
        difference: undefined,
        totalSales: onlineOrderData.sales - onlineOrderData.refund,
        transactionType: "close",
        description: "Cash Drawer Close",
        shiftIn: false,
        dayEnd: true,
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

          const printTemplate = printtemplates.results?.[0];

          if (printTemplate?.resetCounterDaily) {
            localStorage.setItem("orderTokenCount", `1`);
          }

          const cashTxnData = {
            openingActual: Number(startShiftData?.openingActual),
            openingExpected: Number(startShiftData?.openingExpected),
            closingActual: 0,
            closingExpected: 0,
            difference: 0,
            shiftStarted: false,
            dayEnd: true,
            transactionType: "close",
            description: "Cash Drawer Close",
            shiftIn: startShiftData?.shiftIn || new Date(),
            shiftOut: new Date(),
          };

          localStorage.setItem("openShiftDrawer", JSON.stringify(cashTxnData));

          handleLogout();

          toast.success(t("Day Ended and Logout Successfully"));
        }
      } catch (error: any) {
        toast.error(error?.message);
      }
    },

    validationSchema: getValidationSchema(),
  });

  const handleLogout = async () => {
    const login = localStorage.getItem("login");

    handleSuccess();

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
    formik.resetForm();
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
            {t("Day End")}
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
              {t(
                "Please choose the order option(s) to cancel the orders within it before day end."
              )}
            </Typography>
          </Box>

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
                  mt: 2,
                  px: 2,
                  py: 1.5,
                  borderRadius: 3,
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
            <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
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
            <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
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
            <Box sx={{ mt: 2, display: "flex", flexDirection: "row" }}>
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
              formik.handleSubmit();
            }}
            sx={{ mb: 1 }}
            variant="contained"
            type="submit"
            loading={formik.isSubmitting}
          >
            {t("Day end and logout")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
