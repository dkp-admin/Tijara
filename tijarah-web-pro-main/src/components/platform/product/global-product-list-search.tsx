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
import { ChangeEvent, FC, useEffect } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import BrandMultiSelect from "src/components/input/brand-multiSelect";
import CategoryMultiSelect from "src/components/input/category-multiSelect";
import { MultiSelect } from "src/components/multi-select";
import { useEntity } from "src/hooks/use-entity";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import { industryOptions } from "src/utils/constants";
import { sortOptions, statusOptions, updateOptions } from "src/utils/constants";

interface GlobalProductListSearchProps {
  onFiltersChange?: (filters: Filters) => void;
  userRole?: string;
  showFilter?: boolean;
  showUserRoleFilter?: boolean;
  showLocationFilter?: boolean;
  showBrandFilter?: boolean;
  showBusinessTypeFilter?: boolean;
  showUpdateFilter?: boolean;
  showIndustryFilter?: boolean;
  searchPlaceholder: string;
  onSortChange: (value: string) => void;
  sortBy?: string;
  field?: string;
  sort?: string;
  sortOptions?: { label: string; value: string }[];
  onQueryChange: (value: string) => void;
  report?: string;
  differenceFilter?: boolean;
}
interface Filters {
  name?: string;
  industry?: string[];
  businessType: string[];
  category: string[];
  brand: string[];
  status: string[];
  update: string[];
}

interface SearchChip {
  label: string;
  field:
    | "name"
    | "industry"
    | "category"
    | "businessType"
    | "brand"
    | "status"
    | "update";
  value: unknown;
  displayValue?: unknown;
}

export const GlobalProductListSearch: FC<GlobalProductListSearchProps> = (
  props
) => {
  const {
    onFiltersChange,
    sort,
    onSortChange,
    userRole,
    showFilter = true,
    showUserRoleFilter,
    showLocationFilter,
    showBrandFilter,
    showBusinessTypeFilter,
    showIndustryFilter,
    showUpdateFilter,
    searchPlaceholder,
    sortBy,
    onQueryChange,
    report,
    differenceFilter = false,
    ...other
  } = props;
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [chips, setChips] = useState<SearchChip[]>([]);

  const { find: findBusinessType, entities: businessTypeData } =
    useEntity("business-type");
  const { find: findCategory, entities: categories } =
    useEntity("global-categories");
  const { find: findBrand, entities: brandsData } = useEntity("brands");

  const [categoryOptions, setCategoryOptions] = useState<any>([]);

  const [brandOptions, setBrandOptions] = useState<any>([]);

  const businessTypeOptions =
    businessTypeData?.results?.map((type) => {
      return { label: type?.name?.en, value: type?._id };
    }) || [];

  // const categoryOptions =
  //   categories?.results?.map((category) => {
  //     return { label: category?.name?.en, value: category?._id };
  //   }) || [];

  // const brandOptions =
  //   brandsData?.results?.map((brand) => {
  //     return { label: brand?.name?.en, value: brand?._id };
  //   }) || [];

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      name: undefined,
      industry: [],
      category: [],
      status: [],
      update: [],
      businessType: [],
      brand: [],
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case "name":
          // There will (or should) be only one chips with field "name"
          // so we can set up it directly
          filters.name = chip.value as string;
          break;
        case "industry":
          filters.industry.push(chip.value as string);
          break;
        case "businessType":
          filters.businessType.push(chip.value as string);
          break;
        case "status":
          filters.status.push(chip.value as string);
          break;
        case "update":
          filters.update.push(chip.value as string);
          break;
        case "category":
          filters.category.push(chip.value as string);
          break;
        case "brand":
          filters.brand.push(chip.value as string);
          break;
        default:
          break;
      }
    });

    onFiltersChange?.(filters);
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

  const handleIndustryChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "industry") {
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
          const option = industryOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: "Industry",
            field: "industry",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleBusinessTypeChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "businessType") {
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
            const option = businessTypeOptions.find(
              (option) => option.value === value
            );

            newChips.push({
              label: "Business Type",
              field: "businessType",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [businessTypeOptions]
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
              label: "Category",
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
              (option: any) => option.value === value
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

  const handleUpdateChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "update") {
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
          const option = updateOptions.find((option) => option.value === value);

          newChips.push({
            label: "Update",
            field: "update",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  // We memoize this part to prevent re-render issues
  const industryValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "industry")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const businessTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "businessType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const categoryValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "category")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const brandValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "brand")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const statusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "status")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const updateValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "update")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const showChips = chips.length > 0;

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSortChange(event.target.value as string);
  };

  useEffect(() => {
    findBusinessType({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 100,
      _q: "",
    });

    findCategory({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 100,
      _q: "",
    });

    findBrand({
      page: 0,
      sort: "desc",
      activeTab: "all",
      limit: 100,
      _q: "",
    });
  }, []);

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
          placeholder={searchPlaceholder}
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
      {showFilter && (
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          spacing={1}
          sx={{ p: 1 }}
        >
          <MultiSelect
            label="Industry"
            onChange={handleIndustryChange}
            options={industryOptions}
            value={industryValues}
          />

          {showBusinessTypeFilter && (
            <MultiSelect
              label="Business Type"
              onChange={handleBusinessTypeChange}
              options={businessTypeOptions}
              value={businessTypeValues}
            />
          )}

          <CategoryMultiSelect
            isFromProduct={true}
            isFromGlobalProduct={true}
            selectedIds={categoryOptions}
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

          {/* <MultiSelect
            label="Category"
            onChange={handleCategoryChange}
            options={categoryOptions}
            value={categoryValues}
          /> */}
          <BrandMultiSelect
            isFromGlobalProduct={true}
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
          {/* <MultiSelect
            label="Brand"
            onChange={handleBrandChange}
            options={brandOptions}
            value={brandValues}
          /> */}

          <MultiSelect
            label="Status"
            isMulti={false}
            onChange={handleStatusChange}
            options={statusOptions}
            value={statusValues}
          />

          {showUpdateFilter && (
            <MultiSelect
              label="Update"
              isMulti={false}
              onChange={handleUpdateChange}
              options={updateOptions}
              value={updateValues}
            />
          )}
        </Stack>
      )}
    </div>
  );
};

GlobalProductListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
};
