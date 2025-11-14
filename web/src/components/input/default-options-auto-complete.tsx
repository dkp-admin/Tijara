import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";

export default function DefaultOptionsDropdown({
  data,
  id,
  onChange,
  error = "",
  selectedId,
  selectedName,
  label = t("Default option"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  data: any;
  id: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedId?: string;
  selectedName?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const selectedOptions = data?.find(
        (option: any) => option._id === selectedId
      );

      if (selectedOptions) {
        return selectedOptions;
      } else {
        return { _id: selectedId, name: { en: selectedName } };
      }
    }

    return "";
  }, [data, selectedId, selectedName, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.name || ""}
          disablePortal
          disabled={disabled}
          options={data || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name);
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
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
