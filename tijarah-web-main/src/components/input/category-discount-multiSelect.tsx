import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function CategoryDiscountMultiSelect({
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Category"),
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
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: categories } = useEntity("category");
  const lng = localStorage.getItem("currentLanguage");

  const uniqueCategories = [...new Set(categories?.results)];

  React.useEffect(() => {
    find({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 100,
      _q: inputValue || "",
      companyRef: companyRef,
    });
  }, [inputValue, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return categories?.results?.find(
          (category) => category._id === selected?._id
        );
      });

      return selected;
    }

    return [];
  }, [categories, selectedIds, inputValue]);

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
          disableCloseOnSelect
          getOptionLabel={(option) => {
            return option?.name?.en;
          }}
          disablePortal
          disabled={disabled}
          options={uniqueCategories || []}
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option?.name?.[lng] || option.name?.en}
            </li>
          )}
          onChange={(e, newValue: any) => {
            onChange(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error}
              helperText={error}
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
    </>
  );
}
