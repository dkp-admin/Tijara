import { Button, Card, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import * as Yup from "yup";
import CustomerDropdown from "../input/customer-auto-complete";
import CreateCustomerModal from "./create-customer-modal";
import CloseIcon from "@mui/icons-material/Close";
import { bgcolor } from "@mui/system";

interface AddCustomerModalProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  companyRef?: string;
  companyName?: string;
  onClose?: any;
}

interface UpdateCustomerInOrder {
  orderId?: string;
  customer: string;
  phone: string;
  vat: string;
  customerRef: string;
  totalOrder: any;
  totalSpent: any;
  lastOrderDate: Date;
  totalRefunded: any;
}

const validationSchema = Yup.object({
  customerRef: Yup.string().required(`${i18n.t("Please Select Customer")}`),
});

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  open,
  modalData,
  handleClose,
  companyRef,
  companyName,
  onClose,
}) => {
  const { t } = useTranslation();
  const [openCreateCustomerModal, setOpenCreateCustomerModal] = useState(false);

  const { updateEntity, loading } = useEntity("order");
  const { updateEntity: updateCustomer } = useEntity("customer");

  const initialValues: UpdateCustomerInOrder = {
    customerRef: "",
    customer: "",
    phone: "",
    vat: "",
    totalOrder: null,
    totalSpent: null,
    totalRefunded: null,
    lastOrderDate: new Date(),
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const data = {
        companyRef: companyRef,
        customer: {
          name: values.customer,
          phone: values.phone,
          vat: values.vat,
        },
        customerRef: values.customerRef,
      };
      const customerData = {
        companyRef: companyRef,
        customer: {
          name: values.customer,
          vat: values.vat,
        },
        customerRef: values.customerRef,
        totalOrder: formik.values.totalOrder + 1,
        totalSpent: formik.values.totalSpent + modalData?.payment?.total,
        lastOrderDate: formik.values.lastOrderDate,
      };

      try {
        await updateEntity(modalData?._id?.toString(), { ...data });
        toast.success(t("Customer Added to Order").toString());

        await updateCustomer(values.customerRef?.toString(), {
          ...customerData,
        });
        handleClose();
        onClose();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  return (
    <Box>
      <Modal
        sx={{ borderRadius: 2 }}
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description">
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "50vw",
              sm: "40vw",
              md: "35vw",
            },
            height: {
              xs: "40vh",
              sm: "35vh",
              md: "30vh",
            },
            bgcolor: "background.paper",
            overflow: "inherit",
            p: 2,
            borderRadius: 1,
          }}>
          <Box sx={{ width: "100%", display: "flex" }}>
            <Box style={{ flex: 1 }}>
              <Typography variant="h6" align="center" sx={{ ml: 1 }}>
                {t("Add Customer")}
              </Typography>
            </Box>

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
              }}>
              <CloseIcon fontSize="medium" onClick={handleClose} />
            </Box>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 3 }}>
            <CustomerDropdown
              handleBlur={formik.handleBlur}
              companyRef={companyRef}
              required
              error={formik?.touched?.customerRef && formik.errors.customerRef}
              onChange={(
                id: string,
                name: string,
                phone: string,
                vat: string,
                totalOrder: any,
                totalSpent: any
              ) => {
                formik.handleChange("customerRef")(id || "");
                formik.handleChange("customer")(name || "");
                formik.handleChange("phone")(phone || "");
                formik.setFieldValue("vat", vat || "");
                formik.setFieldValue("totalOrder", totalOrder || 0.0);
                formik.setFieldValue("totalSpent", totalSpent || 0.0);
              }}
              selectedId={formik.values.customerRef}
              selectedName={formik.values.customer}
              label={t("Customer")}
              id="Customer"
            />
          </Box>

          <Divider sx={{ mt: 6, width: "100%" }} />
          <Box
            sx={{
              bgcolor: "background.paper",
              borderBottomRightRadius: 5,
              borderBottomLeftRadius: 5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "inherit",
              bottom: 0,
              width: "100%",
              ml: -2,
              p: 2,
            }}>
            <Button
              sx={{ borderRadius: 1 }}
              onClick={() => {
                setOpenCreateCustomerModal(true);
              }}>
              {t("Create Customer")}
            </Button>
            <Button
              sx={{ borderRadius: 1 }}
              onClick={() => {
                formik.handleSubmit();
              }}
              variant="contained">
              {t("Add")}
            </Button>
          </Box>
        </Card>
      </Modal>
      <CreateCustomerModal
        companyName={companyName}
        companyRef={companyRef}
        open={openCreateCustomerModal}
        setOpenCreateCustomerModal={(res: any) => {
          setOpenCreateCustomerModal(res);
        }}
      />
    </Box>
  );
};
