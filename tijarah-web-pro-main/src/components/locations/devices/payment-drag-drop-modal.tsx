import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Card,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  SvgIcon,
  Switch,
  TableBody,
  TableCell,
  TableRow,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useTranslation } from "react-i18next";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useAuth } from "src/hooks/use-auth";
import toast from "react-hot-toast";
import { useEffect } from "react";
import { useEntity } from "src/hooks/use-entity";
import CloseIcon from "@mui/icons-material/Close";

interface PaymentDragDropModalProps {
  companyRef: string;
  open?: boolean;
  handleClose?: () => void;
  handleToggleSwitch?: any;
  formik?: any;
}

export const PaymentDragDropModal = (props: PaymentDragDropModalProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const { companyRef, open, formik, handleClose } = props;

  const { findOne, entity: company } = useEntity("company");

  useEffect(() => {
    if (companyRef) {
      findOne(companyRef?.toString());
    }
  }, [companyRef]);

  return (
    <>
      <Dialog
        fullWidth
        maxWidth="sm"
        open={open}
        onClose={() => {
          handleClose();
        }}
      >
        {/* header */}
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
            {`${t("Payment Type")}`}
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
          <Box
            style={{
              marginTop: 0,
              marginBottom: 10,
              width: "100%",
            }}
          >
            <Droppable droppableId="billingDroppable">
              {(provided) => (
                <TableBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  {formik?.values?.paymentTypeRef?.length > 0 ? (
                    formik?.values?.paymentTypeRef.map(
                      (data: any, idx: number) => {
                        const handleSwitchChange = (e: any) => {
                          const isWallet = data.name === "Wallet";
                          const isLoyaltyEnabled =
                            company?.configuration?.enableLoyalty;
                          const isSwitchDisabled =
                            isWallet && !isLoyaltyEnabled;

                          if (isSwitchDisabled) {
                            toast.error(
                              t(
                                "Loyalty feature is not enabled for Wallet"
                              ).toString()
                            );
                            return;
                          }

                          const updatedPaymentTypes =
                            formik.values.paymentTypeRef.map((payment: any) =>
                              payment._id === data._id
                                ? {
                                    ...payment,
                                    status: !payment.status,
                                  }
                                : payment
                            );

                          const atLeastOneEnabled = updatedPaymentTypes.some(
                            (payment: any) => payment.status === true
                          );

                          if (
                            !atLeastOneEnabled &&
                            updatedPaymentTypes[idx].status === false
                          ) {
                            toast.error(
                              t(
                                "At least one payment type should be active"
                              ).toString()
                            );
                            return;
                          }

                          // Otherwise, update the paymentTypeRef in the form
                          formik.setFieldValue(
                            "paymentTypeRef",
                            updatedPaymentTypes
                          );
                        };

                        return (
                          <Draggable
                            key={idx}
                            draggableId={idx.toString()}
                            index={idx}
                          >
                            {(provided, snapshot: DraggableStateSnapshot) => (
                              <TableRow
                                key={idx}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  background: snapshot.isDragging
                                    ? "rgba(245,245,245, 0.75)"
                                    : "none",
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <TableCell sx={{ minWidth: "50%" }}>
                                  <Typography variant="body2">
                                    <IconButton sx={{ mr: 0.7, ml: -1 }}>
                                      <SvgIcon>
                                        <ReorderRoundedIcon fontSize="small" />
                                      </SvgIcon>
                                    </IconButton>
                                    {data?.name}
                                  </Typography>
                                </TableCell>

                                <TableCell
                                  sx={{
                                    minWidth: "50%",
                                    textAlign: "right",
                                  }}
                                >
                                  <Switch
                                    color="primary"
                                    edge="end"
                                    name={`paymentType-${idx}`}
                                    checked={data.status}
                                    onChange={handleSwitchChange}
                                    sx={{ mr: 0.2 }}
                                  />
                                </TableCell>
                              </TableRow>
                            )}
                          </Draggable>
                        );
                      }
                    )
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        style={{ textAlign: "center", borderBottom: "none" }}
                      >
                        <Box sx={{ mt: 4, mb: 4 }}>
                          <NoDataAnimation
                            text={
                              <Typography
                                variant="h5"
                                textAlign="center"
                                sx={{ mt: 5 }}
                              >
                                {t("No Data!")}
                              </Typography>
                            }
                          />
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
