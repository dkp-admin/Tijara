import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";
import { ProductCreateForm } from "../product/product-create-form";

export default function BatchAutoCompleteDropdown({
  id,
  onChange,
  error = "",
  selectedId,
  kind,
  screenType = "",
  label = t("Batch"),
  disabled = false,
  required = true,
  dataTestId,
  locationRef,
  companyRef,
  productRef,
}: {
  id: string;
  onChange: (x: any, y?: any, z?: any) => any;
  error?: any;
  selectedId?: string;
  kind?: string;
  screenType?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  locationRef?: string;
  companyRef?: string;
  productRef?: string;
}) {
  const { setScan } = useScanStore();
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: batchs } = useEntity("batch");

  console.log(batchs);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 30,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      locationRef: locationRef,
      companyRef: companyRef,
      productRef: productRef,
    });
  }, [inputValue, locationRef, companyRef, productRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return batchs?.results?.find((batch) => batch._id === selectedId);
    }

    return "";
  }, [batchs, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) =>
            `${option.name}, ${option.batchCode}, ${option?.location?.name}`
          }
          disablePortal
          disabled={disabled}
          options={batchs?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.batchCode, newValue);
          }}
          // sx={{mb: 1}}
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
