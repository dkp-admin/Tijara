import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function CompanyMultiSelect({
  dontShowAll,
  showAllCompanies,
  businessTypeRefs,
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Companies"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  dontShowAll?: boolean;
  showAllCompanies?: boolean;
  businessTypeRefs?: string[];
  id: string;
  onChange?: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: companies } = useEntity("company");
  const lng = localStorage.getItem("currentLanguage");
  const uniqueCompanies = [...new Set(companies?.results)];

  React.useEffect(() => {
    find({
      page: 0,
      limit: 300,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
      businessTypeRefs: businessTypeRefs || [],
    });
  }, [inputValue, businessTypeRefs]);

  const getValue = React.useCallback(() => {
    if (showAllCompanies) {
      return [{ _id: "all", name: { en: "All Companies" } }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return companies?.results?.find((company) => company._id === selected);
      });

      return selected;
    }

    return [];
  }, [companies, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
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
            dontShowAll
              ? [...uniqueCompanies] || []
              : [
                  {
                    _id: "all",
                    name: {
                      en: "All Companies",
                    },
                  },
                  ...uniqueCompanies,
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
                  selected && !showAllCompanies ? true : showAllCompanies
                }
              />
              {option?.name?.[lng] || option?.name?.en}
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];

            const selected: any = [];

            if (lastSelected?._id == "all") {
              selected.push(...uniqueCompanies);
            } else {
              newValue.map((value: any) => {
                if (value._id == "all") {
                  return;
                }

                selected.push(value);
              });
            }

            onChange(selected, companies?.total);
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
