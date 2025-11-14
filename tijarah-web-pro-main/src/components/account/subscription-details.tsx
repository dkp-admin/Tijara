import { ArrowDropDownCircleOutlined, ErrorOutline } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { differenceInDays, format } from "date-fns";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "src/contexts/auth/jwt-context";
import { CompanyContext } from "src/contexts/company-context";
import { useEntity } from "src/hooks/use-entity";
import { MoleculeType } from "src/permissionManager";
import type { FC } from "react";
import { toFixedNumber } from "src/utils/toFixedNumber";
import AccountSubscriptionModal from "../modals/account-subscription-modal";
import MerchantSubscriptionModal from "../modals/merchant-subscription-modal";
import ReceivePaymentModal from "../modals/receive-payment-modal";
import ExtendExpiryModal from "../modals/extend-expiry-modal";
import withPermission from "../permissionManager/restrict-page";
import { useCurrency } from "src/utils/useCurrency";

const PaymentType: any = {
  offline: "Offline",
  online: "Online",
};

const PaymentMethod: any = {
  cash: "Cash",
  card: "Card",
  accountTransfer: "Account Transfer",
};

const PaymentStatus: any = {
  unpaid: "unpaid",
  paid: "paid",
};

interface SubscriptionDetailsProps {
  ownerRef?: string;
}

