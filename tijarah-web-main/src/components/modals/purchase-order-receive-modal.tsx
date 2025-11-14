import {
  Button,
  Card,
  Checkbox,
  FormControlLabel,
  Grid,
  TextFieldProps,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ConfirmationDialog from "src/components/confirmation-dialog";
import { PO_GRN_STATUS } from "src/utils/constants";
import { PurchaseOrderAddCartRowLoading } from "../purchase-order/purchase-order-add-cart-row-loading";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";

interface ReceiveModalProps {
  open?: boolean;
  handleClose?: () => void;
  formik?: any;
  onSuccess?: () => void;
  selectedOption?: string;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  open,
  formik,
  onSuccess,
  handleClose,
  selectedOption,
}) => {
  const { t } = useTranslation();
  const lng = localStorage.getItem("currentLanguage");
  const [isCancelAllClicked] = useState(false);
  const [receiveAllQuantities, setReceiveAllQuantities] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [openDatePickers, setOpenDatePickers] = useState(
    formik.values.items.map(() => false)
  );
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

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

  const tableHeaders = [
    {
      key: "name",
      label: t("Name"),
    },
    {
      key: "ordered",
      label: t("Ordered"),
    },
    {
      key: "remaining",
      label: t("Remaining"),
    },
    {
      key: "return",
      label: t("Return"),
    },
    {
      key: "receiving",
      label: t("Receiving"),
    },

    {
      key: "expiry",
      label: t("Expiry"),
    },
    {
      key: "note",
      label: t("Note"),
    },
  ];

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    formik.values?.items?.map((product: any, idx: any) => {
      arr.push({
        key: idx,
        id: idx,

        name: (
          <>
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {product?.type === "item" &&
                `${product?.name[lng] || product?.name?.en}, ${
                  product?.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }, ${product.sku}`}
              {product?.type === "box" &&
                `${product?.name[lng] || product?.name?.en}, ${
                  product?.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }  [Box - ${product?.unitCount} Unit(s)] ${product.sku}`}
              {product?.type === "crate" &&
                `${product?.name[lng] || product?.name?.en}, ${
                  product?.hasMultipleVariants
                    ? product?.variant?.name[lng] || product?.variant?.name?.en
                    : ""
                }  [Crate - ${product?.unitCount} Unit(s)] ${product.sku}`}
            </Typography>
          </>
        ),

        ordered: <Typography variant="body2">{product.quantity}</Typography>,
        remaining: (
          <Typography variant="body2">
            {Number(product.remainingitem)}
          </Typography>
        ),
        return: (
          <Typography variant="body2">{product?.returnQty || "0"}</Typography>
        ),
        receiving: (
          <Typography variant="body2">
            <TextFieldWrapper
              fullWidth
              variant="standard"
              name="receiveditem"
              disabled={formik.values.orderStatus === "completed"}
              value={formik.values.items[idx].receiveditem}
              onChange={(e) =>
                handleProductFieldChange("receiveditem", e.target.value, idx)
              }
              onKeyPress={(event): void => {
                const ascii = event.charCode;
                const value = (event.target as HTMLInputElement).value;

                if (value.length > 9) {
                  event.preventDefault();
                } else if (ascii < 48 || ascii > 57) {
                  event.preventDefault();
                }
              }}
              error={Boolean(
                formik.errors.items && formik.errors.items[idx]?.receiveditem
              )}
              helperText={
                formik.errors.items && formik.errors.items[idx]?.receiveditem
              }
            />
          </Typography>
        ),
        expiry: (
          <DatePicker
            open={openDatePickers[idx]}
            onOpen={() => toggleDatePicker(idx)}
            onClose={() => toggleDatePicker(idx)}
            inputFormat="dd/MM/yyyy"
            onChange={(date: Date | null): void => {
              formik.setFieldValue(`items[${idx}].expiry`, date);
            }}
            //{/*
            // @ts-ignore */}
            InputProps={{ disabled: true }}
            minDate={new Date()}
            disablePast
            value={formik.values?.items[idx]?.expiry}
            disabled={formik.values.orderStatus === "completed"}
            renderInput={(params: JSX.IntrinsicAttributes & TextFieldProps) => (
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
                  onBlur={formik.handleBlur(`items[${idx}].expiry`)}
                />
                {formik.errors?.items?.[idx]?.expiry && (
                  <Typography
                    style={{
                      color: "red",
                      fontSize: "0.8rem",
                    }}
                  >
                    {formik.errors?.items?.[idx]?.expiry}
                  </Typography>
                )}
              </div>
            )}
          />
        ),
        note: (
          <Typography variant="body2">
            <TextFieldWrapper
              type="text"
              fullWidth
              variant="standard"
              name={`items[${idx}].note`}
              disabled={formik.values.orderStatus === "completed"}
              value={formik.values.items[idx].note}
              onChange={(e) => {
                const newValue = e.target.value;
                formik.setFieldValue(`items[${idx}].note`, newValue);
              }}
              error={Boolean(
                formik.errors.items && formik.errors.items[idx]?.note
              )}
              helperText={formik.errors.items && formik.errors.items[idx]?.note}
            />
          </Typography>
        ),
      });
    });

    return arr;
  }, [formik, openDatePickers]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData.slice(startIndex, endIndex);

  return (
    <Box>
      <Modal
        open={open}
        onClose={() => {
          setReceiveAllQuantities(false);
          handleClose();
        }}
      >
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
          }}
        >
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
              }}
            >
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
              <SuperTable
                isLoading={false}
                loaderComponent={PurchaseOrderAddCartRowLoading}
                items={paginatedItems}
                headers={tableHeaders}
                total={formik.values.items?.length || 0}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                rowsPerPage={rowsPerPage}
                page={page}
                isCancelAllClicked={isCancelAllClicked}
                noDataPlaceholder={
                  <Box sx={{ mt: 6, mb: 4 }}>
                    <NoDataAnimation
                      text={
                        <Typography
                          variant="h6"
                          textAlign="center"
                          sx={{ mt: 2 }}
                        >
                          {t("Currently, there are no Product added")}
                        </Typography>
                      }
                    />
                  </Box>
                }
              />
            </>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 5 }}>
            <Button
              color="inherit"
              sx={{ mr: 2 }}
              onClick={() => {
                setReceiveAllQuantities(false);
                handleClose();
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              variant="contained"
              onClick={(e) => {
                e.preventDefault();

                if (selectedOption === "po") {
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
              disabled={formik.values.orderStatus === "completed"}
            >
              {t("Receive and update inventory")}
            </Button>
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
