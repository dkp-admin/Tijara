import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function CustomerDropdown({
  id,
  onChange,
  error = "",
  selectedId,
  handleBlur,
  selectedName,
  label = t("Customer"),
  disabled = false,
  required = false,
  dataTestId,
  companyRef,
}: {
  id: string;
  onChange: (
    id?: string,
    name?: string,
    phone?: string,
    vat?: string,
    totalOrder?: any,
    totalSpent?: any,
    totalRefunded?: any
  ) => any;
  error?: any;
  selectedId?: string;
  selectedName?: string;
  label?: string;
  handleBlur?: any;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  companyRef?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: customers } = useEntity("customer");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      companyRef: companyRef,
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const selectedCustomer = customers?.results?.find(
        (customer) => customer._id === selectedId
      );

      if (selectedCustomer) {
        return selectedCustomer;
      } else {
        return { _id: selectedId, name: { en: selectedName } };
      }
    }

    return "";
  }, [customers, selectedId, selectedName, inputValue]);

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
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          // height: "10vh",
        }}
      >
        <Autocomplete
          id={id}
          fullWidth
          onBlur={handleBlur}
          getOptionLabel={(option) => option?.name || ""}
          disablePortal
          disabled={disabled}
          options={customers?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.name,
              newValue?.phone,
              newValue?.vat,
              newValue?.totalOrder,
              newValue?.totalSpent,
              newValue?.totalRefunded
            );
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error && !getValue()?._id}
              helperText={getValue()?._id ? "" : error}
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
      </Box>
    </>
  );
}
