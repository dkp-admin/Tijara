import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

export default function NewCategoryMultiSelect({
  fromKitchen,
  showAllCategories,
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Categories"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  fromKitchen?: boolean;
  showAllCategories?: boolean;
  id: string;
  companyRef: string;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: categories } = useEntity("category");

  const kitchenFilteredOptions = React.useMemo(() => {
    if (categories?.results?.length > 0) {
      const categoryList = categories.results?.filter(
        (category) => category?.kitchenRefs?.length === 0
      );

      return categoryList;
    }

    return [];
  }, [categories]);

  const uniqueCategories = [...new Set(categories?.results)];
  const uniqueCategoriesKitchen = [...new Set(kitchenFilteredOptions)];

  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 100,
        _q: inputValue || "",
        activeTab: "active",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [companyRef, inputValue]);

  const getValue = React.useCallback(() => {
    if (showAllCategories) {
      return [{ _id: "all", name: { en: "All Categories" } }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return categories?.results?.find(
          (category) => category._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [categories, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          multiple
          id={id}
          fullWidth
          disableCloseOnSelect
          getOptionLabel={(option) =>
            option?.name?.[lng] || option?.name?.en || ""
          }
          disablePortal
          disabled={disabled}
          options={
            fromKitchen
              ? [
                  {
                    _id: "all",
                    name: { en: "All Categories", ar: "جميع المواقع" },
                  },
                  ...uniqueCategoriesKitchen,
                ] || []
              : [
                  {
                    _id: "all",
                    name: { en: "All Categories", ar: "جميع المواقع" },
                  },
                  ...uniqueCategories,
                ] || []
          }
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={
                  selected && !showAllCategories ? true : showAllCategories
                }
              />
              {option?.name?.[lng] || option.name?.en}
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id == "all") {
              if (fromKitchen) {
                selected.push(...uniqueCategoriesKitchen);
              } else {
                selected.push(...uniqueCategories);
              }
            } else {
              newValue.map((value: any) => {
                if (value._id == "all") {
                  return;
                }

                selected.push(value);
              });
            }
            onChange(selected, categories.total);
          }}
          sx={{ mb: 1 }}
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
