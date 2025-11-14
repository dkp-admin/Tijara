import { DeleteOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import PlusIcon from "@untitled-ui/icons-react/build/esm/Plus";
import XIcon from "@untitled-ui/icons-react/build/esm/X";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import generateUniqueId from "src/utils/generate-unique-id";
import { useCurrency } from "src/utils/useCurrency";

export function VolumetricPricingAddCard({ formik, onRemoveItem }: any) {
  const { t } = useTranslation();

  const theme = useTheme();

  const currency = useCurrency();

  const handleAddCustomRow = (idx: number) => {
    if (
      formik.values.items[idx]?.priceTable.length > 0 &&
      formik.values.items[idx]?.priceTable[
        formik.values.items[idx]?.priceTable.length - 1
      ].startQty &&
      formik.values.items[idx]?.priceTable[
        formik.values.items[idx]?.priceTable.length - 1
      ].endQty &&
      formik.values.items[idx]?.priceTable[
        formik.values.items[idx]?.priceTable.length - 1
      ].customPrice
    ) {
      formik.setFieldValue(`items[${idx}].priceTable`, [
        ...formik.values.items[idx].priceTable,
        {
          id: `${generateUniqueId(8)}`,
          startQty: null,
          endQty: null,
          customPrice: null,
        },
      ]);
    } else {
      toast.error(t("Please fill the last row before adding a new one."));
    }
  };

  const handleRemoveCustomRow = (id: any, idx: number) => {
    formik.setFieldValue(
      `items[${idx}].priceTable`,
      formik.values.items[idx].priceTable.filter((row: any) => row.id !== id)
    );
  };

  const handleCustomRowChange = (
    id: any,
    value: any,
    name: string,
    idx: number
  ) => {
    if (name == "startQty") {
      formik.setFieldValue(
        `items[${idx}].priceTable`,
        formik.values.items[idx]?.priceTable.map((row: any) =>
          row.id === id ? { ...row, startQty: value } : row
        )
      );
    } else if (name == "endQty") {
      formik.setFieldValue(
        `items[${idx}].priceTable`,
        formik.values.items[idx]?.priceTable.map((row: any) =>
          row.id === id ? { ...row, endQty: value } : row
        )
      );
    } else if (name === "customPrice") {
      formik.setFieldValue(
        `items[${idx}].priceTable`,
        formik.values.items[idx]?.priceTable.map((row: any) =>
          row.id === id ? { ...row, customPrice: value } : row
        )
      );
    }
  };

  return (
    <>
      <Box sx={{ mt: -2 }}>
        <Divider />
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "30%" }}>{t("Item details")}</TableCell>

              <TableCell sx={{ width: "30%" }}>{t("Selling price")}</TableCell>
              <TableCell sx={{ width: "30%" }}>{t("SKU")}</TableCell>

              <TableCell sx={{ width: "30%" }}>
                <TableRow>
                  <TableCell>{t("Start quantity")}</TableCell>
                  <TableCell>{t("End quantity")}</TableCell>
                  <TableCell>{t("Custom rate")}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableCell>
              <TableCell sx={{ width: "30%" }}>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formik?.values?.items?.map((d: any, idx: number) => {
              return (
                <TableRow key={d?.sku}>
                  <TableCell sx={{ verticalAlign: "top", pt: 4, width: "20%" }}>
                    {d?.name?.en}
                    {/* <Typography> */}
                    {/* {d?.type === "item" && `${d?.product?.en}, ${d?.name?.en}`}
                    {d?.type === "box" &&
                      `${d?.product?.name?.en}, ${d?.name[lng]}  [${t(
                        "Box"
                      )} - ${d?.qty} ${t("Unit(s)")}]`}
                    {d?.type === "crate" &&
                      `${d?.product?.name?.en}, ${d?.name[lng]}  [${t(
                        "Crate"
                      )} - ${d?.qty} ${t("Unit(s)")}]`} */}
                    {/* </Typography> */}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: "top", pt: 4, width: "20%" }}>
                    {d?.price || d?.sellingPrice}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: "top", pt: 4, width: "20%" }}>
                    {d?.sku}
                  </TableCell>
                  <TableCell sx={{ width: "50%" }}>
                    {d.priceTable?.map((row: any, index: number) => {
                      return (
                        <TableRow key={row?.id}>
                          <TableCell sx={{ borderBottom: "none" }}>
                            <TextField
                              name={"startQty"}
                              variant="standard"
                              sx={{
                                "& .MuiInput-underline:before": {
                                  borderBottom: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }!important`,
                                },
                              }}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= 8) {
                                  handleCustomRowChange(
                                    row.id,
                                    newValue,
                                    "startQty",
                                    idx
                                  );
                                }
                              }}
                              onKeyPress={(event): void => {
                                const ascii = event.charCode;
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                const decimalCheck = value.indexOf(".") !== -1;

                                // Prevent leading zero
                                if (value === "0" && ascii !== 46) {
                                  event.preventDefault();
                                }

                                if (decimalCheck) {
                                  const decimalSplit = value.split(".");
                                  const decimalLength = decimalSplit[1].length;
                                  // Prevent more than 1 decimal place or a second decimal point
                                  if (decimalLength > 1 || ascii === 46) {
                                    event.preventDefault();
                                  } else if (ascii < 48 || ascii > 57) {
                                    event.preventDefault();
                                  }
                                } else {
                                  // Prevent input if length exceeds 5 or if it's a non-numeric character except '.'
                                  if (value.length > 5 && ascii !== 46) {
                                    event.preventDefault();
                                  } else if (
                                    (ascii < 48 || ascii > 57) &&
                                    ascii !== 46
                                  ) {
                                    event.preventDefault();
                                  }
                                }

                                // Prevent leading zero if it is the first character
                                if (value === "" && ascii === 48) {
                                  event.preventDefault();
                                }

                                // Ensure that the value is greater than or equal to 1
                                if (value === "" && ascii === 46) {
                                  event.preventDefault();
                                }
                              }}
                              value={row.startQty}
                            />
                          </TableCell>

                          <TableCell sx={{ borderBottom: "none" }}>
                            <TextField
                              name={"endQty"}
                              value={row.endQty}
                              variant="standard"
                              sx={{
                                "& .MuiInput-underline:before": {
                                  borderBottom: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }!important`,
                                },
                              }}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= 8) {
                                  handleCustomRowChange(
                                    row.id,
                                    newValue,
                                    "endQty",
                                    idx
                                  );
                                }
                              }}
                              onKeyPress={(event): void => {
                                const ascii = event.charCode;
                                const value = (event.target as HTMLInputElement)
                                  .value;
                                const decimalCheck = value.indexOf(".") !== -1;

                                // Prevent leading zero
                                if (value === "0" && ascii !== 46) {
                                  event.preventDefault();
                                }

                                if (decimalCheck) {
                                  const decimalSplit = value.split(".");
                                  const decimalLength = decimalSplit[1].length;
                                  // Prevent more than 1 decimal place or a second decimal point
                                  if (decimalLength > 1 || ascii === 46) {
                                    event.preventDefault();
                                  } else if (ascii < 48 || ascii > 57) {
                                    event.preventDefault();
                                  }
                                } else {
                                  // Prevent input if length exceeds 5 or if it's a non-numeric character except '.'
                                  if (value.length > 5 && ascii !== 46) {
                                    event.preventDefault();
                                  } else if (
                                    (ascii < 48 || ascii > 57) &&
                                    ascii !== 46
                                  ) {
                                    event.preventDefault();
                                  }
                                }

                                // Prevent leading zero if it is the first character
                                if (value === "" && ascii === 48) {
                                  event.preventDefault();
                                }

                                // Ensure that the value is greater than or equal to 1
                                if (value === "" && ascii === 46) {
                                  event.preventDefault();
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ borderBottom: "none" }}>
                            <TextField
                              value={row.customPrice}
                              name={"customPrice"}
                              variant="standard"
                              sx={{
                                "& .MuiInput-underline:before": {
                                  borderBottom: `1px solid ${
                                    theme.palette.mode !== "dark"
                                      ? "#E5E7EB"
                                      : "#2D3748"
                                  }!important`,
                                },
                              }}
                              onChange={(e) => {
                                const newValue = e.target.value;
                                if (newValue.length <= 8) {
                                  handleCustomRowChange(
                                    row.id,
                                    newValue,
                                    "customPrice",
                                    idx
                                  );
                                }
                              }}
                              InputProps={{
                                startAdornment: (
                                  <Typography
                                    color="textSecondary"
                                    variant="body2"
                                    sx={{ mr: 1 }}
                                  >
                                    {row.type == "percentage"
                                      ? t("%")
                                      : currency}
                                  </Typography>
                                ),
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 0.5, borderBottom: "none" }}>
                            <IconButton
                              disabled={
                                formik.values.items[idx]?.priceTable?.length ===
                                1
                              }
                              sx={{ py: 0.5 }}
                              onClick={() =>
                                handleRemoveCustomRow(row?.id, idx)
                              }
                              color="error"
                            >
                              <SvgIcon>
                                <XIcon />
                              </SvgIcon>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableCell>

                  <TableCell
                    align="left"
                    sx={{ verticalAlign: "top", pt: 3, width: "20%" }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                      }}
                    >
                      <Button
                        startIcon={
                          <SvgIcon>
                            <PlusIcon />
                          </SvgIcon>
                        }
                        onClick={() => handleAddCustomRow(idx)}
                        color="primary"
                      >
                        {t("Add")}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          onRemoveItem(idx);
                        }}
                      >
                        <DeleteOutlined fontSize="medium" color="error" />
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}
