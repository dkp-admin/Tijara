import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function UserAutoCompleteDropdown({
  editing = false,
  showAllUser = true,
  id,
  onChange,
  handleBlur,
  companyRef,
  locationRef,
  error = "",
  selectedId,
  label = t("User"),
  disabled = false,
  required = true,
  dataTestId,
  skip,
  showAll = true,
}: {
  editing?: boolean;
  showAllUser?: boolean;
  id: string;
  companyRef: string;
  locationRef: string;
  onChange: (x: any, y?: any, z?: any) => any;
  handleBlur?: any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  skip?: string;
  showAll?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  // const [userData, setUserData] = React.useState<any>([]);

  const { find, entities: users } = useEntity("user");

  React.useEffect(() => {
    if (companyRef) {
      find({
        page: 0,
        limit: 500,
        _q: inputValue || "",
        activeTab: "all",
        sort: "asc",
        companyRef: companyRef,
        // locationRef: locationRef,
      });
    }
  }, [inputValue, companyRef, locationRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return users?.results?.find((user: any) => user?._id === selectedId);
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All Users" } };
    }

    return "";
  }, [users?.results, selectedId, inputValue]);

  // React.useEffect(() => {
  //   if (!selectedId) {
  //     setInputValue("");
  //   }
  // }, [selectedId]);

  // React.useEffect(() => {
  //   const userOptions = [];
  //   if (showAllUser) {
  //     userOptions.push({ name: t("All User"), _id: "all" });
  //   }

  //   users?.results?.map((user) => {
  //     if (skip !== user._id) {
  //       userOptions?.push({
  //         name: user?.name,
  //         _id: user?._id,
  //         userType: user?.userType,
  //       });
  //     }
  //   });

  //   setUserData(userOptions);
  // }, [users, skip, selectedId]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          fullWidth
          onBlur={handleBlur}
          getOptionLabel={(option) => {
            return `${option.name} (${option?.userType?.split(":")[1]})` || "";
          }}
          disablePortal
          disabled={disabled}
          options={users?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.name, newValue?.userType);
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
