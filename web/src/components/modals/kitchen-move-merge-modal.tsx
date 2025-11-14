import CloseIcon from "@mui/icons-material/Close";
import { Button, Card, CircularProgress, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import * as Yup from "yup";
import KitchenDropdown from "../input/kitchen-auto-complete";
import { useQueryClient } from "react-query";
import { LoadingButton } from "@mui/lab";

interface KitchenModalProps {
  products: any[];
  categories: any[];
  open: boolean;
  companyRef: string;
  modalData: any;
  onSuccess: any;
  handleClose: () => void;
}

interface KitchenProps {
  kitchenRef: string;
  kitchenNameEn: string;
  kitchenNameAr: string;
}

const validationSchema = Yup.object({
  kitchenRef: Yup.string().required(`${i18n.t("Please Select Kitchen")}`),
});

export const KitchenMoveMergeModal: React.FC<KitchenModalProps> = ({
  open,
  companyRef,
  modalData,
  onSuccess,
  handleClose,
  products,
  categories,
}) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  // console.log("products", products);
  // console.log("categories", categories);

  const { create: deleteOrAssign } = useEntity(
    "kitchen-management/delete-or-assign"
  );

  const initialValues: KitchenProps = {
    kitchenRef: "",
    kitchenNameEn: "",
    kitchenNameAr: "",
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values): Promise<void> => {
      const newProductRefs = products?.map((d) => d?.productRef);
      const newCategoryRefs = categories?.map((d) => d?.categoryRef);

      const data = {
        id: modalData?.kitchenGroupId?.toString(),
        mode: "assign",
        kitchenRef: formik.values.kitchenRef,
        productsData: products,
        productRefs: newProductRefs,
        name: {
          en: formik.values.kitchenNameEn,
          ar: formik.values.kitchenNameAr,
        },
        categoryRefs: newCategoryRefs,
        categoriesData: categories,
      };

      try {
        await deleteOrAssign({ ...data });
        queryClient.invalidateQueries("find-kitchen-management");
        onSuccess();
        toast.success(t("Kitchen move & merge successfully"));
      } catch (err) {
        console.error("Error in kitchen move & merge:", err);
        toast.error(err.message);
      }
    },
  });

  useEffect(() => {
    formik.resetForm();
  }, [open]);

  return (
    <Box>
      <Modal
        sx={{ borderRadius: 2 }}
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card
          sx={{
            p: 2,
            borderRadius: 1,
            overflow: "inherit",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "90vw",
              sm: "60vw",
              md: "35vw",
            },
            height: {
              xs: "25vh",
              sm: "35vh",
              md: "28vh",
            },
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ width: "100%", display: "flex" }}>
            <Box style={{ flex: 1 }}>
              <Typography variant="h6" align="center" sx={{ ml: 1 }}>
                {t("Kitchen")}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "&:hover": {
                  opacity: 0.5,
                  cursor: "pointer",
                  backgroundColor: "action.hover",
                },
              }}
            >
              <CloseIcon fontSize="medium" onClick={handleClose} />
            </Box>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 3 }}>
            <KitchenDropdown
              required
              id="kitchen"
              label={t("Kitchen")}
              companyRef={companyRef}
              locationRef={modalData?.locationRef}
              moveKitchenId={modalData?.kitchenGroupId}
              handleBlur={formik.handleBlur}
              error={formik?.touched?.kitchenRef && formik.errors.kitchenRef}
              onChange={(id: string, name: any) => {
                formik.handleChange("kitchenRef")(id || "");
                formik.handleChange("kitchenNameEn")(
                  (name?.en as string) || ""
                );
                formik.handleChange("kitchenNameAr")(
                  (name?.ar as string) || ""
                );
              }}
              selectedId={formik.values.kitchenRef}
              selectedName={formik.values.kitchenNameEn}
            />
          </Box>

          <Divider sx={{ mt: 4.5 }} />

          <Box
            sx={{
              p: 2,
              ml: -2,
              bottom: 0,
              width: "100%",
              display: "flex",
              position: "inherit",
              alignItems: "center",
              justifyContent: "flex-end",
              borderBottomLeftRadius: 5,
              borderBottomRightRadius: 5,
              bgcolor: "background.paper",
            }}
          >
            {formik.isSubmitting ? (
              <LoadingButton>Moving...</LoadingButton>
            ) : (
              <Button
                sx={{ borderRadius: 1 }}
                onClick={async () => {
                  await formik.handleSubmit();
                }}
                variant="contained"
              >
                {t("Move")}
              </Button>
            )}
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
