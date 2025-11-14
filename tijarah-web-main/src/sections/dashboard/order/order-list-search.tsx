import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import {
  Box,
  Chip,
  Divider,
  FormLabel,
  IconButton,
  InputAdornment,
  OutlinedInput,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  useTheme,
} from "@mui/material";
import SearchMdIcon from "@untitled-ui/icons-react/build/esm/SearchMd";
import PropTypes from "prop-types";
import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "src/components/custom-button/custom-export-button";
import CustomDateFilter from "src/components/custom-date-filter/custom-date-filter";
import { MultiSelect } from "src/components/multi-select";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import {
  sortOptions,
  DEFAULT_PAYMENT_TYPES, // Import DEFAULT_PAYMENT_TYPES
} from "src/utils/constants";
import exportAllReport from "src/utils/export-all-report";

interface Filters {
  query?: string;
  method: string[];
  type: string[];
  orderType: string[];
  status?: string[];
  discount: string[];
  startDate?: Date;
  endDate?: Date;
  zatcaStatus?: string[];
  source?: string[];
  orderStatus?: string[];
  driver: string[];
  device: string[];
}

interface SearchChip {
  label: string;
  field:
    | "query"
    | "method"
    | "type"
    | "status"
    | "discount"
    | "orderType"
    | "startDate"
    | "endDate"
    | "zatcaStatus"
    | "source"
    | "orderStatus"
    | "driver"
    | "device";
  value: unknown;
  displayValue?: unknown;
}

const transactionTypeOptions = [
  { label: "Payment", value: "payment" },
  { label: "Refund", value: "refund" },
];

const paymentStatusOptions = [
  { label: "Completed", value: "completed" },
  { label: "Partially paid", value: "partiallyPaid" },
  { label: "Awaiting capture", value: "awaitingCapture" },
];

const discountOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const zatcaOptions = [
  { label: "Error", value: "ERROR" },
  { label: "Reported", value: "REPORTED" },
];

const sourceOptions = [
  { label: "Online", value: "online" },
  { label: "QR", value: "qr" },
];

