import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";

export default function OrderTypeSelect({
  industry,
  id,
  onChange,
  error = "",
  selectedIds,
  orderTypes,
  label = t("Order Types"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  industry?: string;
  id: string;
  onChange: (x: any) => any;
  error?: any;
  orderTypes?: any[];
  selectedIds?: any;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const uniqueChannels = [...new Set(orderTypes || [])];

  const getValue = React.useCallback(() => {
    if (selectedIds && orderTypes?.length > 0) {
      let selected: any = [];

      selected = orderTypes?.find((Channel) => Channel.value === selectedIds);

      return selected;
    }

    return { label: "", value: "" };
  }, [orderTypes, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{
          ml: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.label}
          disablePortal
          disabled={disabled}
          options={[...uniqueChannels]}
          onChange={(e, newValue: any) => {
            onChange(newValue?.value);
          }}
          value={getValue() || { label: "", value: "" }}
          renderInput={(params) => (
            <TextField
              {...params}
              required={required}
              label={label}
              fullWidth
              onKeyDown={(e) => {
                const { key } = e;
                if (key === "Backspace") {
                  onChange(undefined);
                  setInputValue("");
                }
              }}
              onChange={(e) => setInputValue(e?.target?.value)}
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
