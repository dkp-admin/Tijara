import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function ModifiersMultiSelect({
  showAllModifiers,
  addedModifierRefs,
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Modifiers"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  addedModifierRefs?: string[];
  companyRef?: string;
  showAllModifiers?: boolean;
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

  const { find, entities: modifiers } = useEntity("modifier");

  const filteredData = modifiers?.results?.filter((modifier: any) => {
    const modifierId = modifier?._id || modifier?.modifierRef;
    return !addedModifierRefs?.includes(modifierId);
  });

  const uniqueModifiers = [...new Set(filteredData)];

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
    if (showAllModifiers && filteredData?.length > 0) {
      return [{ _id: "all", name: "All Modifiers" }];
    }
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return filteredData?.find((modifier) => modifier._id === selected);
      });

      return selected;
    }

    return [];
  }, [modifiers, selectedIds, inputValue]);

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
          getOptionLabel={(option) => option?.name || ""}
          disablePortal
          disabled={disabled}
          options={
            [
              filteredData?.length > 0 && {
                _id: "all",
                name: "All Modifiers",
              },
              ...uniqueModifiers,
            ] || []
          }
          value={getValue() || []}
          renderOption={(props, option, { selected }) => {
            if (!option) {
              return <Typography>{t("No Options!")}</Typography>;
            }
            return (
              <li {...props}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  style={{ marginRight: 8 }}
                  checked={
                    selected && !showAllModifiers ? true : showAllModifiers
                  }
                />
                {`${option?.name} `}
              </li>
            );
          }}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id == "all") {
              selected.push(...uniqueModifiers);
            } else {
              newValue.map((value: any) => {
                if (value._id == "all") {
                  return;
                }

                selected.push(value);
              });
              // selected.push(...newValue);
            }
            onChange(selected, modifiers.total);
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
