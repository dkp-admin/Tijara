import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";

export default function ExcludedOptionsMultiSelect({
  data,
  showAllOptions = false,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Excluded options"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  data: any;
  showAllOptions?: boolean;
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

  const uniqueOptions = [...new Set(data)];

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return data?.find((d: any) => d._id === selected);
      });

      return selected;
    }

    return [];
  }, [data, selectedIds, inputValue]);

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
          getOptionLabel={(option) => option?.name || ""}
          disablePortal
          disabled={disabled}
          options={[...uniqueOptions] || []}
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected && !showAllOptions ? true : showAllOptions}
              />
              <Typography>{`${option?.name} `}</Typography>
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id == "all") {
              selected.push(...uniqueOptions);
            } else {
              // newValue.map((value: any) => {
              //   if (value._id == "all") {
              //     return;
              //   }

              //   selected.push(value);
              // });
              selected.push(...newValue);
            }
            onChange(selected, lastSelected?._id);
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
