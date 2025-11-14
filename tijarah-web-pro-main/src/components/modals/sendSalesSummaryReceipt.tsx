import {
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import { format } from "date-fns";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import endpoint from "src/api/endpoints";
import serviceCaller from "src/api/serviceCaller";
import PhoneInput from "../phone-input";
import parsePhoneNumber from "src/utils/parse-phone-number";
import * as Yup from "yup";

const SendReceiptViaEnum: any = {
  sms: "sms",
  email: "email",
};

interface SendSalesSummaryReceiptModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  startDate?: Date;
  endDate?: Date;
  locationRef?: string;
  userName?: string;
  printedBy?: string;
}

function salesSummaryData(
  data: any,
  startDate: Date,
  endDate: Date,
  userName: string,
  cashiers: string[],
  printedBy: string
) {
  const dataObj = {
    startDate: format(new Date(startDate), "dd-MM-yyyy, h:mm a"),
    endDate: format(new Date(endDate), "dd-MM-yyyy, h:mm a"),
    printedBy: printedBy,
    user: { name: { en: userName } },
    refundInCash: data.refundInCash,
    refundInCard: data.refundInCard,
    refundInWallet: data.refundInWallet,
    refundCountInCash: data.refundCountInCash,
    refundCountInCard: data.refundCountInCard,
    refundCountInWallet: data.refundCountInWallet,
    discount: data.discount,
    charges: data.chargeTotal,
    chargeVat: data.chargeVat,
    chargesWithoutVat: data.chargesWithoutVat,
    totalVatWithoutDiscount: data.totalVatWithoutDiscount,
    totalVat: data?.totalVat - data?.refundedVatOnCharge,
    totalOrder: data.totalOrder,
    noOfRefund: data.noOfRefund,
    noOfDiscount: data.noOfDiscount,
    totalRevenue:
      data?.netSales +
      data?.totalVat +
      data?.chargesWithoutVat -
      data?.refundedCharges,
    pickup: {
      name: "Pickup",
      amount: data.pickup.amount,
      count: data.pickup.count,
    },
    delivery: {
      name: "Delivery",
      amount: data.delivery.amount,
      count: data.delivery.count,
    },
    walkin: {
      name: "Walk-in",
      amount: data.walkin.amount,
      count: data.walkin.count,
    },
    takeaway: {
      name: "Takeaway",
      amount: data.takeaway.amount,
      count: data.takeaway.count,
    },
    "dine-in": {
      name: "Dine-in",
      amount: data?.["dine-in"].amount,
      count: data?.["dine-in"].count,
    },
    netSales:
      data?.netSales +
      data?.chargesWithoutVat -
      data?.refundedCharges +
      data?.refundedVatOnCharge,
    netSalesWithoutDiscount: data.netSalesWithoutDiscount,
    totalShift: data.totalShift,
    txnWithCard: data.txnWithCard,
    txnWithCash: data.txnWithCash,
    txnWithWallet: data.txnWithWallet,
    txnCountInCard: data.txnCountInCard,
    txnCountInCash: data.txnCountInCash,
    txnCountInWallet: data.txnCountInWallet,
    cashiers: cashiers?.join(",") || "",
    txnStats: data?.txnStats || [],
    refundData: data?.refundData || [],
  };

  return dataObj;
}

export const SendSalesSummaryReceiptModal: React.FC<
  SendSalesSummaryReceiptModalProps
