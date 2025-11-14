import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function BusinessTypeDropdown({
  showAllBusinessTypes = true,
  id,
  onChange,
  handleBlur,
  error = "",
  selectedId,
  label = t("Business Type"),
  disabled = false,
  required = false,
  dataTestId,
  industry,
}: {
  showAllBusinessTypes?: boolean;
  id: string;
  onChange: (x: any, y?: any) => any;
  handleBlur?: any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  industry?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const [businessTypeData, setBusinessTypeData] = React.useState<any>([]);

  const { find, entities: businessTypes } = useEntity("business-type");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      industry: industry,
    });
  }, [inputValue, industry]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const value = businessTypeData?.find((businessType: any) => {
        return businessType?._id === selectedId;
      });
      return value;
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All BusinessTypes" } };
    }

    return "";
  }, [businessTypeData, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const businessTypeOptions = [];
    if (showAllBusinessTypes) {
      businessTypeOptions.push({ name: t("All Business types"), _id: "all" });
    }

    businessTypes?.results?.forEach((businessType: any) => {
      if (!industry) {
        businessTypeOptions.push({
          name: businessType?.name?.en,
          _id: businessType?._id,
        });
      }
      if (industry && businessType.industry === industry) {
        businessTypeOptions.push({
          name: businessType?.name?.en,
          _id: businessType?._id,
        });
      }
    });
    setBusinessTypeData(businessTypeOptions);
  }, [businessTypes, industry]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.name || ""}
          disablePortal
          disabled={disabled}
          options={businessTypeData || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name);
          }}
          onBlur={handleBlur}
          // sx={{mb: 1}}
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
              error={error && !getValue()?._id}
              helperText={getValue()?._id ? "" : error}
              onBlur={handleBlur}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (!/[^a-zA-Z0-9]/.test(inputValue)) {
                  setInputValue(inputValue);
                }
              }}
            />
          )}
        />
      </Box>
    </>
  );
}
