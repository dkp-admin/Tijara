import { Typography } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEntity } from "src/hooks/use-entity";

export default function CompanyDropdown({
  showAllCompanies = true,
  id,
  onChange,
  error = "",
  selectedId,
  label = t("Company"),
  disabled = false,
  required = false,
  dataTestId,
}: {
  showAllCompanies?: boolean;
  id: string;
  onChange: (x: any, y?: any, z?: any, a?: any) => any;
  error?: any;
  selectedId?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  dataTestId?: string;
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [companyData, setCompanyData] = React.useState<any>([]);

  const { find, entities: companies } = useEntity("company");
  const lng = localStorage.getItem("currentLanguage");

  React.useEffect(() => {
    find({
      page: 0,
      limit: 300,
      _q: inputValue || "",
      activeTab: "all",
      sort: "asc",
    });
  }, [inputValue]);

  const getValue = React.useCallback(() => {
    if (selectedId) {
      const value = companyData?.find((company: any) => {
        return company?._id === selectedId;
      });
      return value;
    }
    if (selectedId?.includes("all")) {
      return { _id: "all", name: { en: "All Companies" } };
    }

    return "";
  }, [companyData, selectedId, inputValue]);

  React.useEffect(() => {
    if (!selectedId) {
      setInputValue("");
    }
  }, [selectedId]);

  React.useEffect(() => {
    const companyOptions = [];
    if (showAllCompanies) {
      companyOptions.push({
        name: { en: "All Companies", ar: "جميع الشركات" },
        _id: "all",
      });
    }

    companies?.results?.map((company) => {
      companyOptions?.push({
        businessType: company?.businessType,
        name: company?.name,
        _id: company?._id,
        industry: company?.industry,
      });
    });

    setCompanyData(companyOptions);
  }, [companies]);

  return (
    <>
      <Box
        data-testid={dataTestId}
        sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id={id}
          fullWidth
          getOptionLabel={(option) =>
            option?.name?.[lng] || option?.name?.en || ""
          }
          disablePortal
          disabled={disabled}
          options={companyData || []}
          value={getValue() || null}
          onChange={(e, newValue) => {
            onChange(
              newValue?._id,
              newValue?.name?.en,
              newValue?.businessType,
              newValue?.industry
            );
          }}
          renderInput={(params) => (
            <TextField
              data-testid={dataTestId}
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
              onChange={(e) => setInputValue(e?.target?.value)}
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