> = ({
  open,
  modalData,
  handleClose,
  startDate,
  endDate,
  locationRef,
  userName,
  printedBy,
}) => {
  const { t } = useTranslation();

  const [country, setCountry] = useState("+966");

  const formik = useFormik({
    initialValues: {
      type: "",
      email: "",
      phone: "",
    },

    onSubmit: async (values) => {
      const { cashiers, ...otherModalData } = modalData;

      if (locationRef == "all") {
        toast.error(t("Select a location"));
        return;
      }

      if (values.type == "email" && values.email == "") {
        toast.error(`${t("Email should not be empty")}`);
        return;
      }

      if (values.type == "sms" && values.phone == "") {
        toast.error(`${t("Phone should not be empty")}`);
        return;
      }

      try {
        const res = await serviceCaller(endpoint.sendSalesSummaryReceipt.path, {
          method: endpoint.sendSalesSummaryReceipt.method,
          body: {
            sales: salesSummaryData(
              otherModalData,
              startDate,
              endDate,
              userName,
              cashiers,
              printedBy
            ),
            printedOn: format(new Date(), "dd-MM-yyyy, h:mm a"),
            type: SendReceiptViaEnum[values.type],
            locationRef: locationRef,
            value:
              values.type == "email"
                ? values.email
                : parsePhoneNumber(country, values.phone),
          },
        });

        if (res) {
          toast.success(`${"Receipt Sent Successfully"}`);
          handleClose();
        }
      } catch (err) {
        toast.error(err.message);
      }
    },

    validationSchema: Yup.object().shape({
      type: Yup.string().required(t("Sent Via is required")),
      phone: Yup.string().when("type", {
        is: "sms",
        then: Yup.string()
          .min(9, `${t("Phone Number should be minimum 9 digits")}`)
          .max(12, `${t("Phone Number should be maximum 12 digits")}`)
          .required(`${t("Phone number is required")}`),
        otherwise: Yup.string().optional(),
      }),
      email: Yup.string().when("type", {
        is: "email",
        then: Yup.string()
          .email(`${t("Must be a valid email")}`)
          .max(255)
          .required(`${t("Email is required")}`),
        otherwise: Yup.string().optional(),
      }),
    }),
  });

  const handleChangeCountry = (event: any) => {
    setCountry(event.target.value);
  };

  useEffect(() => {
    formik.resetForm();
  }, [open]);

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "70vw",
              md: "55vw",
              lg: "45vw",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 4,
          }}
        >
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={handleClose}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h5" align="center" sx={{ mr: 4 }}>
                {t("Send Receipt")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 3 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, mr: 4 }}>
              {t("Sent via")}
            </Typography>

            <FormControl>
              <RadioGroup
                name="type"
                onChange={(e) => {
                  formik.handleChange("type")(e.target.value);
                }}
                value={formik.values.type}
                row
              >
                <FormControlLabel
                  value="sms"
                  control={<Radio />}
                  label={t("Phone")}
                />
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label={t("Email")}
                />
              </RadioGroup>
            </FormControl>

            {Boolean(formik.touched.type) && (
              <Typography
                color="error.main"
                sx={{
                  fontSize: "12px",
                  fontWeight: 500,
                  margin: "5px 14px 0 14px",
                }}
              >
                {formik.errors.type}
              </Typography>
            )}
          </Box>

          {formik.values.type == "sms" && (
            <Box>
              <PhoneInput
                touched={formik.touched.phone}
                error={formik.errors.phone}
                value={formik.values.phone}
                onBlur={formik.handleBlur("phone")}
                country={country}
                handleChangeCountry={handleChangeCountry}
                onChange={formik.handleChange("phone")}
                required
                label={t("Phone")}
              />
            </Box>
          )}

          {formik.values.type == "email" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t("Email")}
                name="email"
                sx={{ flexGrow: 1 }}
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                required
                value={formik.values.email}
              />
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 5 }}>
            <Button
              color="inherit"
              disabled={formik.isSubmitting}
              sx={{ mr: 2 }}
              onClick={() => {
                handleClose();
              }}
            >
              {t("Cancel")}
            </Button>

            <Button
              variant="contained"
              disabled={formik.isSubmitting}
              onClick={() => {
                formik.handleSubmit();
              }}
              sx={{ ml: 1.5 }}
            >
              {formik.isSubmitting ? t("Sending....") : t("Send Receipt")}
            </Button>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
