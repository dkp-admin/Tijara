import { Box, Button, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

export default function CategoryDropdown({
  id,
  companyRef,
  onChange,
  error = "",
  selectedId,
  kind,
  screenType = "",
  label = t("Category"),
  disabled = false,
  required = true,
  dataTestId,
  defaultSelectedValue = null,
  handleModalOpen,
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
  handleModalOpen?: any;
}) {
  const { setScan } = useScanStore();
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: categories } = useEntity("category");

  const lng = localStorage.getItem("currentLanguage");

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
      return categories?.results?.find(
        (category) => category._id === selectedId
      );
    }

    return "";
  }, [categories, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  // React.useEffect(() => {
  //   if (isPrefilled && getValue() != null) {
  //     onChange(getValue()?._id, getValue()?.category?.name);
  //     setIsPrefilled(false);
  //   }
  // }, [getValue()]);

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
            option?.name?.[lng] || option?.name?.en || ""
          }
          disablePortal
          disabled={disabled}
          options={categories?.results || []}
          value={getValue() || defaultSelectedValue}
          noOptionsText={
            handleModalOpen ? (
              <Button onClick={handleModalOpen}>
                {t("Create new category")}
              </Button>
            ) : (
              "No options"
            )
          }
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
