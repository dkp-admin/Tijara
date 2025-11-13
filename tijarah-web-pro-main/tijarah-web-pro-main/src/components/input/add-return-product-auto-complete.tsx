import {
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

interface AddReturnProductTextInputProps {
  id: string;
  onChange: (id: string, name: string) => void;
  onProductSelect: any;
  error?: string;
  selectedId: string;
  label?: string;
  formik?: any;
}

export default function AddReturnProductTextInput({
  id,
  onChange,
  onProductSelect,
  error = "",
  formik,
  label = t("Product"),
}: AddReturnProductTextInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [returnProduct, setReturnProduct] = React.useState([]);
  const [filteredOptions, setFilteredOptions] = React.useState([]);
  const [selectedProductSku, setSelectedProductSku] = React.useState([]);

  React.useEffect(() => {
    console.log(formik.values.items);

    // Filter products based on return qty
    const filteredProducts = formik?.values?.items?.filter(
      (item: any) => item.received > 0
    );
    setReturnProduct(filteredProducts);
  }, [formik?.values?.items]);

  React.useEffect(() => {
    // Filter products based on input value
    const filteredProducts = returnProduct?.filter((product: any) =>
      product.name.en.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filteredProducts);
  }, [returnProduct, inputValue]);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  const handleItemSelect = (
    event: React.ChangeEvent<{}>,
    value: any // Change this type as per your product structure
  ) => {
    if (value) {
      // Handle the selected product
      onProductSelect(value);
      setInputValue(""); // Clear input value after selection
    }
  };

  const getOptionLabel = (option: any) => {
    // Define how product option should be displayed

    if (option?.type === "box") {
      return `${option?.name?.en || ""} ${
        option?.hasMultipleVariants ? option?.variant?.name?.en : ""
      } [Box - ${option?.unitCount || 0} Unit(s)] - (SKU: ${
        option?.sku || "N/A"
      })`;
    } else if (option?.type === "crate") {
      return `${option?.name?.en || ""} ${
        option?.hasMultipleVariants ? option?.variant?.name?.en : ""
      } [Crate - ${option?.unitCount || 0} Unit(s)] - (SKU: ${
        option?.sku || "N/A"
      })`;
    } else {
      return `${option?.name?.en || ""} ${
        option?.hasMultipleVariants ? option?.variant?.name?.en : ""
      } - (SKU: ${option?.sku || "N/A"})`;
    }
  };

  const filteredOptionsUnique = React.useMemo(() => {
    if (!filteredOptions) return [];

    return filteredOptions.filter(
      (option) => !selectedProductSku.includes(option.sku)
    );
  }, [filteredOptions, selectedProductSku]);

  React.useEffect(() => {
    const variantSku = formik.values?.returnItems?.map((item: any) => item.sku);
    setSelectedProductSku(variantSku);
  }, [formik]);

  return (
    <Box>
      <Autocomplete
        id={id}
        fullWidth
        options={filteredOptionsUnique || []}
        value={null}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={handleItemSelect}
        getOptionLabel={getOptionLabel}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            fullWidth
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  {error && (
                    <Typography color="error" variant="caption">
                      {error}
                    </Typography>
                  )}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props}>
            <Typography variant="body2">{getOptionLabel(option)}</Typography>
          </li>
        )}
        PopperComponent={({ children, ...popperProps }) => (
          <Popper {...popperProps} placement="bottom-start">
            <Paper>
              <List component="ul" aria-label="product options">
                {React.isValidElement(children) ? (
                  children
                ) : (
                  <ListItem>
                    <ListItemText primary="No options available" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Popper>
        )}
      />
    </Box>
  );
}
