import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function TaxDropdown({
  id,
  onChange,
  handleBlur,
  error = "",
  selectedId,
  label = t("Tax"),
  variant = "filled",
  disabled = false,
  required = false,
  isPrefilled = false,
  setIsPrefilled,
  dataTestId,
}: {
  id: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  handleBlur?: any;
  selectedId?: string;
  label?: string;
  variant?: any;
  disabled?: boolean;
  required?: boolean;
  isPrefilled?: boolean;
  setIsPrefilled?: any;
  dataTestId?: string;
}) {
  const { find, entities: taxes } = useEntity("tax");
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 500,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
    });
  }, [inputValue, selectedId]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return taxes?.results?.find((tax) => tax._id === selectedId);
    }

    return "";
  }, [taxes, selectedId, inputValue]);

  React.useEffect(() => {
    if (isPrefilled && getValue() != null) {
      onChange(getValue()?._id, getValue()?.tax);
      setIsPrefilled(false);
    }
  }, [getValue()]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          fullWidth
          onBlur={handleBlur}
          getOptionLabel={(option) => `${option?.tax || "0"}%`}
          disablePortal
          disabled={disabled}
          options={taxes?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.tax);
          }}
          // sx={{mb: 1}}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              error={error && !getValue()?._id}
              helperText={getValue()?._id ? "" : error}
              fullWidth
              variant={variant}
              onBlur={handleBlur}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!/[^a-zA-Z0-9]/.test(inputValue)) {
                  setInputValue(inputValue);
                }
              }}
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
        {/* {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )} */}
      </Box>
    </>
  );
}
