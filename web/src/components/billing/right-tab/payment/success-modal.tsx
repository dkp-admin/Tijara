import { PrintRounded } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import Barcode from "react-barcode";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { SendReceiptModal } from "src/components/modals/send-receipt";
import OrderQR from "src/components/order-qr";
import { CompanyContext } from "src/contexts/company-context";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { MoleculeType } from "src/permissionManager";
import A4ReceiptPrint from "src/sections/dashboard/order/print-receipt/A4-payment-print-receipt";
import KOTReceiptPrint from "src/sections/dashboard/order/print-receipt/kot-print-receipt";
import MultiPayReceiptPrint from "src/sections/dashboard/order/print-receipt/multi-payment-print-receipt";
import useCartStore from "src/store/cart-item";
import { useCurrency } from "src/utils/useCurrency";

interface SuccessModalProps {
  data: any;
  open: boolean;
  company: any;
  device: any;
  printTemplate: any;
  handleClose: any;
}

function getItems(items: any) {
  const itemList = items?.map((item: any) => {
    const data: any = {
      name: {
        en: item.name.en,
        ar: item.name.ar,
      },
      image: item.image,
      quantity: item.qty,
      billing: {
        total: item.total,
        subTotal: item.itemSubTotal,
        vatAmount: item.vat,
        vatPercentage: item.vatPercentage,
        discountAmount: item.discount,
        discountPercentage: item.discountPercentage,
        discountedTotal: item.discountAmount,
      },
      modifiers: item.modifiers || [],
      promotionsData: item.promotionsData || [],
      isFree: item.isFree,
      hasMultipleVariants: item.hasMultipleVariants,
      variant: {
        name: {
          en: item.variantNameEn,
          ar: item.variantNameAr,
        },
        sku: item.sku,
        type: item.type,
        unitCount: item.noOfUnits,
        unit: item.unit,
        costPrice: item.sellingPrice,
        sellingPrice: item.itemSubTotal,
      },
    };

    if (item?.productRef != "") {
      data["productRef"] = item.productRef;
    }

    if (item?.categoryRef != "") {
      data["categoryRef"] = item.categoryRef;
    }

    return data;
  });

  return itemList;
}

