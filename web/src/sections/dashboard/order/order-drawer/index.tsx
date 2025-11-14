import { ArrowDropDownCircleOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import PropTypes from "prop-types";
import { FC, useEffect, useRef, useState } from "react";
import Barcode from "react-barcode";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useReactToPrint } from "react-to-print";
import { AddCustomerModal } from "src/components/modals/add-customer-modat";
import IssueRefundModal from "src/components/modals/issue-refund-modal";
import { SendReceiptModal } from "src/components/modals/send-receipt";
import OrderQR from "src/components/order-qr";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUserType } from "src/hooks/use-user-type";
import { MoleculeType } from "src/permissionManager";
import { USER_TYPES } from "src/utils/constants";
import A4ReceiptPrint from "../print-receipt/A4-payment-print-receipt";
import A4RefundReceiptPrint from "../print-receipt/A4-refund-receipt";
import MultiPayReceiptPrint from "../print-receipt/multi-payment-print-receipt";
import RefundReceiptPrint from "../print-receipt/refund-print-receipt";
import { OrderDetails } from "./order-details";

interface OrderDrawerProps {
  container?: HTMLDivElement | null;
  open?: boolean;
  onClose?: () => void;
  order?: any;
  isFromOrders?: boolean;
  companyRef?: string;
  companyName?: string;
  companyContext?: any;
}

