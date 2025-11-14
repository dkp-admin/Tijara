import { Button, Card, Divider } from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import React from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ModifiersMultiSelect from "../input/modifiers-multiSelect";

interface AddMOdifierModalProps {
  open?: boolean;
  companyRef?: string;
  handleClose?: () => void;
  handleModifierSubmit?: any;
  modifiersData?: any;
}

interface AddModifier {
  assignedToAllModifiers: boolean;
  modifierRefs?: string[];
  modifiers?: string[];
}

export const AddModifierModal: React.FC<AddMOdifierModalProps> = ({
  open,
  companyRef,
  handleClose,
  handleModifierSubmit,
  modifiersData,
}) => {
  const { t } = useTranslation();

  const addedModifiersRefs = modifiersData?.map((d: any) => {
    console.log(d);

    console.log(d?._id);
    const ids = d?.modifierRef;
    return ids;
  });

  console.log(addedModifiersRefs);

  const initialValues: AddModifier = {
    assignedToAllModifiers: false,
    modifierRefs: [],
    modifiers: [],
  };

  const formik = useFormik({
    initialValues,
    onSubmit: async (values): Promise<void> => {
      const modifiers = values.modifiers;
      console.log(modifiers);

      try {
        handleModifierSubmit(modifiers);
        toast.success(t("Modifier Added to Product.").toString());

        handleClose();
      } catch (err) {
        toast.error(err.message);
      }
    },
  });

  return (
    <Box>
      <Modal
        open={open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "60vw",
              sm: "50vw",
              md: "45vw",
            },
            maxHeight: {
              xs: "95vh",
              sm: "95vh",
              md: "90vh",
            },
            bgcolor: "background.paper",
            overflow: "inherit",
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
                {t("Add Modifiers")}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mt: 2 }} />

          <Box sx={{ mt: 3, mb: 6 }}>
            <ModifiersMultiSelect
              addedModifierRefs={addedModifiersRefs}
              showAllModifiers={formik.values.assignedToAllModifiers}
              companyRef={companyRef}
              selectedIds={formik?.values?.modifierRefs as any}
              required
              id={"modifier-multi-select"}
              error={
                formik?.touched?.modifierRefs && formik.errors.modifierRefs
              }
              onChange={(option: any, total: number) => {
                if (option?.length > 0) {
                  const ids = option?.map((option: any) => {
                    return option._id;
                  });

                  const names = option?.map((option: any) => {
                    return option.name.en;
                  });

                  if (ids.length == total) {
                    formik.setFieldValue("assignedToAllModifiers", true);
                  } else {
                    formik.setFieldValue("assignedToAllModifiers", false);
                  }

                  formik.setFieldValue("modifierRefs", ids);
                  formik.setFieldValue("modifiers", option);
                } else {
                  formik.setFieldValue("modifierRefs", []);
                  formik.setFieldValue("modifiers", []);
                  formik.setFieldValue("assignedToAllModifiers", false);
                }
              }}
            />
          </Box>

          <Box
            sx={{
              bgcolor: "background.paper",
              borderBottomRightRadius: 20,
              borderBottomLeftRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 1,
              position: "inherit",
              bottom: 10,
              width: "100%",
              ml: -4,
            }}
          >
            <Button
              sx={{
                ml: 2,
              }}
              color="inherit"
              onClick={() => {
                handleClose();
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              onClick={() => {
                if (formik.values?.modifiers?.length > 0) {
                  formik.handleSubmit();
                } else {
                  toast.error(t("Add a modifier"));
                }
              }}
              sx={{
                mr: 3,
              }}
              variant="contained"
            >
              {t("Add")}
            </Button>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
