import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Button, Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

export default function CollectionMultiSelect({
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Collections"),
  disabled = false,
  required = false,
  handleModalOpen,
}: {
  id: string;
  companyRef?: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: any[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  handleModalOpen?: any;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities: collections } = useEntity("collection");
  const lng = localStorage.getItem("currentLanguage");

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return collections?.results?.find(
          (collection) => collection._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [collections, selectedIds, debouncedQuery]);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      sort: "desc",
      activeTab: "active",
      _q: debouncedQuery || "",
      companyRef: companyRef,
    });
  }, [debouncedQuery, companyRef]);

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
        disabled={disabled}
        disableCloseOnSelect
        value={getValue() || []}
        options={collections?.results || []}
        getOptionLabel={(option) =>
          option?.name?.[lng] || option?.name?.en || ""
        }
        noOptionsText={
          handleModalOpen ? (
            <Button onClick={handleModalOpen}>
              {t("Create new collection")}
            </Button>
          ) : (
            "No options"
          )
        }
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
          if (newValue.length > getValue().length) {
            onChange(newValue, "select-option");
          } else if (newValue.length < getValue().length) {
            onChange(newValue, "remove-option");
          }
        }}
        sx={{ mb: 1 }}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            label={label}
            helperText={error}
            required={required}
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
