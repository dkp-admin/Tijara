import CloseIcon from "@mui/icons-material/Close";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useEntity } from "src/hooks/use-entity";

interface Batch {
  _id: string;
  sku: string;
  expiry: string;
  available: number;
}

interface StocktakeBatchProps {
  open?: boolean;
  handleClose?: () => void;
  modalData?: any;
  productRef?: string;
  productSku?: string;
  companyRef?: string;
  selectedOption?: string;
  locationRef?: string;
  handleAddEditAction: any;
  batchdata?: any;
}

interface InputState {
  [key: string]: {
    actual: number;
  };
}

export const StocktakeBatchModal = (props: StocktakeBatchProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const {
    open,
    modalData,
    handleClose,
    selectedOption,
    productSku,
    productRef,
    companyRef,
    locationRef,
    handleAddEditAction,
    batchdata,
  } = props;
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productList, setProductList] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [batchRef, setBatchRef] = useState("");
  const [batch, setBatch] = useState<any>(null);
  const [showAll, setShowAll] = useState(false);
  const [inputs, setInputs] = useState<InputState>({});

  const { find, entities: batchs } = useEntity("batch");

  useEffect(() => {
    find({
      page: 0,
      limit: 50,
      _q: "",
      activeTab: "all",
      sort: "desc",
      locationRef: locationRef,
      companyRef: companyRef,
      productRef: productRef,
      sku: productSku,
    });
  }, [locationRef, companyRef, productRef, productSku]);

  const handleInputChange = (batchId: any, field: any, value: any) => {
    setInputs((prevInputs) => ({
      ...prevInputs,
      [batchId]: {
        ...prevInputs[batchId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = () => {
    const data = batchs.results
      ?.filter((batch) => inputs.hasOwnProperty(batch._id))
      .map((batch) => ({
        batchRef: batch._id,
        sku: batch.sku,
        expiry: batch.expiry,
        available: batch.available,
        actual: inputs[batch._id]?.actual || 0,
      }));

    handleAddEditAction(data, modalData);
    handleClose();
  };

  const visibleBatches = showAll
    ? batchs?.results
    : batchs?.results?.slice(0, 3);

  const totalAvailable = batchs?.results?.reduce(
    (acc, batch) => acc + batch?.available,
    0
  );
  const totalActual = batchs?.results?.reduce(
    (acc, batch) => acc + (inputs[batch._id]?.actual || 0),
    0
  );

  // useEffect(() => {
  //   if (open) {
  //     console.log("dgdgd", batchdata);

  //     setSelectedProducts(modalData || []);
  //   }
  // }, [open]);

  console.log(inputs);

  useEffect(() => {
    if (open) {
      const selectedBatch = batchdata[modalData];
      setSelectedProducts(selectedBatch || []);

      if (selectedBatch && selectedBatch.batching) {
        const inputData = selectedBatch.batches?.reduce(
          (acc: any, batch: any) => {
            acc[batch.batchRef] = { actual: batch.actual };
            return acc;
          },
          {}
        );

        setInputs(inputData || {});
      }
    }
  }, [open]);

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
            px: 2,
            mt: 2,
            mb: 2,
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
          <Box sx={{ textAlign: "center" }}>
            <Typography
              sx={{ ml: 2, textTransform: "capitalize" }}
              variant="h6"
            >
              {batchdata[modalData]?.name?.en +
                ", " +
                batchdata[modalData]?.variant?.name?.en ||
                t("Selecte batch you want to adjust")}
            </Typography>
          </Box>

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
          <form>
            <Stack spacing={2}>
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("Batch")}</TableCell>
                        <TableCell>{t("Available")}</TableCell>
                        <TableCell>{t("Actual")}</TableCell>
                      </TableRow>
                    </TableHead>
                    {batchs?.results?.length > 0 ? (
                      <TableBody>
                        {visibleBatches?.map((batch) => (
                          <TableRow key={batch._id}>
                            <TableCell style={{ borderBottom: "none" }}>
                              {format(new Date(batch.expiry), "dd/MM/yyyy")}
                            </TableCell>
                            <TableCell style={{ borderBottom: "none" }}>
                              {batch.available}
                            </TableCell>
                            <TableCell style={{ borderBottom: "none" }}>
                              <TextField
                                label="Actual"
                                variant="standard"
                                fullWidth
                                value={inputs[batch._id]?.actual || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    batch._id,
                                    "actual",
                                    Number(e.target.value)
                                  )
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                        {!showAll && batchs?.results?.length > 3 && (
                          <TableRow>
                            <TableCell colSpan={3} align="center">
                              <Button onClick={() => setShowAll(true)}>
                                {t("Show More")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow>
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>

                        <TableRow style={{ borderBottom: "none" }}>
                          <TableCell style={{ borderBottom: "none" }}>
                            {t("Total")}
                          </TableCell>
                          <TableCell style={{ borderBottom: "none" }}>
                            {totalAvailable}
                          </TableCell>
                          <TableCell style={{ borderBottom: "none" }}>
                            {totalActual}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    ) : (
                      <TableBody>
                        {" "}
                        <TableRow>
                          <TableCell colSpan={3} align="center">
                            {t("No Batch Found please add bach from product")}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
          </form>
        </DialogContent>
        <Divider />

        {/* footer */}
        <DialogActions sx={{ px: 2, mb: 1 }}>
          <LoadingButton
            sx={{ borderRadius: 1 }}
            onClick={handleSubmit}
            size="medium"
            variant="contained"
            type="submit"
          >
            {t("Done")}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
