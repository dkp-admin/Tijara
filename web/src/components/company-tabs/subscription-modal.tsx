import {
  Box,
  Card,
  CardContent,
  Divider,
  Modal,
  Typography,
  useTheme,
} from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import { usePageView } from "src/hooks/use-page-view";
import { PropertyList } from "../property-list";
import { PropertyListItem } from "../property-list-item";
import { differenceInDays, format } from "date-fns";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface SubsctiptionModalProps {
  open: boolean;
  data: any;
  handleClose: any;
}

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
  paid: "Paid",
  unpaid: "Due",
};

const SubscriptionModal: React.FC<SubsctiptionModalProps> = ({
  open,
  data,
  handleClose,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const currency = useCurrency();

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const hardwareNames = data?.hardwares?.map((hardware: any) =>
    isRTL ? hardware?.name?.ar : hardware?.name?.en
  );

  const getNoOfRenewDays = () => {
    const date = new Date();
    date.setHours(0, 0, 0);
    const docDate = new Date(data?.subscriptionEndDate);
    docDate.setHours(0, 0, 0);

    return data?.subscriptionEndDate ? differenceInDays(docDate, date) : 0;
  };

  usePageView();

  const getAddOnAmount = () => {
    return data?.billing?.addonAmount;
  };

  const getHardwareAmount = () => {
    return data?.billing?.hardwareAmount;
  };

  return (
    <>
      <Modal open={open}>
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
            <Box
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
              }}
            >
              <Box
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                  marginTop: 15,
                }}
              >
                <XCircle
                  fontSize="small"
                  onClick={() => handleClose(false)}
                  style={{ cursor: "pointer" }}
                />

                <Box style={{ flex: 1 }}>
                  <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                    {t("Subscription details")}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mt: 5 }} />

            <Box
              sx={{
                pb: 8,
                height: {
                  xs: "calc(100vh - 0px)",
                  sm: "calc(100vh - 0px)",
                  md: "calc(100vh - 25px)",
                  lg: "calc(100vh - 25px)",
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
                  pb: 4,
                  mb: 5,
                  flexGrow: 1,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <PropertyList>
                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Package Name")}
                        value={isRTL ? data?.package?.ar : data?.package?.en}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Hardware")}
                        value={hardwareNames?.join(", ") || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Subscription start date")}
                        value={
                          data?.subscriptionStartDate
                            ? format(
                                new Date(data.subscriptionStartDate),
                                "dd/MM/yyyy"
                              )
                            : "NA"
                        }
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Subscription Expiry")}
                        value={
                          data?.subscriptionEndDate
                            ? format(
                                new Date(data.subscriptionEndDate),
                                "dd/MM/yyyy"
                              )
                            : "NA"
                        }
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Subscription Status")}
                        value={
                          getNoOfRenewDays() > 0
                            ? t("Active")
                            : t("Deactivated")
                        }
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Number of days to renew")}
                        value={`${getNoOfRenewDays()}`}
                      />

                      {/* <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Tenure")}
                        value={
                          data?.validityInMonths
                            ? `${data.validityInMonths || 1} ${
                                data.validityInMonths > 1
                                  ? t("Months")
                                  : t("Month")
                              }`
                            : "NA"
                        }
                      /> */}

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Referral Code")}
                        value={data?.referralCode || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Package Amount")}
                        value={`${currency} ${toFixedNumber(
                          data?.billing?.packageAmount || 0
                        )}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Add-on Amount")}
                        value={`${currency} ${toFixedNumber(getAddOnAmount())}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Hardware Amount")}
                        value={`${currency} ${toFixedNumber(
                          getHardwareAmount()
                        )}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Discount Amount")}
                        value={`${currency} ${toFixedNumber(
                          data?.billing?.discount || 0
                        )}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("VAT Amount")}
                        value={`${currency} ${toFixedNumber(
                          data?.billing?.vat || 0
                        )}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Amount Paid")}
                        value={`${currency} ${toFixedNumber(
                          data?.billing?.total || 0
                        )}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Payment Mode")}
                        value={t(PaymentType[data?.paymentType]) || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Payment Type")}
                        value={t(PaymentMethod[data?.paymentMethod]) || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Payment Status")}
                        value={t(PaymentStatus[data?.paymentStatus]) || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Sales Person")}
                        value={`${data?.salesPerson || "NA"}`}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("Reference No. / Transaction ID")}
                        value={data?.transactionId || "NA"}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        from="subscription"
                        label={t("Attachment")}
                        value={data?.paymentProofUrl}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("No. of Locations")}
                        value={data?.currentLocationLimit || 1}
                      />

                      <PropertyListItem
                        align="horizontal"
                        divider
                        label={t("No. of Devices")}
                        value={data?.currentDeviceLimit || 1}
                      />
                    </PropertyList>
                  </Box>
                </CardContent>
              </Box>
            </Box>
          </Card>
        </Box>
      </Modal>
    </>
  );
};

export default SubscriptionModal;
