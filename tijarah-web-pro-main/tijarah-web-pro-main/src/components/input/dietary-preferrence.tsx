import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { Preferrence } from "src/utils/constants";

export default function PreferrrenceMultiSelect({
  showAllPreferrence,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Dietary preferences"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  showAllPreferrence?: boolean;
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

  const uniquePreferrences = [...new Set(Preferrence)];

  const getValue = React.useCallback(() => {
    if (showAllPreferrence) {
      return [{ value: "all", label: "All" }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return Preferrence?.find((Channel) => Channel.value === selected);
      });

      return selected;
    }

    return [];
  }, [Preferrence, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          multiple
          id={id}
          fullWidth
          disableCloseOnSelect
          getOptionLabel={(option) => option?.label || ""}
          disablePortal
          disabled={disabled}
          options={
            [{ value: "all", label: "All" }, ...uniquePreferrences] || []
          }
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={
                  selected && !showAllPreferrence ? true : showAllPreferrence
                }
              />
              <Typography>{`${option.label}`}</Typography>
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?.value == "all") {
              selected.push(...uniquePreferrences);
            } else {
              newValue.map((value: any) => {
                if (value.value == "all") {
                  return;
                }

                selected.push(value);
              });
            }
            onChange(selected, Preferrence?.length);
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
