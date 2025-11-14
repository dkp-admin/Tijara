import {
  Box,
  Button,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { FC, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
// import useItems from "src/hooks/use-items";
import { usePageView } from "src/hooks/use-page-view";
// import useCartStore from "src/store/cart-item";
import useScanStore from "src/store/scan-store";
// import { autoApplyCustomCharges } from "src/utils/auto-apply-custom-charge";
import cart from "src/utils/cart";
import { trigger } from "src/utils/custom-event";
import { getItemSellingPrice, getItemVAT } from "src/utils/get-price";
import { useCurrency } from "src/utils/useCurrency";

interface BillingKeypadProps {
  company: any;
  handleAddToTable: any;
}

export const BillingKeypad: FC<BillingKeypadProps> = (props) => {
  const { company } = props;
  const { t } = useTranslation();
  const { setScan } = useScanStore();
  usePageView();
  const currency = useCurrency();

  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (Number(inputValue) === 0) {
      toast.error(t("Price must be greater than 0"));
      return;
    }

    if (inputValue > company?.transactionVolumeCategory) {
      toast.error(
        `${t("Transaction amount must be less than or equal to ")}${
          company?.transactionVolumeCategory
        }`
      );

      return;
    }

    const vat = Number(company.vat.percentage);

    const item = {
      image: "",
      productRef: "OPEN_ITEM" + (Math.random() * 10).toString(),
      categoryRef: "",
      name: { en: "Open Item", ar: "افتح العنصر" },
      category: { name: "" },
      costPrice: 0,
      sellingPrice: getItemSellingPrice(Number(inputValue), vat),
      variantNameEn: "Regular",
      variantNameAr: "عادي",
      type: "item",
      sku: "Open Item",
      parentSku: "",
      boxSku: "",
      crateSku: "",
      boxRef: "",
      crateRef: "",
      vat,
      vatAmount: getItemVAT(Number(inputValue), vat),
      qty: 1,
      hasMultipleVariants: false,
      itemSubTotal: getItemSellingPrice(Number(inputValue), vat),
      itemVAT: getItemVAT(Number(inputValue), vat),
      total: Number(inputValue),
      unit: "perItem",
      noOfUnits: 1,
      note: "",
      isOpenItem: true,
      availability: true,
      tracking: false,
      stockCount: 1,
      modifiers: [] as any,
      channel: [] as any,
      productModifiers: [] as any,
    };

    cart.addToCart(item, (items: any) => {
      trigger("itemAdded", null, items, null, null);
    });

    // autoApplyCustomCharges(
    //   item.total + totalAmount - totalCharges + totalCharges,
    //   customCharges,
    //   chargesApplied,
    //   item.itemSubTotal + subTotalWithoutDiscount
    // );
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/[^0-9.]/g, "");

    const decimalIndex = newValue.indexOf(".");
    if (decimalIndex !== -1 && newValue.slice(decimalIndex + 1).length > 2) {
      return;
    }

    setInputValue(newValue);
  };

  const handleButtonClick = (value: any) => {
    if (value === "<-") {
      setInputValue((prevValue) => prevValue.slice(0, -1));
    } else if (value === "." && inputValue.includes(".")) {
      return;
    } else if (value === "." && inputValue === "0.00") {
      setInputValue("0.");
    } else if (value === "." && inputValue.split(".")[1]?.length === 2) {
      return;
    } else {
      const decimalIndex = inputValue.indexOf(".");
      const decimalPlaces =
        decimalIndex === -1 ? 0 : inputValue.length - decimalIndex - 1;

      if (inputValue.length < 10 && decimalPlaces < 2) {
        const newInputValue =
          inputValue === "0.00" ? `${value}` : `${inputValue}${value}`;
        setInputValue(newInputValue);
      }
    }
  };

  const buttons = [1, 2, 3, 4, 5, 6, 7, 8, 9, ".", 0, "<-"];

  return (
    <>
      <Stack
        spacing={1}
        sx={{
          height: "calc(100vh - 250px)",
          justifyContent: "center",
          alignItems: "center",
          pt: 1,
          pl: 1,
          pr: 2,
          pb: 1,
        }}
      >
        <CardContent sx={{ height: "100%", mt: 2, p: 0, pr: 2 }}>
          <Grid
            container
            spacing={1}
            sx={{ pl: 1.25, mx: "auto", justifyContent: "space-between" }}
          >
            <Box sx={{ display: "flex", width: "70%" }}>
              <TextField
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Typography
                      color="textSecondary"
                      fontSize={"1.25rem"}
                      variant="body2"
                    >
                      {currency}
                    </Typography>
                  ),
                  inputProps: {
                    maxLength: 10,
                    style: {
                      fontSize: "1.25rem",
                      padding: "12px",
                      paddingLeft: "10px",
                    },
                  },
                }}
                fullWidth
                placeholder="0.00"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setScan(true)}
                onBlur={() => setScan(false)}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                width: "27%",
                height: "100%",
                marginTop: 0.75,
              }}
            >
              <Button
                variant="contained"
                sx={{ borderRadius: "8px", width: "100%", minWidth: "auto" }}
                onClick={() => {
                  handleAdd();
                  setInputValue("");
                }}
              >
                {t("Add")}
              </Button>
            </Box>
          </Grid>
          <Grid container spacing={0} sx={{ mt: 2, ml: 1.5, height: "100%" }}>
            {buttons.map((num) => (
              <Grid key={num} item xs={4} sx={{ display: "flex" }}>
                <Button
                  variant="text"
                  sx={{
                    width: "100%",
                    minHeight: "100%",
                    borderRadius: 0,
                    flex: 1,
                    fontSize: "2rem",
                  }}
                  onClick={() => handleButtonClick(num)}
                >
                  {num}
                </Button>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Stack>
    </>
  );
};
