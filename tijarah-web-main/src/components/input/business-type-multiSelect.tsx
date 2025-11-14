import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export default function BusinessTypeMultiSelect({
  dontShowAll,
  showAllBusinessTypes,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Business Type"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  dontShowAll?: boolean;
  showAllBusinessTypes?: boolean;
  id: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: businessTypes } = useEntity("business-type");

  const uniqueBusinessTypes = [...new Set(businessTypes?.results)];

  React.useEffect(() => {
    find({
      page: 0,
      limit: 30,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (showAllBusinessTypes) {
      return [{ _id: "all", name: { en: "All Business Types" } }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return businessTypes?.results?.find(
          (businessType) => businessType._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [businessTypes, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          multiple
          id={id}
          fullWidth
          disableCloseOnSelect
          getOptionLabel={(option) => option?.name?.en || ""}
          disablePortal
          disabled={disabled}
          options={
            dontShowAll
              ? [...uniqueBusinessTypes] || []
              : [
                  { _id: "all", name: { en: "All Business Types" } },
                  ...uniqueBusinessTypes,
                ] || []
          }
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={
                  selected && !showAllBusinessTypes
                    ? true
                    : showAllBusinessTypes
                }
              />
              {option?.name?.en}
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id == "all") {
              selected.push(...uniqueBusinessTypes);
            } else {
              newValue.map((value: any) => {
                if (value._id == "all") {
                  return;
                }

                selected.push(value);
              });
            }
            onChange(selected, businessTypes.total);
          }}
          sx={{ mb: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
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
        {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
