import { Typography, useTheme } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function BrandMultiSelect({
  isFromProduct = false,
  isFromGlobalProduct = false,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Brand"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  isFromGlobalProduct?: boolean;
  isFromProduct?: boolean;
  id: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { find, entities: brands } = useEntity("brands");
  const lng = localStorage.getItem("currentLanguage");
  const brandOptions =
    brands?.results?.map((brand) => {
      return {
        label: brand?.name?.[lng] || brand?.name?.en,
        value: brand?._id,
      };
    }) || [];

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "desc",
    });
  }, [inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{
          display: "flex",
          flexDirection: "column",
          width: isMobile ? "35%" : "15%",
        }}>
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.label}
          disablePortal
          disabled={disabled}
          options={brandOptions}
          value={null}
          onChange={(e, newValue: any) => {
            onChange(newValue, newValue?.value);
          }}
          sx={{ mb: 1 }}
          renderInput={(params) => (
            <TextField
              sx={{
                width: isFromProduct ? "100%" : null,
                height: isFromProduct ? 50 : null,
              }}
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
