import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Checkbox } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function GroupMultiSelect({
  showAllGroups,
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Groups"),
  disabled = false,
  required = false,
}: {
  showAllGroups?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: groups } = useEntity("customer-group");

  const uniqueGroups = [...new Set(groups?.results)];

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 100,
        _q: inputValue || "",
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [inputValue, companyRef]);

  const getValue = React.useCallback(() => {
    if (showAllGroups) {
      return [{ _id: "all", name: "All Groups" }];
    }

    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return groups?.results?.find((group) => group._id === selected);
      });

      return selected;
    }

    return [];
  }, [groups, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        multiple
        id={id}
        fullWidth
        disableCloseOnSelect
        getOptionLabel={(option) => {
          return option?.name;
        }}
        disablePortal
        disabled={disabled}
        options={[{ _id: "all", name: "All Groups" }, ...uniqueGroups] || []}
        value={getValue() || []}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox
              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
              checkedIcon={<CheckBoxIcon fontSize="small" />}
              style={{ marginRight: 8 }}
              checked={selected && !showAllGroups ? true : showAllGroups}
            />
            {option?.name}
          </li>
        )}
        onChange={(e, newValue: any) => {
          const lastSelected = newValue[newValue.length - 1];

          const selected: any = [];

          if (lastSelected?._id == "all") {
            selected.push(...uniqueGroups);
          } else {
            newValue.map((value: any) => {
              if (value._id == "all") {
                return;
              }

              selected.push(value);
            });
          }

          onChange(selected, groups?.total);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            label={label}
            fullWidth
            error={error}
            helperText={error}
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
    </Box>
  );
}
