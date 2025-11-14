import { DeleteOutlined } from "@mui/icons-material";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import {
  Box,
  Button,
  IconButton,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useTranslation } from "react-i18next";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";

export function PackageAddonsTable({
  formik,
  modulesList,
}: {
  formik: any;
  modulesList: {
    name: string;
    key: string;
    subModules: { key: string; name: string }[];
  }[];
}) {
  const { t } = useTranslation();
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

  const handlePriceInput = (
    value: string,
    index: number,
    priceType: string,
    updateField?: string
  ) => {
    const regex = /^\d*(\.\d{0,2})?$/;
    if (value === "" || regex.test(value)) {
      const updatedAddons = [...formik.values.addons];

      if (!updatedAddons[index].prices) {
        updatedAddons[index].prices = [];
      }

      const priceObj = {
        type: priceType,
        price: value,
        discount: 0,
      };

      updatedAddons[index].prices = updatedAddons[index].prices.filter(
        (p: any) => p.type !== priceType
      );
      updatedAddons[index].prices.push(priceObj);

      if (updateField) {
        updatedAddons[index][updateField] = value;
      }

      if (priceType === "monthly") {
        const monthlyValue = value === "" ? "" : parseFloat(value);
        if (
          formik.values.prices.some((price: any) => price.type === "quarterly")
        ) {
          const quarterlyValue =
            monthlyValue === "" ? "" : (monthlyValue * 3).toFixed(2);
          updatedAddons[index].quarterlyPrice = quarterlyValue;
          updatedAddons[index].prices = updatedAddons[index].prices.filter(
            (p: any) => p.type !== "quarterly"
          );
          updatedAddons[index].prices.push({
            type: "quarterly",
            price: quarterlyValue,
            discount: 0,
          });
        }
        if (
          formik.values.prices.some((price: any) => price.type === "annually")
        ) {
          const annualValue =
            monthlyValue === "" ? "" : (monthlyValue * 12).toFixed(2);
          updatedAddons[index].annualPrice = annualValue;
          updatedAddons[index].prices = updatedAddons[index].prices.filter(
            (p: any) => p.type !== "annually"
          );
          updatedAddons[index].prices.push({
            type: "annually",
            price: annualValue,
            discount: 0,
          });
        }
      }

      formik.setFieldValue("addons", updatedAddons);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return;
    }

    const updatedAddons = [...formik.values.addons];
    const [movedItem] = updatedAddons.splice(sourceIndex, 1);
    updatedAddons.splice(destinationIndex, 0, movedItem);

    // Update sortOrder for all addons
    const reorderedAddons = updatedAddons.map((addon, idx) => ({
      ...addon,
      sortOrder: idx, // Assign new sortOrder based on index
    }));

    formik.setFieldValue("addons", reorderedAddons);
  };

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedAddons = formik.values.addons.slice(startIndex, endIndex);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell> {/* Drag handle column */}
              <TableCell>{t("Module")}</TableCell>
              {/* Monthly price column temporarily disabled */}
              {formik.values.prices.some(
                (price: any) => price.type === "monthly"
              ) && <TableCell>{t("Monthly Price")}</TableCell>}
              {formik.values.prices.some(
                (price: any) => price.type === "quarterly"
              ) && <TableCell>{t("Quarterly Price")}</TableCell>}
              {formik.values.prices.some(
                (price: any) => price.type === "annually"
              ) && <TableCell>{t("Annual Price")}</TableCell>}
              <TableCell>{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>

          <Droppable droppableId="addonsDroppable">
            {(provided) => (
              <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                {paginatedAddons.length > 0 ? (
                  paginatedAddons.map((addon: any, index: number) => (
                    <Draggable
                      key={index}
                      draggableId={index.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            background: snapshot.isDragging
                              ? "rgba(245,245,245, 0.75)"
                              : "none",
                          }}
                        >
                          <TableCell>
                            <IconButton sx={{ mr: 0.7, ml: -1 }}>
                              <SvgIcon>
                                <ReorderRoundedIcon fontSize="small" />
                              </SvgIcon>
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {addon.name}
                            </Typography>
                          </TableCell>
                          {/* Monthly price input temporarily disabled */}
                          {formik.values.prices.some(
                            (price: any) => price.type === "monthly"
                          ) && (
                            <TableCell>
                              <TextField
                                fullWidth
                                variant="standard"
                                type="text"
                                value={
                                  addon?.prices?.find(
                                    (ad: any) => ad.type === "monthly"
                                  )?.price || ""
                                }
                                onChange={(e) =>
                                  handlePriceInput(
                                    e.target.value,
                                    startIndex + index,
                                    "monthly",
                                    "monthlyPrice"
                                  )
                                }
                                inputProps={{
                                  inputMode: "decimal",
                                }}
                              />
                            </TableCell>
                          )}
                          {formik.values.prices.some(
                            (price: any) => price.type === "quarterly"
                          ) && (
                            <TableCell>
                              <TextField
                                fullWidth
                                variant="standard"
                                type="text"
                                value={
                                  addon?.prices?.find(
                                    (ad: any) => ad.type === "quarterly"
                                  )?.price || ""
                                }
                                onChange={(e) =>
                                  handlePriceInput(
                                    e.target.value,
                                    startIndex + index,
                                    "quarterly",
                                    "quarterlyPrice"
                                  )
                                }
                                inputProps={{
                                  inputMode: "decimal",
                                }}
                              />
                            </TableCell>
                          )}
                          {formik.values.prices.some(
                            (price: any) => price.type === "annually"
                          ) && (
                            <TableCell>
                              <TextField
                                fullWidth
                                variant="standard"
                                type="text"
                                value={
                                  addon?.prices?.find(
                                    (ad: any) => ad.type === "annually"
                                  )?.price || ""
                                }
                                onChange={(e) =>
                                  handlePriceInput(
                                    e.target.value,
                                    startIndex + index,
                                    "annually",
                                    "annualPrice"
                                  )
                                }
                                inputProps={{
                                  inputMode: "decimal",
                                }}
                              />
                            </TableCell>
                          )}
                          <TableCell>
                            <Box display="flex" justifyContent="center">
                              <Button
                                onClick={() => {
                                  const updatedAddons =
                                    formik.values.addons.filter(
                                      (_: any, idx: number) =>
                                        idx !== startIndex + index
                                    );
                                  formik.setFieldValue("addons", updatedAddons);
                                }}
                              >
                                <DeleteOutlined
                                  fontSize="medium"
                                  color="error"
                                />
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      sx={{ py: 3 }}
                      style={{ textAlign: "center" }}
                    >
                      <NoDataAnimation
                        text={
                          <Typography
                            variant="h6"
                            textAlign="center"
                            sx={{ mt: 2 }}
                          >
                            {t("Currently, there are no addons added")}
                          </Typography>
                        }
                      />
                    </TableCell>
                  </TableRow>
                )}
                {provided.placeholder}
              </TableBody>
            )}
          </Droppable>
        </Table>
      </TableContainer>

      {formik.values.addons.length > rowsPerPage && (
        <TablePagination
          component="div"
          count={formik.values.addons.length}
          onPageChange={(_, newPage) => handlePageChange(newPage)}
          onRowsPerPageChange={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      )}
    </DragDropContext>
  );
}
