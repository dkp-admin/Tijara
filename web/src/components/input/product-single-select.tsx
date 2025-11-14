import { CircularProgress, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEffect } from "react";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

interface Product {
  _id: string;
  productRef: string;
  categoryRef: string;
  category: { name: string };
  name: any;
  variant: any;
  batching: boolean;
  hasMultipleVariants: boolean;
  sku: Array<any>;
  tax: any;
  taxRef: string;
  expiry: Date;
  productVariants: any[];
  status: string;
}

interface AddProductTextInputProps {
  id: string;
  onChange: (data: any) => void;
  error?: any;
  helperText?: any;
  selectedId: string;
  label?: string;
  formik?: any;
  disabled?: boolean;
  required?: boolean;
  locationRefs?: any;
  selectedLocationTo?: any;
  companyRef?: string;
  dataTestId?: string;
  handleModalOpen?: any;
  orderType?: string;
  userType?: string;
}

export default function NewProductAutoCompleteDropdown({
  id,
  onChange,
  error,
  helperText,
  formik,
  companyRef,
  locationRefs,
  label = t("Product"),
  disabled = false,
  dataTestId,
  handleModalOpen,
  selectedId,
  required,
}: AddProductTextInputProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const { find, entities: product, loading } = useEntity("product");

  const [productList, setProductList] = React.useState([]);

  const lng = localStorage.getItem("currentLanguage");

  const getOptionLabel = (option: Product) => {
    if (option?.variant?.type === "item") {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } - (SKU: ${option?.variant?.sku || "N/A"}) `;
    }
  };

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return productList?.find(
        (product: any) => product?.variant?.sku === selectedId
      );
    }

    return "";
  }, [productList, selectedId, inputValue]);

  useEffect(() => {
    find({
      page: 0,
      limit: 500,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "asc",
      locationRefs: locationRefs,
      companyRef: companyRef || user.company?._id,
    });
  }, [debouncedQuery, user.company?._id, companyRef, locationRefs]);

  useEffect(() => {
    if (product?.results?.length > 0) {
      const data: any[] = [];

      product.results.map((product: any) => {
        product.variants.forEach((variant: any) => {
          data.push({
            productRef: product?._id,
            name: product.name,
            categoryRef: product.categoryRef,
            category: product.category,
            brand: product.brand,
            brandRef: product.brandRef,
            batching: product.batching,
            tax: {
              percentage: product.tax.percentage,
            },
            taxRef: product.taxRef,
            price: variant.price,
            costPrice: variant?.costPrice,
            sku: variant.sku,
            code: variant.code,
            variantNameEn: variant.name.en,
            variantNameAr: variant.name.ar,
            variant: variant,
            stockConfiguration: variant?.stockConfiguration.map((d: any) => {
              return {
                availability: d.availablity,
                tracking: d.tracking,
                count: d.count,
                lowStockAlert: d.lowStockAlert,
                lowStockCount: d.lowStockCount,
                locationRef: d.locationRef,
                location: {
                  name: d.location.name,
                },
              };
            }),
            productVariants: product.variants,
            hasMultipleVariants: product.variants.length > 1 ? true : false,
          });
        });
      });

      setProductList(data);
    }
  }, [product?.results]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  useEffect(() => {
    setInputValue(selectedId);
  }, [selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={getOptionLabel}
          noOptionsText={
            inputValue === "" ? (
              "No options"
            ) : loading ? (
              <CircularProgress />
            ) : (
              // <Button onClick={handleModalOpen}>
              //   {t("Create New Product")}
              // </Button>
              <></>
            )
          }
          disablePortal
          disabled={disabled}
          options={productList || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              // disabled={editing}
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error}
              helperText={helperText}
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
                if (key === "Backspace") {
                  onChange(undefined);
                  setInputValue("");
                }
                if (key === " " && target.value === "") {
                  e.preventDefault();
                }
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!/[^a-zA-Z0-9]/.test(inputValue)) {
                  setInputValue(inputValue);
                }
              }}
            />
          )}
        />
      </Box>
    </>
  );
}
