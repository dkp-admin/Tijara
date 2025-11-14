import { AddCircleOutline, DeleteOutlined } from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import ReorderRoundedIcon from "@mui/icons-material/ReorderRounded";
import UploadIcon from "@mui/icons-material/Upload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Box,
  Checkbox,
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
} from "@mui/material";
import { useFormik } from "formik";
import React, { ChangeEvent, useCallback, useMemo, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import upload, { FileUploadNamespace } from "src/utils/uploadToS3";
import * as Yup from "yup";

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const NewHardwareRow = React.memo(
  ({ formik, hardwareFormik, handleAddHardware }: any) => {
    const { t } = useTranslation();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handlePriceInput = useCallback(
      (value: string, fieldPath: string) => {
        const regex = /^\d*(\.\d{0,2})?$/;
        if (value === "" || regex.test(value)) {
          hardwareFormik.setFieldValue(fieldPath, value);
        }
      },
      [hardwareFormik]
    );

    const handleImageUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        try {
          const url = await upload(
            files as any,
            FileUploadNamespace["hardwares"]
          );
          hardwareFormik.setFieldValue("newHardware.imageUrl", url);
        } catch (error) {
          toast.error(t("Failed to upload image"));
        }
      }
    };

    return (
      <TableRow>
        <TableCell />
        <TableCell>
          <TextField
            fullWidth
            variant="standard"
            name="newHardware.name.en"
            value={hardwareFormik.values.newHardware.name.en}
            onChange={hardwareFormik.handleChange}
            onBlur={hardwareFormik.handleBlur}
            error={
              hardwareFormik.touched.newHardware?.name?.en &&
              Boolean(hardwareFormik.errors.newHardware?.name?.en)
            }
            helperText={
              hardwareFormik.touched.newHardware?.name?.en &&
              hardwareFormik.errors.newHardware?.name?.en
            }
          />
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            variant="standard"
            name="newHardware.name.ar"
            value={hardwareFormik.values.newHardware.name.ar}
            onChange={hardwareFormik.handleChange}
            onBlur={hardwareFormik.handleBlur}
            error={
              hardwareFormik.touched.newHardware?.name?.ar &&
              Boolean(hardwareFormik.errors.newHardware?.name?.ar)
            }
            helperText={
              hardwareFormik.touched.newHardware?.name?.ar &&
              hardwareFormik.errors.newHardware?.name?.ar
            }
            inputProps={{ style: { direction: "rtl" } }}
          />
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            variant="standard"
            type="text"
            name="newHardware.price"
            value={hardwareFormik.values.newHardware.price}
            onChange={(e) =>
              handlePriceInput(e.target.value, "newHardware.price")
            }
            onBlur={hardwareFormik.handleBlur}
            error={
              hardwareFormik.touched.newHardware?.price &&
              Boolean(hardwareFormik.errors.newHardware?.price)
            }
            helperText={
              hardwareFormik.touched.newHardware?.price &&
              hardwareFormik.errors.newHardware?.price
            }
            inputProps={{ inputMode: "decimal" }}
          />
        </TableCell>
        <TableCell>
          <TextField
            fullWidth
            variant="standard"
            name="newHardware.infoText"
            value={hardwareFormik.values.newHardware.infoText}
            onChange={hardwareFormik.handleChange}
            onBlur={hardwareFormik.handleBlur}
          />
        </TableCell>
        <TableCell>
          <IconButton onClick={() => fileInputRef.current?.click()}>
            <UploadIcon />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleImageUpload}
          />
          {hardwareFormik.values.newHardware.imageUrl && (
            <span>{t("Image uploaded")}</span>
          )}
        </TableCell>
        <TableCell>
          <Checkbox
            name="newHardware.defaultSelected"
            checked={hardwareFormik.values.newHardware.defaultSelected}
            onChange={hardwareFormik.handleChange}
          />
        </TableCell>
        <TableCell>
          <IconButton
            color="primary"
            onClick={handleAddHardware}
            disabled={
              hardwareFormik.isSubmitting ||
              Object.keys(hardwareFormik.errors).length > 0
            }
          >
            <AddCircleOutline />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  }
);

