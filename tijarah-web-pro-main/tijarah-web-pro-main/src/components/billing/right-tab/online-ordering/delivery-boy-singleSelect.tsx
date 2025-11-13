import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";
import { UserTypeEnum } from "src/types/userTypes";
import { useDebounce } from "use-debounce";

export default function DeliveryBoyDropdown({
  id,
  device,
  onChange,
  error = "",
  selectedId,
  label = t("Delivery Boy"),
  disabled = false,
  required = true,
}: {
  id: string;
  device: any;
  onChange: (x: any, y?: any) => any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
}) {
  const { setScan } = useScanStore();
  const { find, entities: deliveryUsers } = useEntity("ordering/driver");

  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  React.useEffect(() => {
    find({
      page: 0,
      limit: 100,
      sort: "asc",
      activeTab: "active",
      _q: debouncedQuery || "",
      locationRef: device?.locationRef,
      companyRef: device?.companyRef,
      userType: UserTypeEnum?.["app:driver"],
    });
  }, [debouncedQuery, device]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return deliveryUsers?.results?.find((user) => user._id === selectedId);
    }

    return "";
  }, [deliveryUsers, selectedId, inputValue]);

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
        getOptionLabel={(option) => `${option?.name}, ${option?.phone}` || ""}
        disablePortal
        disabled={disabled}
        options={deliveryUsers?.results || []}
        value={getValue() || null}
        onChange={(e, newValue) => {
          onChange(newValue?._id, newValue);
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            required={required}
            label={label}
            fullWidth
            error={error}
            helperText={error}
            onFocus={() => setScan(true)}
            onBlur={() => setScan(false)}
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
  );
}
