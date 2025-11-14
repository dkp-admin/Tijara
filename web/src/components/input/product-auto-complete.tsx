import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function ProductAutoCompleteDropdown({
  selectedIds,
  id,
  onChange,
  handleBlur,
  companyRef,
  locationRef,
  error = "",
  selectedId,
  label = t("Products"),
  disabled = false,
  required = true,
  dataTestId,
  skip,
}: {
  locationRef?: string;
  selectedIds?: string[];
  editing?: boolean;
  showAllLocation?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any) => any;
  handleBlur?: any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  skip?: string;
  showAll?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: products } = useEntity("product");
  const {
    find: findQuickItems,
    loading,
    entities: quickItems,
  } = useEntity("quick-items");

  const lng = localStorage.getItem("currentLanguage");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [addedProducts, setAddedProducts] = React.useState([]);

  const filteredOptions = React.useMemo(() => {
    if (products?.results?.length > 0) {
      const productList = products.results?.filter((product) => {
        return (
          !selectedIds?.includes(product?._id) &&
          !addedProducts?.includes(product?._id)
        );
      });

      return productList;
    }

    return [];
  }, [products, selectedIds, addedProducts]);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      companyRef: companyRef,
      locationRef,
    });
  }, [inputValue, companyRef, locationRef]);

  React.useEffect(() => {
    findQuickItems({
      page: 0,
      sort: "asc",
      activeTab: "all",
      limit: 50,
      companyRef: companyRef,
      locationRef: locationRef,
    });
  }, [companyRef, locationRef]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const productRefs = quickItems?.results?.map((d: any) => {
      return d?.productRef;
    });

    setAddedProducts(productRefs);
  }, [quickItems?.results]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          onBlur={handleBlur}
          getOptionLabel={(option) => {
            return `${option?.name?.[lng] || option.name?.en || ""} `;
          }}
          disablePortal
          disabled={disabled}
          options={filteredOptions || []}
          value={null}
          onChange={(e, newValue) => {
            onChange(newValue);
            setInputValue("");
            inputRef.current?.blur();
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              inputRef={inputRef}
              fullWidth
              error={error}
              helperText={error}
              onKeyDown={(e) => {
                const { key } = e;
                const target = e.target as HTMLInputElement;
                // if (key === "Backspace") {
                //   onChange(undefined);
                //   setInputValue("");
                // }
                if (key === " " && target.value === "") {
                  e.preventDefault();
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
