import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { UserTypeEnum } from "src/types/userTypes";

const merchantUserTypes = [
  UserTypeEnum["app:admin"],
  UserTypeEnum["app:cashier"],
  UserTypeEnum["app:accountant"],
  UserTypeEnum["app:manager"],
  UserTypeEnum["app:pos"],
  UserTypeEnum["app:waiter"],
];

export default function RolesDropdown({
  from,
  handleBlur,
  id,
  onChange,
  error = "",
  selectedId,
  label = t("Roles"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  from?: any;
  handleBlur?: any;
  id: string;
  onChange: (
    _id: string,
    name?: string,
    permissions?: any,
    userType?: string
  ) => any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const { user } = useAuth();
  const { find, entities: roles } = useEntity("role");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
      type: from === UserTypeEnum["app:admin"] ? "merchant" : "platform",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return roles?.results?.find((role) => role._id === selectedId);
    }

    return "";
  }, [roles, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

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
          getOptionLabel={(option) => option.name || ""}
          disablePortal
          disabled={disabled}
          options={
            // roles?.results?.filter((t) => {
            //   if (user.userType !== UserTypeEnum["app:admin"]) {
            //     if (
            //       t.parentUserType === UserTypeEnum["app:admin"] ||
            //       t.parentUserType === UserTypeEnum["app:manager"]
            //     ) {
            //       return false;
            //     }
            //     return true;
            //   }
            //   return true;
            // }) || []
            roles?.results || []
          }
          value={getValue() || ""}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.name,
              newValue?.permissions,
              newValue?.parentUserType
            );
          }}
          // sx={{mb: 1}}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
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
    </>
  );
}
