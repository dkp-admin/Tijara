import { Button } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function GroupDropDown({
  id,
  label = t("Group"),
  selectedId,
  selectedName,
  onChange,
  handleModalOpen,
  error = "",
  handleBlur,
  disabled = false,
  required = false,
}: {
  id: string;
  label: string;
  selectedId: string;
  selectedName?: string;
  onChange: (_id: string, name?: string) => any;
  handleModalOpen: any;
  error?: any;
  handleBlur?: any;
  disabled?: boolean;
  required?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const { find, entities: groups } = useEntity("customer-group");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const selectedGroup = groups?.results?.find(
        (group) => group._id === selectedId
      );

      if (selectedGroup) {
        return selectedGroup;
      } else {
        return { _id: selectedId, name: selectedName };
      }
    }

    return "";
  }, [groups, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        id={id}
        fullWidth
        onBlur={handleBlur}
        getOptionLabel={(option) => option.name || ""}
        disablePortal
        disabled={disabled}
        options={groups?.results || []}
        value={getValue() || ""}
        noOptionsText={
          handleModalOpen ? (
            <Button onClick={handleModalOpen}>{t("Create new group")}</Button>
          ) : (
            t("No options")
          )
        }
        onChange={(e, newValue) => {
          onChange(newValue?._id, newValue?.name);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            label={label}
            fullWidth
            error={error && !getValue()?._id}
            helperText={getValue()?._id ? "" : error}
            onKeyDown={(e) => {
              const { key } = e;
              if (key === "Backspace") {
                onChange(undefined);
                setInputValue("");
              }
            }}
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
  );
}
