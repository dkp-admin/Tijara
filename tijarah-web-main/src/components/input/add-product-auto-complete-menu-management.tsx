import {
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
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
  onProductSelect: any;
  error?: string;
  label?: string;
  formik?: any;
  disabled?: boolean;
  required?: boolean;
  companyRef?: string;
  dataTestId?: string;
  userType?: string;
  selectedProducts?: any[];
  locationRef?: any;
}

export default function AddProductTextInputMenuManagement({
  id,
  onProductSelect,
  error = "",
  companyRef,
  label = t("Product"),
  disabled = false,
  dataTestId,
  selectedProducts,
  locationRef = "",
}: AddProductTextInputProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const { find, entities: product, loading } = useEntity("product");

  const lng = localStorage.getItem("currentLanguage");

  useEffect(() => {
    find({
      page: 0,
      limit: 500,
      _q: debouncedQuery || "",
      activeTab: "active",
      sort: "asc",
      companyRef: user.company?._id || companyRef,
      locationRef,
    });
  }, [debouncedQuery, user.company?._id, companyRef, locationRef]);

  const filteredOptions: any = React.useMemo(() => {
    if (product?.results?.length > 0) {
      const filteredProducts = product?.results?.filter(
        (product: any) => !selectedProducts?.includes(product?._id)
      );

      return filteredProducts;
    }

    return [];
  }, [debouncedQuery, product, selectedProducts]);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          disablePortal
          disabled={disabled}
          onInputChange={handleInputChange}
          options={filteredOptions || []}
          value={null}
          inputValue={inputValue}
          onChange={(e, newValue) => {
            const payload = {
              company: newValue?.company,
              companyRef: newValue?.companyRef,
              productRef: newValue?._id,
              variants: newValue?.variants,
              boxes: newValue?.boxes,
              name: newValue?.name,
              _id: newValue?._id,
              sortOrder: 0,
              categoryRef: newValue?.categoryRef,
              category: newValue?.category,
              brand: newValue?.brand,
              brandRef: newValue?.brandRef,
              ...newValue,
            };

            onProductSelect(payload);
          }}
          getOptionLabel={(option) => {
            return option?.name?.en || option?.name?.en || "";
          }}
          noOptionsText={loading ? <CircularProgress /> : "No options"}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={false}
              label={label}
              fullWidth
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
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
            />
          )}
        />
        {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
