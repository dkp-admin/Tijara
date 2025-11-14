import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

export default function CategoryDropdownMenuManagement({
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
  selectedCategories,
}: {
  selectedCategories?: any[];
  id: string;
  companyRef: string;
  onChange: (x: any, y?: any, z?: any) => any;
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
  const lng = localStorage.getItem("currentLanguage");
  const { find, entities, loading } = useEntity("category");
  const [inputValue, setInputValue] = React.useState("");

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

  const filteredOptions: any = React.useMemo(() => {
    if (entities.results?.length > 0) {
      const filteredCategories = entities.results?.filter(
        (category) => !selectedCategories?.includes(category?._id)
      );

      return filteredCategories;
    }
    return [];
  }, [entities?.results, selectedCategories]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) =>
            option?.name?.[lng] || option?.name?.en || ""
          }
          inputValue={inputValue}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name, newValue?.image);
          }}
          disablePortal
          disabled={disabled}
          options={filteredOptions || []}
          value={null}
          noOptionsText={loading ? <CircularProgress /> : "No options"}
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
                if (key === "Backspace" && !params.inputProps.value) {
                  event.stopPropagation();
                  if (inputValue.length > 0) {
                    setInputValue(inputValue.slice(0, -1));
                    event.preventDefault();
                  }
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