const orderStatusOptions = [
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

type SortDir = "asc" | "desc";

interface OrderListSearchProps {
  locationRef?: string;
  companyRef?: string;
  showDriverFilter?: boolean;
  showZatcaFilter?: boolean;
  industry?: string;
  count?: number;
  isLoading?: boolean;
  onFiltersChange?: (filters: Filters) => void;
  onSortChange?: (sort: string) => void;
  sortBy?: string;
  sortDir?: SortDir;
  queryObj: any;
  showOrderZatcaStatus?: boolean;
  showDeviceFilter?: boolean;
}

export const OrderListSearch: FC<OrderListSearchProps> = (props) => {
  const { t } = useTranslation();
  const {
    locationRef,
    companyRef,
    showDriverFilter,
    industry,
    onFiltersChange,
    onSortChange,
    sortBy,

    queryObj,

    showZatcaFilter,
    showDeviceFilter,
  } = props;

  const theme = useTheme();
  const { user } = useAuth();

  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);

  const queryRef = useRef<HTMLInputElement | null>(null);

  const [query, setQuery] = useState<string>("");
  const [chips, setChips] = useState<SearchChip[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [showButton, setShowButton] = useState(false);
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [reset, setReset] = useState(false);
  const { find: findUser, entities: userListData } = useEntity("user");
  const { find: findDevice, entities: deviceListData } = useEntity("device");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");
  const { findOne: findOrderTypes, entity: orderTypeListData } = useEntity(
    "company/order-types"
  );
  const [deviceList, setDeviceList] = useState<any>([]);
  const [orderTypeList, setOrderTypeList] = useState<any>([]);

  const [userList, setUserList] = useState<any>([]);

  // Fetch payment types from API
  useEffect(() => {
    findPaymentTypes({
      page: 0,
      limit: 50,
      activeTab: "active",
      sort: "asc",
    });
  }, []);

  // Create dynamic payment method options from API data
  const paymentMethodOptions = useMemo(() => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      return paymentTypesData.results.map((paymentType: any) => ({
        label: paymentType.name?.en || paymentType.name,
        value: (paymentType.name?.en || paymentType.name)
          .toLowerCase()
          .replace(/\s+/g, ""),
      }));
    }
    // Fallback to hardcoded options if API data is not available
    return [
      { label: "Cash", value: "cash" },
      { label: "Card", value: "card" },
      { label: "Wallet", value: "wallet" },
      { label: "Credit", value: "credit" },
    ];
  }, [paymentTypesData]);

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      query: undefined,
      method: [],
      type: [],
      orderType: [],
      status: [],
      discount: [],
      startDate: undefined,
      endDate: undefined,
      zatcaStatus: [],
      source: [],
      orderStatus: [],
      driver: [],
      device: [],
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case "query":
          // There will (or should) be only one chips with field "name"
          // so we can set up it directly
          filters.query = chip.value as string;
          break;
        case "method":
          filters.method.push(chip.value as string);
          break;
        case "type":
          filters.type.push(chip.value as string);
          break;
        case "zatcaStatus":
          filters.zatcaStatus.push(chip.value as string);
          break;
        case "status":
          filters.status.push(chip.value as string);
          break;
        case "discount":
          filters.discount.push(chip.value as string);
          break;
        case "startDate":
          filters.startDate = chip.value as Date;
          break;
        case "endDate":
          // There will (or should) be only one chips with field "name"
          // so we can set up it directly
          filters.endDate = chip.value as Date;
          break;
        case "orderType":
          filters.orderType.push(chip.value as string);
          break;
        case "source":
          filters.source.push(chip.value as string);
          break;
        case "orderStatus":
          filters.orderStatus.push(chip.value as string);
          break;
        case "driver":
          filters.driver.push(chip.value as string);
          break;
        case "device":
          filters.device.push(chip.value as string);
          break;
        default:
          break;
      }
    });

    if (query) {
      filters.query = query;
    }

    if (startDate) {
      filters.startDate = startDate;
    }

    if (endDate) {
      filters.endDate = endDate;
    }

    onFiltersChange?.(filters);
  }, [query, startDate, endDate, chips]);

  useUpdateEffect(() => {
    handleChipsUpdate();
  }, [query, startDate, endDate, chips, handleChipsUpdate]);

  useEffect(() => {
    if (showDeviceFilter) {
      findDevice({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef !== "all" && companyRef ? companyRef : "",
        locationRef: locationRef !== "all" && locationRef ? locationRef : "",
      });
    }
  }, [showDeviceFilter]);

  const handleChipDelete = useCallback((deletedChip: SearchChip): void => {
    setChips((prevChips) => {
      return prevChips.filter((chip) => {
        return !(
          deletedChip.field === chip.field && deletedChip.value === chip.value
        );
      });
    });
  }, []);

  const handleQueryChange = (event: any): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      setQuery((event?.target?.value?.trim() as string) || "");
    }
  };

  const handleSortChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onSortChange(event.target.value as string);
  };

  const handleMethodChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "method") {
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
          const option = paymentMethodOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Payment Method"),
            field: "method",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDeviceChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "device") {
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
            const option = deviceList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Device"),
              field: "device",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [deviceList]
  );

  const deviceValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "device")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const handleZatcaStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "zatcaStatus") {
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
          const option = zatcaOptions.find((option) => option.value === value);

          newChips.push({
            label: t("ZATCA"),
            field: "zatcaStatus",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "type") {
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
          const option = transactionTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Payment Type"),
            field: "type",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

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
          const option = paymentStatusOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Payment Status"),
            field: "status",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDiscountChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "discount") {
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
          const option = discountOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Discount"),
            field: "discount",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleOrderTypeChange = useCallback(
    (values: string[]): void => {
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
            const option = orderTypeList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Order Type"),
              field: "orderType",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [orderTypeList]
  );

  const handleSourceChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "source") {
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
          const option = sourceOptions.find((option) => option.value === value);

          newChips.push({
            label: t("Source"),
            field: "source",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleOrderStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "orderStatus") {
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
          const option = orderStatusOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Order Status"),
            field: "orderStatus",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleStartDateChange = useCallback(
    (date: Date | null): void => {
      setShowButton(true);
      if (date) {
        setStartDate(date);
      }

      // Prevent end date to be before start date
      if (endDate && date && date > endDate) {
        setEndDate(date);
      }
    },
    [endDate, onFiltersChange]
  );

  const handleEndDateChange = useCallback(
    (date: Date | null): void => {
      setShowButton(true);
      if (date) {
        setEndDate(date);
      }

      // Prevent start date to be after end date
      if (startDate && date && date < startDate) {
        setStartDate(date);
      }
    },
    [startDate, onFiltersChange]
  );

  const handleDriverChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "driver") {
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
            const option = userList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Driver"),
              field: "driver",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [userList]
  );

  // We memoize this part to prevent re-render issues
  const methodValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "method")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const typeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "type")
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

  const discountValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "discount")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const zatcaValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "zatcaStatus")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const orderValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "orderType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const sourceValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "source")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const orderStatusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "orderStatus")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const driverValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "driver")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const showChips = chips.length > 0;

  useEffect(() => {
    if (userListData?.results?.length > 0) {
      const list: any = [];

      userListData?.results?.map((type) => {
        list.push({ label: type?.name, value: type?._id });
      });

      setUserList(list);
    }
  }, [userListData?.results]);

  useEffect(() => {
    if (showDriverFilter) {
      if (companyRef) {
        findUser({
          page: 0,
          sort: "desc",
          activeTab: "all",
          limit: 100,
          _q: "",
          companyRef: companyRef !== "all" && companyRef ? companyRef : "",
          locationRef: locationRef !== "all" && locationRef ? locationRef : "",
          userType: "app:driver",
        });
      }
    }
  }, [companyRef, locationRef]);

  // Fetch order types from API
  useEffect(() => {
    if (companyRef && companyRef !== "all") {
      findOrderTypes(companyRef);
    }
  }, [companyRef]);

  // Map order types API response to options format
  useEffect(() => {
    if (orderTypeListData?.orderTypes?.length > 0) {
      const list: any = [];

      orderTypeListData?.orderTypes?.map((orderType: any) => {
        list.push({ label: orderType?.label, value: orderType?.value });
      });

      setOrderTypeList(list);
    }
  }, [orderTypeListData?.orderTypes]);

  useEffect(() => {
    if (deviceListData?.results?.length > 0) {
      const list: any = [];

      deviceListData?.results?.map((type) => {
        list.push({ label: type?.name, value: type?._id });
      });

      setDeviceList(list);
    }
  }, [deviceListData?.results]);

  return (
    <div
      style={{
        backgroundColor: theme.palette.mode !== "dark" && "#fff",
      }}
    >
      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        gap={3}
        sx={{ p: 3 }}
      >
        <Box component="form" onSubmit={handleQueryChange} sx={{ flexGrow: 1 }}>
          <OutlinedInput
            defaultValue=""
            fullWidth
            inputProps={{ ref: queryRef }}
            name="orderNumber"
            placeholder={t("Search with receipt or customer").toString()}
            startAdornment={
              <InputAdornment position="start">
                <SvgIcon>
                  <SearchMdIcon />
                </SvgIcon>
              </InputAdornment>
            }
            onChange={(e) => {
              if (!e.target.value) e.target.value = "";
              handleQueryChange(e);
            }}
          />
        </Box>

        <TextField
          label="Sort By"
          name="sort"
          onChange={handleSortChange}
          select
          SelectProps={{ native: true }}
          value={sortBy}
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

      <Stack
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        spacing={1}
        sx={{ p: 1 }}
      >
        <MultiSelect
          isMulti={false}
          label={t("Payment Method")}
          onChange={handleMethodChange}
          options={paymentMethodOptions}
          value={methodValues}
        />
        <MultiSelect
          isMulti={false}
          label={t("Payment Type")}
          onChange={handleTypeChange}
          options={transactionTypeOptions}
          value={typeValues}
        />
        {/* <MultiSelect
          label={t("Payment Status")}
          onChange={handleStatusChange}
          options={paymentStatusOptions}
          value={statusValues}
        /> */}
        <MultiSelect
          isMulti={false}
          label={t("Discount")}
          onChange={handleDiscountChange}
          options={discountOptions}
          value={discountValues}
        />
        {showZatcaFilter && (
          <MultiSelect
            isMulti={false}
            label={t("ZATCA")}
            onChange={handleZatcaStatusChange}
            options={zatcaOptions}
            value={zatcaValues}
          />
        )}
        <MultiSelect
          isMulti={false}
          label={t("Order Type")}
          onChange={handleOrderTypeChange}
          options={orderTypeList}
          value={orderValues}
        />
        <MultiSelect
          isMulti={false}
          label={t("Source")}
          onChange={handleSourceChange}
          options={sourceOptions}
          value={sourceValues}
        />
        <MultiSelect
          isMulti={false}
          label={t("Order Status")}
          onChange={handleOrderStatusChange}
          options={orderStatusOptions}
          value={orderStatusValues}
        />

        {showDriverFilter && (
          <MultiSelect
            isMulti={false}
            label={t("Driver")}
            onChange={handleDriverChange}
            options={userList}
            value={driverValues}
          />
        )}
        {showDeviceFilter && (
          <MultiSelect
            isMulti={false}
            label={t("Device")}
            onChange={handleDeviceChange}
            options={deviceList}
            value={deviceValues}
          />
        )}
      </Stack>

      <Divider />

      <Stack
        spacing={2}
        alignItems="center"
        direction="row"
        flexWrap="wrap"
        sx={{ px: 3, py: 2, mb: 1 }}
      >
        <FormLabel
          sx={{
            color: "inherit",
            display: "block",
          }}
        >
          {t("Date Range")}
        </FormLabel>

        <CustomDateFilter
          reset={reset}
          setReset={(val: any) => setReset(val)}
          startDate={startDate}
          setStartDate={(val: any) => {
            setStartDate(val);
          }}
          endDate={endDate}
          setEndDate={(val: any) => {
            setEndDate(val);
          }}
        />

        <Box>
          <Tooltip title={t("Reset date")}>
            <IconButton
              onClick={() => {
                setReset(true);
                setStartDate(new Date());
                setEndDate(new Date());
                setShowButton(false);
              }}
            >
              <AutorenewRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack alignItems="center" direction="row" spacing={1}>
          <ExportButton
            onClick={(type: string) => {
              exportAllReport(
                "/report/order",
                queryObj(type),
                "order",
                startDate,
                endDate
              );
            }}
          />
        </Stack>
      </Stack>
    </div>
  );
};

OrderListSearch.propTypes = {
  onFiltersChange: PropTypes.func,
  onSortChange: PropTypes.func,
  sortBy: PropTypes.string,
  sortDir: PropTypes.oneOf<SortDir>(["asc", "desc"]),
};
