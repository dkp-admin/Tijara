import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";

const dayOptions = [
  {
    name: "Monday",
    _id: "Monday",
  },
  {
    name: "Tuesday",
    _id: "Tuesday",
  },
  {
    name: "Wednesday",
    _id: "Wednesday",
  },
  {
    name: "Thursday",
    _id: "Thursday",
  },
  {
    name: "Friday",
    _id: "Friday",
  },
  {
    name: "Saturday",
    _id: "Saturday",
  },
  {
    name: "Sunday",
    _id: "Sunday",
  },
];

export default function DayMultiSelect({
  showAllDays,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Days"),
  disabled = false,
  required = false,
}: {
  showAllDays?: boolean;
  id: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const getValue = React.useCallback(() => {
    if (showAllDays) {
      return [{ name: "All", _id: "All" }];
    }

    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return dayOptions?.find((day) => day.name === selected);
      });

      return selected;
    }

    return [];
  }, [dayOptions, selectedIds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        multiple
        id={id}
        fullWidth
        disableCloseOnSelect
        getOptionLabel={(option) => {
          return option?.name;
        }}
        disablePortal
        disabled={disabled}
        options={[{ name: "All", _id: "All" }, ...dayOptions] || []}
        value={getValue() || []}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected && !showAllDays ? true : showAllDays}
            />
            {option?.name}
          </li>
        )}
        onChange={(e, newValue: any) => {
          const lastSelected = newValue[newValue.length - 1];

          const selected: any = [];

          if (lastSelected?._id === "All") {
            selected.push(...dayOptions);
          } else {
            newValue.map((value: any) => {
              if (value._id === "All") {
                return;
              }

              selected.push(value);
            });
          }

          onChange(selected, dayOptions?.length);
        }}
        sx={{ mb: 1 }}
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
