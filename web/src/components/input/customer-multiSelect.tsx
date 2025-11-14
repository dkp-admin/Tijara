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

export default function CustomerMultiSelect({
  id,
  companyRef,
  onChange,
  selectedIds,
  groupRef,
  label = t("Customers"),
}: {
  id: string;
  companyRef: any;
  groupRef: any;
  onChange: (x: any, y?: any) => any;
  selectedIds?: any[];
  label?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities: customers, loading } = useEntity("customer");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      sort: "desc",
      activeTab: "all",
      _q: debouncedQuery || "",
      companyRef: companyRef,
    });
  }, [debouncedQuery, companyRef]);

  const filteredOptions = React.useMemo(() => {
    if (customers?.results?.length > 0) {
      const productList = customers.results?.filter(
        (customer) => !customer?.groupRefs?.includes(groupRef)
      );

      return productList;
    }

    return [];
  }, [customers, groupRef]);

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return customers?.results?.find(
          (customer) => customer?._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [customers, selectedIds, debouncedQuery]);

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
        disableCloseOnSelect
        value={getValue() || []}
        options={filteredOptions || []}
        getOptionLabel={(option) => option?.name || ""}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected}
            />
            {option?.name}
          </li>
        )}
        onChange={(e, newValue) => {
          onChange(newValue);
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
                onChange(undefined);
                setInputValue("");
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