const SubscriptionDetails: FC<SubscriptionDetailsProps> = ({ ownerRef }) => {
  const { t } = useTranslation();
  const companyContext = useContext<any>(CompanyContext);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { findOne, entity } = useEntity<any>("subscription/ownerRef");
  const { findOne: findInvoice, entity: invoice } = useEntity<any>(
    "invoice/ownerRef"
  ) as any;
  const authContext = useContext(AuthContext);
  const currency = useCurrency();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const hardwareNames = entity?.hardwares?.map((hardware: any) =>
    isRTL
      ? `${hardware?.name?.ar} x  ${hardware.qty}`
      : `${hardware?.name?.en} x ${hardware.qty}`
  );

  const addonNames = entity?.addons?.map((addon: any) =>
    isRTL ? addon?.name : addon?.name
  );

  const getNoOfRenewDays = () => {
    if (!entity?.subscriptionEndDate) return 0;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const endDate = new Date(entity.subscriptionEndDate);
    endDate.setHours(0, 0, 0, 0);

    if (endDate.getTime() === currentDate.getTime()) {
      return 1;
    }

    const daysLeft = differenceInDays(endDate, currentDate);

    return daysLeft > 0 ? daysLeft : 0;
  };

  const getAddOnAmount = () => {
    return entity?.billing?.addonAmount || 0;
  };

  const getHardwareAmount = () => {
    return entity?.billing?.hardwareAmount || 0;
  };

  useEffect(() => {
    const refToUse = ownerRef || companyContext?.ownerRef;
    if (refToUse) {
      findOne(refToUse);
      findInvoice(refToUse);
    }
  }, [ownerRef, companyContext]);

  const hasUnpaidInvoice =
    entity?.paymentStatus === "unpaid" && invoice?.paymentStatus === "unpaid";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AccountSubscriptionModal
        openSubModal={isSubModalOpen}
        setOpenSubModal={() => setIsSubModalOpen(false)}
        subscription={entity}
      />
      <MerchantSubscriptionModal
        open={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        subscription={entity}
      />
      <ReceivePaymentModal
        openPaymentModal={isPaymentModalOpen}
        setOpenPaymentModal={setIsPaymentModalOpen}
        subscription={entity}
        invoice={invoice}
      />
      <ExtendExpiryModal
        openExtendModal={isExtendModalOpen}
        setOpenExtendModal={setIsExtendModalOpen}
        subscription={entity}
      />

      <Menu
        id="subscription-actions-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {authContext?.user?.userType === "app:admin" && (
          <MenuItem
            onClick={() => {
              setIsProvisionModalOpen(true);
              handleMenuClose();
            }}
            disabled={hasUnpaidInvoice}
          >
            {t("Manage Subscription")}
          </MenuItem>
        )}
        {authContext?.user?.userType === "app:super-admin" && (
          <>
            <MenuItem
              onClick={() => {
                setIsSubModalOpen(true);
                handleMenuClose();
              }}
            >
              {t("Update Subscription")}
            </MenuItem>
            {hasUnpaidInvoice && (
              <MenuItem
                onClick={() => {
                  setIsPaymentModalOpen(true);
                  handleMenuClose();
                }}
              >
                {t("Receive Payment")}
              </MenuItem>
            )}
            <MenuItem
              onClick={() => {
                setIsExtendModalOpen(true);
                handleMenuClose();
              }}
            >
              {t("Extend Expiry")}
            </MenuItem>
          </>
        )}
      </Menu>
      <Card elevation={1} sx={{ mb: 4 }}>
        <CardHeader
          title={t("Subscription Details")}
          titleTypographyProps={{ variant: "h6", align: "left" }}
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {hasUnpaidInvoice && (
                <Chip
                  icon={<ErrorOutline fontSize="small" />}
                  label={t("Unpaid Invoice Exists")}
                  color="warning"
                  variant="filled"
                  sx={{ fontWeight: "medium" }}
                />
              )}
              <Button
                sx={{
                  display: "flex",
                  maxWidth: 190,
                  maxHeight: 50,
                }}
                variant="outlined"
                endIcon={<ArrowDropDownCircleOutlined fontSize="small" />}
                onClick={handleMenuOpen}
              >
                {t("Actions")}
              </Button>
            </Box>
          }
        />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            {/* Package Information Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title={t("Package Information")}
                  titleTypographyProps={{ variant: "subtitle1", align: "left" }}
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Package Name")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {isRTL
                            ? entity?.package?.ar
                            : entity?.package?.en || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Addon")}
                        </Typography>
                        <Typography variant="body1">
                          {addonNames?.join(", ") || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Hardware")}
                        </Typography>
                        <Typography variant="body1">
                          {hardwareNames?.join(", ") || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Subscription Status Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title={t("Subscription Status")}
                  titleTypographyProps={{ variant: "subtitle1", align: "left" }}
                  sx={{ pb: 1 }}
                  action={
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Chip
                        label={entity?.isTrial ? t("Trial") : t("Regular")}
                        color={entity?.isTrial ? "info" : "success"}
                        size="small"
                        variant="filled"
                      />
                      <Chip
                        label={
                          getNoOfRenewDays() > 0
                            ? t("Active")
                            : t("Deactivated")
                        }
                        color={getNoOfRenewDays() > 0 ? "success" : "error"}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  }
                />
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Subscription start date")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.subscriptionStartDate
                            ? format(
                                new Date(entity?.subscriptionStartDate),
                                "dd/MM/yyyy"
                              )
                            : "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Subscription Expiry")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.subscriptionEndDate
                            ? format(
                                new Date(entity?.subscriptionEndDate),
                                "dd/MM/yyyy"
                              )
                            : "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Number of days to renew")}
                        </Typography>
                        <Typography variant="body1">
                          {getNoOfRenewDays()}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Tenure")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.validityInMonths
                            ? `${entity?.validityInMonths || 1} ${
                                entity?.validityInMonths > 1
                                  ? t("Months")
                                  : t("Month")
                              }`
                            : "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Referral Code")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.referralCode || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Subscription Type")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {entity?.isTrial ? t("Trial") : t("Regular")}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Billing Information Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title={t("Billing Information")}
                  titleTypographyProps={{ variant: "subtitle1", align: "left" }}
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Package Amount")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {`${currency} ${toFixedNumber(
                            entity?.billing?.packageAmount || 0
                          )}`}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Add-on Amount")}
                        </Typography>
                        <Typography variant="body1">
                          {`${currency} ${toFixedNumber(getAddOnAmount())}`}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Hardware Amount")}
                        </Typography>
                        <Typography variant="body1">
                          {`${currency} ${toFixedNumber(getHardwareAmount())}`}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Discount Amount")}
                        </Typography>
                        <Typography variant="body1">
                          {`${currency} ${toFixedNumber(
                            entity?.billing?.discount || 0
                          )}`}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Amount Paid")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {`${currency} ${toFixedNumber(
                            entity?.billing?.total || 0
                          )}`}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Payment Information Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title={t("Payment Information")}
                  titleTypographyProps={{ variant: "subtitle1", align: "left" }}
                  sx={{ pb: 1 }}
                  action={
                    <Chip
                      label={t(PaymentStatus[entity?.paymentStatus]) || "NA"}
                      color={
                        entity?.paymentStatus === "paid" ? "success" : "warning"
                      }
                      size="small"
                      variant="filled"
                    />
                  }
                />
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Payment Mode")}
                        </Typography>
                        <Typography variant="body1">
                          {t(PaymentType[entity?.paymentType]) || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Payment Type")}
                        </Typography>
                        <Typography variant="body1">
                          {t(PaymentMethod[entity?.paymentMethod]) || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Sales Person")}
                        </Typography>
                        <Typography variant="body1">
                          {companyContext.subscription?.salesPerson || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Reference No. / Transaction ID")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.transactionId || "NA"}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("Attachment")}
                        </Typography>
                        <Typography variant="body1">
                          {entity?.paymentProofUrl ? (
                            <IconButton
                              href={entity?.paymentProofUrl}
                              target="_blank"
                              style={{
                                pointerEvents: entity?.paymentProofUrl
                                  ? null
                                  : "none",
                              }}
                              sx={{ mx: -1, my: -1 }}
                              disabled={!entity?.paymentProofUrl}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "600" }}
                                color={
                                  entity?.paymentProofUrl
                                    ? "primary"
                                    : "neutral.400"
                                }
                              >
                                {entity?.paymentProofUrl ? t("View") : "NA"}
                              </Typography>
                            </IconButton>
                          ) : (
                            "NA"
                          )}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Limits Section */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader
                  title={t("Usage Limits")}
                  titleTypographyProps={{ variant: "subtitle1", align: "left" }}
                  sx={{ pb: 1 }}
                />
                <Divider />
                <CardContent sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("No. of Locations")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {entity?.currentLocationLimit || 1}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: "left" }}>
                        <Typography variant="body2" color="text.secondary">
                          {t("No. of Devices")}
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {entity?.currentDeviceLimit || 1}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
};

export default withPermission(
  SubscriptionDetails,
  MoleculeType["account:read"]
);
