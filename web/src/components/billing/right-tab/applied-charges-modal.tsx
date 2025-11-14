import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  Divider,
  Modal,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import CloseIcon from "@mui/icons-material/Close";
import { useCurrency } from "src/utils/useCurrency";

interface AppliedChargesModalProps {
  charges: any[];
  open: boolean;
  handleClose: any;
}

export const AppliedChargeModal: React.FC<AppliedChargesModalProps> = ({
  charges,
  open = false,
  handleClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const currency = useCurrency();
  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getChargeValue = (data: any) => {
    const maxText = data.chargeType === "custom" ? `${t("Max")}. ` : "";

    if (data.type === "percentage") {
      return maxText + `${data.value}%`;
    } else {
      return maxText + `${currency} ${Number(data.value)?.toFixed(2)}`;
    }
  };

  return (
    <>
      <Box>
        <Dialog
          fullWidth
          maxWidth="sm"
          open={open}
          onClose={() => {
            handleClose();
          }}
        >
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
              {t("Applied Charges")}
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
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  handleClose();
                }}
              />
            </Box>
          </Box>

          <Divider />
          <DialogContent>
            <TableContainer>
              <Table>
                <TableBody>
                  {charges?.length > 0 ? (
                    charges?.map((data, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ width: "65%" }}>
                          <Typography variant="subtitle2">
                            {isRTL ? data.name.ar : data.name.en}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: "25%" }}>
                          <Typography variant="subtitle2">
                            {getChargeValue(data)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ width: "10%" }}>
                          <Button
                            onClick={() => {
                              cart.removeCharges(index, (charges: any) => {
                                trigger(
                                  "chargeRemoved",
                                  null,
                                  charges,
                                  null,
                                  null
                                );
                              });
                            }}
                            sx={{
                              p: 1,
                              borderRadius: 50,
                              minWidth: "auto",
                            }}
                          >
                            <SvgIcon
                              color={"error"}
                              fontSize="medium"
                              sx={{
                                m: "auto",
                                cursor: "pointer",
                              }}
                            >
                              <RemoveCircleIcon />
                            </SvgIcon>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        style={{
                          textAlign: "center",
                          borderBottom: "none",
                        }}
                      >
                        <Box sx={{ mt: 10, mb: 6 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h6"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Applied Charges!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};
