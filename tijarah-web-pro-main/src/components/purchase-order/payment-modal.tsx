import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  MenuItem,
  Modal,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "react-query";
import { useEntity } from "src/hooks/use-entity";
import { Screens } from "src/utils/screens-names";
import * as Yup from "yup";
import TextFieldWrapper from "../text-field-wrapper";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface PurchaseOrder {
  paymentamount: number;
  paymentnote: string;
  paymenttype: string;
}

const validationSchema = Yup.object({
  // billToRef: Yup.string().required(`${i18n.t("Bill To is required")}`),
});

interface PaymentModalProps {
  open: boolean;
  handleClose?: any;
  paymentType?: string;
  total?: any;
  fullAmount?: any;
  companyRef: string;
  ordertype: string;
}

// Payment method options will be loaded from API

export const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  handleClose,
  paymentType,
  total,
  fullAmount,
  companyRef,
  ordertype,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const currency = useCurrency();

  const { updateEntity: updatePaymentEntity } = useEntity(
    "purchase-order/partial-payment"
  );
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");

  // Fetch payment types from API
  useEffect(() => {
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  const MODE_TYPE_LIST = useMemo(() => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      return paymentTypesData.results.map((paymentType: any) => ({
        key: (paymentType.name?.en || paymentType.name)
          .toLowerCase()
          .replace(/\s+/g, ""),
        value: paymentType.name?.en || paymentType.name,
      }));
    }
    return [
      { key: "cash", value: "Cash" },
      { key: "card", value: "Card" },
      { key: "banktransfer", value: "Bank Transfer" },
    ];
  }, [paymentTypesData]);

  const initialValues: PurchaseOrder = {
    paymentamount: 0,
    paymentnote: "",
    paymenttype: "cash",
  };

  const formik: any = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const paymentdata = {
        amount: Number(values.paymentamount),
        note: values.paymentnote,
        providerName: values.paymenttype,
        type: ordertype,
        companyRef: companyRef,
      };

      try {
        if (id != null && values.paymentamount > 0) {
          await updatePaymentEntity(id?.toString(), { ...paymentdata });
        }
        if (paymentType === "full") {
          toast.success(`${"Payment Updated"}`);
        } else {
          toast.success(`${"Payment Updated Partially"}`);
        }
        queryClient.invalidateQueries("find-one-purchase-order");
        handleClose();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    if (paymentType === "full") {
      formik.setFieldValue("paymentamount", fullAmount);
    }
  }, [open]);

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
              {t("Payment")}
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
              <Box sx={{ mt: 2, mx: 0.5 }}>
                <TextFieldWrapper
                  fullWidth
                  label={t("Amount")}
                  disabled={paymentType === "full"}
                  name="paymentamount"
                  error={Boolean(
                    formik.touched.paymentamount && formik.errors.paymentamount
                  )}
                  helperText={
                    (formik.touched.paymentamount &&
                      formik.errors.paymentamount) as any
                  }
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value >= 0 || e.target.value === "") {
                      formik.handleChange(e);
                    }
                  }}
                  value={formik.values.paymentamount}
                  InputProps={{
                    startAdornment: (
                      <Typography
                        color="textSecondary"
                        variant="body2"
                        sx={{ mr: 1, mt: 2.4 }}
                      >
                        {currency}
                      </Typography>
                    ),
                  }}
                  placeholder="0.00"
                  onKeyPress={(event): void => {
                    const ascii = event.charCode;
                    const value = (event.target as HTMLInputElement).value;
                    const decimalCheck = value.indexOf(".") !== -1;

                    if (decimalCheck) {
                      const decimalSplit = value.split(".");
                      const decimalLength = decimalSplit[1].length;
                      if (decimalLength > 1 || ascii === 46) {
                        event.preventDefault();
                      } else if (ascii < 48 || ascii > 57) {
                        event.preventDefault();
                      }
                    } else if (value.length > 9 && ascii !== 46) {
                      event.preventDefault();
                    } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                      event.preventDefault();
                    }
                  }}
                />
              </Box>

              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  autoComplete="off"
                  fullWidth
                  label={t("Note")}
                  name="paymentnote"
                  error={Boolean(
                    formik.touched.paymentnote && formik.errors.paymentnote
                  )}
                  helperText={
                    (formik.touched.paymentnote &&
                      formik.errors.paymentnote) as any
                  }
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  value={formik.values.paymentnote}
                />
              </Box>

              <Box sx={{ mt: 3, mx: 0.5 }}>
                <TextFieldWrapper
                  inputProps={{
                    style: { textTransform: "capitalize" },
                  }}
                  autoComplete="off"
                  fullWidth
                  label={t("Payment Method")}
                  name="paymenttype"
                  onChange={(e) => {
                    formik.handleChange(e);
                  }}
                  select
                  value={formik.values.paymenttype}
                >
                  {MODE_TYPE_LIST.map((option) => (
                    <MenuItem key={option.key} value={option.key}>
                      {option.value}
                    </MenuItem>
                  ))}
                </TextFieldWrapper>
              </Box>
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
              type="submit"
              onClick={(e) => {
                e.preventDefault();

                if (formik.values.paymentamount > total) {
                  return toast.error(
                    t("Amount cannot be grater then total Amount")
                  );
                }
                if (formik.values.paymentamount < 0.1) {
                  return toast.error(t("Amount cannot be Zero"));
                }
                formik.handleSubmit();
                handleClose();
              }}
              loading={formik.isSubmitting}
              sx={{ borderRadius: 1 }}
              variant="contained"
            >
              {t("Continue")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
