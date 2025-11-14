import { DeleteOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Divider,
  IconButton,
  Popover,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toFixedNumber } from "src/utils/toFixedNumber";
import TaxDropdown from "../input/tax-auto-complete";
import TextFieldWrapper from "../text-field-wrapper";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { SuperTable } from "../widgets/super-table";
import { StocktakesRowLoading } from "./stocktakes-row-loading";
import { SuperTableHeader } from "../widgets/super-table-header";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { Sort } from "src/types/sortoption";
import { SeverityPill } from "../severity-pill";
import toast from "react-hot-toast";
import { StocktakeBatchModal } from "../modals/stocktakes/stocktake-batch-modal";
import { PencilAlt as PencilAltIcon } from "src/icons/pencil-alt";
import { useCurrency } from "src/utils/useCurrency";

export function StocktakesAddCard({
  formik,
  stockid,
  newid,
  onRemoveItem,
  selectedOption,
  locationRef,
  companyRef,
}: any) {
  const { t } = useTranslation();
  const [isCancelAllClicked] = useState(false);
  const [page, setPage] = useState<number>(0);
  const [queryText, setQueryText] = useState("");
  const [productRef, setProductRef] = useState("");
  const [productSku, setProductSku] = useState("");
  const [idx, setIdx] = useState(null);
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [openDatePickers, setOpenDatePickers] = useState(
    formik.values.items.map(() => false)
  );
  const [openBatchModal, setOpenBatchModal] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [currentNote, setCurrentNote] = useState("");

  const handlePopoverOpen = (event: any, index: any) => {
    setAnchorEl(event.currentTarget);
    setCurrentIndex(index);
    setCurrentNote(formik.values.items[index].note);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setCurrentIndex(null);
  };

  const handleNoteSave = () => {
    handleProductFieldChange("note", currentNote, currentIndex);
    handlePopoverClose();
  };
  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const tableHeaders = [
    {
      key: "product",
      label: t("Product"),
    },
    {
      key: "sku",
      label: t("SKU"),
    },
    {
      key: "expected",
      label: t("Expected"),
    },
    {
      key: "actual",
      label: t("actual"),
    },
    {
      key: "discrepancy",
      label: t("Discrepancy"),
    },

    {
      key: "hasbatching",
      label: t("Has Batching"),
    },
    {
      key: "note",
      label: t("Note"),
    },
    {
      key: "price",
      label: t("Price"),
    },
    {
      key: "category",
      label: t("Category"),
    },
  ];

  if (selectedOption === "grn") {
    tableHeaders.push({
      key: "expiry",
      label: t("Expiry"),
    });
  }

  if (stockid == null) {
    tableHeaders.push({
      key: "action",
      label: t("Action"),
    });
  }

  const lng = localStorage.getItem("currentLanguage");
  const currency = useCurrency();

  const transformedData = useMemo(() => {
    const arr: any[] = formik.values.items?.map((product: any, idx: any) => {
      console.log(product, "dshdhsjshdjhsdjshdjshd");

      let stockConfig = {} as any;
      if (newid) {
        stockConfig = product?.stockConfiguration?.find(
          (config: any) => config?.locationRef === locationRef
        );
      } else {
        stockConfig = product?.variant?.stockConfiguration?.find(
          (config: any) => config?.locationRef === locationRef
        );
      }
      const stockCount = stockConfig ? stockConfig?.count : 0;

      return {
        key: idx,
        id: idx,
        product: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {product?.name[lng] || product?.name?.en},{" "}
            {product?.variant?.name[lng] || product?.variant?.name?.en}
          </Typography>
        ),
        sku: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {product.variant.sku}
          </Typography>
        ),
        expected: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {stockid ? product.expected : stockCount}
          </Typography>
        ),
        actual: (
          <TextFieldWrapper
            fullWidth
            disabled={
              formik.values.orderStatus === "complete" || product?.batching
            }
            variant="standard"
            name={`items[${idx}].actual`}
            value={formik.values.items[idx].actual}
            onChange={(e) =>
              handleProductFieldChange("actual", e.target.value, idx)
            }
            error={Boolean(
              formik.touched.items &&
                formik.errors.items &&
                formik.touched.items?.[idx]?.actual &&
                formik.errors.items?.[idx]?.actual
            )}
            helperText={
              formik.touched.items &&
              formik.errors.items &&
              formik.touched.items?.[idx]?.actual &&
              formik.errors.items?.[idx]?.actual
            }
            onBlur={formik.handleBlur(`items[${idx}].actual`)}
            onKeyPress={(event): void => {
              const ascii = event.charCode;
              const value = (event.target as HTMLInputElement).value;
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
              } else if ((ascii < 48 || ascii > 57) && ascii !== 46) {
                event.preventDefault();
              }
            }}
          />
        ),
        discrepancy: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {stockid
              ? product.discrepancy
              : formik.values.items[idx].actual
              ? Number(formik.values.items[idx].actual || 0) -
                Number(stockCount)
              : "0"}
          </Typography>
        ),
        hasbatching: (
          <Typography
            variant="body2"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {product.batching && (
              <Box
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.preventDefault();
                  setOpenBatchModal(true);
                  setProductRef(product?.productRef);
                  setProductSku(product?.variant?.sku);
                  setIdx(idx);
                }}
              >
                <SeverityPill style={{ cursor: "pointer" }} color={"primary"}>
                  {t("Select Batch")}
                  <IconButton color="primary" sx={{ mx: 0.2 }}>
                    <PencilAltIcon fontSize="small" />
                  </IconButton>
                </SeverityPill>
              </Box>
            )}
            {!product.batching && <Typography> -</Typography>}
          </Typography>
        ),

        note: (
          <div>
            <Button variant="text" onClick={(e) => handlePopoverOpen(e, idx)}>
              {formik.values.orderStatus === "completed"
                ? t("View Note")
                : formik.values.items[idx].note
                ? t("Edt Note")
                : t("Add Note")}
            </Button>
            <Popover
              open={Boolean(anchorEl) && currentIndex === idx}
              anchorEl={anchorEl}
              onClose={handlePopoverClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                style: { maxWidth: 200 },
              }}
            >
              <div style={{ padding: 16 }}>
                <TextFieldWrapper
                  fullWidth
                  variant="standard"
                  label="Note"
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  error={Boolean(
                    formik.touched.items &&
                      formik.errors.items &&
                      formik.touched.items?.[idx]?.note &&
                      formik.errors.items?.[idx]?.note
                  )}
                  onBlur={formik.handleBlur(`items[${idx}].note`)}
                />
                <Button onClick={handleNoteSave} color="primary">
                  {t("Save")}
                </Button>
                <Button onClick={handlePopoverClose} color="inherit">
                  {t("Cancel")}
                </Button>
              </div>
            </Popover>
          </div>
        ),

        price: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {`${currency} ${product.variant.sellingPrice}`}
          </Typography>
        ),
        category: (
          <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
            {product.category?.name || "na"}
          </Typography>
        ),

        action: stockid == null && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
            }}
          >
            <Button
              onClick={(e) => {
                e.preventDefault();
                onRemoveItem(idx);
              }}
            >
              <DeleteOutlined fontSize="medium" color="error" />
            </Button>
          </Box>
        ),
      };
    });

    return arr;
  }, [formik, anchorEl, currentIndex]);

  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedItems = transformedData?.slice(startIndex, endIndex);

  const handleProductFieldChange = useCallback(
    (fieldName: string, value: any, index: number) => {
      const currentItem = formik.values.items[index];
      let updatedTotal = currentItem.total;

      if (fieldName === "actual") {
        const actual = Number(value);
        updatedTotal = toFixedNumber(Number(actual));
      } else if (fieldName === "note") {
        const note = Number(value);

        updatedTotal = toFixedNumber(Number(currentItem.actual));
      }

      formik.setFieldValue(`items[${index}].${fieldName}`, value);
    },
    [formik.values.items]
  );

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const handleAddEditAction = useCallback(
    (newData: any, id: any) => {
      const existingBatches = formik.values.items[id]?.batches || [];

      // Create a map of existing batches for quick lookup
      const existingBatchesMap = existingBatches.reduce(
        (map: any, batch: any) => {
          map[batch.batchRef] = batch;
          return map;
        },
        {}
      );

      // Update existing batches or add new ones
      newData.forEach((newBatch: any) => {
        if (existingBatchesMap[newBatch.batchRef]) {
          existingBatchesMap[newBatch.batchRef] = {
            ...existingBatchesMap[newBatch.batchRef],
            ...newBatch,
          };
        } else {
          existingBatchesMap[newBatch.batchRef] = newBatch;
        }
      });

      // Convert the map back to an array
      const updatedBatches = Object.values(existingBatchesMap);

      const totalActual = updatedBatches.reduce(
        (acc: any, batch: any) => acc + batch.actual,
        0
      );

      formik.setFieldValue(`items[${id}].actual`, totalActual);
      formik.setFieldValue(`items[${id}].batches`, updatedBatches);
    },
    [formik.values.items]
  );

  return (
    <>
      <Box sx={{ mt: -2 }}>
        <Divider />
        {/* <SuperTableHeader
          onQueryChange={handleQueryChange}
          onFiltersChange={handleFilterChange}
          searchPlaceholder={t("Search with Name")}
          onSortChange={handleSortChange}
          sort={sort}
          showStatusFilter={false}
          sortOptions={sortOptions}
        /> */}
        <SuperTable
          isLoading={false}
          loaderComponent={StocktakesRowLoading}
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
                  <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                    {t("Currently, there are no items added")}
                  </Typography>
                }
              />
            </Box>
          }
        />
      </Box>
      {openBatchModal && (
        <StocktakeBatchModal
          modalData={idx}
          batchdata={formik.values.items}
          productSku={productSku}
          productRef={productRef}
          companyRef={companyRef?.toString()}
          locationRef={locationRef}
          handleAddEditAction={handleAddEditAction}
          selectedOption={selectedOption}
          open={openBatchModal}
          handleClose={() => {
            setOpenBatchModal(false);
            setProductRef("");
            setIdx(null);
          }}
        />
      )}
    </>
  );
}