const HardwareRow = React.memo(
  ({ hardware, index, startIndex, formik, t, setIsImageUpload }: any) => {
    const nameEnFieldPath = `hardwares[${startIndex + index}].name.en`;
    const nameArFieldPath = `hardwares[${startIndex + index}].name.ar`;
    const priceFieldPath = `hardwares[${startIndex + index}].price`;
    const infoTextFieldPath = `hardwares[${startIndex + index}].infoText`;
    const defaultSelectedPath = `hardwares[${
      startIndex + index
    }].defaultSelected`;
    const imageUrlPath = `hardwares[${startIndex + index}].imageUrl`;
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handlePriceInput = useCallback(
      (value: string, fieldPath: string) => {
        const regex = /^\d*(\.\d{0,2})?$/;
        if (value === "" || regex.test(value)) {
          formik.setFieldValue(fieldPath, value);
        }
      },
      [formik]
    );

    const debouncedFieldUpdate = useCallback(
      debounce((fieldPath: string, value: any) => {
        formik.setFieldValue(fieldPath, value);
      }, 0),
      [formik]
    );

    const handleFieldChange = useCallback(
      (fieldPath: string, value: any, nestedField?: string) => {
        const updatedHardwares = [...formik.values.hardwares];
        if (nestedField) {
          updatedHardwares[startIndex + index].name = {
            ...updatedHardwares[startIndex + index].name,
            [nestedField]: value,
          };
        } else {
          updatedHardwares[startIndex + index][fieldPath.split("].")[1]] =
            value;
        }
        debouncedFieldUpdate("hardwares", updatedHardwares);
      },
      [formik, startIndex, index, debouncedFieldUpdate]
    );

    const handleImageUpload = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setIsImageUpload(true);
      const files = event.target.files;
      if (files && files.length > 0) {
        try {
          const url = await upload(
            files as any,
            FileUploadNamespace["hardwares"]
          );

          const updatedHardwares = [...formik.values.hardwares];
          updatedHardwares[startIndex + index].imageUrl = url;

          formik.setFieldValue("hardwares", updatedHardwares);

          formik.setFieldTouched(
            `hardwares[${startIndex + index}].imageUrl`,
            true
          );

          formik.submitForm();
        } catch (error) {
          toast.error(t("Failed to upload image"));
        }
      }
    };

    const handleRemoveImage = () => {
      const updatedHardwares = [...formik.values.hardwares];
      updatedHardwares[startIndex + index].imageUrl = "";
      formik.setFieldValue("hardwares", updatedHardwares);
      formik.setFieldTouched(`hardwares[${startIndex + index}].imageUrl`, true);
    };

    const handleViewImage = () => {
      if (hardware.imageUrl) {
        window.open(hardware.imageUrl, "_blank");
      }
    };

    return (
      <Draggable
        key={hardware.key || index}
        draggableId={`${hardware.key || index}`}
        index={index}
      >
        {(provided, snapshot) => (
          <TableRow
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            sx={{
              background: snapshot.isDragging
                ? "rgba(245,245,245, 0.75)"
                : "inherit",
            }}
          >
            <TableCell>
              <IconButton>
                <SvgIcon>
                  <ReorderRoundedIcon fontSize="small" />
                </SvgIcon>
              </IconButton>
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                variant="standard"
                name={nameEnFieldPath}
                value={hardware.name?.en || ""}
                onChange={(e) =>
                  handleFieldChange(nameEnFieldPath, e.target.value, "en")
                }
                onBlur={() => formik.setFieldTouched(nameEnFieldPath, true)}
                placeholder={t("Enter hardware name (EN)")}
                error={
                  formik.touched.hardwares?.[startIndex + index]?.name?.en &&
                  !hardware.name?.en?.trim()
                }
                helperText={
                  formik.touched.hardwares?.[startIndex + index]?.name?.en &&
                  !hardware.name?.en?.trim()
                    ? t("English hardware name is required")
                    : ""
                }
              />
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                variant="standard"
                name={nameArFieldPath}
                value={hardware.name?.ar || ""}
                onChange={(e) =>
                  handleFieldChange(nameArFieldPath, e.target.value, "ar")
                }
                onBlur={() => formik.setFieldTouched(nameArFieldPath, true)}
                placeholder={t("Enter hardware name (AR)")}
                inputProps={{ style: { direction: "rtl" } }}
                error={
                  formik.touched.hardwares?.[startIndex + index]?.name?.ar &&
                  !hardware.name?.ar?.trim()
                }
                helperText={
                  formik.touched.hardwares?.[startIndex + index]?.name?.ar &&
                  !hardware.name?.ar?.trim()
                    ? t("Arabic hardware name is required")
                    : ""
                }
              />
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                variant="standard"
                type="text"
                name={priceFieldPath}
                value={hardware.price || ""}
                onChange={(e) =>
                  handlePriceInput(e.target.value, priceFieldPath)
                }
                onBlur={() => formik.setFieldTouched(priceFieldPath, true)}
                error={
                  formik.touched.hardwares?.[startIndex + index]?.price &&
                  (hardware.price === "" || parseFloat(hardware.price) <= 0)
                }
                helperText={
                  formik.touched.hardwares?.[startIndex + index]?.price &&
                  (hardware.price === "" || parseFloat(hardware.price) <= 0)
                    ? t("Price must be greater than 0")
                    : ""
                }
                inputProps={{ inputMode: "decimal" }}
              />
            </TableCell>
            <TableCell>
              <TextField
                fullWidth
                variant="standard"
                name={infoTextFieldPath}
                value={hardware.infoText || ""}
                onChange={(e) =>
                  handleFieldChange(infoTextFieldPath, e.target.value)
                }
              />
            </TableCell>
            <TableCell>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {hardware.imageUrl ? (
                  <>
                    <IconButton onClick={handleViewImage}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={handleRemoveImage}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </>
                ) : (
                  <IconButton onClick={() => fileInputRef.current?.click()}>
                    <UploadIcon />
                  </IconButton>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </Box>
            </TableCell>
            <TableCell>
              <Checkbox
                name={defaultSelectedPath}
                checked={hardware.defaultSelected || false}
                onChange={(e) =>
                  handleFieldChange(defaultSelectedPath, e.target.checked)
                }
              />
            </TableCell>
            <TableCell>
              <IconButton
                onClick={() => {
                  const updatedHardwares = formik.values.hardwares.filter(
                    (_: any, idx: number) => idx !== startIndex + index
                  );
                  formik.setFieldValue("hardwares", updatedHardwares);
                }}
              >
                <DeleteOutlined color="error" />
              </IconButton>
            </TableCell>
          </TableRow>
        )}
      </Draggable>
    );
  }
);

export function PackageHardwaresTable({
  formik,
  setIsImageUpload,
}: {
  formik: any;
  setIsImageUpload: any;
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

  const hardwareFormik = useFormik({
    initialValues: {
      newHardware: {
        name: { en: "", ar: "" },
        key: "",
        price: "",
        defaultSelected: false,
        tag: "",
        infoText: "",
        imageUrl: "",
      },
    },
    validationSchema: Yup.object({
      newHardware: Yup.object({
        name: Yup.object({
          en: Yup.string().required(t("English hardware name is required")),
          ar: Yup.string().required(t("Arabic hardware name is required")),
        }),
        price: Yup.string()
          .matches(/^\d*(\.\d{0,2})?$/, t("Invalid price format"))
          .test("min-price", t("Price must be greater than 0"), (value) => {
            return value === "" || parseFloat(value) > 0;
          }),
        defaultSelected: Yup.boolean(),
        tag: Yup.string(),
        infoText: Yup.string(),
        imageUrl: Yup.string(),
      }),
    }),
    onSubmit: () => {},
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleAddHardware = useCallback(() => {
    hardwareFormik.setFieldTouched("newHardware.name.en", true);
    hardwareFormik.setFieldTouched("newHardware.name.ar", true);
    hardwareFormik.setFieldTouched("newHardware.price", true);

    if (
      hardwareFormik.values.newHardware.name.en.trim() &&
      hardwareFormik.values.newHardware.name.ar.trim() &&
      hardwareFormik.values.newHardware.price !== "" &&
      parseFloat(hardwareFormik.values.newHardware.price) > 0
    ) {
      const updatedHardwares = [
        ...(formik.values.hardwares || []),
        {
          ...hardwareFormik.values.newHardware,
          key: hardwareFormik.values.newHardware.name.en
            .replaceAll(" ", "_")
            .toLowerCase(),
          sortOrder: (formik.values.hardwares || []).length,
        },
      ];
      formik.setFieldValue("hardwares", updatedHardwares);
      hardwareFormik.resetForm();
    }
  }, [formik, hardwareFormik]);

  const handleDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      const updatedHardwares = [...formik.values.hardwares];
      const [movedItem] = updatedHardwares.splice(sourceIndex, 1);
      updatedHardwares.splice(destinationIndex, 0, movedItem);

      const reorderedHardwares = updatedHardwares.map((hardware, idx) => ({
        ...hardware,
        sortOrder: idx,
      }));

      formik.setFieldValue("hardwares", reorderedHardwares);
    },
    [formik]
  );

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedHardwares = useMemo(
    () => (formik.values.hardwares || []).slice(startIndex, endIndex),
    [formik.values.hardwares, startIndex, endIndex]
  );

  return (
    <Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>{t("HW Name (EN)")}</TableCell>
                <TableCell>{t("HW Name (AR)")}</TableCell>
                <TableCell>{t("Price")}</TableCell>
                <TableCell>{t("Info")}</TableCell>
                <TableCell>{t("Image")}</TableCell>
                <TableCell>{t("Default Selected?")}</TableCell>
                <TableCell>{t("Actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <NewHardwareRow
                formik={formik}
                hardwareFormik={hardwareFormik}
                handleAddHardware={handleAddHardware}
              />
            </TableBody>
            <Droppable droppableId="hardwaresDroppable">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {paginatedHardwares.map((hardware: any, index: number) => (
                    <HardwareRow
                      key={hardware.key || index}
                      hardware={hardware}
                      index={index}
                      startIndex={startIndex}
                      formik={formik}
                      t={t}
                      setIsImageUpload={setIsImageUpload}
                    />
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </TableContainer>
      </DragDropContext>

      {formik.values.hardwares &&
        formik.values.hardwares.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={formik.values.hardwares.length}
            onPageChange={(_, newPage) => handlePageChange(newPage)}
            onRowsPerPageChange={handleRowsPerPageChange}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
    </Box>
  );
}
