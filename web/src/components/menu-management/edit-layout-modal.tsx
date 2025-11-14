import CloseIcon from "@mui/icons-material/Close";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import { Stack } from "@mui/system";
import { t } from "i18next";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);

  const [removed] = result.splice(startIndex, 1);

  result.splice(endIndex, 0, removed);

  return result;
};

interface EditLayoutModalProps {
  open: boolean;
  handleClose: any;
  data: any[];
  formik?: any;
}

const EditLayoutModal: React.FC<EditLayoutModalProps> = ({
  open = false,
  handleClose,
  data,
  formik,
}) => {
  const theme = useTheme();

  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      data,
      result.source.index,
      result.destination.index
    ) as any;

    const IdsAndPos = newItems.map((d: any, idx: number) => {
      const obj = { categoryRef: d.id, ...d, sortOrder: idx };
      return obj;
    });

    formik.setFieldValue("categories", IdsAndPos);

    formik.values.categories = IdsAndPos;
  };

  return (
    <>
      <Box>
        <Dialog fullWidth maxWidth="sm" open={open}>
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
              {t("Category Layout")}
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

          <DialogContent>
            <Box>
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {data.map((item: any, index: number) => (
                        <Draggable
                          key={item.categoryRef}
                          draggableId={item.categoryRef}
                          index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                              <Card sx={{ mb: 1, borderRadius: 1 }}>
                                <CardContent sx={{ p: 0.5, pb: "0!important" }}>
                                  <Stack direction="row" spacing={2}>
                                    <ReorderRoundedIcon />
                                    <Stack direction="column" spacing={2}>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary">
                                        {item.name?.en}
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </CardContent>
                                <Divider />
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};

export default EditLayoutModal;
