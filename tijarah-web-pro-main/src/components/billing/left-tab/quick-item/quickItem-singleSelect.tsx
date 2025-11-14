import { Paper, Popper, Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";

import * as React from "react";
import { useEntity } from "src/hooks/use-entity";
import useScanStore from "src/store/scan-store";

export default function QuickItemAutoCompleteDropdown({
  editing = false,
  showAllQuickItem = true,
  id,
  onChange,

  error = "",
  selectedId,
  skip,
  label = t("QuickItem"),
  disabled = false,
  required = true,
}: {
  editing?: boolean;
  showAllQuickItem?: boolean;
  id?: string;

  onChange: (x: any, y?: any, z?: any, a?: any, b?: any) => any;
  error?: any;
  skip?: string;
  selectedId?: string;
  label?: string;

  disabled?: boolean;
  required?: boolean;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [expiryData, setQuickItemData] = React.useState<any>([]);

  const { setScan } = useScanStore();
  const { find, entities: expirys } = useEntity("batch");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 50,
      _q: inputValue || "",
      activeTab: "active",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      return expiryData?.find((expiry: any) => expiry?._id === selectedId);
    }

    if (selectedId?.includes("all")) {
      return { _id: "all", expiry: t("All QuickItems") };
    }

    return "";
  }, [expiryData, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const discount = [];
    if (showAllQuickItem) {
      discount.push({ expiry: t("All QuickItems"), _id: "all" });
    }

    [
      {
        _id: "123",
        name: "DISC20",
        amount: 10,
      },
      {
        _id: "123",
        name: "DISC20",
        amount: 10,
      },
    ].map((expiry) => {
      if (skip !== expiry._id) {
        discount?.push({
          _id: expiry?._id,

          discount: `${expiry?.name}, Amount : ${expiry.amount}`,
        });
      }
    });

    setQuickItemData(discount);
  }, [expirys, skip]);

  return (
    <>
      <Box
        sx={{ display: "flex", flexDirection: "column", width: "100%", mb: 6 }}
      >
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) => option.discount}
          disablePortal
          disabled={disabled}
          options={expiryData || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.expiry,
              newValue?.available,
              newValue?.received,
              newValue?.transfer
            );
          }}
          renderInput={(params) => (
            <TextField
              disabled={editing}
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
