import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { LoadingButton } from "@mui/lab";
import {
  Card,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { AddBoxesPackModal } from "src/components/modals/variant-tabs/boxes/add-boxes-pack-modal";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { useCurrency } from "src/utils/useCurrency";
interface BoxesDetailsProps {
  productData: any;
  companyRef: any;
  formik: any;
  createNew?: boolean;
}

export const BoxesDetails: React.FC<BoxesDetailsProps> = ({
  formik,
  productData,
  companyRef,
}) => {
  const { t } = useTranslation();

  const [openBoxPack, setOpenBoxPack] = useState(false);
  const [filterBox, setFilterBox] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [existing, setExisting] = useState(false);
  const currency = useCurrency();

  const handleRemoveBox = (indexToRemove: number) => {
    const updatedItems = formik.values.boxes.filter(
      (item: any, index: any) => index !== indexToRemove
    );
    formik.setFieldValue("boxes", updatedItems);
    toast(t("Boxes/Pack Remove"));
  };

  const handleAddEditBoxes = useCallback(
    (data: any) => {
      const otherBoxes = formik.values.boxes.filter(
        (box: any) => box.parentSku !== formik.values.sku
      );

      let boxes = filterBox;

      const idx = boxes?.findIndex((box: any) => box?.sku == data?.sku);

      if (data?.sku == undefined || idx == -1) {
        if (boxes.length > 0) {
          boxes = [...boxes, { ...data }];
        } else {
          boxes = [{ ...data }];
        }
        toast(t("Boxes/Pack Added"));
      } else {
        boxes.splice(idx, 1, data);
        toast(t("Boxes/Pack Updated"));
      }

      formik?.setFieldValue("boxes", [...boxes, ...otherBoxes]);
      setOpenBoxPack(false);
    },
    [formik.values.boxes, filterBox]
  );

  useEffect(() => {
    const boxes = formik.values.boxes.filter(
      (box: any) => box.parentSku === formik.values.sku
    );
    setFilterBox(boxes);
  }, [formik.values.boxes]);

  return (
    <>
      <Box sx={{ mt: 2, mb: 8, ml: "auto", mr: "auto", maxWidth: "800px" }}>
        <Box>
          <Grid
            xs={12}
            sx={{
              mt: 4,
              mb: 3,
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              width: "100%",
            }}
          >
            <LoadingButton
              onClick={() => {
                if (!formik.values.sku) {
                  toast.error(
                    `${t("Variant SKU is empty. Please add the SKU first.")}`
                  );
                } else if (!formik.values.variantNameEn) {
                  toast.error(
                    `${t("Variant Name is empty. Please add the Name first.")}`
                  );
                } else if (!formik.values.variantNameAr) {
                  toast.error(
                    `${t("Variant Name is empty. Please add the Name first.")}`
                  );
                } else {
                  setOpenBoxPack(true);
                }
              }}
              size="small"
              variant="contained"
              type="submit"
            >
              {t("Add boxes/pack")}
            </LoadingButton>
          </Grid>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t("Box SKU")}</TableCell>
                  <TableCell>{t("No of units")}</TableCell>
                  <TableCell>{t("Cost Price of the box")}</TableCell>
                  <TableCell>{t("Selling Price of the box")}</TableCell>
                  <TableCell width={50}></TableCell>
                </TableRow>
              </TableHead>
              {filterBox?.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      style={{ textAlign: "center", borderBottom: "none" }}
                    >
                      <Box sx={{ mt: 4, mb: 4 }}>
                        <NoDataAnimation
                          text={
                            <Typography
                              variant="h6"
                              textAlign="center"
                              sx={{ mt: 5 }}
                            >
                              {t("No Boxes!")}
                            </Typography>
                          }
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : (
                <TableBody>
                  {filterBox?.map((data: any, index: number) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            cursor: "pointer",
                            textTransform: "uppercase",
                          }}
                          onClick={() => {
                            setExisting(true);
                            setSelectedItem(filterBox[index]);
                            setOpenBoxPack(true);
                          }}
                        >
                          {data.sku}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {data.unitCount}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{`${currency} ${data.costPrice}`}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{`${currency} ${data.price}`}</Typography>
                      </TableCell>
                      <TableCell width={50}>
                        <Typography variant="body2">
                          <IconButton onClick={() => handleRemoveBox(index)}>
                            <DeleteOutlineIcon fontSize="small" color="error" />
                          </IconButton>
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              )}
            </Table>
          </Card>
        </Box>
      </Box>

      <AddBoxesPackModal
        existing={existing}
        existingSKU={productData?.existingSKU}
        open={openBoxPack}
        handleClose={() => {
          setOpenBoxPack(false);
          setSelectedItem(null);
          setExisting(false);
        }}
        handleAddEditBoxes={handleAddEditBoxes}
        parentSku={formik.values.sku}
        variantNameEn={formik.values.variantNameEn}
        variantNameAr={formik.values.variantNameAr}
        selectedItem={selectedItem}
        companyRef={companyRef}
      />
    </>
  );
};
