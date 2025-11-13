import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { format } from "date-fns";
import { t } from "i18next";
import * as React from "react";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";

export default function ReportingHoursAutoCompleteDropdown({
  editing = false,
  showAllHours = true,
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
}: {
  editing?: boolean;
  showAllHours?: boolean;
  id: string;
  companyRef: any;
  onChange: (x: any, y?: any, z?: any, a?: any, b?: any, c?: any) => any;
  handleBlur?: any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
  skip?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: reportingHours } = useEntity("reporting-hours");

  const { user } = useAuth();

  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    if (companyRef?.length > 0) {
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
    if (selectedId) {
      return reportingHours?.results?.find(
        (reportingHour: any) => reportingHour?._id === selectedId
      );
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All ", ar: "All ar" } };
    }

    return "";
  }, [reportingHours?.results, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

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
            if (option?.startTime && option?.endTime) {
              return `${option?.name?.[lng] || option.name?.en || ""}, ${
                option?.createdStartTime
                  ? option?.createdStartTime
                  : format(new Date(option?.startTime), "hh:mm a")
              } - ${
                option?.createdEndTime
                  ? option?.createdEndTime
                  : format(new Date(option?.endTime), "hh:mm a")
              } ${option?.timezone.split(", utcOffset")[0]}`;
            } else {
              return ``;
            }
          }}
          disablePortal
          disabled={disabled}
          options={reportingHours?.results || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.name?.en,
              newValue?.startTime,
              newValue?.endTime,
              newValue?.timezone,
              newValue
            );
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
