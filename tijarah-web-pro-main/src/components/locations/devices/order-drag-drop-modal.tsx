import CloseIcon from "@mui/icons-material/Close";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
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
import Typography from "@mui/material/Typography";
import {
  Draggable,
  DraggableStateSnapshot,
  Droppable,
} from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { ChannelsName } from "src/utils/constants";

interface OrderDragDropModalProps {
  open?: boolean;
  handleClose?: () => void;
  handleToggleSwitch?: any;
  formik?: any;
}

export const OrderDragDropModal = (props: OrderDragDropModalProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { open, formik, handleClose } = props;
  // const theme = localStorage.getItem("theme");

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
            {`${t("Order Types")}`}
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

        <DialogContent>
          <Box
            style={{
              marginTop: 0,
              marginBottom: 10,
              width: "100%",
            }}
          >
            <Droppable droppableId="billingOrderDroppable">
              {(provided) => (
                <TableBody
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  sx={{ display: "flex", flexDirection: "column" }}
                >
                  {formik?.values?.orderTypes?.length > 0 ? (
                    formik?.values?.orderTypes.map((data: any, idx: number) => {
                      return (
                        <Draggable
                          key={idx}
                          draggableId={idx.toString()}
                          index={idx}
                        >
                          {(provided, snapshot: DraggableStateSnapshot) => {
                            return (
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
                                    {ChannelsName[data?.name] || data?.name}
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
                                    name={`orderType-${idx}`}
                                    checked={data.status}
                                    onChange={() => {
                                      const updatedOrderTypes =
                                        formik.values.orderTypes.map(
                                          (order: any) =>
                                            order._id === data._id
                                              ? {
                                                  ...order,
                                                  status: !order.status,
                                                }
                                              : order
                                        );

                                      const atLeastOneEnabled =
                                        updatedOrderTypes.some(
                                          (order: any) => order.status === true
                                        );

                                      if (
                                        !atLeastOneEnabled &&
                                        updatedOrderTypes[idx].status === false
                                      ) {
                                        toast.error(
                                          t(
                                            "At least one order type should be active"
                                          ).toString()
                                        );
                                        return;
                                      }

                                      // Otherwise, update the orderTypes in the form
                                      formik.setFieldValue(
                                        "orderTypes",
                                        updatedOrderTypes
                                      );
                                    }}
                                    sx={{ mr: 0.2 }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          }}
                        </Draggable>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
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
