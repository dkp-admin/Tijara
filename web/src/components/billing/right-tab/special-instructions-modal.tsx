import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Modal,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useFormik } from "formik";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useScanStore from "src/store/scan-store";
import * as Yup from "yup";
import CloseIcon from "@mui/icons-material/Close";

interface SpecialInstructionModalProps {
  data: string;
  open: boolean;
  handleClose: any;
  handleSuccess: any;
}

type SpecialInstructionFormikProps = {
  specialInstruction: string;
};

export const SpecialInstructionModal: React.FC<
  SpecialInstructionModalProps
> = ({ data, open = false, handleClose, handleSuccess }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setScan } = useScanStore();

  const formik = useFormik<SpecialInstructionFormikProps>({
    initialValues: {
      specialInstruction: "",
    },

    onSubmit: (values) => {
      handleSuccess(values.specialInstruction);
      toast.success(
        data ? t("Special Instruction updated") : t("Special Instruction added")
      );
    },

    validationSchema: Yup.object().shape({
      specialInstruction: Yup.string()
        .required(t("Special Instruction is required"))
        .max(
          70,
          t("Special Instruction must not be greater than 70 characters")
        ),
    }),
  });

  useEffect(() => {
    if (open) {
      formik.setValues({
        specialInstruction: data,
      });
    }
  }, [open, data]);

  return (
    <>
      <Box>
        {/* <Modal
          open={open}
          onClose={() => {
            handleClose();
          }}>
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "70vw",
                md: "60vw",
                lg: "45vw",
              },
              maxHeight: "90%",
              bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              px: 4,
              py: 3,
            }}>
            <Box
              sx={{
                bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              }}
              style={{ width: "100%", display: "flex" }}>
              <XCircle
                fontSize="small"
                onClick={() => {
                  handleClose();
                }}
                style={{ cursor: "pointer" }}
              />

              <Box sx={{ flex: 1, pl: "0px" }}>
                <Typography variant="h6" style={{ textAlign: "center" }}>
                  {t("Special Instruction")}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mt: 2 }} />

            <Box sx={{ mt: 2 }}>
              <TextField
                rows={4}
                required
                fullWidth
                multiline
                name="specialInstruction"
                label={t("Special Instructions")}
                error={Boolean(
                  formik.touched.specialInstruction &&
                    formik.errors.specialInstruction
                )}
                helperText={
                  (formik.touched.specialInstruction &&
                    formik.errors.specialInstruction) as any
                }
                value={formik.values.specialInstruction}
                onFocus={() => setScan(true)}
                onBlur={() => {
                  setScan(false);
                  formik.handleBlur("specialInstruction");
                }}
                onChange={(e) => formik.handleChange(e)}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3.5 }}>
              <LoadingButton
                sx={{ width: "25%" }}
                type="submit"
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();
                  formik.handleSubmit();
                }}>
                {data ? t("Update") : t("Add")}
              </LoadingButton>
            </Box>
          </Card>
        </Modal> */}

        <Dialog
          fullWidth
          maxWidth="sm"
          open={open}
          onClose={() => {
            handleClose();
          }}>
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
            }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}></Box>

            <Typography sx={{ ml: 2 }} variant="h6">
              {t("Special Instruction")}
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
              }}>
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  handleClose();
                }}
              />
            </Box>
          </Box>
          <Divider />
          {/* body */}
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                rows={4}
                required
                fullWidth
                multiline
                name="specialInstruction"
                label={t("Special Instructions")}
                error={Boolean(
                  formik.touched.specialInstruction &&
                    formik.errors.specialInstruction
                )}
                helperText={
                  (formik.touched.specialInstruction &&
                    formik.errors.specialInstruction) as any
                }
                value={formik.values.specialInstruction}
                onFocus={() => setScan(true)}
                onBlur={() => {
                  setScan(false);
                  formik.handleBlur("specialInstruction");
                }}
                onChange={(e) => formik.handleChange(e)}
              />
            </Box>
          </DialogContent>

          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
              p: 2,
            }}>
            <LoadingButton
              sx={{ borderRadius: 1 }}
              type="submit"
              variant="contained"
              onClick={(e) => {
                e.preventDefault();
                formik.handleSubmit();
              }}>
              {data ? t("Update") : t("Add")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
