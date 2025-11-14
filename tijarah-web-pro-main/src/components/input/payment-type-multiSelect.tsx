import { Checkbox, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
const btype = [
  { _id: "credit_card", name: "Credit Card" },
  { _id: "paypal", name: "Paypal" },
];

export default function PaymentTypeMultiSelect({
  id,
  onChange,
  error = "",
  selectedIds,
  label = t("Payment Type"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  id: string;
  onChange: (x: any) => any;
  error?: any;
  selectedIds?: string[];
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");

  const { find, entities: paymentTypes } = useEntity("business-type");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 30,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedIds?.length > 0) {
      let selected: any = [];

      selected = selectedIds?.map((selected) => {
        return btype.find((paymentType) => paymentType._id === selected);
      });

      return selected;
    }

    return [];
  }, [paymentTypes, selectedIds, inputValue]);

  React.useEffect(() => {
    if (selectedIds?.length > 0) {
      setInputValue("");
    }
  }, [selectedIds]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}
      >
        <Autocomplete
          multiple
          id={id}
          fullWidth
          disableCloseOnSelect
          getOptionLabel={(option) => option?.name || ""}
          disablePortal
          disabled={disabled}
          options={btype || []}
          value={getValue() || []}
          renderOption={(props, option, { selected }) => (
            <li {...props}>
              <Checkbox
                icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                checkedIcon={<CheckBoxIcon fontSize="small" />}
                style={{ marginRight: 8 }}
                checked={selected}
              />
              {option?.name}
            </li>
          )}
          onChange={(e, newValue: any) => {
            onChange(newValue);
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
        {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
