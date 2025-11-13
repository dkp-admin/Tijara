import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import generate from "bson-objectid";
import { useRouter } from "next/router";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import serviceCaller from "src/api/serviceCaller";
import { BillingWalkIn } from "src/components/billing/right-tab/walk-in";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
import { DotsVertical } from "src/icons/dots-vertical";
import { tijarahPaths } from "src/paths";
import useCartStore from "src/store/cart-item";
import calculateCart from "src/utils/calculate-cart";
import cart from "src/utils/cart";
import ConfirmationDialog from "../confirmation-dialog";
import { CancelOnlineOrderModal } from "./right-tab/cancel-online-order-modal";
import { EndShiftModal } from "./right-tab/end-shift-modal";
import { StaffSelectionModal } from "./right-tab/staff-selection-modal";
import { CreateTicketModal } from "./ticket/create-ticket";
import { SavedTicketModal } from "./ticket/saved-ticket-modal";

interface BillingRightViewProps {
  handleBack: () => void;
  companyRef: string;
  company: any;
  location: any;
}

export const BillingRightView: FC<BillingRightViewProps> = (props) => {
  const { handleBack, companyRef, company, location } = props;

  const router = useRouter();
  const { items } = useItems();
  const { t } = useTranslation();
  const {
    setCustomer,
    setCustomerRef,
    staff,
    staffRef,
    setStaff,
    setStaffRef,
  } = useCartStore();
  const {
    user,
    device: deviceData,
    deviceLogout,
    userDeviceLogout,
  } = useAuth();
  const xsDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  usePageView();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [ticketData, setTicketData] = useState<any>(null);
  const [ticketIndex, setTicketIndex] = useState(null) as any;
  const [showDialogClearCart, setShowDialogClearCart] = useState(false);
  const [openSavedTicketModal, setOpenSavedTicketModal] = useState(false);
  const [openCreateTicketModal, setOpenCreateTicketModal] = useState(false);
  const [openStaffSelectionModal, setOpenStaffSelectionModal] = useState(false);
  const [openEndShift, setOpenEndShift] = useState(false);
  const [shiftEnd, setShiftEnd] = useState(true);
  const [openCancelOnline, setOpenCancelOnline] = useState(false);
  const [onlineOrderData, setOnlineOrderData] = useState<any>(null);
  const [showDialogEndShift, setShowDialogEndShift] = useState(false);

  const { findOne: findDevice, entity: device } = useEntity("device");

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const checkUpdateCashDrawer = async (shiftEnd: boolean) => {
    let openOrders: any[] = [];
    let otherOrders: any[] = [];

    if (!shiftEnd) {
      let page = 0;
      let length = 0;
      let totalCount = 0;

      do {
        try {
          const onlineOrders = await serviceCaller("/ordering/order", {
            method: "GET",
            query: {
              _q: "",
              page: page,
              limit: 100,
              sort: "asc",
              activeTab: "all",
              companyRef: device.companyRef,
              locationRef: device.locationRef,
            },
          });

          if (onlineOrders?.results?.length > 0) {
            page = page + 1;
            totalCount = onlineOrders?.total || 0;
            length += onlineOrders?.results?.length;

            const open = onlineOrders?.results?.filter(
              (order: any) => order.orderStatus === "open"
            );

            const other = onlineOrders?.results?.filter(
              (order: any) =>
                order.orderStatus !== "open" && order.deviceRef === device._id
            );

            openOrders.push(...openOrders, ...open);
            otherOrders.push(...otherOrders, ...other);
          } else {
            break;
          }
        } catch (error) {
          console.log("error", error);
        }
      } while (length < totalCount);
    }

    let salesAmount = 0;
    let refundedAmount = 0;

    const startShiftData = JSON.parse(localStorage.getItem("openShiftDrawer"));

    if (startShiftData) {
      const startDate = new Date(startShiftData?.shiftIn);
      const endDate = new Date();

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
          orders.push(
            ...orders,
            ...data?.results?.filter(
              (result: any) => !result.qrOrdering && !result.onlineOrdering
            )
          );
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

      if (orders?.length > 0) {
        salesAmount +=
          orders?.reduce((amount: number, order: any) => {
            return amount + calculatePaymentTotal(order.payment.breakup);
          }, 0) || 0;
      }

      if (onlineOrders?.length > 0) {
        salesAmount +=
          onlineOrders?.reduce((amount: number, order: any) => {
            return amount + calculatePaymentTotal(order.payment.breakup);
          }, 0) || 0;
      }

      if (refundData?.length > 0) {
        refundedAmount +=
          refundData?.reduce((amount: number, order: any) => {
            return amount + calculateRefundTotal(order.refunds[0].refundedTo);
          }, 0) || 0;
      }
    }

    if (device?.configuration?.cashManagement) {
      handleMenuClose();
      setOnlineOrderData({
        sales: salesAmount,
        refund: refundedAmount,
        openOrders: openOrders,
        otherOrders: otherOrders,
      });
      setOpenEndShift(true);
    } else {
      if (openOrders?.length > 0 || otherOrders?.length > 0) {
        handleMenuClose();
        setOnlineOrderData({
          sales: salesAmount,
          refund: refundedAmount,
          openOrders: openOrders,
          otherOrders: otherOrders,
        });
        setOpenCancelOnline(true);
      } else {
        const objectId = generate();

        const cashDrawerData: any = {
          _id: objectId.toString(),
          userRef: user._id,
          user: { name: user.name },
          location: { name: location?.name?.en },
          locationRef: location?._id,
          company: { name: company?.name?.en },
          companyRef: company?._id,
          openingActual: undefined,
          openingExpected: undefined,
          closingActual: undefined,
          closingExpected: undefined,
          difference: undefined,
          totalSales: salesAmount - refundedAmount,
          transactionType: "close",
          description: "Cash Drawer Close",
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
            // if (salesAmount > 0 || refundedAmount > 0) {
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
            //     deviceRef: deviceData.deviceRef,
            //     device: { deviceCode: deviceData.phone },
            //     referenceNumber: "",
            //     fileUrl: [] as any,
            //     transactions: [
            //       {
            //         paymentMethod: "cash",
            //         amount: salesAmount - refundedAmount,
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

            localStorage.setItem(
              "openShiftDrawer",
              JSON.stringify(cashTxnData)
            );

            cart.clearCart();
            calculateCart();
            setCustomer({});
            setCustomerRef("");
            setStaff({});
            setStaffRef("");
            handleLogout();
          }
        } catch (error: any) {
          toast.error(error?.message);
        }
      }
    }
  };

  function calculatePaymentTotal(breakup: any): number {
    return breakup.reduce((total: number, payment: any) => {
      const change = Math.max(payment.change || 0, 0);
      return total + Number(payment.total || 0) - change || 0;
    }, 0);
  }

  function calculateRefundTotal(refunds: any): number {
    return refunds.reduce((total: number, refund: any) => {
      return total + Number(refund.amount || 0);
    }, 0);
  }

  const handleLogout = async () => {
    const login = localStorage.getItem("login");

    if (login === "user") {
      router.back();
      await userDeviceLogout(deviceData?.deviceRef, deviceData?.phone);
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
    if (deviceData?.deviceRef) {
      findDevice(deviceData?.deviceRef?.toString());
    }
  }, [deviceData]);

  return (
    <>
      <Box component="main" sx={{ flexGrow: 1, position: "relative" }}>
        <Container maxWidth="xl" style={{ padding: "0px 0px 0px 0px" }}>
          <Stack spacing={0} sx={{ mt: 0, px: 0, py: 1 }}>
            <Stack
              spacing={0}
              sx={{
                pl: 2,
                pr: 1.5,
                pt: 0.5,
                height: "35px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              {xsDown && (
                <Box sx={{ flex: 1 }}>
                  <IconButton onClick={handleBack}>
                    <ArrowBackIcon
                      fontSize="small"
                      sx={{ mr: 1, color: "#6B7280" }}
                    />
                    <Typography>{t("Back")}</Typography>
                  </IconButton>
                </Box>
              )}

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: !xsDown ? "flex-start" : "center",
                }}
              >
                <Typography color="text.secondary">
                  {ticketData?.name || t("Current Sale")}
                </Typography>
              </Box>

              <Box
                sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
              >
                <Typography
                  color={"primary"}
                  sx={{ cursor: "pointer", ml: "3px" }}
                  onClick={handleMenuClick}
                >
                  <DotsVertical />
                </Typography>
              </Box>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem
                  onClick={() => {
                    setShowDialogClearCart(true);
                  }}
                  disabled={items?.length === 0}
                >
                  {t("Clear")}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenCreateTicketModal(true);
                  }}
                  disabled={items?.length === 0}
                >
                  {t("Save Ticket")}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenSavedTicketModal(true);
                  }}
                >
                  {t("Tickets")}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenStaffSelectionModal(true);
                    handleMenuClose();
                  }}
                >
                  {t("Assign Staff")}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setShiftEnd(true);

                    if (cart.getCartItems()?.length > 0) {
                      setShowDialogEndShift(true);
                    } else {
                      checkUpdateCashDrawer(true);
                    }
                  }}
                >
                  {t("End Shift")}
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setShiftEnd(false);

                    if (cart.getCartItems()?.length > 0) {
                      setShowDialogEndShift(true);
                    } else {
                      checkUpdateCashDrawer(false);
                    }
                  }}
                >
                  {t("Day End")}
                </MenuItem>
              </Menu>
            </Stack>

            <BillingWalkIn
              companyRef={companyRef}
              company={company}
              location={location}
              device={device}
              ticketData={ticketData}
              ticketIndex={ticketIndex}
              removeTicket={() => {
                setTicketData(null);
                setTicketIndex(null);
              }}
              handleBack={handleBack}
            />
          </Stack>
        </Container>
      </Box>

      <ConfirmationDialog
        show={showDialogClearCart}
        toggle={() => setShowDialogClearCart(!showDialogClearCart)}
        onOk={() => {
          cart.clearCart();
          setCustomer({});
          setCustomerRef("");
          setStaff({});
          setStaffRef("");
          setTicketIndex(null);
          setTicketData(null);
          setShowDialogClearCart(false);
          handleMenuClose();
        }}
        okButtonText={`${t("Yes")}, ${t("Clear")}`}
        cancelButtonText={t("No")}
        title={t("Clear Cart")}
        text={t("Do you want to clear cart items?")}
      />

      <ConfirmationDialog
        show={showDialogEndShift}
        toggle={() => setShowDialogEndShift(!showDialogEndShift)}
        onOk={() => {
          setShowDialogEndShift(false);
          checkUpdateCashDrawer(shiftEnd);
          handleMenuClose();
        }}
        okButtonText={`${t("Yes")}, ${
          shiftEnd ? t("End Shift") : t("Day End")
        }`}
        cancelButtonText={t("No")}
        title={t("Confirmation")}
        text={
          shiftEnd
            ? `${t("There is an open order in the cart")}. ${t(
                "Do you still want to shift end?"
              )}`
            : `${t("There is an open order in the cart")}. ${t(
                "Do you still want to day end?"
              )}`
        }
      />

      <SavedTicketModal
        open={openSavedTicketModal}
        handleClose={() => {
          setOpenSavedTicketModal(false);
          handleMenuClose();
        }}
        handleTicketRowTap={(ticket: any) => {
          setTicketData(ticket);
          setTicketIndex(ticket?.id);
          setOpenSavedTicketModal(false);
          handleMenuClose();
        }}
      />

      <CreateTicketModal
        open={openCreateTicketModal}
        items={items}
        handleClose={() => {
          setOpenCreateTicketModal(false);
          handleMenuClose();
        }}
        handleAddTicket={() => {
          cart.clearCart();
          setCustomer({});
          setCustomerRef("");
          setStaff({});
          setStaffRef("");
          setOpenCreateTicketModal(false);
          handleMenuClose();
        }}
      />

      <EndShiftModal
        location={location}
        shiftEnd={shiftEnd}
        open={openEndShift}
        onlineOrderData={onlineOrderData}
        defaultCash={device?.configuration?.startingCash || 0}
        handleClose={() => setOpenEndShift(false)}
      />

      <CancelOnlineOrderModal
        location={location}
        open={openCancelOnline}
        onlineOrderData={onlineOrderData}
        handleClose={() => setOpenCancelOnline(false)}
        handleSuccess={() => {
          cart.clearCart();
          calculateCart();
          setCustomer({});
          setCustomerRef("");
          setStaff({});
          setStaffRef("");
        }}
      />

      <StaffSelectionModal
        open={openStaffSelectionModal}
        handleClose={() => setOpenStaffSelectionModal(false)}
        onStaffSelect={(selectedStaff) => {
          if (selectedStaff) {
            setStaff(selectedStaff);
            setStaffRef(selectedStaff._id);
          } else {
            setStaff({});
            setStaffRef("");
          }
        }}
        selectedStaffId={staffRef}
        companyRef={companyRef}
        locationRef={device?.locationRef}
      />
    </>
  );
};
