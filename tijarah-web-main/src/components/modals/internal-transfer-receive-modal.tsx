import {
  Button,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Table,
  TableBody,
  TextFieldProps,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { PO_GRN_STATUS } from "src/utils/constants";
import ConfirmationDialog from "src/components/confirmation-dialog";
import TextFieldWrapper from "../text-field-wrapper";

interface ReceiveModalProps {
  open?: boolean;
  handleClose?: () => void;
  formik?: any;
  onSuccess?: () => void;
  selectedOption?: string;
  userType?: string;
  matchLocation?: boolean;
}

export const InternalTransReceiveModal: React.FC<ReceiveModalProps> = ({
  open,
  formik,
  onSuccess,
  handleClose,
  selectedOption,
  matchLocation,
  userType,
}) => {
  const { t } = useTranslation();
  const lng = localStorage.getItem("currentLanguage");
  const [receiveAllQuantities, setReceiveAllQuantities] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openDatePickers, setOpenDatePickers] = useState(
    formik.values.items.map(() => false)
  );

  const toggleDatePicker = (index: number) => {
    const updatedOpenDatePickers = [...openDatePickers];
    updatedOpenDatePickers[index] = !updatedOpenDatePickers[index];
    setOpenDatePickers(updatedOpenDatePickers);
  };

  const handleReceiveAllQuantitiesChange = () => {
    if (receiveAllQuantities) {
      formik.values.items.forEach((product: any, idx: number) => {
        formik.setFieldValue(`items[${idx}].received`, 0);
        formik.setFieldValue(`items[${idx}].receiveditem`, 0);
        formik.setFieldValue(`items[${idx}].remaining`, product.quantity);
        formik.setFieldValue(`items[${idx}].remainingitem`, product.quantity);
        formik.setFieldValue(`items[${idx}].status`, PO_GRN_STATUS.PENDING);
      });
    } else {
      formik.values.items.forEach((product: any, idx: number) => {
        formik.setFieldValue(`items[${idx}].received`, product.quantity);
        formik.setFieldValue(`items[${idx}].receiveditem`, product.quantity);
        formik.setFieldValue(`items[${idx}].remaining`, 0);
        formik.setFieldValue(`items[${idx}].remainingitem`, product.quantity);
        formik.setFieldValue(`items[${idx}].status`, PO_GRN_STATUS.COMPLETED);
      });
    }

    setReceiveAllQuantities(!receiveAllQuantities);
  };

  const itemsWithExcessReceived = formik.values.items.filter(
    (item: any) => item.received > item.quantity
  );

  const handleConfirmation = () => {
    onSuccess();
    setShowConfirmation(false);
  };

  const handleProductFieldChange = (
    fieldName: string,
    value: any,
    index: number
  ) => {
    const currentItem = formik.values.items[index];

    if (fieldName === "receiveditem") {
      const enteredReceiving = Number(value || 0);

      formik.setFieldValue(`items[${index}].${fieldName}`, value);
      formik.setFieldValue(
        `items[${index}].remaining`,
        Number(currentItem.remainingitem) - enteredReceiving
      );

      formik.setFieldValue(
        `items[${index}].received`,
        enteredReceiving + Number(currentItem.receivedold)
      );

      if (Number(currentItem.remainingitem) - enteredReceiving < 0) {
        formik.setFieldValue(`items[${index}].status`, PO_GRN_STATUS.COMPLETED);
      } else if (Number(currentItem.remainingitem) - enteredReceiving === 0) {
        formik.setFieldValue(`items[${index}].status`, PO_GRN_STATUS.COMPLETED);
      } else if (currentItem.receive === 0) {
        formik.setFieldValue(`items[${index}].status`, PO_GRN_STATUS.PENDING);
      } else if (currentItem.quantity === 0) {
        formik.setFieldValue(`items[${index}].status`, PO_GRN_STATUS.PENDING);
      } else {
        formik.setFieldValue(
          `items[${index}].status`,
          PO_GRN_STATUS.PARTIALLY_RECEIVED
        );
      }
    }
  };

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          setReceiveAllQuantities(false);
          handleClose();
        }}>
        <Card
          sx={{
            position: "absolute" as "absolute",
            width: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "100%",
            },
            height: {
              xs: "100%",
              sm: "100%",
              md: "100%",
              lg: "100%",
            },
            bgcolor: "background.paper",
            overflow: "auto",
            p: 4,
            borderRadius: 0,
          }}>
          <Box style={{ width: "100%", display: "flex" }}>
            <XCircle
              fontSize="small"
              onClick={() => {
                setReceiveAllQuantities(false);
                handleClose();
              }}
              style={{ cursor: "pointer" }}
            />

            <Box style={{ flex: 1 }}>
              <Typography variant="h6" align="center" sx={{ mr: 4, mb: 1 }}>
                {t("Receive Inventory")}
              </Typography>
              <Typography variant="body2" align="center" sx={{ mr: 4 }}>
                {` (${formik.values.orderNum || ""})`}
              </Typography>
            </Box>
          </Box>

          <Grid item md={12} xs={12}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                mt: 2,
              }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={receiveAllQuantities}
                    color="primary"
                    edge="end"
                    name="receiveall"
                    disabled={
                      formik.values.orderStatus === "completed" ||
                      formik.values.orderStatus === "partiallyReceived"
                    }
                    onChange={handleReceiveAllQuantitiesChange}
                    sx={{
                      mr: 0.2,
                    }}
                  />
                }
                label={t("Receive all quantities")}
              />
            </Box>
          </Grid>
          <Box sx={{ mt: 3 }}>
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Name")}</TableCell>
                    <TableCell>{t("Ordered")}</TableCell>
                    <TableCell>{t("Remaining")}</TableCell>
                    <TableCell>{t("Receiving")}</TableCell>

                    <TableCell>{t("Expiry")}</TableCell>

                    <TableCell>{t("Note")}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {formik.values.items?.length > 0 ? (
                    formik.values.items.map((product: any, idx: any) => {
                      return (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ textTransform: "capitalize" }}>
                              {product?.type === "item" &&
                                `${product?.name[lng] || product?.name?.en}, ${
                                  product?.hasMultipleVariants
                                    ? product?.variant?.name[lng] ||
                                      product?.variant?.name?.en
                                    : ""
                                }, ${product.sku} ${
                                  product.code ? `(${product.code})` : ""
                                }`}
                              {product?.type === "box" &&
                                `${product?.name[lng] || product?.name?.en}, ${
                                  product?.hasMultipleVariants
                                    ? product?.variant?.name[lng] ||
                                      product?.variant?.name?.en
                                    : ""
                                }  [Box - ${product?.unitCount} Unit(s)] ${
                                  product.sku
                                } ${product.code ? `(${product.code})` : ""}`}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {product.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {Number(product.remainingitem) -
                                Number(product.receiveditem || 0)}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              <TextFieldWrapper
                                fullWidth
                                variant="standard"
                                name="receiveditem"
                                disabled={
                                  formik.values.orderStatus === "completed"
                                }
                                value={formik.values.items[idx].receiveditem}
                                onChange={(e) =>
                                  handleProductFieldChange(
                                    "receiveditem",
                                    e.target.value,
                                    idx
                                  )
                                }
                                onKeyPress={(event): void => {
                                  const ascii = event.charCode;
                                  const value = (
                                    event.target as HTMLInputElement
                                  ).value;

                                  if (value.length > 9) {
                                    event.preventDefault();
                                  } else if (ascii < 48 || ascii > 57) {
                                    event.preventDefault();
                                  }
                                }}
                                error={Boolean(
                                  formik.errors.items &&
                                    formik.errors.items[idx]?.receiveditem
                                )}
                                helperText={
                                  formik.errors.items &&
                                  formik.errors.items[idx]?.receiveditem
                                }
                              />
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ minWidth: "180px" }}>
                            <DatePicker
                              open={openDatePickers[idx]}
                              onOpen={() => toggleDatePicker(idx)}
                              onClose={() => toggleDatePicker(idx)}
                              inputFormat="dd/MM/yyyy"
                              onChange={(date: Date | null): void => {
                                formik.setFieldValue(
                                  `items[${idx}].expiry`,
                                  date
                                );
                              }}
                              //{/*
                              // @ts-ignore */}
                              InputProps={{ disabled: true }}
                              minDate={new Date()}
                              disablePast
                              value={formik.values?.items[idx]?.expiry}
                              disabled={
                                formik.values.orderStatus === "completed"
                              }
                              renderInput={(
                                params: JSX.IntrinsicAttributes & TextFieldProps
                              ) => (
                                <div>
                                  <TextFieldWrapper
                                    required
                                    fullWidth
                                    aria-readonly
                                    onClick={() => toggleDatePicker(idx)}
                                    {...params}
                                    inputProps={{
                                      ...params.inputProps,
                                      readOnly: true,
                                    }}
                                    variant="standard"
                                    onBlur={formik.handleBlur(
                                      `items[${idx}].expiry`
                                    )}
                                  />
                                  {formik.errors?.items?.[idx]?.expiry && (
                                    <Typography
                                      style={{
                                        color: "red",
                                        fontSize: "0.8rem",
                                      }}>
                                      {formik.errors?.items?.[idx]?.expiry}
                                    </Typography>
                                  )}
                                </div>
                              )}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography variant="body2">
                              <TextFieldWrapper
                                type="text"
                                fullWidth
                                variant="standard"
                                name={`items[${idx}].note`}
                                disabled={
                                  formik.values.orderStatus === "completed"
                                }
                                value={formik.values.items[idx].note}
                                onChange={(e) => {
                                  const newValue = e.target.value;
                                  formik.setFieldValue(
                                    `items[${idx}].note`,
                                    newValue
                                  );
                                }}
                                error={Boolean(
                                  formik.errors.items &&
                                    formik.errors.items[idx]?.note
                                )}
                                helperText={
                                  formik.errors.items &&
                                  formik.errors.items[idx]?.note
                                }
                              />
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} style={{ textAlign: "center" }}>
                        {t("No Product in receive inventory")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => {
                setReceiveAllQuantities(false);
                handleClose();
              }}>
              {t("Cancel")}
            </Button>
            {formik.values.orderStatus === "completed" ? (
              ""
            ) : userType === "app:admin" ||
              userType === "app:super-admin" ||
              matchLocation ? (
              <Button
                variant="contained"
                onClick={(e) => {
                  e.preventDefault();

                  if (selectedOption) {
                    for (let i = 0; i < formik.values.items.length; i++) {
                      if (
                        formik.values.items[i].batching &&
                        !formik.values.items[i].expiry
                      ) {
                        formik.setFieldError(
                          `items[${i}].expiry`,
                          "Expiry Date is required"
                        );
                        return;
                      }
                    }
                  }

                  const hasOverReceived = formik.values.items.some(
                    (item: any) => item.received > item.quantity
                  );

                  if (hasOverReceived) {
                    setShowConfirmation(true);
                  } else {
                    onSuccess();
                  }
                }}
                sx={{ ml: 1.5 }}
                disabled={
                  formik.values.orderStatus === "completed" ||
                  (!matchLocation &&
                    !(
                      userType === "app:admin" || userType === "app:super-admin"
                    ))
                }>
                {t("Receive and update inventory")}
              </Button>
            ) : (
              ""
            )}
          </Box>

          <ConfirmationDialog
            show={showConfirmation}
            toggle={() => {
              setShowConfirmation(!showConfirmation);
            }}
            onOk={() => {
              handleConfirmation();
            }}
            okButtonText={`${t("Yes")}, ${t("Confirm")}`}
            cancelButtonText={t("Back")}
            title={t("Confirmation")}
            text={t(
              `Are you sure you want to continue? You have received more than the ordered amount on the following product(s):`
            )}
            itemsWithExcessReceived={itemsWithExcessReceived}
          />
        </Card>
      </Modal>
    </Box>
  );
};
