import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Autocomplete, Checkbox } from "@mui/material";
// import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

export default function ProductMultiSelect({
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Products"),
  disabled = false,
  required = false,
}: {
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: any[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  fetchCustomPriceProducts?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const [productList, setProductList] = React.useState([]);
  const lng = localStorage.getItem("currentLanguage");
  const { find, entities: products } = useEntity("product");

  React.useEffect(() => {
    find({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 25,
      _q: debouncedQuery || "",
      companyRef: companyRef,
    });
  }, [debouncedQuery, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      return selectedIds;
    }

    return [];
  }, [productList, products, selectedIds]);

  const getOptionLabel = (option: any) => {
    if (option?.variant?.type === "box") {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } [Box - ${option?.variant?.unitCount || 0} Unit(s)] - (SKU: ${
        option?.variant?.sku || "N/A"
      })`;
    } else if (option?.variant?.type === "crate") {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } [Crate - ${option?.variant?.unitCount || 0} Unit(s)] - (SKU: ${
        option?.variant?.sku || "N/A"
      })`;
    } else {
      return `${option?.name?.[lng] || option?.name?.en || ""} ${
        option?.hasMultipleVariants
          ? option?.variant?.name?.[lng] || option?.variant?.name?.en
          : ""
      } - (SKU: ${option?.variant?.sku || "N/A"})`;
    }
  };

  React.useEffect(() => {
    if (products?.results?.length > 0) {
      const data: any[] = [];

      products.results.map((product: any) => {
        product.variants.forEach((variant: any) => {
          const selected = selectedIds?.find((sel) => {
            return sel?.variant?.sku === variant?.sku;
          });

          if (!variant.nonSaleable && !selected) {
            data.push({
              productRef: product?._id,
              name: product?.name,
              categoryRef: product.categoryRef,
              batching: product.batching,
              tax: product.tax.percentage,
              taxRef: product.taxRef,
              variant: variant,
              productVariants: product.variants,
              hasMultipleVariants: product.variants.length > 1 ? true : false,
            });
          }
        });
      });

      setProductList(data);
    }
  }, [products?.results, selectedIds]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          multiple
          fullWidth
          freeSolo
          disableCloseOnSelect
          getOptionLabel={getOptionLabel}
          disablePortal
          disabled={disabled}
          options={productList || []}
          value={getValue() || []}
          onChange={(e, newValue: any) => {
            onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              id={id}
              {...params}
              required={required}
              label={t("Products")}
              fullWidth
              error={error}
              helperText={error}
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
                if (key === "Enter") {
                  e.preventDefault();
                  setInputValue("");
                  return;
                }
                if (key === "Backspace" && !params.inputProps.value) {
                  event.stopPropagation();
                  if (inputValue.length > 0) {
                    setInputValue(inputValue.slice(0, -1));
                    event.preventDefault();
                  }
                }
                if (key === " " && target.value === "") {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onKeyPress={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                }
              }}
            />
          )}
        />
      </Box>
    </>
  );
}
