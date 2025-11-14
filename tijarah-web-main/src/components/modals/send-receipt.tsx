import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  useTheme,
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
import CloseIcon from "@mui/icons-material/Close";
import useScanStore from "src/store/scan-store";
import modifiers from "../company/catalogue/modifiers";

const SendReceiptViaEnum: any = {
  sms: "sms",
  email: "email",
};

interface SendReceiptModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  type?: string;
}

export const SendReceiptModal: React.FC<SendReceiptModalProps> = ({
  open,
  modalData,
  handleClose,
  type,
}) => {
  const { t } = useTranslation();
  const { setScan } = useScanStore();
  const theme = useTheme();
  const [country, setCountry] = useState("+966");

  const formik = useFormik({
    initialValues: {
      type: "",
      email: "",
      phone: "",
    },

    onSubmit: async (values) => {
      const { createdAt, ...otherModalData } = modalData;

      const formattedCreatedAt = format(
        new Date(createdAt),
        "h:mma yyyy-MM-dd"
      );

      if (values.type == "email" && values.email == "") {
        toast.error(`${t("Email should not be empty")}`);
        return;
      }

      if (values.type == "sms" && values.phone == "") {
        toast.error(`${t("Phone should not be empty")}`);
        return;
      }

      try {
        const res = await serviceCaller(endpoint.sendReceipt.path, {
          method: endpoint.sendReceipt.method,
          body: {
            order: {
              ...otherModalData,
              createdAt: formattedCreatedAt,
            },
            type: SendReceiptViaEnum[values.type],
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
            {t("Send Receipt")}
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
                onBlur={
                  type === "billing"
                    ? () => setScan(false)
                    : formik.handleBlur("phone")
                }
                country={country}
                handleChangeCountry={handleChangeCountry}
                onChange={formik.handleChange("phone")}
                required
                label={t("Phone")}
                onFocus={type === "billing" ? () => setScan(true) : () => {}}
              />
            </Box>
          )}

          {formik.values.type == "email" && (
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={t("Email")}
                name="email"
                error={Boolean(formik.touched.email && formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                onBlur={
                  type === "billing"
                    ? () => setScan(false)
                    : formik.handleBlur("phone")
                }
                onChange={formik.handleChange}
                required
                value={formik.values.email}
                onFocus={type === "billing" ? () => setScan(true) : () => {}}
              />
            </Box>
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
          <Button
            variant="contained"
            disabled={formik.isSubmitting}
            onClick={() => {
              formik.handleSubmit();
            }}
            sx={{ borderRadius: 1 }}
          >
            {formik.isSubmitting ? t("Sending....") : t("Send Receipt")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
