import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

initialValue: {
}

export default function LocationAutoCompleteDropdown({
  editing = false,
  showAllLocation = true,
  id,
  onChange,
  handleBlur,
  companyRef,
  error = "",
  selectedId,
  label = t("Location"),
  disabled = false,
  required = true,
  dataTestId,
  skip,
  allowAll = false,
}: {
  editing?: boolean;
  showAllLocation?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any) => any;
  handleBlur?: any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  skip?: string;
  allowAll?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [locationData, setLocationData] = React.useState<any>([]);
  const [uniqueLocations, setUniqueLocation] = React.useState([]);

  const { find, entities: locations } = useEntity("location");

  React.useEffect(() => {
    if (locations?.results?.length > 0) {
      const user = JSON.parse(localStorage.getItem("user")) as any;
      let filteredLocation = locations.results;

      if (
        locations?.results?.length > 0 &&
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user &&
        !allowAll
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
    if (uniqueLocations?.length > 0) {
      if (
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user &&
        !allowAll
      ) {
        const newValue = uniqueLocations?.[0];
        onChange(newValue?._id, newValue?.name);
      }
    }
  }, [uniqueLocations]);

  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      companyRef: companyRef,
    });
  }, [inputValue, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return locationData?.find(
        (location: any) => location?._id === selectedId
      );
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All Locations" } };
    }

    return "";
  }, [locationData, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const locationOptions = [];
    if (showAllLocation) {
      locationOptions.push({ name: t("All Locations"), _id: "all" });
    }

    locations?.results?.map((location) => {
      if (skip !== location._id) {
        locationOptions?.push({
          name: location?.name,
          _id: location?._id,
          address: location?.address,
        });
      }
    });

    setLocationData(locationOptions);
  }, [locations, skip]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          id={id}
          fullWidth
          onBlur={handleBlur}
          getOptionLabel={(option) => {
            return (
              `${option?.name?.[lng] || option.name?.en || ""} ${
                option?.address?.city ? `, ${option?.address?.city}` : ""
              }` || ""
            );
          }}
          disablePortal
          disabled={disabled}
          options={uniqueLocations || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name);
          }}
          renderInput={(params) => (
            <TextField
              disabled={editing}
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              error={error && !getValue()?._id}
              helperText={getValue()?._id ? "" : error}
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
    </>
  );
}
