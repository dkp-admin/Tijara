import { ArrowDropDownCircleOutlined } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/Email";
import { LoadingButton } from "@mui/lab";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useContext, useMemo, useRef, useState } from "react";
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
import MultiPayReceiptPrint from "src/sections/dashboard/order/print-receipt/multi-payment-print-receipt";
import { useCurrency } from "src/utils/useCurrency";

interface SuccessModalProps {
  order: any;
  open: boolean;
  printTemplate: any;
  handleClose: any;
  device?: any;
}

export const OnlineOrderSuccessModal: React.FC<SuccessModalProps> = ({
  order,
  open = false,
  printTemplate,
  handleClose,
  device: deviceDoc,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const companyContext = useContext<any>(CompanyContext);
  const componentRef = useRef();
  const a4ComponentRef = useRef();
  const currency = useCurrency();

  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const canAccess = usePermissionManager();
  const canPrint =
    canAccess(MoleculeType["order:print"]) ||
    canAccess(MoleculeType["order:manage"]);
  const canSendReceipt =
    canAccess(MoleculeType["order:send-receipt"]) ||
    canAccess(MoleculeType["order:manage"]);

  const totalDiscount = order?.payment?.discountAmount;

  const totalPaid = useMemo(
    () =>
      order?.payment?.breakup?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [order]
  );

  const totalCharges = useMemo(
    () =>
      order?.payment?.charges?.reduce(
        (prev: any, cur: any) => prev + Number(cur.total),
        0
      ),
    [order]
  );

  const total = useMemo(() => {
    if (order?.items?.length > 0) {
      return order.items.reduce(
        (prev: any, cur: any) =>
          Number((prev + Number(cur.billing.total))?.toFixed(2)),
        0
      );
    }
    return 0;
  }, [order]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getPrintPreview = () => {
    if (order) {
      return MultiPayReceiptPrint(
        user,
        order,
        printTemplate,
        order?.location?.phone || ""
      );
    }
  };

  const handlePrintA4 = useReactToPrint({
    content: () => a4ComponentRef.current,
  });

  const getA4PrintPreview = () => {
    let userObj = {};

    userObj = {
      company: {
        name: {
          en: order?.name?.en,
          ar: order?.name?.ar,
        },
        logo: order?.logo || "",
        vat: { docNumber: order?.vat?.docNumber },
        address: {
          address1: order?.address?.address1,
          city: order?.address?.city,
          postalCode: order?.address?.postalCode,
          country: order?.address?.country,
        },
        phone: order?.phone,
      },
    };

    if (order) {
      return A4ReceiptPrint(
        userObj,
        { ...order, createdAt: new Date() },
        printTemplate,
        order?.phone
      );
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  if (order?.payment?.breakup?.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
              <CloseIcon fontSize="medium" onClick={handleClose} />
            </Box>
          </Box>

          <Divider />
          {/* body */}
          <DialogContent>
            <Box>
              <Typography sx={{ textAlign: "center" }} variant="body1">
                {"#" + order?.orderNum}
              </Typography>

              <Typography sx={{ textAlign: "center" }} variant="h4">
                {(order?.payment?.breakup || order?.payment?.breakup?.length > 0
                  ? Number(totalPaid)
                  : 0) -
                Number(
                  (total + (totalCharges || 0) - (totalDiscount || 0))?.toFixed(
                    2
                  )
                )
                  ? `${currency} ${(
                      (order?.payment?.breakup ||
                      order?.payment?.breakup?.length > 0
                        ? totalPaid
                        : 0) -
                      (total + (totalCharges || 0) - (totalDiscount || 0))
                    ).toFixed(2)} ${t("Change")}`
                  : t("No Change")}
              </Typography>
              <Typography
                sx={{ mt: 1, textAlign: "center" }}
                variant="subtitle1"
              >
                {`${t("out of")} ${t("SAR")} ${(order?.payment?.breakup ||
                order?.payment?.breakup?.length > 0
                  ? totalPaid
                  : 0
                )?.toFixed(2)}`}
              </Typography>
            </Box>
          </DialogContent>

          {/* footer */}
          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
            }}
          >
            <Button
              sx={{ borderRadius: 1 }}
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

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexDirection: "row",
              }}
            >
              <div id="printablediv">
                <Box>
                  <Button
                    sx={{
                      display: "flex",
                      maxWidth: 190,
                      maxHeight: 50,
                    }}
                    variant="outlined"
                    endIcon={<ArrowDropDownCircleOutlined fontSize="small" />}
                    onClick={handleClick}
                    data-testid="add"
                  >
                    {t("Print")}
                  </Button>
                  <Menu
                    id="export-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        if (!canPrint) {
                          return toast.error(t("You don't have access"));
                        }

                        handlePrint();
                        setAnchorEl(null);
                      }}
                    >
                      {"3 inch Print"}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        if (!canPrint) {
                          return toast.error(t("You don't have access"));
                        }
                        handlePrintA4();
                        setAnchorEl(null);
                      }}
                    >
                      {"A4 print"}
                    </MenuItem>
                  </Menu>
                </Box>

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
                        order={order}
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
                      value={order?.orderNum}
                      width={2}
                    />
                  </div>
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
                          order={order}
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

              <LoadingButton
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                sx={{ borderRadius: 1, ml: 1 }}
                variant="contained"
                type="submit"
              >
                {t("Complete")}
              </LoadingButton>
            </Box>
          </DialogActions>
        </Dialog>

        <SendReceiptModal
          modalData={order}
          open={openSendReceiptModal}
          handleClose={() => {
            setOpenSendReceiptModal(false);
          }}
        />
      </Box>
    </>
  );
};
