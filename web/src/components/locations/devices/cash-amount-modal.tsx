import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import CloseIcon from "@mui/icons-material/Close";

interface CashAmountMoadlProps {
  open?: boolean;
  handleClose?: () => void;
  handleToggleSwitch?: any;
  formik?: any;
}

export const CashAmountMoadl = (props: CashAmountMoadlProps) => {
  const { t } = useTranslation();
  const { open, formik, handleClose } = props;
  const [inputValue, setInputValue] = useState("0");
  const theme = useTheme();

  const handleAddAmount = () => {
    formik.setFieldValue("startingCash", Number(inputValue).toFixed(2));
    formik.setFieldValue("cashManagement", true);
    setInputValue("0");
    handleClose();
  };

  return (
    <>
      {/* <Modal
        open={open}
        onClose={() => {
          handleClose();
        }}>
        <Box>
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
              overflowY: "auto",
              p: 4,
            }}>

            <Box style={{ display: "flex", justifyContent: "space-between" }}>
              <XCircle
                fontSize="small"
                onClick={() => {
                  handleClose();
                }}
                style={{ cursor: "pointer" }}
              />
              <Typography variant="h6" style={{ textAlign: "center" }}>
                {`${t("Add Amount")}`}
              </Typography>
              <Box>
                <Button onClick={handleAddAmount}>{t("Add")}</Button>
              </Box>
            </Box>

            <Divider style={{ marginTop: "20px" }} />

            <Box
              style={{
                marginTop: 0,
                marginBottom: 10,
                width: "100%",
              }}>
              <TextField
                autoComplete="off"
                fullWidth
                required
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
                  } else if (value.length > 7 && ascii !== 46) {
                    event.preventDefault();
                  } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                    event.preventDefault();
                  }
                }}
                label={t("Cash Amount")}
                name="cashAmount"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "+" || e.key === "-") {
                    e.preventDefault();
                  }
                }}
                value={inputValue}
              />
            </Box>
          </Card>
        </Box>
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
            p: 2,
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
            {`${t("Add Amount")}`}
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
            <CloseIcon fontSize="medium" onClick={handleClose} />
          </Box>
        </Box>

        <Divider />

        {/* body */}
        <DialogContent>
          <TextField
            autoComplete="off"
            fullWidth
            required
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
              } else if (value.length > 7 && ascii !== 46) {
                event.preventDefault();
              } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                event.preventDefault();
              }
            }}
            label={t("Cash Amount")}
            name="cashAmount"
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "+" || e.key === "-") {
                // Prevent the default action for these keys
                e.preventDefault();
              }
            }}
            value={inputValue}
          />
        </DialogContent>

        <Divider />

        {/* footer */}
        <DialogActions sx={{ p: 2 }}>
          <Button
            size="medium"
            variant="contained"
            type="submit"
            sx={{ borderRadius: 1 }}
            onClick={handleAddAmount}>
            {t("Add")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
