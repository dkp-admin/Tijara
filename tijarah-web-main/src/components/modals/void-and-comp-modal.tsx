import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
  useTheme,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { FormikProps, useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";
import i18n from "src/i18n";
import { VoidAndCompType } from "src/utils/constants";
import * as Yup from "yup";
import ConfirmationDialog from "../confirmation-dialog";
import { id } from "date-fns/locale";

interface CompanyDocsProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  itemId?: any;
  handleRemoveItem?: any;
  companyRef: string;
  companyNameEn: string;
  companyNameAr: string;
}

interface DocumentDataProps {
  name?: string;
  type?: string;
  isDefault?: boolean;
  status: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required(i18n.t("Reason is required")),
  type: Yup.string().required(i18n.t("Type is required")),
});

export const VoidAndCompModal = (props: CompanyDocsProps) => {
  const { t } = useTranslation();
  const {
    open,
    modalData,
    handleClose,
    itemId,
    companyRef,
    companyNameEn,
    companyNameAr,
  } = props;
  const { updateEntity, create, deleteEntity, findOne, entity } =
    useEntity("void-comp");
  const [showDialogDeleteItem, setShowDialogDeleteItem] = useState(false);
  const theme = useTheme();

  const initialValues: DocumentDataProps = {
    name: "",
    type: "",
    isDefault: false,
    status: true,
  };

  const formik: FormikProps<DocumentDataProps> = useFormik<DocumentDataProps>({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const itemData = {
          reason: {
            en: values.name.trim(),
            ar: values.name.trim(),
          },
          type: values.type,
          companyRef: companyRef,
          company: {
            name:
              // {
              // en:
              companyNameEn,
            // ar: companyNameAr,
            // }
            // ,
          },
          isDefault: values.isDefault,
          status: values.status ? "active" : "inactive",
        };
        if (itemId != null) {
          await updateEntity(itemId.toString(), {
            ...itemData,
          });
        } else {
          await create({
            ...itemData,
          });
        }

        if (itemId) {
          toast.success("Reason Updated");
        } else {
          toast.success("Reason Created");
        }

        handleClose();
      } catch (error) {
        console.log("error", error);

        toast.error(error.message);
      }
    },
  });

  console.log("val", formik.values);

  const handleDeleteItem = async () => {
    try {
      await deleteEntity(itemId.toString());
      toast.success(`${t("Reason Deleted")}`);
      setShowDialogDeleteItem(false);
      handleClose();
    } catch (error) {
      toast.error(error.message);
      setShowDialogDeleteItem(false);
    }
  };

  useEffect(() => {
    if (itemId != null) {
      findOne(itemId?.toString());
    }
  }, [itemId, open]);

  useEffect(() => {
    if (open) {
      formik.resetForm();
      if (entity) {
        formik.setFieldValue("name", entity?.reason?.en);
        formik.setFieldValue("type", entity?.type);
        formik.setFieldValue("isDefault", entity?.isDefault);
        formik.setFieldValue(
          "status",
          entity?.status == "active" ? true : false
        );
      }
    }
  }, [open, entity]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          formik.resetForm();
          handleClose();
        }}
      >
        {/* header */}

        <Box
          sx={{
            display: "flex",
            px: 2,
            mt: 2,
            mb: 2,
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
            {itemId ? t("Edit Reason") : t("Create Reason")}
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
          <form onSubmit={() => formik.handleSubmit()}>
            <Stack spacing={2}>
              <Box>
                <TextField
                  error={!!(formik.touched.name && formik.errors.name)}
                  fullWidth
                  helperText={formik.touched.name && formik.errors.name}
                  label={t("Reason")}
                  name="name"
                  onBlur={formik.handleBlur}
                  onChange={(e) => {
                    formik.handleChange("name")(e.target.value);
                  }}
                  value={formik.values.name}
                  required
                />
              </Box>

              <Box sx={{ mt: 3 }}>
                <TextField
                  error={!!(formik.touched.type && formik.errors.type)}
                  fullWidth
                  select
                  helperText={formik.touched.type && formik.errors.type}
                  label={t("Type")}
                  name="type"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.type}
                  required
                >
                  {VoidAndCompType?.map((voidcomp) => (
                    <MenuItem key={voidcomp.value} value={voidcomp.value}>
                      {voidcomp.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {itemId && (
                <Box sx={{ mt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={8}>
                      <Stack spacing={0}>
                        <Typography variant="h6">{t("Status")}</Typography>
                        <Typography color="text.secondary" variant="body2">
                          {t("Change the status of the Reason")}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formik.values.status}
                            color="primary"
                            edge="end"
                            name="status"
                            onChange={() => {
                              formik.setFieldValue(
                                "status",
                                !formik.values.status
                              );
                            }}
                            sx={{
                              mr: 0.2,
                            }}
                          />
                        }
                        label={
                          formik.values.status ? t("Active") : t("Deactivated")
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Stack>
          </form>
        </DialogContent>

        <Divider />

        {/* footer */}
        <DialogActions
          sx={{
            p: 2,

            display: "flex",
            justifyContent: `${
              itemId && !formik.values.isDefault ? "space-between" : "flex-end"
            }`,
          }}
        >
          {itemId && !formik.values.isDefault && (
            <LoadingButton
              sx={{ borderRadius: 1 }}
              onClick={() => {
                setShowDialogDeleteItem(true);
              }}
              color="error"
              size="medium"
              variant="outlined"
              type="submit"
            >
              {t("Delete")}
            </LoadingButton>
          )}
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={() => {
              formik.handleSubmit();
            }}
            size="medium"
            variant="contained"
            type="submit"
          >
            {t("Save")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        show={showDialogDeleteItem}
        toggle={() => setShowDialogDeleteItem(!showDialogDeleteItem)}
        onOk={(e: any) => {
          handleDeleteItem();
        }}
        okButtonText={`${t("Delete")}`}
        cancelButtonText={t("Cancel")}
        title={t("Confirm Delete?")}
        text={t(
          "Are you sure you want to delete this? This action cannot be undone."
        )}
      />
    </>
  );
};
