import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

export default function CustomerDropdown({
  id,
  companyRef,
  onChange,
  error = "",
  selectedId,
  kind,
  screenType = "",
  label = t("Customer"),
  disabled = false,
  required = true,
  dataTestId,
  defaultSelectedValue = null,
}: {
  id: string;
  companyRef: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedId?: string;
  kind?: string;
  screenType?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  defaultSelectedValue?: any;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: customers } = useEntity("customer");

  const { setScan } = useScanStore();

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 500,
        _q: inputValue || "",
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [inputValue, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return customers?.results?.find(
        (customer) => customer._id === selectedId
      );
    }

    return "";
  }, [customers, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          mt: 1,
          zIndex: 1,
        }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option?.name || ""}
          disablePortal
          disabled={disabled}
          options={customers?.results || []}
          value={getValue() || defaultSelectedValue}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue);
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onKeyDown={(e) => {
                const { key } = e;
                if (key === "Backspace") {
                  onChange(undefined);
                  setInputValue("");
                }
              }}
              onChange={(e) => setInputValue(e.target.value)}
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
