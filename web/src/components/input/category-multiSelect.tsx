import { Typography, useTheme } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import businessTypes from "src/pages/platform/business-types";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function CategoryMultiSelect({
  isFromProduct = false,
  isFromGlobalProduct = false,
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Reporting Category"),
  disabled = false,
  required = false,
  dataTestId,
  businessTypeRef,
}: {
  businessTypeRef?: string;
  isFromGlobalProduct?: boolean;
  isFromProduct?: boolean;
  id: string;
  companyRef?: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: any[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const lng = localStorage.getItem("currentLanguage");
  const [inputValue, setInputValue] = React.useState("");
  const { find, entities: categories } = useEntity("category");
  const { find: findGlobalCategories, entities: GlobalCategories } =
    useEntity("global-categories");
  const categoryOptions =
    categories?.results?.map((category) => {
      return {
        label: category?.name?.[lng] || category?.name?.en,
        value: category?._id,
      };
    }) || [];
  const globalCategoryOptions =
    GlobalCategories?.results?.map((category) => {
      return {
        label: category?.name?.[lng] || category?.name?.en,
        value: category?._id,
      };
    }) || [];
  React.useEffect(() => {
    if (isFromGlobalProduct) {
      findGlobalCategories({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: inputValue || "",
        businessTypeRefs: [businessTypeRef],
      });
    } else {
      find({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: inputValue || "",
        companyRef: companyRef,
      });
    }
  }, [inputValue, companyRef]);
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
          ml: 1,
          display: "flex",
          flexDirection: "column",
          width: isMobile ? "35%" : "15%",
        }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option?.label}
          disablePortal
          disabled={disabled}
          options={
            isFromGlobalProduct ? globalCategoryOptions : categoryOptions
          }
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
