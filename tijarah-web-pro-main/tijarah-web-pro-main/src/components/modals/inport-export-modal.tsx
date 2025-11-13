import { CheckCircle } from "@mui/icons-material";
import {
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  LinearProgress,
  MenuItem,
  Modal,
  Stack,
  Step,
  StepIcon,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import type { Theme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";

const Steps = [
  {
    title: "Initiated",
    icon: <CancelIcon style={{ color: "#f04438" }} />,
  },
  {
    title: "Processing",
    icon: <HourglassEmptyIcon />,
  },
  {
    title: "Completed",
    icon: <CheckCircleIcon style={{ color: "#00FF00" }} />,
  },
];
interface ImportExportModalProps {
  open: boolean;
  handleClose?: any;
  formik?: any;
  canUpdate?: any;
  canCreate?: any;
  paymentType?: string;
  total?: any;
  response?: any;
  importEntity?: any;
}

const renderDialogContent = (response: any, importEntity: any, t: any) => {
  const textimportEntity = importEntity
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (l: string) => l.toUpperCase());
  if (response?.invalidCols?.length > 0) {
    return (
      <Box id="alert-dialog-description">
        <Table>
          <TableBody>
            {response?.invalidCols?.map((error: any, index: any) => (
              <TableRow key={index}>
                <TableCell>
                  <Typography fontSize={"14px"} sx={{ textAlign: "left" }}>
                    {`${index + 1} : ${error.field} ${error.message}, Row:- ${
                      response?.row
                    }`}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }

  if (response?.code === "not_found") {
    return (
      <Typography fontSize={"14px"} sx={{ color: "#f04438" }}>{`${
        typeof response.value === "string"
          ? response.value
          : response?.value?.[0]
      }  is ${response?.code.replace("_", " ")} in the ${
        response?.field || response.context
      }`}</Typography>
    );
  }

  if (response?.code === "validation_error") {
    return (
      <Typography fontSize={"14px"} sx={{ color: "#f04438" }}>{`${
        typeof response.value === "string"
          ? response.context
          : response?.context?.[0]
      }  ${response?.message || response.value}`}</Typography>
    );
  }

  if (response?.code === "too_large") {
    return (
      <Typography
        fontSize={"14px"}
        sx={{
          color: "#f04438",
        }}>{`${textimportEntity} count should not exceed 15,000`}</Typography>
    );
  }

  if (response?.code === "no_data") {
    return (
      <Typography fontSize={"14px"} sx={{ color: "#f04438" }}>{`${t(
        "Not able to import empty sheet!"
      )}`}</Typography>
    );
  }

  if (response?.status === true) {
    return (
      <Typography
        fontSize={"14px"}
        sx={{ color: "#16b364" }}>{`${textimportEntity} ${t(
        "Imported Successfully!"
      )}`}</Typography>
    );
  }

  if (response?.statusCode === 500) {
    return (
      <Typography fontSize={"14px"} sx={{ color: "#f04438" }}>{`${t(
        "Something went wrong!"
      )}`}</Typography>
    );
  }

  return null;
};

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  open,
  handleClose,
  response,
  importEntity,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const [activeStep, setActiveStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  useEffect(() => {
    let timer: string | number | NodeJS.Timer;

    if (open) {
      setLoading(true);
      let progress = 0;
      const increment = 80 / 40;

      timer = setInterval(() => {
        if (progress < 80) {
          progress += increment;
          setProgressValue(progress);
        }
      }, 100);
      if (progress < 79) {
        setActiveStep(2);
      }
    }

    return () => {
      clearInterval(timer);
    };
  }, [open]);

  useEffect(() => {
    if (response?.status === true && progressValue == 80) {
      setProgressValue(100);
      setActiveStep(3);
    }
  }, [response, progressValue]);

  return (
    <>
      <Box>
        {/* <Modal open={open}>
          <Card
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: {
                xs: "95vw",
                sm: "60vw",
                md: "60vw",
                lg: "60vw",
              },
              maxHeight: "90%",
              bgcolor: theme.palette.mode !== "dark" ? `#f8f9fa` : "#0B0F19",
              overflow: "inherit",
              display: "flex",
              flexDirection: "column",
              p: 4,
            }}>
            <Box
              style={{
                flex: "0 0 auto",
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1,

                padding: "30px",
                paddingBottom: "12px",
                borderRadius: "20px",
              }}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <Box>
                  <Typography
                    variant="h6"
                    style={{ textAlign: "center" }}></Typography>
                </Box>
                <Box sx={{ flex: 1, pl: "20px" }}>
                  <Typography variant="h6" style={{ textAlign: "center" }}>
                    {t("Import progress")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="gray"
                    sx={{ fontSize: "13px", pl: 0.5, textAlign: "center" }}>
                    {t(
                      "Please do not close this window until the import is complete"
                    )}
                  </Typography>
                </Box>
                <Box>
                  {response && progressValue > 79 && (
                    <Button
                      onClick={() => {
                        setProgressValue(0);
                        handleClose();
                      }}
                      variant="outlined">
                      {t("Done")}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>


            <Box
              style={{
                flex: "1 1 auto",
                padding: 3,
                height: "100%",
                paddingTop: "50px",
                marginTop: "30px",
              }}>
              <div>
                <Stack alignItems="center" direction="row" spacing={2}>
                  <LinearProgress
                    value={progressValue || 0}
                    sx={{
                      flexGrow: 1,
                      height: 8,
                    }}
                    color={
                      !response
                        ? "primary"
                        : response?.status !== true && progressValue > 79
                        ? "error"
                        : "primary"
                    }
                    variant={"determinate"}
                  />
                  <Typography
                    color={
                      !response
                        ? "primary"
                        : response?.status !== true && progressValue > 79
                        ? "error"
                        : "primary"
                    }
                    variant="body2">
                    {progressValue}%
                  </Typography>
                </Stack>

                <Stepper
                  activeStep={activeStep}
                  orientation={lgUp ? "horizontal" : "vertical"}
                  sx={{
                    mt: 3,
                    "& .MuiStepLabel-iconContainer": {
                      pr: 3,
                    },
                    "& .MuiStepConnector-line": {
                      borderLeftColor: "divider",
                      borderLeftWidth: 2,
                    },
                  }}>
                  {Steps.map((step: any, index: number) => {
                    const isCompleted = index < activeStep;

                    return (
                      <Step key={step.title} completed={isCompleted}>
                        <StepLabel StepIconComponent={StepIcon}>
                          <Typography
                            color={
                              isCompleted ? "textPrimary" : "textSecondary"
                            }
                            variant="subtitle2">
                            {step.title}
                          </Typography>
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>

                {response && progressValue > 79 && (
                  <Box
                    sx={{
                      mt: 3,
                      textAlign: "center",
                      color: `${
                        response?.status === true ? "primary" : "error"
                      }`,
                    }}>
                    {renderDialogContent(response, importEntity, t)}
                  </Box>
                )}
              </div>
            </Box>
          </Card>
        </Modal> */}

        <Dialog fullWidth maxWidth="md" open={open}>
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

            <Box sx={{ flex: 1, pl: "20px" }}>
              <Typography variant="h6" style={{ textAlign: "center" }}>
                {t("Import progress")}
              </Typography>
              <Typography
                variant="body2"
                color="gray"
                sx={{ fontSize: "13px", pl: 0.5, textAlign: "center" }}>
                {t(
                  "Please do not close this window until the import is complete"
                )}
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
          {/* body */}
          <Divider />
          <DialogContent>
            <div>
              <Stack alignItems="center" direction="row" spacing={2}>
                <LinearProgress
                  value={progressValue || 0}
                  sx={{
                    flexGrow: 1,
                    height: 8,
                  }}
                  color={
                    !response
                      ? "primary"
                      : response?.status !== true && progressValue > 79
                      ? "error"
                      : "primary"
                  }
                  variant={"determinate"}
                />
                <Typography
                  color={
                    !response
                      ? "primary"
                      : response?.status !== true && progressValue > 79
                      ? "error"
                      : "primary"
                  }
                  variant="body2">
                  {progressValue}%
                </Typography>
              </Stack>

              <Stepper
                activeStep={activeStep}
                orientation={lgUp ? "horizontal" : "vertical"}
                sx={{
                  mt: 3,
                  "& .MuiStepLabel-iconContainer": {
                    pr: 3,
                  },
                  "& .MuiStepConnector-line": {
                    borderLeftColor: "divider",
                    borderLeftWidth: 2,
                  },
                }}>
                {Steps.map((step: any, index: number) => {
                  const isCompleted = index < activeStep;

                  return (
                    <Step key={step.title} completed={isCompleted}>
                      <StepLabel StepIconComponent={StepIcon}>
                        <Typography
                          color={isCompleted ? "textPrimary" : "textSecondary"}
                          variant="subtitle2">
                          {step.title}
                        </Typography>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>

              {response && progressValue > 79 && (
                <Box
                  sx={{
                    mt: 3,
                    textAlign: "center",
                    color: `${response?.status === true ? "primary" : "error"}`,
                  }}>
                  {renderDialogContent(response, importEntity, t)}
                </Box>
              )}
            </div>
          </DialogContent>
          {response && progressValue > 79 && <Divider />}
          <DialogActions sx={{ p: 2 }}>
            {response && progressValue > 79 && (
              <Button
                onClick={() => {
                  setProgressValue(0);
                  handleClose();
                }}
                variant="contained">
                {t("Done")}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};
