import { LoadingButton } from "@mui/lab";
import {
  Card,
  Modal,
  Typography,
  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  useTheme,
} from "@mui/material";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import React from "react";
import { Scrollbar } from "src/components/scrollbar";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface SuccessModalComponentProps {
  open: boolean;
  onViewList?: any;
  hasId?: boolean;
  formik?: any;
  handleClose: any;
}

export const ProductUpdateModalComponent: React.FC<
  SuccessModalComponentProps
> = ({ open, onViewList, handleClose, formik }) => {
  const { t } = useTranslation();
  const currency = useCurrency();

  const theme = useTheme();

  return (
    <Box>
      <Modal open={open}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {
              xs: "95vw",
              sm: "65vw",
              md: "55vw",
              lg: "55vw",
            },
            bgcolor: "background.paper",
            overflowY: "auto",
            p: 4,
            textAlign: "center",
          }}
        >
          <Box
            style={{
              flex: "0 0 auto",
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              background: theme.palette.mode !== "dark" ? `#fff` : "#111927",
              padding: "20px 30px",
              paddingBottom: "12px",
              borderRadius: "20px",
            }}
          >
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <XCircle
                fontSize="small"
                onClick={() => {
                  handleClose();
                }}
                style={{ cursor: "pointer" }}
              />

              <Box sx={{ flex: 1, pl: "30px" }}>
                <Typography variant="h6" align="center" sx={{ mr: 4, mb: 2 }}>
                  {t("Update Price")}
                </Typography>
              </Box>
              <LoadingButton
                type="submit"
                onClick={(e) => {
                  e.preventDefault();

                  formik.handleSubmit();
                }}
                loading={formik.isSubmitting}
                sx={{ m: 1 }}
                variant="contained"
              >
                {t("Update")}
              </LoadingButton>
            </Box>
          </Box>
          <Box sx={{ width: "100%", mt: 8 }}>
            <Scrollbar sx={{ maxHeight: "50vh" }}>
              <Table sx={{ width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="subtitle2">{t("")}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Product")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Old Cost Price")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Cost Price")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Old Selling Price")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">
                        {t("Selling Price")}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <React.Fragment>
                    {formik.values.variants.map(
                      (variant: any, vIdx: number) => (
                        <TableRow key={`variant_${vIdx}`}>
                          <TableCell>
                            <Checkbox
                              checked={variant.status === "active"}
                              onBlur={formik.handleBlur}
                              onChange={(e) => {}}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ textTransform: "capitalize" }}>
                              {variant.product?.en}{" "}
                              {variant.hasMultipleVariants
                                ? variant.name.en
                                : ""}
                              ,{variant.sku}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ minWidth: "120px" }}>
                            <TextField
                              variant="standard"
                              value={variant.costPrice}
                              error={Boolean(
                                formik.touched.costPrice &&
                                  formik.errors.costPrice
                              )}
                              helperText={
                                formik.touched.costPrice &&
                                formik.errors.costPrice
                              }
                              onBlur={formik.handleBlur}
                              onChange={(e): void => {}}
                              onKeyPress={(event): void => {
                                const ascii = event.charCode;
                                const value = (event.target as HTMLInputElement)
                                  .value;
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
                                } else if (
                                  (ascii < 48 || ascii > 57) &&
                                  ascii !== 46
                                ) {
                                  event.preventDefault();
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                    sx={{ mr: 1 }}
                                  >
                                    {currency}
                                  </Typography>
                                ),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: "120px" }}>
                            {`${currency} ${toFixedNumber(variant.price)}`}
                          </TableCell>
                          <TableCell sx={{ minWidth: "120px" }}>
                            {`${currency} ${toFixedNumber(variant.price)}`}
                          </TableCell>
                          <TableCell sx={{ minWidth: "120px" }}>
                            {`${currency} ${toFixedNumber(variant.price)}`}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </React.Fragment>
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>
        </Card>
      </Modal>
    </Box>
  );
};
