import { Paper, Popper, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import { relative } from "path";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function ExpiryAutoCompleteDropdown({
  editing = false,
  showAllExpiry = true,
  id,
  onChange,
  companyRef,
  error = "",
  selectedId,
  skip,
  label = t("Expiry"),
  disabled = false,
  required = true,
  dataTestId,
  sku,
  locationRef,
}: {
  editing?: boolean;
  showAllExpiry?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any, z?: any, a?: any, b?: any) => any;
  error?: any;
  skip?: string;
  selectedId?: string;
  label?: string;
  sku?: string;
  locationRef?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [expiryData, setExpiryData] = React.useState<any>([]);

  const { find, entities: expirys } = useEntity("batch");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
      sku: sku,
      companyRef: companyRef,
      locationRef: locationRef,
    });
  }, [inputValue, sku, companyRef, locationRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return expiryData?.find((expiry: any) => expiry?._id === selectedId);
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", expiry: t("All Expirys") };
    }

    return "";
  }, [expiryData, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const expiryOptions = [];
    if (showAllExpiry) {
      expiryOptions.push({ expiry: t("All Expirys"), _id: "all" });
    }

    expirys?.results?.map((expiry) => {
      const formattedDate = new Date(expiry.expiry).toLocaleDateString(
        "en-GB",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      );
      if (skip !== expiry._id) {
        expiryOptions?.push({
          _id: expiry?._id,
          expiry: expiry?.expiry,
          available: expiry?.available,
          received: expiry?.received,
          transfer: expiry?.transfer,
          showexpiry: `Batch : ${formattedDate}, Quantity : ${expiry.available}`,
        });
      }
    });

    setExpiryData(expiryOptions);
  }, [expirys, skip]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%", mb: 6 }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.showexpiry}
          disablePortal
          disabled={disabled}
          options={expiryData || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.expiry,
              newValue?.available,
              newValue?.received,
              newValue?.transfer
            );
          }}
          renderInput={(params) => (
            <TextField
              disabled={editing}
              data-testid={dataTestId}
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
