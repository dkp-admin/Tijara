import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";

export default function ChannelMultiSelect({
  industry,
  showAllChannels,
  id,
  orderTypes,
  onChange,
  error = "",
  selectedIds,
  label = t("Order Types"),
  disabled = false,
  required = false,
  dataTestId,
  isMulti = true,
}: {
  industry?: string;
  showAllChannels?: boolean;
  id: string;
  orderTypes: any[];
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  isMulti?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const uniqueChannels = [...new Set(orderTypes)];

  const getValue = React.useCallback(() => {
    if (showAllChannels) {
      return [{ value: "all", label: "All" }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return orderTypes?.find((Channel) => Channel.value === selected);
      });

      return selected;
    }

    return [];
  }, [orderTypes, selectedIds, inputValue]);

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
          options={[{ value: "all", label: "All" }, ...uniqueChannels] || []}
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected && !showAllChannels ? true : showAllChannels}
              />
              <Typography>
                {option?.value == "all" ? "All" : option?.label}
              </Typography>
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?.value == "all") {
              selected.push(...uniqueChannels);
            } else {
              newValue.map((value: any) => {
                if (value.value == "all") {
                  return;
                }

                selected.push(value);
              });
            }
            onChange(selected, orderTypes?.length);
          }}
          sx={{ mb: 1 }}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              label={label}
              error={error}
              helperText={error}
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