function getOrderData(data: any) {
  if (!data) return;

  const items = getItems(data?.items);

  const dataObj: any = {
    _id: data._id,
    company: { name: data.company?.en || data.company.name },
    companyRef: data.companyRef,
    location: { name: data.location.name },
    locationRef: data.locationRef,
    cashier: { name: data.cashier.name },
    cashierRef: data.cashierRef,
    device: { deviceCode: data.device.deviceCode },
    deviceRef: data.deviceRef,
    orderNum: data.orderNum,
    items: items,
    payment: {
      total: data.payment.total,
      subTotal: data.payment.subTotal,
      vatAmount: data.payment.vat,
      vatPercentage: data.payment.vatPercentage,
      discountCode: data.payment.discountCode,
      discountAmount: data.payment.discount,
      discountPercentage: data.payment.discountPercentage,
      subTotalWithoutDiscount: data.payment.subTotalWithoutDiscount,
      breakup: data.payment.breakup?.map((breakup: any) => {
        return {
          name: breakup.name,
          total: breakup.total,
          refId: breakup.refId,
          providerName: breakup.providerName,
          change: breakup.change,
        };
      }),
    },
    refunds: data.refunds?.map((refund: any) => {
      return {
        reason: refund.reason,
        amount: refund.amount,
        vat: refund.vat,
        items: refund.items?.map((item: any) => {
          return {
            unit: item.unit,
            qty: Number(item.qty),
            amount: Number(item.amount),
            vat: item.vat,
            name: { en: item?.nameEn || "", ar: item?.nameAr || "" },
            categoryRef: item.categoryRef,
            _id: item._id,
            sku: item.sku,
          };
        }),
        refundedTo: refund.refundedTo?.map((data: any) => {
          return {
            amount: data.amount,
            refundedTo: data.refundTo,
          };
        }),
        cashier: { name: refund.cashier.name },
        cashierRef: refund.cashierRef,
        date: new Date(refund.date),
        device: { deviceCode: refund.device.deviceCode },
        deviceRef: refund.deviceRef,
      };
    }),
    orderType: data?.orderType,
    createdAt: new Date(data.createdAt),
  };

  if (data?.customerRef) {
    dataObj["customer"] = {
      name: data.customer.name,
      vat: data.customer.vat,
    };
    dataObj["customerRef"] = data.customerRef;
  }

  return dataObj;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  data,
  open = false,
  handleClose,
  printTemplate,
  device: deviceDoc,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const componentRef = useRef();
  const kotComponentRef = useRef();
  const a4ComponentRef = useRef();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const currency = useCurrency();
  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const companyContext = useContext<any>(CompanyContext);

  const canAccess = usePermissionManager();
  const canPrint =
    canAccess(MoleculeType["order:print"]) ||
    canAccess(MoleculeType["order:manage"]);
  const canSendReceipt =
    canAccess(MoleculeType["order:send-receipt"]) ||
    canAccess(MoleculeType["order:manage"]);

  console.log(data?.device);

  const {
    setOrder,
    setCustomer,
    setCustomerRef,
    customer,
    clearDiscount,
    discountsApplied,
    setLastOrder,
  } = useCartStore();

  const totalPaid = useMemo(
    () =>
      data?.payment?.breakup?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const totalCharges = useMemo(
    () =>
      data?.payment?.charges?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [data]
  );

  const total = useMemo(() => {
    if (data?.items?.length > 0) {
      return data.items.reduce((prev: number, cur: any) => {
        if (!cur?.isFree) {
          return Number(
            (prev + Number(cur?.discountedTotal || cur.total)).toFixed(2)
          );
        }
        return prev;
      }, 0);
    }
    return 0;
  }, [data]);

  const handlePrintKOT = useReactToPrint({
    content: () => kotComponentRef.current,
  });

  const handlePrintA4 = useReactToPrint({
    content: () => a4ComponentRef.current,
  });

  const getA4PrintPreview = () => {
    let userObj = {};

    userObj = {
      company: {
        name: {
          en: data?.name?.en,
          ar: data?.name?.ar,
        },
        logo: data?.logo || "",
        vat: { docNumber: data?.vat?.docNumber },
        address: {
          address1: data?.address?.address1,
          city: data?.address?.city,
          postalCode: data?.address?.postalCode,
          country: data?.address?.country,
        },
        phone: data?.phone,
      },
    };

    if (data) {
      return A4ReceiptPrint(
        userObj,
        { ...data, createdAt: new Date() },
        printTemplate,
        data?.phone
      );
    }
  };

  const getKOTPrintPreview = () => {
    const printData = {
      orderNum: data?.orderNum,
      createdAt: data?.createdAt,
      tokenNum: data?.tokenNum,
      orderType: data?.orderType,
      items: data?.items,
      specialInstructions: data?.specialInstructions,
      showToken: data?.showToken,
      showOrderType: data?.showOrderType,
      location: {
        en: data?.location?.en,
        ar: data?.location?.ar,
      },
      address: data?.address,
    };

    return KOTReceiptPrint(printData);
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getPrintPreview = () => {
    if (data) {
      const template = {
        location: {
          name: {
            en: data?.location?.en,
            ar: data?.location?.ar,
          },
          vat: data?.vat,
          address: data?.address,
        },
        returnPolicy: data?.returnPolicy,
        customText: data?.customText,
        footer: data?.footer,
        logo: printTemplate?.logo,
      };

      return MultiPayReceiptPrint(user, data, template, data?.phone);
    }
  };

  useEffect(() => {
    if (open || data) {
      setOrder({});
      setLastOrder(data);
      if (Object.keys(customer || {}).length > 0) {
        setCustomer({});
        setCustomerRef("");
      }
      if (discountsApplied?.length > 0) {
        clearDiscount();
      }
    }
  }, [open, data]);

  const handleA4Print = () => {
    if (canPrint && data?.print) {
      setTimeout(() => {
        handlePrintA4();
        if (data?.printKOT) {
          setTimeout(() => {
            handlePrintKOT();
          }, 1000);
        }
      }, 1000);
    }
  };

  const handle3InchPrint = () => {
    if (canPrint && data?.print) {
      setTimeout(() => {
        handlePrint();
        if (data?.printKOT) {
          setTimeout(() => {
            handlePrintKOT();
          }, 1000);
        }
      }, 1000);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
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
              {t("Completed")}
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
                }}
              />
            </Box>
          </Box>

          <Divider />

          {/* body */}
          <DialogContent>
            <Typography sx={{ textAlign: "center" }} variant="body1">
              {"#" + data?.orderNum}
            </Typography>

            <Typography sx={{ mt: 7, textAlign: "center" }} variant="h4">
              {Number((totalPaid || 0)?.toFixed(2)) -
              Number((total + totalCharges)?.toFixed(2))
                ? `${currency} ${(
                    totalPaid?.toFixed(2) -
                    (total + totalCharges)
                  ).toFixed(2)} ${t("Change")}`
                : t("No Change")}
            </Typography>
            <Typography sx={{ mt: 1, textAlign: "center" }} variant="subtitle1">
              {`${t("out of")} ${currency} ${totalPaid?.toFixed(2)}`}
            </Typography>
            <center>
              <LoadingButton
                onClick={(e) => {
                  e.preventDefault();
                  setOrder({});
                  handleClose();
                }}
                sx={{ mt: 2, width: "100%" }}
                variant="contained"
                type="submit"
              >
                {t("New Sale")}
              </LoadingButton>
            </center>
          </DialogContent>
          <Divider />
          {/* footer */}
          <DialogActions
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Button
                variant="outlined"
                startIcon={<EmailIcon />}
                onClick={() => {
                  if (!canSendReceipt) {
                    return toast.error(t("You done't have access"));
                  }
                  setOpenSendReceiptModal(true);
                }}
              >
                {t("Send")}
              </Button>
            </Box>

            <Box>
              <Button
                sx={{ mr: 1 }}
                variant="outlined"
                startIcon={<PrintRounded />}
                onClick={() => {
                  if (!canPrint) {
                    return toast.error(t("You don't have access"));
                  }
                  handleA4Print();
                  setAnchorEl(null);
                }}
              >
                {t("A4 Receipt")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PrintRounded />}
                onClick={() => {
                  if (!canPrint) {
                    return toast.error(t("You don't have access"));
                  }

                  handle3InchPrint();
                  setAnchorEl(null);
                }}
              >
                {t("3” Receipt")}
              </Button>
            </Box>

            <div style={{ display: "none" }}>
              <>
                <div id="printablediv">
                  <div style={{ display: "none" }}>
                    <div
                      ref={componentRef}
                      style={{
                        width: "400px",
                        margin: "20px auto",
                        textAlign: "center",
                        padding: "30px 5px",
                        fontWeight: "bold",
                        fontSize: "15px",
                        lineHeight: "20px",
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getPrintPreview(),
                        }}
                      />
                      <center>
                        <OrderQR
                          order={data}
                          user={user}
                          companyContext={companyContext}
                        />
                        {deviceDoc?.zatcaConfiguration?.enableZatca ===
                          "active" && (
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "#666",
                              maxWidth: "350px",
                              textAlign: "center",
                            }}
                          >
                            {t(
                              "This QR is ZATCA Phase 1 compliant. For a Phase 2 compliant receipt, please check your email or ask the merchant directly."
                            )}
                          </div>
                        )}
                      </center>
                      <Barcode
                        displayValue={false}
                        value={data?.orderNum}
                        width={2}
                      />
                    </div>
                  </div>
                </div>
              </>
              <div id="kotprintablediv">
                <div style={{ display: "none" }}>
                  <div
                    ref={kotComponentRef}
                    style={{
                      width: "400px",
                      margin: "20px auto",
                      textAlign: "center",
                      padding: "30px 5px",
                      fontWeight: "bold",
                      fontSize: "15px",
                      lineHeight: "20px",
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getKOTPrintPreview(),
                      }}
                    />
                  </div>
                </div>
              </div>

              <div id="a4printablediv">
                <div style={{ display: "none" }}>
                  <div
                    ref={a4ComponentRef}
                    style={{
                      width: "95%",
                      margin: "10px auto",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "15px",
                      lineHeight: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        {printTemplate?.logo ? (
                          <img
                            src={printTemplate?.logo}
                            alt=""
                            width="100px"
                            height="90px"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100px",
                              height: "90px",
                            }}
                          ></div>
                        )}
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-dark">
                          Tax Invoice / فاتورة ضريبية{" "}
                        </h1>
                        <div className="text-center mb-4">
                          <div className="text-xs text-dark mt-2">

                            <p className="font-bold">
                              {printTemplate?.location?.name?.en || ""}/
                              {printTemplate?.location?.name?.ar || ""}
                            </p>
                            <p>{printTemplate?.location?.address || ""}</p>
                            <p>
                              VAT No. / الرقم الضريبي:
                              {printTemplate?.location?.vat?.length > 0
                                ? printTemplate?.location?.vat
                                : "Not Applicable / غير قابل للتطبيق"}
                            </p>
                            <p>
                              Ph: {printTemplate?.phone || ""}
                              {printTemplate?.email
                                ? `, Email: ${printTemplate?.email}`
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div className="text-center"></div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexDirection: "column",
                        }}
                      >
                        <OrderQR
                          order={data}
                          user={user}
                          companyContext={companyContext}
                        />
                        {deviceDoc?.zatcaConfiguration?.enableZatca ===
                          "active" && (
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "12px",
                              lineHeight: "16px",
                              color: "#666",
                              maxWidth: "350px",
                              textAlign: "center",
                            }}
                          >
                            {t(
                              "This QR is ZATCA Phase 1 compliant. For a Phase 2 compliant receipt, please check your email or ask the merchant directly."
                            )}
                          </div>
                        )}
                        {/* <Barcode
                          displayValue={false}
                          value={data?.orderNum}
                          width={1}
                          height={50}
                        /> */}
                      </div>
                    </div>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: getA4PrintPreview(),
                      }}
                    />

                    <div className="text-sm">Powered by Tijarah360</div>
                  </div>
                </div>
              </div>
            </div>
          </DialogActions>
        </Dialog>

        <SendReceiptModal
          modalData={getOrderData(data)}
          open={openSendReceiptModal}
          handleClose={() => {
            setOpenSendReceiptModal(false);
          }}
          type={"billing"}
        />
      </Box>
    </>
  );
};
