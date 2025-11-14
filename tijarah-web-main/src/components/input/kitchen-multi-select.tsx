import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

export default function KitchenMultiSelect({
  id,
  companyRef,
  onChange,
  selectedIds,
  label = t("Kitchens"),
  disabled = false,
}: {
  id: string;
  companyRef: string;
  onChange: (x: any) => any;
  selectedIds: string[];
  label: string;
  disabled: boolean;
}) {
  const lng = localStorage.getItem("currentLanguage");

  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities: kitchens } = useEntity("kitchen-management");

  const uniqueKitchens = [...new Set(kitchens?.results)];

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      sort: "desc",
      activeTab: "active",
      _q: debouncedQuery || "",
      companyRef: companyRef,
    });
  }, [debouncedQuery, companyRef]);

  const getValue = React.useCallback(() => {
    if (kitchens?.total === selectedIds?.length) {
      return [{ _id: "all", name: { en: "All Kitchens" } }];
    }

    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return kitchens?.results?.find((kitchen) => kitchen._id === selected);
      });

      return selected;
    }

    return [];
  }, [kitchens, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          multiple
          id={id}
          fullWidth
          disableCloseOnSelect
          getOptionLabel={(option) =>
            option?.name?.[lng] || option?.name?.en || ""
          }
          disablePortal
          disabled={disabled}
          options={
            [
              {
                _id: "all",
                name: { en: "All Kitchens", ar: "جميع المطابخ" },
              },
              ...uniqueKitchens,
            ] || []
          }
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
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id == "all") {
              selected.push(...uniqueKitchens);
            } else {
              newValue.map((value: any) => {
                if (value._id == "all") {
                  return;
                }

                selected.push(value);
              });
            }
            onChange(selected);
          }}
          sx={{ mb: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              fullWidth
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
