import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function BrandDropdown({
  id,
  onChange,
  error = "",
  selectedId,
  selectedName,
  label = t("Brand"),
  disabled = false,
  required = false,
  dataTestId,
}: {
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

  const { find, entities: brands } = useEntity("brands");
  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const selectedBrand = brands?.results?.find(
        (brand) => brand._id === selectedId
      );

      if (selectedBrand) {
        return selectedBrand;
      } else {
        return { _id: selectedId, name: { en: selectedName } };
      }
    }

    return "";
  }, [brands, selectedId, selectedName, inputValue]);

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
            option?.name?.[lng] || option.name?.en || ""
          }
          disablePortal
          disabled={disabled}
          options={brands?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name?.en);
          }}
          // sx={{mb: 1}}
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
