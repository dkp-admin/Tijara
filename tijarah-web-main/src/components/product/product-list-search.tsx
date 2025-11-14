import {
  Box,
  Chip,
  Divider,
  Input,
  Stack,
  SvgIcon,
  TextField,
} from "@mui/material";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import PropTypes from "prop-types";
import {
  ChangeEvent,
  FC,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import { sortOptions, statusOptions } from "src/utils/constants";
import BrandMultiSelect from "../input/brand-multiSelect";
import CategoryMultiSelect from "../input/category-multiSelect";
import { MultiSelect } from "../multi-select";
import { useAuth } from "src/hooks/use-auth";
import { CompanyContext } from "src/contexts/company-context";

const sellableOptions = [
  {
    label: "Sellable",
    value: "sellable",
  },

  {
    label: "Non-Sellable",
    value: "nonSellable",
  },
];
interface Filters {
  name?: string;
  category: string[];
  status: string[];
  brand: string[];
  sellable: string[];
}

interface SearchChip {
  label: string;
  field: "name" | "category" | "status" | "brand" | "sellable";
  value: unknown;
  displayValue?: unknown;
}

interface ProductListSearchProps {
  companyRef?: any;
  onQueryChange?: (value: string) => void;
  onFiltersChange?: (filters: Filters) => void;
  onSortChange?: (value: string) => void;
  sort?: string;
  showBrandFilter?: boolean;
}

export const ProductListSearch: FC<ProductListSearchProps> = (props) => {
  const {
    companyRef,
    onQueryChange,
    onFiltersChange,
    sort,
    showBrandFilter,
    onSortChange,
    ...other
  } = props;
  const { t } = useTranslation();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [chips, setChips] = useState<SearchChip[]>([]);
  const { user } = useAuth();
  const companyContext = useContext<any>(CompanyContext);
  const [categoryOptions, setCategoryOptions] = useState<any>([]);
  const [brandOptions, setBrandOptions] = useState<any>([]);

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      name: undefined,
      category: [],
      status: [],
      brand: [],
      sellable: [],
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case "name":
          // There will (or should) be only one chips with field "name"
          // so we can set up it directly
          filters.name = chip.value as string;
          break;
        case "category":
          filters.category.push(chip.value as string);
          break;
        case "status":
          filters.status.push(chip.value as string);
          break;
        case "brand":
          filters.brand.push(chip.value as string);
          break;
        case "sellable":
          filters.sellable.push(chip.value as string);
          break;
        default:
          break;
      }
    });

    onFiltersChange(filters);
  }, [chips]);

  useUpdateEffect(() => {
    handleChipsUpdate();
  }, [chips, handleChipsUpdate]);

  const handleChipDelete = useCallback(
    (deletedChip: SearchChip): void => {
      if (deletedChip.field === "category") {
        let options: any[] = categoryOptions.filter(
          (option: any) => option.value !== deletedChip.value
        );

        setCategoryOptions(options);
      }

      if (deletedChip.field === "brand") {
        let options: any[] = brandOptions.filter(
          (option: any) => option.value !== deletedChip.value
        );

        setBrandOptions(options);
      }

      setChips((prevChips) => {
        return prevChips.filter((chip) => {
          // There can exist multiple chips for the same field.
          // Filter them by value.

          return !(
            deletedChip.field === chip.field && deletedChip.value === chip.value
          );
        });
      });
    },
    [categoryOptions, brandOptions]
  );

  const handleQueryChange = (event: any): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      onQueryChange(event?.target?.value?.trim() as string);
    }
  };

  const handleBrandChange = useCallback(
    (allOptions: any, values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "brand") {
            return true;
          }

          const found = values.includes(chip.value as string);

          if (found) {
            valuesFound.push(chip.value as string);
          }

          return found;
        });

        // Nothing changed
        if (values.length === valuesFound.length) {
          return newChips;
        }

        values.forEach((value) => {
          if (!valuesFound.includes(value)) {
            const option = allOptions.find(
              (option: any) => option?.value === value
            );

            newChips.push({
              label: "Brand",
              field: "brand",
              value,
              displayValue: option!.label,
            });
          }
        });

        return newChips;
      });
    },
    [brandOptions]
  );

  const handleCategoryChange = useCallback(
    (allOptions: any, values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "category") {
            return true;
          }

          const found = values.includes(chip.value as string);

          if (found) {
            valuesFound.push(chip.value as string);
          }

          return found;
        });

        // Nothing changed
        if (values?.length === valuesFound?.length) {
          return newChips;
        }

        values?.forEach((value) => {
          if (!valuesFound.includes(value)) {
            const option = allOptions.find(
              (option: any) => option?.value === value
            );

            newChips.push({
              label: "Reporting Category",
              field: "category",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    []
  );

  const handleStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "status") {
          return true;
        }

        const found = values.includes(chip.value as string);

        if (found) {
          valuesFound.push(chip.value as string);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newChips;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = statusOptions.find((option) => option.value === value);

          newChips.push({
            label: "Status",
            field: "status",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleSellableChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "sellable") {
          return true;
        }

        const found = values.includes(chip.value as string);

        if (found) {
          valuesFound.push(chip.value as string);
        }

        return found;
      });

      // Nothing changed
      if (values.length === valuesFound.length) {
        return newChips;
      }

      values.forEach((value) => {
        if (!valuesFound.includes(value)) {
          const option = sellableOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Product Status"),
            field: "sellable",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  // We memoize this part to prevent re-render issues
  const statusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "status")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const sellableValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "sellable")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const showChips = chips.length > 0;

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSortChange(event.target.value as string);
  };

  return (
    <div {...other}>
      <Stack
        alignItems="center"
        component="form"
        direction="row"
        onSubmit={handleQueryChange}
        spacing={2}
        sx={{ p: 2 }}
      >
        <SvgIcon>
          <SearchMdIcon />
        </SvgIcon>
        <Input
          disableUnderline
          fullWidth
          inputProps={{ ref: queryRef }}
          placeholder={t("Search with Product Name / SKU")}
          sx={{ flexGrow: 1 }}
          onChange={(e) => {
            if (!e.target.value) e.target.value = "";
            handleQueryChange(e);
          }}
        />

        <TextField
          label="Sort By"
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={sort}
          sx={{ width: "300px" }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </TextField>
      </Stack>
      <Divider />
      {showChips ? (
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          gap={1}
          sx={{ p: 2 }}
        >
          {chips.map((chip, index) => (
            <Chip
              key={index}
              label={
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    "& span": {
                      fontWeight: 600,
                    },
                  }}
                >
                  <>
                    <span>{chip.label}</span>: {chip.displayValue || chip.value}
                  </>
                </Box>
              }
              onDelete={(): void => handleChipDelete(chip)}
              variant="outlined"
            />
          ))}
        </Stack>
      ) : (
        ""
      )}
      <Divider />
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        spacing={1}
        sx={{ p: 1 }}
      >
        <CategoryMultiSelect
          isFromProduct={true}
          companyRef={companyRef}
          selectedIds={categoryOptions}
          label={
            user?.company?.industry === "retail" ||
            companyContext?.industry === "retail"
              ? t("Category")
              : t("Reporting Category")
          }
          id={"categories"}
          onChange={(option: any, values: any) => {
            const ids = categoryOptions.map((option: any) => {
              return option.value;
            });

            const allOptions = [...categoryOptions, option];

            if (option) {
              setCategoryOptions(allOptions);
              handleCategoryChange(allOptions, [...ids, values]);
            } else {
              setCategoryOptions([]);
              handleCategoryChange([], []);
            }
          }}
        />

        <BrandMultiSelect
          isFromProduct={true}
          selectedIds={brandOptions}
          id={"brands"}
          onChange={(option: any, values: any) => {
            const ids = brandOptions.map((option: any) => {
              return option.value;
            });

            const allOptions = [...brandOptions, option];

            if (option) {
              setBrandOptions(allOptions);
              handleBrandChange(allOptions, [...ids, values]);
            } else {
              setBrandOptions([]);
              handleBrandChange([], []);
            }
          }}
        />

        <MultiSelect
          label="Product Status"
          isMulti={false}
          onChange={handleSellableChange}
          options={sellableOptions}
          value={sellableValues}
        />
      </Stack>
    </div>
  );
};

ProductListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
};
