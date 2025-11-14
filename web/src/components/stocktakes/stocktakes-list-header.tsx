import { ChangeEvent, FC, useEffect } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import {
  Box,
  Chip,
  Divider,
  Input,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { MultiSelect } from "src/components/multi-select";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import {
  sortOptions,
  paymentStatusList,
  vendorOptions,
  poOrderTypeOptions,
} from "src/utils/constants";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import { useTranslation } from "react-i18next";
import { useAuth } from "src/hooks/use-auth";
import RolesList from "src/pages/platform/rolesAndPermission";

interface StocktakesHeaderProps {
  tabs?: { label: string; value: string }[];
  placeHolder?: any;
  showRoleFilter?: boolean;
  showStatusFilter?: boolean;
  onTabChange?: (value: string) => void;
  currentTab?: any;
  onFiltersChange?: (filters: Filters) => void;
  companyRef?: any;
  userRole?: string;
  showFilter?: boolean;
  showVendorFilter?: boolean;
  showPoOrderTypeFilter?: boolean;
  showPaymentStatusFilter?: boolean;
  showLocationFilter?: boolean;
  searchPlaceholder: string;
  onSortChange: (value: string) => void;
  sortBy?: string;
  sortDir?: SortDir;
  field?: string;
  sort?: string;
  sortOptions?: { label: string; value: string }[];
  onQueryChange: (value: string) => void;
  report?: string;
}

interface Filters {
  vendor?: string[];
  location?: string[];
  paymentStatus?: string[];
  orderType?: string[];
}

interface SearchChip {
  label: string;
  field: "location" | "vendor" | "paymentStatus" | "orderType";
  value: unknown;
  displayValue?: unknown;
}

interface Option {
  label: string;
  value: string;
}

const platformType = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  // { label: "Wallet", value: "wallet" },
];

const platformUserRoles: Option[] = [
  {
    label: "Admin",
    value: "admin",
  },
];

type SortDir = "asc" | "desc";
type SortValue = "newest" | "oldest";

export const StocktakesHeader: FC<StocktakesHeaderProps> = (props) => {
  const {
    tabs = [],
    showRoleFilter = false,
    showStatusFilter = true,
    onTabChange,
    companyRef,
    currentTab,
    onFiltersChange,
    userRole,
    showFilter = true,
    showLocationFilter,
    showVendorFilter,
    showPoOrderTypeFilter,
    showPaymentStatusFilter,
    searchPlaceholder,
    onSortChange,
    sort,
    sortBy,
    sortDir,
    onQueryChange,
    report,
    ...other
  } = props;
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [chips, setChips] = useState<SearchChip[]>([]);
  const [vendorList, setVendorList] = useState<any>([]);
  const [locationsList, setLocationsList] = useState<any>([]);
  const { user } = useAuth();

  const { t } = useTranslation();

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void =>
    onTabChange(value);

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      vendor: [],
      location: [],
      paymentStatus: [],
      orderType: [],
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case "location":
          filters.location.push(chip.value as string);
          break;
        case "vendor":
          filters.vendor.push(chip.value as string);
          break;
        case "orderType":
          filters.orderType.push(chip.value as string);
          break;
        case "paymentStatus":
          filters.paymentStatus.push(chip.value as string);
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

  const { find: findVendor, entities: vendorListData } = useEntity("vendor");
  const { find: findLocation, entities: locationsListData } =
    useEntity("location");

  const handleChipDelete = useCallback((deletedChip: SearchChip): void => {
    setChips((prevChips) => {
      return prevChips.filter((chip) => {
        // There can exist multiple chips for the same field.
        // Filter them by value.

        return !(
          deletedChip.field === chip.field && deletedChip.value === chip.value
        );
      });
    });
  }, []);

  const handleQueryChange = (event: any): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      onQueryChange(event?.target?.value?.trim() as string);
    }
  };

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSortChange(event.target.value as string);
  };

  const handleVendorChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "vendor") {
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
            const option = vendorList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Vendor"),
              field: "vendor",
              value,
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [vendorList]
  );

  const handlePoOrderType = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "orderType") {
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
          const option = poOrderTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Order Type"),
            field: "orderType",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);
  const handlePaymentStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "paymentStatus") {
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
          const option = paymentStatusList.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Payment Status"),
            field: "paymentStatus",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleLocationChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "location") {
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
            const option = locationsList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Location"),
              field: "location",
              value,
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [locationsList]
  );

  // We memoize this part to prevent re-render issues

  const vendorValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "vendor")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const paymentStatusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "paymentStatus")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const poOrderTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "orderType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const locationValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "location")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const showChips = chips.length > 0;

  useEffect(() => {
    if (showVendorFilter) {
      findVendor({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef,
      });
    }

    if (showLocationFilter) {
      findLocation({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef,
      });
    }
  }, [companyRef, showVendorFilter, showLocationFilter]);

  useEffect(() => {
    if (locationsListData?.results?.length > 0) {
      const list: any = [];

      locationsListData?.results?.map((type) => {
        list.push({ label: type?.name?.en, value: type?._id });
      });

      setLocationsList(list);
    }
  }, [locationsListData?.results]);

  useEffect(() => {
    if (vendorListData?.results?.length > 0) {
      const list: any = [];

      vendorListData?.results?.map((type) => {
        list.push({ label: type?.name, value: type?._id });
      });

      setVendorList(list);
    }
  }, [vendorListData?.results]);

  return (
    <div {...other}>
      {tabs.length > 0 && (
        <>
          <Tabs
            indicatorColor="primary"
            onChange={handleTabsChange}
            scrollButtons="auto"
            sx={{ px: 3 }}
            textColor="primary"
            value={currentTab}
            variant="scrollable"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Divider />
        </>
      )}
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
          label={t("Sort By")}
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={sort}
          sx={{ width: "300px" }}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </TextField>
      </Stack>

      <Divider />
      {showChips && (
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
          {showLocationFilter && (
            <MultiSelect
              label={t("Location")}
              onChange={handleLocationChange}
              options={locationsList}
              value={locationValues}
            />
          )}
          {showVendorFilter && (
            <MultiSelect
              label={t("Name")}
              onChange={handleVendorChange}
              options={vendorList}
              value={vendorValues}
            />
          )}
          {showPoOrderTypeFilter && (
            <MultiSelect
              label={t("Order Type")}
              onChange={handlePoOrderType}
              options={poOrderTypeOptions}
              value={poOrderTypeValues}
            />
          )}
          {showPaymentStatusFilter && (
            <MultiSelect
              label={t("Payment Status")}
              onChange={handlePaymentStatusChange}
              options={paymentStatusList}
              value={paymentStatusValues}
            />
          )}
        </Stack>
      )}
    </div>
  );
};

StocktakesHeader.propTypes = {
  onFiltersChange: PropTypes.func,
};
