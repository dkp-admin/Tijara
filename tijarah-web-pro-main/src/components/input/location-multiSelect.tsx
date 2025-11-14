import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { Box, Checkbox, Typography } from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

export default function LocationMultiSelect({
  showAllLocation,
  id,
  companyRef,
  onChange,
  error = "",
  selectedIds,
  label = t("Locations"),
  disabled = false,
  required = false,
  dataTestId,
  showAll = true,
  allowAll = false,
}: {
  showAllLocation?: boolean;
  id?: string;
  companyRef?: any;
  onChange?: (x: any, y?: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  showAll?: boolean;
  allowAll?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const { find, entities: locations } = useEntity("location");

  const lng = localStorage.getItem("currentLanguage");
  const [uniqueLocations, setUniqueLocation] = React.useState([]);

  React.useEffect(() => {
    if (locations?.results?.length > 0) {
      const user = JSON.parse(localStorage.getItem("user")) as any;
      let filteredLocation = locations.results;

      if (
        locations?.results?.length > 0 &&
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user
      ) {
        filteredLocation = locations.results.filter((t) =>
          user?.locationRefs?.includes(t._id.toString())
        );
      }
      setUniqueLocation([...new Set(filteredLocation)]);
    }
  }, [locations.results]);

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user")) as any;
    if (uniqueLocations?.length > 0 && selectedIds?.length === 0) {
      if (
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user &&
        !allowAll
      ) {
        onChange([uniqueLocations[0]], locations?.total);
      }
    }
  }, [uniqueLocations]);

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 200,
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef,
      });
    }
  }, [companyRef]);

  const getValue = React.useCallback(() => {
    if (showAllLocation && showAll) {
      return [
        { _id: "all", name: { en: "All Locations", ar: "جميع المواقع" } },
      ];
    }

    if (selectedIds?.length && locations?.results?.length) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return locations?.results?.find(
          (location) => location._id === selected
        );
      });

      return selected;
    }

    return [];
  }, [selectedIds, locations]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          multiple
          id={id}
          freeSolo
          fullWidth
          disableCloseOnSelect
          inputValue={inputValue}
          onInputChange={handleInputChange}
          noOptionsText="No options"
          getOptionLabel={(option) => {
            return (
              `${option?.name?.[lng] || option?.name?.en || ""} ${
                option?.address?.city ? `, ${option?.address?.city}` : ""
              }` || ""
            );
          }}
          disablePortal
          disabled={disabled}
          options={
            showAll
              ? [
                  {
                    _id: "all",
                    name: { en: "All Locations", ar: "جميع المواقع" },
                  },
                  ...uniqueLocations,
                ]
              : uniqueLocations
          }
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected && !showAllLocation ? true : showAllLocation}
              />
              {`${option?.name?.[lng] || option.name?.en || ""} ${
                option?.address?.city ? `, ${option?.address?.city}` : ""
              }`}
            </li>
          )}
          onChange={(e, newValue: any) => {
            const lastSelected = newValue[newValue.length - 1];
            const selected = [];

            if (lastSelected?._id === "all") {
              selected.push(...uniqueLocations);
            } else {
              newValue.map((value: any) => {
                if (value?._id === "all") {
                  return;
                } else if (value?._id) {
                  selected.push(value);
                } else if (typeof value === "string") {
                  return;
                }
              });
            }

            setInputValue("");

            onChange(selected, locations?.total);
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
