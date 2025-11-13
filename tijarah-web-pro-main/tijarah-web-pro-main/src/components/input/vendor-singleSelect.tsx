import { Button, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

initialValue: {
}

export default function VendorAutoCompleteDropdown({
  editing = false,
  showAllVendor = true,
  id,
  onChange,
  companyRef,
  error = "",
  selectedId,
  label = t("Vendor"),
  disabled = false,
  required = true,
  dataTestId,
  handleModalOpen,
}: {
  editing?: boolean;
  showAllVendor?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  handleModalOpen?: any;
}) {
  const [inputValue, setInputValue] = React.useState("");
  // const [vendorData, setVendorData] = React.useState<any>([]);

  const { find, entities: vendors } = useEntity("vendor");

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 100,
        _q: inputValue || "",
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [inputValue, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return vendors?.results?.find(
        (vendor: any) => vendor?._id === selectedId
      );
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All Vendors" } };
    }

    return "";
  }, [vendors?.results, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  // React.useEffect(() => {
  //   const vendorOptions = [];
  //   if (showAllVendor) {
  //     vendorOptions.push({ name: t("All Vendors"), _id: "all" });
  //   }

  //   vendors?.results?.map((vendor) => {
  //     vendorOptions?.push({
  //       name: vendor?.name,
  //       _id: vendor?._id,
  //     });
  //   });

  //   setVendorData(vendorOptions);
  // }, [vendors]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => {
            return (
              `${option.name} ${
                option?.address?.city ? `, ${option?.address?.city}` : ""
              }` || ""
            );
          }}
          disablePortal
          disabled={disabled}
          options={vendors?.results || []}
          noOptionsText={
            <Button onClick={() => handleModalOpen()}>
              {t("Create New Vendor")}
            </Button>
          }
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name);
          }}
          renderInput={(params) => (
            <TextField
              disabled={editing}
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error}
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
