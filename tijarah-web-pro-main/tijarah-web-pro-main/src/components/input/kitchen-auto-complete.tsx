import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

export default function KitchenDropdown({
  id,
  onChange,
  error = "",
  selectedId,
  handleBlur,
  selectedName,
  moveKitchenId,
  label = t("Kitchen"),
  disabled = false,
  required = false,
  dataTestId,
  companyRef,
  locationRef,
}: {
  id: string;
  onChange: (id?: string, name?: string) => any;
  error?: any;
  selectedId?: string;
  selectedName?: string;
  moveKitchenId?: string;
  label?: string;
  handleBlur?: any;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  companyRef?: string;
  locationRef?: string;
}) {
  const lng = localStorage.getItem("currentLanguage");

  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities: kitchens } = useEntity("kitchen-management");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      sort: "desc",
      activeTab: "active",
      _q: debouncedQuery || "",
      companyRef: companyRef,
      locationRef: locationRef,
    });
  }, [inputValue, companyRef, locationRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const selectedCustomer = kitchens?.results?.find(
        (kitchen) => kitchen._id === selectedId
      );

      if (selectedCustomer) {
        return selectedCustomer;
      } else {
        return { _id: selectedId, name: { en: selectedName } };
      }
    }

    return "";
  }, [kitchens, selectedId, selectedName, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  return (
    <>
      <Box
        sx={{
          // zIndex: 10000,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Autocomplete
          id={id}
          fullWidth
          disablePortal
          disabled={disabled}
          onBlur={handleBlur}
          getOptionLabel={(option) =>
            option?.name?.[lng] || option.name?.en || ""
          }
          options={
            (moveKitchenId
              ? kitchens?.results?.filter(
                  (result: any) => result?._id !== moveKitchenId
                )
              : kitchens?.results) || []
          }
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name);
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              fullWidth
              required={required}
              label={label}
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
              onChange={(e) => setInputValue(e?.target?.value)}
            />
          )}
        />
      </Box>
    </>
  );
}
