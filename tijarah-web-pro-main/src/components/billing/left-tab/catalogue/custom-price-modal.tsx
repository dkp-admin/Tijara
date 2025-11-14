import { LoadingButton } from "@mui/lab";
import {
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Grid,
  Modal,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import XCircle from "@untitled-ui/icons-react/build/esm/XCircle";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
// import useItems from "src/hooks/use-items";
// import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { ModifiersModal } from "./modifiers-modal";
import CloseIcon from "@mui/icons-material/Close";

interface CustomPriceModalProps {
  open: boolean;
  isFromPriceModal?: boolean;
  handleClose: any;
  productlist: any;
  company: any;
  handlePriceModalClose?: any;
}

export const CustomPriceModal: React.FC<CustomPriceModalProps> = ({
  open = false,
  isFromPriceModal = false,
  handleClose,
  productlist,
  company,
  handlePriceModalClose,
}) => {
  const { device } = useAuth();
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const theme = useTheme();
  const { setScan } = useScanStore();

  const [productData, setProductData] = useState<any>(null);
  const [openModifiersModal, setOpenModifersModal] = useState(false);

  const handleSelectVariant = (data: any) => {
    if (inputValue > company?.transactionVolumeCategory) {
      toast.error(
        `${"Billing amount must be less than or equal to "}${
          company?.transactionVolumeCategory
        }`
      );
      return;
    }
    if (isFromPriceModal) {
      const vat = company.vat.percentage;

      const priceData = data?.prices?.find(
        (price: any) => price?.locationRef === device.locationRef
      );

      const stockConfig = data?.stockConfiguration?.find(
        (stock: any) => stock?.locationRef === device.locationRef
      );

      handlePriceModalClose({
        _id: data._id,
        image: data.image,
        name: { en: data.name.en, ar: data.name.ar },
        type: data.type || "item",
        sku: data.sku,
        parentSku: data?.parentSku || "",
        boxSku: data?.boxSku || "",
        code: data?.code || "",
        crateSku: data?.crateSku || "",
        boxRef: data?.boxRef || "",
        crateRef: data?.crateRef || "",
        costPrice: priceData?.costPrice || 0,
        sellingPrice: Number(inputValue),
        vat,
        qty: 1,
        unit: data.unit || "perItem",
        noOfUnits: 1,
        note: "",
        isOpenPrice: true,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        stockCount: stockConfig?.count ? stockConfig.count : 0,
      });
    } else {
      const priceData = data.variants?.[0].prices?.find(
        (price: any) => price?.locationRef === device.locationRef
      );

      const stockConfig = data.variants?.[0].stockConfiguration?.find(
        (stock: any) => stock?.locationRef === device.locationRef
      );

      const item = {
        productRef: data._id,
        categoryRef: data.categoryRef || "",
        image: data.variants[0].image || data.image || "",
        name: { en: data.name.en, ar: data.name.ar },
        category: { name: data.category.name },
        variantNameEn: data.variants[0].name.en,
        variantNameAr: data.variants[0].name.ar,
        type: data.variants[0].type || "item",
        sku: data.variants[0].sku,
        parentSku: data.variants[0]?.parentSku || "",
        boxSku: "",
        crateSku: "",
        code: data?.variants[0]?.code || "",
        boxRef: "",
        crateRef: "",
        costPrice: priceData?.costPrice || 0,
        sellingPrice: getItemSellingPrice(inputValue, data.tax.percentage),
        vat: data.tax.percentage,
        vatAmount: getItemVAT(inputValue, data.tax.percentage),
        qty: 1,
        hasMultipleVariants: data?.multiVariants
          ? Boolean(data.multiVariants)
          : data.variants?.length > 1,
        itemSubTotal: getItemSellingPrice(inputValue, data.tax.percentage),
        itemVAT: getItemVAT(inputValue, data.tax.percentage),
        total: Number(inputValue),
        unit: data.variants[0].unit || "perItem",
        noOfUnits: 1,
        note: "",
        isOpenPrice: true,
        availability: stockConfig ? stockConfig.availability : true,
        tracking: stockConfig ? stockConfig.tracking : false,
        stockCount: stockConfig?.count ? stockConfig.count : 0,
        modifiers: [] as any,
        channel: data?.channel,
        productModifiers: data?.modifiers,
      };

      const activeModifiers = data?.modifiers?.filter(
        (modifier: any) => modifier.status === "active"
      );

      if (data?.modifiers?.length > 0 && activeModifiers?.length > 0) {
        setProductData(item);
        setOpenModifersModal(true);
        return;
      }

      cart.addToCart(item, (items: any) => {
        trigger("itemAdded", null, items, null, null);
      });

      // autoApplyCustomCharges(
      //   item.total + totalAmount - totalCharges + totalCharges,
      //   customCharges,
      //   chargesApplied,
      //   item.itemSubTotal + subTotalWithoutDiscount
      // );

      handleClose();
    }
  };

  useEffect(() => {
    setInputValue("");
  }, [open]);

  return (
    <>
      <Box>
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
              {t("Add price")}
            </Typography>

            <Box
              sx={{
                // mb: 2,
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
              <CloseIcon
                fontSize="medium"
                onClick={() => {
                  if (isFromPriceModal) {
                    handlePriceModalClose();
                  } else {
                    handleClose();
                  }
                }}
              />
            </Box>
          </Box>
          <Divider />
          <DialogContent>
            <Box>
              <Stack spacing={1} sx={{ mb: 1 }}>
                <Grid container>
                  <Grid item md={12} xs={12}>
                    <Box>
                      <TextField
                        fullWidth
                        label={t("Enter price")}
                        value={inputValue}
                        onFocus={() => setScan(true)}
                        onBlur={() => setScan(false)}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(event): void => {
                          const ascii = event.charCode;
                          const value = (event.target as HTMLInputElement)
                            .value;
                          const decimalCheck = value.indexOf(".") !== -1;

                          if (decimalCheck) {
                            const decimalSplit = value.split(".");
                            const decimalLength = decimalSplit[1].length;

                            if (decimalLength > 1 || ascii === 46) {
                              event.preventDefault();
                            } else if (ascii < 48 || ascii > 57) {
                              event.preventDefault();
                            }
                          } else if (value.length > 8 && ascii !== 46) {
                            event.preventDefault();
                          } else if (
                            (ascii < 48 || ascii > 57) &&
                            ascii !== 46
                          ) {
                            event.preventDefault();
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "end",
            }}
          >
            <LoadingButton
              onClick={(e) => {
                e.preventDefault();
                if (
                  inputValue === null ||
                  inputValue === "" ||
                  inputValue === "0" ||
                  /^0+$/.test(inputValue)
                ) {
                  toast.error(
                    `${t("Price is required and must be a valid number")}`
                  );
                  return;
                }

                handleSelectVariant(productlist);
              }}
              sx={{ borderRadius: 1 }}
              variant="contained"
              type="submit"
            >
              {t("Add")}
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </Box>

      {openModifiersModal && (
        <ModifiersModal
          data={productData}
          open={openModifiersModal}
          handleClose={() => {
            setOpenModifersModal(false);
            setProductData(null);
          }}
          handleSuccess={() => {
            handleClose();
            setOpenModifersModal(false);
            setProductData(null);
          }}
        />
      )}
    </>
  );
};
