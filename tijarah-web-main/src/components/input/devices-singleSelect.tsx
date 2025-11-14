import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

export default function DeviceAutoCompleteDropdown({
  id,
  onChange,
  error = "",
  selectedId,
  kind,
  screenType = "",
  label = t("Device"),
  disabled = false,
  required = true,
  dataTestId,
  locationRefs,
  companyRef,
  pos = false,
}: {
  id: string;
  onChange: (x: any, y?: any, z?: any) => any;
  error?: any;
  selectedId?: string;
  kind?: string;
  screenType?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  locationRefs?: string[];
  companyRef?: string;
  pos?: boolean;
}) {
  const { setScan } = useScanStore();
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: devices } = useEntity("device");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 500,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
      ...(!pos ? { locationRefs } : {}),
      companyRef: companyRef,
    });
  }, [inputValue, locationRefs, companyRef]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return devices?.results?.find((device) => device._id === selectedId);
    }

    return "";
  }, [devices, selectedId, inputValue]);

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
          getOptionLabel={(option) =>
            pos
              ? `${option.name}, ${option.deviceCode}, ${option?.location?.name}`
              : option.deviceCode || ""
          }
          disablePortal
          disabled={disabled}
          options={
            pos
              ? devices?.results?.filter(
                  (device: any) => device.connectivityStatus === "offline"
                ) || []
              : devices?.results || []
          }
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(newValue?._id, newValue?.deviceCode, newValue);
          }}
          // sx={{mb: 1}}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
              {...params}
              required={required}
              label={label}
              fullWidth
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onKeyDown={(e) => {
                const { key } = e;
                if (key === "Backspace") {
                  onChange(undefined);
                  setInputValue("");
                }
              }}
              onChange={(e) => setInputValue(e.target.value)}
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
