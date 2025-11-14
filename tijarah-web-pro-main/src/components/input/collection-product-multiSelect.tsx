import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox, CircularProgress } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import TextFieldWrapper from "../text-field-wrapper";

export default function CollectionProductMultiSelect({
  fromKitchen,
  categoryRefs,
  id,
  companyRef,
  collectionRef,
  onChange,
  selectedIds,
  fromQuickItems,
  label = t("Products"),
}: {
  fromKitchen?: boolean;
  categoryRefs?: string[];
  id: string;
  companyRef: any;
  collectionRef?: any;
  onChange: (x: any, y?: any) => any;
  selectedIds?: any[];
  label?: string;
  fromQuickItems?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities: products, loading } = useEntity("product");
  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 100,
        sort: "desc",
        activeTab: "all",
        _q: debouncedQuery || "",
        companyRef: companyRef,
        // categoryRefs: categoryRefs || [],
      });
    }
  }, [debouncedQuery, companyRef]);

  const filteredOptions = React.useMemo(() => {
    if (products?.results?.length > 0) {
      const productList = products.results?.filter(
        (product) => !collectionRef?.includes(product?._id)
      );

      return productList;
    }

    return [];
  }, [products, collectionRef]);

  const kitchenFilteredOptions = React.useMemo(() => {
    if (products?.results?.length > 0) {
      const productList = products.results?.filter(
        (product: any) => product?.kitchenRefs?.length === 0
      );

      return productList;
    }

    return [];
  }, [products, collectionRef]);

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return products?.results?.find(
          (product: any) => product?._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [products, selectedIds, debouncedQuery]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        id={id}
        multiple
        fullWidth
        disablePortal
        disableCloseOnSelect={true}
        value={fromQuickItems ? [] : getValue() || []}
        options={fromKitchen ? kitchenFilteredOptions : filteredOptions || []}
        getOptionLabel={(option) =>
          option?.name?.[lng] || option?.name?.en || ""
        }
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            {!fromQuickItems && (
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
            )}

            {option?.name?.[lng] || option.name?.en}
          </li>
        )}
        onChange={(e, newValue) => {
          console.log(newValue, "NEW VALUE");
          onChange(newValue);
          setInputValue("");
        }}
        noOptionsText={loading ? <CircularProgress /> : "No options"}
        renderInput={(params) => (
          <TextFieldWrapper
            {...params}
            fullWidth
            label={label}
            onKeyDown={(e) => {
              const { key } = e;
              const target = e.target as HTMLInputElement;
              if (key === "Backspace") {
                // onChange("", "");
                // setInputValue("");
              }
              if (key === " " && target.value === "") {
                e.preventDefault();
              }
            }}
          />
        )}
      />
    </Box>
  );
}