export const OrderDrawer: FC<OrderDrawerProps> = (props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userType } = useUserType();

  const canAccess = usePermissionManager();
  const canIssueRefund =
    canAccess(MoleculeType["order:issue-refund"]) ||
    canAccess(MoleculeType["order:manage"]);
  const canPrint =
    canAccess(MoleculeType["order:print"]) ||
    canAccess(MoleculeType["order:manage"]);
  const canSendReceipt =
    canAccess(MoleculeType["order:send-receipt"]) ||
    canAccess(MoleculeType["order:manage"]);

  const {
    container,
    onClose,
    open,
    order,
    isFromOrders = true,
    companyRef,
    companyName,
    companyContext,
  } = props;

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));
  const componentRef = useRef();
  const A4ComponentRef = useRef();
  const refundComponentRef = useRef();
  const refundA4ComponentRef = useRef();

  const { findOne, entity } = useEntity("company");

  const { find: findTemplate, entities: templateEntity } = useEntity(
    "print-template"
  ) as {
    find: any;
    entities: any;
  };
  const { findOne: findLocation, entity: location } = useEntity("location");

  const [openSendReceiptModal, setOpenSendReceiptModal] = useState(false);
  const [openCustomerAddModal, setOpenCustomerAddModal] = useState(false);

  const [openIssueRefundModal, setOpenIssueRefundModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElRefund, setAnchorElRefund] = useState<null | HTMLElement>(
    null
  );

  let content: JSX.Element | null = null;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRefundClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElRefund(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleRefundClose = () => {
    setAnchorElRefund(null);
  };

  const getRefundPrintPreview = () => {
    let userObj = {};

    if (user.userType === USER_TYPES.SUPERADMIN) {
      userObj = {
        phone: entity?.phone,
        company: {
          logo: entity?.logo || "",
          vat: { docNumber: entity?.vat?.docNumber },
          address: {
            address1: entity?.address?.address1,
            city: entity?.address?.city,
          },
        },
      };
    } else {
      userObj = user;
    }

    return RefundReceiptPrint(
      userObj,
      order,
      templateEntity?.results?.[0],
      location?.phone
    );
  };

  const getRefundA4PrintPreview = () => {
    let userObj = {};

    if (user.userType === USER_TYPES.SUPERADMIN) {
      userObj = {
        company: {
          name: {
            en: entity?.name?.en,
            ar: entity?.name?.ar,
          },
          logo: entity?.logo || "",
          vat: { docNumber: entity?.vat?.docNumber },
          address: {
            address1: entity?.address?.address1,
            city: entity?.address?.city,
            postalCode: entity?.address?.postalCode,
            country: entity?.address?.country,
          },
          phone: entity?.phone,
        },
      };
    } else {
      userObj = user;
    }

    return A4RefundReceiptPrint(
      userObj,
      order,
      templateEntity?.results?.[0],
      location?.phone
    );
  };

  const getPrintPreview = () => {
    let userObj = {};

    if (user.userType === USER_TYPES.SUPERADMIN) {
      userObj = {
        phone: entity?.phone,
        company: {
          logo: templateEntity?.results?.[0]?.logo || "",
          vat: { docNumber: entity?.vat?.docNumber },
          address: {
            address1: entity?.address?.address1,
            city: entity?.address?.city,
          },
        },
      };
    } else {
      userObj = user;
    }

    return MultiPayReceiptPrint(
      userObj,
      order,
      templateEntity?.results?.[0],
      location?.phone
    );
  };

  const getA4PrintPreview = () => {
    let userObj = {};

    if (user.userType === USER_TYPES.SUPERADMIN) {
      userObj = {
        company: {
          name: {
            en: entity?.name?.en,
            ar: entity?.name?.ar,
          },
          logo: entity?.logo || "",
          vat: { docNumber: entity?.vat?.docNumber },
          address: {
            address1: entity?.address?.address1,
            city: entity?.address?.city,
            postalCode: entity?.address?.postalCode,
            country: entity?.address?.country,
          },
          phone: entity?.phone,
        },
      };
    } else {
      userObj = user;
    }

    return A4ReceiptPrint(
      userObj,
      order,
      templateEntity?.results?.[0],
      location?.phone
    );
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleRefundPrint = useReactToPrint({
    content: () => refundComponentRef.current,
  });

  const handleA4RefundPrint = useReactToPrint({
    content: () => refundA4ComponentRef.current,
  });

  const handleA4Print = useReactToPrint({
    content: () => A4ComponentRef.current,
  });

  useEffect(() => {
    if (userType == USER_TYPES.SUPERADMIN && companyRef) {
      findOne(companyRef);
    }
  }, [companyRef]);

  useEffect(() => {
    if (order) {
      findTemplate({
        page: 0,
        limit: 10,
        _q: "",
        activeTab: "active",
        sort: "asc",
        companyRef: order?.companyRef.toString(),
        locationRef: order?.locationRef.toString(),
      });

      findLocation(order?.locationRef?.toString());
    }
  }, [order]);

  if (order) {
    content = (
      <div>
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Typography color={open ? "primary" : ""} variant="h6">
            {`#${order?.orderNum || ""}`}
          </Typography>
          <IconButton color="inherit" onClick={onClose}>
            <SvgIcon>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Stack>

        {isFromOrders && (
          <>
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-evenly"
              sx={{
                px: 3,
                py: 1,
              }}
              spacing={2}
            >
              <Button
                sx={{ display: "flex", maxWidth: 190, maxHeight: 50 }}
                variant="outlined"
                onClick={() => {
                  if (!canIssueRefund) {
                    return toast.error(t("You done't have access"));
                  }

                  if (
                    (order?.qrOrdering || order?.onlineOrdering) &&
                    order?.orderStatus !== "completed"
                  ) {
                    return toast.error(
                      t("Refund will be initiated after order completion")
                    );
                  }
                  setOpenIssueRefundModal(true);
                }}
                disabled={order?.refunds?.length !== 0}
              >
                {t("Issue Refund")}
              </Button>

              <Button
                sx={{ display: "flex", maxWidth: 190, maxHeight: 50 }}
                variant="outlined"
                onClick={() => {
                  if (!canSendReceipt) {
                    return toast.error(t("You done't have access"));
                  }
                  setOpenSendReceiptModal(true);
                }}
              >
                {t("Send Receipt")}
              </Button>
            </Stack>

            <Stack
              alignItems="center"
              direction="row"
              justifyContent="space-evenly"
              sx={{
                px: 3,
                py: 1,
              }}
              spacing={2}
            >
              <>
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
                      onClose={handleClose}
                    >
                      <MenuItem
                        onClick={() => {
                          if (!canPrint) {
                            return toast.error(t("You don't have access"));
                          }

                          handlePrint();
                          handleClose();
                        }}
                      >
                        {"3 inch Print"}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          if (!canPrint) {
                            return toast.error(t("You don't have access"));
                          }
                          handleA4Print();
                          handleClose();
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
                        dangerouslySetInnerHTML={{ __html: getPrintPreview() }}
                      />
                      <center>
                        <OrderQR
                          order={order}
                          user={user}
                          companyContext={companyContext}
                        />
                      </center>
                      <Barcode
                        displayValue={false}
                        value={order?.orderNum}
                        width={1}
                      />
                      <div>Powered by Tijarah360</div>
                    </div>

                    <div
                      ref={A4ComponentRef}
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
                          {templateEntity?.results?.[0]?.logo ? (
                            <img
                              src={templateEntity?.results?.[0]?.logo}
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
                                {templateEntity?.results?.[0]?.location?.name
                                  ?.en || ""}
                                /
                                {templateEntity?.results?.[0]?.location?.name
                                  ?.ar || ""}
                              </p>
                              <p>
                                {templateEntity?.results?.[0]?.location
                                  ?.address || ""}
                              </p>
                              <p>
                                VAT No. / الرقم الضريبي:
                                {templateEntity?.results?.[0]?.location?.vat
                                  ?.length > 0
                                  ? templateEntity?.results?.[0]?.location?.vat
                                  : "Not Applicable / غير قابل للتطبيق"}
                              </p>
                              <p>
                                Ph: {templateEntity?.results?.[0]?.phone || ""}
                                {templateEntity?.results?.[0]?.email
                                  ? `, Email: ${templateEntity?.results?.[0]?.email}`
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
                          {/* <Barcode
                            displayValue={false}
                            value={order?.orderNum}
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

                      {/* <Barcode
                        displayValue={false}
                        value={order?.orderNum}
                        width={2}
                      /> */}
                      <div className="text-sm">Powered by Tijarah360</div>
                    </div>
                  </div>
                </div>
              </>

              <>
                <div id="refundprintablediv">
                  <Box>
                    <Button
                      disabled={order?.refunds.length <= 0}
                      sx={{
                        display: "flex",
                        maxWidth: 190,
                        maxHeight: 50,
                      }}
                      variant="outlined"
                      endIcon={<ArrowDropDownCircleOutlined fontSize="small" />}
                      onClick={handleRefundClick}
                      data-testid="add"
                    >
                      {t("Refund Print")}
                    </Button>
                    <Menu
                      id="refund-menu"
                      anchorEl={anchorElRefund}
                      open={Boolean(anchorElRefund)}
                      onClose={handleRefundClose}
                    >
                      <MenuItem
                        onClick={() => {
                          if (!canPrint) {
                            return toast.error(t("You don't have access"));
                          }
                          handleRefundPrint();
                          handleRefundClose();
                        }}
                      >
                        {"3 inch Refund Print"}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          if (!canPrint) {
                            return toast.error(t("You don't have access"));
                          }
                          handleA4RefundPrint();
                          handleRefundClose();
                        }}
                      >
                        {"A4 Refund Print"}
                      </MenuItem>
                    </Menu>
                  </Box>

                  <div style={{ display: "none" }}>
                    <div
                      ref={refundComponentRef}
                      style={{
                        width: "400px",
                        margin: "20px auto",
                        textAlign: "center",
                        padding: "30px 5px",
                        fontWeight: "bold",
                        fontSize: "15px",
                        lineHeight: "20px",
                        // border: "1px solid #000",
                      }}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: getRefundPrintPreview(),
                        }}
                      />
                      <center>
                        <OrderQR
                          order={order}
                          user={user}
                          companyContext={companyContext}
                        />
                      </center>
                      <Barcode
                        displayValue={false}
                        value={order?.orderNum}
                        width={2}
                      />
                      <div>Powered by Tijarah360</div>
                    </div>

                    <div
                      ref={refundA4ComponentRef}
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
                          {templateEntity?.results?.[0]?.logo ? (
                            <img
                              src={templateEntity?.results?.[0]?.logo}
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
                          <div className="text-center">
                            <h1 className="text-xl font-bold text-dark">
                              Notice creditor / Refund Receipt
                            </h1>
                            <h1 className="text-xl font-bold text-dark mt-2">
                              دائن الإشعار/إيصال الاسترداد
                            </h1>
                            <h1 className="text-xl font-bold text-dark mt-4"></h1>

                            <div className="text-center mb-4 mt-2">
                              <div className="text-xs text-dark">
                                <p className="font-bold">
                                  {templateEntity?.results?.[0]?.location?.name
                                    ?.en || ""}
                                  /
                                  {templateEntity?.results?.[0]?.location?.name
                                    ?.ar || ""}
                                </p>
                                <p>
                                  {templateEntity?.results?.[0]?.location
                                    ?.address || ""}
                                </p>
                                <p>
                                  VAT No. / الرقم الضريبي:
                                  {templateEntity?.results?.[0]?.location?.vat
                                    ?.length > 0
                                    ? templateEntity?.results?.[0]?.location
                                        ?.vat
                                    : "Not Applicable / غير قابل للتطبيق"}
                                </p>
                                <p>
                                  Ph:
                                  {templateEntity?.results?.[0]?.phone || ""}
                                  {templateEntity?.results?.[0]?.email
                                    ? `| Email: ${templateEntity?.results?.[0]?.email}`
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </div>
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
                        </div>
                      </div>

                      <div
                        dangerouslySetInnerHTML={{
                          __html: getRefundA4PrintPreview(),
                        }}
                      />

                      {/* <Barcode
                        displayValue={false}
                        value={order?.orderNum}
                        width={2}
                      /> */}
                      <div className="text-sm">Powered by Tijarah360</div>
                    </div>
                  </div>
                </div>
              </>
            </Stack>
          </>
        )}

        <Divider sx={{ pt: 2 }} />

        <Box
          sx={{
            px: 3,
            py: 4,
          }}
        >
          <OrderDetails
            company={
              userType === USER_TYPES.SUPERADMIN ? entity : user?.company
            }
            printTemplate={templateEntity?.results?.[0]}
            companyRef={companyRef}
            order={order}
            openCustomerAddModal={openCustomerAddModal}
            setOpenCustomerAddModal={(res) => setOpenCustomerAddModal(res)}
          />

          <AddCustomerModal
            companyName={companyName}
            companyRef={companyRef}
            modalData={order}
            open={openCustomerAddModal}
            onClose={onClose}
            handleClose={() => {
              setOpenCustomerAddModal(false);
              onClose();
            }}
          />
        </Box>

        <SendReceiptModal
          modalData={order}
          open={openSendReceiptModal}
          handleClose={() => {
            setOpenSendReceiptModal(false);
          }}
        />

        <IssueRefundModal
          order={order}
          open={openIssueRefundModal}
          handleClose={() => {
            setOpenIssueRefundModal(false);
          }}
          handleIssueRefund={() => {
            onClose();
            setOpenIssueRefundModal(false);
          }}
        />
      </div>
    );
  }

  if (lgUp) {
    return (
      <Drawer
        anchor="right"
        open={open}
        PaperProps={{
          sx: {
            position: "relative",
            width: 500,
          },
        }}
        SlideProps={{ container }}
        variant="persistent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      hideBackdrop
      ModalProps={{
        container,
        sx: {
          pointerEvents: "none",
          position: "absolute",
        },
      }}
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          maxWidth: "100%",
          width: 400,
          pointerEvents: "auto",
          position: "absolute",
        },
      }}
      SlideProps={{ container }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

OrderDrawer.propTypes = {
  container: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
  // @ts-ignore
  order: PropTypes.object,
};
