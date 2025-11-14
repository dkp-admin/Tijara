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
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { BatchMultiSelect } from "src/components/batch-multi-select";
import CategoryMultiSelect from "src/components/input/category-multiSelect";
import { MultiSelect } from "src/components/multi-select";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { useUpdateEffect } from "src/hooks/use-update-effect";
import useScanStore from "src/store/scan-store";
import {
  USER_TYPES,
  VoidAndCompType,
  adjustmentTypeOptions,
  batchOptions,
  cashDrawerStatusOptions,
  deviceZatcaOptions,
  differenceOptions,
  expiryOptions,
  industryOptions,
  nielsenOptions,
  reportsSortOptions,
  sortOptions,
  statusOptions,
  zatcaOptions,
  printerFilterOption,
  floorTypeOptions,
  ChannelsName,
} from "src/utils/constants";
import { useDebounce } from "use-debounce";

const expenseTypeOptions = [
  {
    value: "administrative",
    label: "Administrative",
  },
  {
    value: "medical",
    label: "Medical",
  },
  {
    value: "marketing",
    label: "Marketing",
  },
  {
    value: "rental",
    label: "Rental",
  },
  {
    value: "other",
    label: "Other",
  },
];

interface SuperTableHeaderProps {
  showBoxAndCrateTypeFilter?: boolean;
  showAccountingPaymentStatus?: boolean;
  showTransactionTypeFilter?: boolean;
  showExpenseTypeFilter?: boolean;
  groupId?: string;
  fromMiscExpense?: boolean;
  showReportsSorting?: boolean;
  industry?: string;
  showUserTypeFilter?: boolean;
  showAdsTypeFilter?: boolean;
  showDaysOfWeekFilter?: boolean;
  showSellableFilter?: boolean;
  showAdsStatus?: boolean;
  showPaymentStatusFilter?: boolean;
  showPackageNameFilter?: boolean;
  showUserFilter?: boolean;
  showStaffFilter?: boolean;
  showDeviceFilter?: boolean;
  showDriverFilter?: boolean;
  showChargeTypeFilter?: boolean;
  businessType?: string;
  showApkVersionFilter?: boolean;
  showConnectivityFilter?: boolean;
  showOrderTypeFilter?: boolean;
  showPrinterFilter?: boolean;
  showSourceFilter?: boolean;
  showOrderStatusFilter?: boolean;
  showPaymentMethodFilter?: boolean;
  showInvoicePaymentMethodFilter?: boolean;
  showPaymentTypeFilter?: boolean;
  showDiscountFilter?: boolean;
  showEntityFilter?: boolean;
  showInventoryFilter?: boolean;
  isFromGlobalProduct?: boolean;
  businessTypeRef?: string;
  showCategoryFilter?: boolean;
  showDaysFilter?: boolean;
  showExpiryFilter?: boolean;
  showNielsenFilter?: boolean;
  showRoleFilter?: boolean;
  showGroupFilter?: boolean;
  showStatusFilter?: boolean;
  showHardwareFilter?: boolean;
  onTabChange?: (value: string) => void;
  onFiltersChange?: (filters: Filters) => void;
  companyRef?: any;
  locationRef?: any;
  userRole?: string;
  showFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  showUserRoleFilter?: boolean;
  showLocationFilter?: boolean;
  showVoidAndCompFilter?: boolean;
  showFloorFilter?: boolean;
  showVendorFilter?: boolean;
  searchPlaceholder: string;
  showBusinessTypeFilter?: boolean;
  showIndustryFilter?: boolean;
  showadjustmentTypeFilter?: boolean;
  showBatchFilter?: boolean;
  onSortChange: (value: string) => void;
  sortBy?: string;
  sortDir?: SortDir;
  field?: string;
  sort?: string;
  sortOptions?: { label: string; value: string }[];
  onQueryChange: (value: string) => void;
  report?: string;
  differenceFilter?: boolean;
  showZatcaFilter?: boolean;
  showDeviceZatcaFilter?: boolean;
  showOrderZatcaFilter?: boolean;
  showDeviceTypeFilter?: boolean;
  packageOptions?: Option[];
  paymentStatusOptions?: Option[];
  hardwareOptions?: Option[];
  initialStatus?: string;
}

interface Filters {
  industry?: string[];
  adjustmentType?: string[];
  batch?: string[];
  businessType?: string[];
  location?: string[];
  vendor?: string[];
  status?: string[];
  difference?: string[];
  role?: string[];
  group?: string[];
  entity?: string[];
  inventory?: string[];
  category?: string[];
  days: string[];
  expiry?: string[];
  nielsen?: string[];
  method: string[];
  invoiceMethod: string[];
  type: string[];
  discount: string[];
  orderType: string[];
  source?: string[];
  orderStatus: string[];
  voidAndComp: string[];
  floor: string[];
  printer: string[];
  connectivity: string[];
  apkVersion: string[];
  user: string[];
  staff: string[];
  device: string[];
  chargeType: string[];
  package: string[];
  paymentStatus: string[];
  adsStatus: string[];
  adsType: string[];
  daysOfWeek: string[];
  sellable: string[];
  zatcaEnabled: string[];
  showDeviceZatcaFilter: string[];
  zatcaOrderStatus: string[];
  userType: string[];
  deviceType: string[];
  expenseType: string[];
  driver: string[];
  transactionType: string[];
  accountingStatusType: string[];
  boxAndCrateType: string[];
  hardware: string[];
}

interface SearchChip {
  label: string;
  field:
    | "role"
    | "industry"
    | "adjustmentType"
    | "batch"
    | "location"
    | "vendor"
    | "status"
    | "difference"
    | "businessType"
    | "inventory"
    | "entity"
    | "category"
    | "days"
    | "expiry"
    | "nielsen"
    | "method"
    | "invoiceMethod"
    | "type"
    | "discount"
    | "orderType"
    | "voidAndComp"
    | "floor"
    | "printer"
    | "source"
    | "orderStatus"
    | "connectivity"
    | "apkVersion"
    | "user"
    | "device"
    | "chargeType"
    | "category"
    | "package"
    | "paymentStatus"
    | "group"
    | "adsStatus"
    | "adsType"
    | "daysOfWeek"
    | "sellable"
    | "zatcaEnabled"
    | "zatcaOrderStatus"
    | "userType"
    | "deviceType"
    | "expenseType"
    | "transactionType"
    | "driver"
    | "accountingStatusType"
    | "boxAndCrateType"
    | "hardware"
    | "staff";

  value: unknown;
  displayValue?: unknown;
}

const userTypeOptions = [
  {
    label: "Super Admin",
    value: "super-admin",
  },
  {
    label: "Merchant",
    value: "merchant",
  },
];

const newTransactionTypeOptions = [
  {
    label: "Debit",
    value: "debit",
  },
  {
    label: "Credit",
    value: "credit",
  },
];

const adsTypeOptions = [
  {
    label: "Image",
    value: "image",
  },
  {
    label: "Video",
    value: "video",
  },
  {
    label: "Image With Text",
    value: "image-with-text",
  },
];

const daysOfWeekOptions = [
  {
    label: "Weekdays",
    value: "weekdays",
  },
  {
    label: "Weekend",
    value: "weekend",
  },
];
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

const adsStatusOptions = [
  {
    label: "Ongoing",
    value: "ongoing",
  },
  {
    label: "Paused",
    value: "paused",
  },
  {
    label: "Completed",
    value: "completed",
  },
];

const chargeTypeOptions = [
  {
    label: "Custom",
    value: "custom",
  },
  {
    label: "Fixed",
    value: "fixed",
  },
];

const connectivityOptions = [
  {
    label: "Paired",
    value: "paired",
  },
  {
    label: "Unpaired",
    value: "unpaired",
  },
];

const sourceOptions = [
  { label: "Online", value: "online" },
  { label: "QR", value: "qr" },
];

const orderStatusOptions = [
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

const paymentMethodOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Wallet", value: "wallet" },
  { label: "Credit", value: "credit" },
  { label: "HungerStation", value: "hungerstation" },
  { label: "Jahez", value: "jahez" },
  { label: "ToYou", value: "toyou" },
  { label: "Barakah", value: "barakah" },
  { label: "Careem", value: "careem" },
  { label: "Ninja", value: "ninja" },
  { label: "The Chef", value: "thechef" },
  { label: "STC Pay", value: "stcpay" },
  { label: "Nearpay", value: "nearpay" },
];

const paymentMethodForMiscExpenseOptions = [
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  // { label: "Wallet", value: "wallet" },
  { label: "Credit", value: "credit" },
];

const transactionTypeOptions = [
  { label: "Payment", value: "payment" },
  { label: "Refund", value: "refund" },
];

const paymentStatusOptions = [
  {
    label: "Paid",
    value: "paid",
  },
  {
    label: "Due",
    value: "unpaid",
  },
];

const accountingStatusOptions = [
  {
    label: "Paid",
    value: "paid",
  },
  {
    label: "Received",
    value: "received",
  },
  {
    label: "To be paid",
    value: "to_be_paid",
  },
  {
    label: "To be received",
    value: "to_be_received",
  },
];

const discountOptions = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
];

const zatcaOrderStatusOptions = [
  { label: "Error", value: "ERROR" },
  { label: "Reported", value: "REPORTED" },
];

interface Option {
  label: string;
  value: string;
}

const platformUserRoles: Option[] = [
  {
    label: "Admin",
    value: "admin",
  },
];
const industriesOptions: Option[] = [
  {
    label: "Retail",
    value: "retail",
  },
  {
    label: "Restaurant",
    value: "restaurant",
  },
];

const daysOptions: Option[] = [
  {
    label: "30",
    value: "30",
  },
  {
    label: "60",
    value: "60",
  },
  {
    label: "90",
    value: "90",
  },
  {
    label: "180",
    value: "180",
  },
  {
    label: "365",
    value: "365",
  },
];

const merchantUserRoles: Option[] = [
  {
    label: "Admin",
    value: USER_TYPES.ADMIN,
  },
  {
    label: "Cashier",
    value: USER_TYPES.CASHIER,
  },
];

const entityOption: Option[] = [
  {
    label: "Product",
    value: "product",
  },
  {
    label: "Brand",
    value: "brand",
  },
  {
    label: "Category",
    value: "category",
  },
];

const inventoryOption: Option[] = [
  {
    label: "Inhand",
    value: "inhand",
  },
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Out of Stock",
    value: "outOfStock",
  },
];

const deviceTypeOptions: Option[] = [
  {
    label: "POS",
    value: "pos",
  },
  {
    label: "KDS",
    value: "kds",
  },
];
const boxAndCrateTypeOptions: Option[] = [
  {
    label: "Box",
    value: "box",
  },
  {
    label: "Crate",
    value: "crate",
  },
];

type SortDir = "asc" | "desc";
type SortValue = "newest" | "oldest";

interface SortOption {
  label: string;
  value: SortValue;
}

export const SuperTableHeader: FC<SuperTableHeaderProps> = (props) => {
  const {
    showBoxAndCrateTypeFilter,
    showAccountingPaymentStatus,
    showTransactionTypeFilter,
    showExpenseTypeFilter,
    groupId,
    fromMiscExpense,
    showReportsSorting,
    industry,
    showUserTypeFilter,
    showAdsTypeFilter,
    showDaysOfWeekFilter,
    showSellableFilter,
    showAdsStatus,
    showPaymentStatusFilter,
    showPackageNameFilter,
    showDriverFilter,
    showUserFilter,
    showStaffFilter,
    showDeviceFilter,
    showChargeTypeFilter = false,
    businessType,
    showApkVersionFilter = false,
    showConnectivityFilter = false,
    showOrderTypeFilter = false,
    showPrinterFilter = false,
    showSourceFilter = false,
    showOrderStatusFilter = false,
    showPaymentMethodFilter = false,
    showInvoicePaymentMethodFilter = false,
    showPaymentTypeFilter = false,
    showDiscountFilter = false,
    showEntityFilter = false,
    showInventoryFilter = false,
    isFromGlobalProduct = false,
    businessTypeRef,
    showCategoryFilter = false,
    showDaysFilter = false,
    showExpiryFilter = false,
    showNielsenFilter = false,
    showRoleFilter = false,
    showGroupFilter = false,
    showStatusFilter = true,
    showOrderZatcaFilter = false,
    onTabChange,
    companyRef,
    locationRef,
    onFiltersChange,
    userRole,
    showFilter = true,
    showSort = true,
    showSearch = true,
    showUserRoleFilter,
    showLocationFilter,
    showVendorFilter,
    showVoidAndCompFilter,
    showFloorFilter,
    showIndustryFilter,
    showadjustmentTypeFilter,
    showBatchFilter,
    showBusinessTypeFilter,
    searchPlaceholder,
    onSortChange,
    sort,
    sortBy,
    sortDir,
    onQueryChange,
    report,
    differenceFilter = false,
    showZatcaFilter = false,
    showDeviceZatcaFilter = false,
    showDeviceTypeFilter = false,
    packageOptions,
    initialStatus,
    ...other
  } = props;
  const { setScan } = useScanStore();
  const queryRef = useRef<HTMLInputElement | null>(null);
  const [chips, setChips] = useState<SearchChip[]>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [businessTypeList, setBusinessTypeList] = useState<any>([]);
  const [roleList, setRoleList] = useState<any>([]);
  const [groupList, setGroupList] = useState<any>([
    // { label: "One timers", value: "one-timers" },
    // { label: "Regulars", value: "regular" },
  ]);

  const [locationsList, setLocationsList] = useState<any>([]);
  const [apkVersionList, setApkVersionList] = useState<any>([]);

  const [userList, setUserList] = useState<any>([]);
  const [staffList, setStaffList] = useState<any>([]);
  const [deviceList, setDeviceList] = useState<any>([]);
  const [orderTypeList, setOrderTypeList] = useState<any>([]);

  const [vendorsList, setVendorsList] = useState<any>([]);
  const { user } = useAuth();

  const { t } = useTranslation();

  const [categoryOptions, setCategoryOptions] = useState<any>([]);

  const handleTabsChange = (event: ChangeEvent<any>, value: string): void =>
    onTabChange(value);

  const handleChipsUpdate = useCallback(() => {
    const filters: Filters = {
      industry: [],
      adjustmentType: [],
      batch: [],
      businessType: [],
      location: [],
      vendor: [],
      status: [],
      difference: [],
      role: [],
      entity: [],
      inventory: [],
      category: [],
      days: [],
      expiry: [],
      nielsen: [],
      method: [],
      invoiceMethod: [],
      type: [],
      discount: [],
      orderType: [],
      source: [],
      orderStatus: [],
      voidAndComp: [],
      floor: [],
      printer: [],
      connectivity: [],
      apkVersion: [],
      user: [],
      staff: [],
      device: [],
      chargeType: [],
      package: [],
      paymentStatus: [],
      group: [],
      adsStatus: [],
      adsType: [],
      daysOfWeek: [],
      sellable: [],
      zatcaEnabled: [],
      showDeviceZatcaFilter: [],
      zatcaOrderStatus: [],
      userType: [],
      deviceType: [],
      expenseType: [],
      driver: [],
      transactionType: [],
      accountingStatusType: [],
      boxAndCrateType: [],
      hardware: [],
    };

    chips.forEach((chip) => {
      switch (chip.field) {
        case "location":
          filters.location.push(chip.value as string);
          break;
        case "vendor":
          filters.vendor.push(chip.value as string);
          break;
        case "industry":
          filters.industry.push(chip.value as string);
          break;
        case "adjustmentType":
          filters.adjustmentType.push(chip.value as string);
          break;
        case "batch":
          filters.batch.push(chip.value as string);
          break;
        case "businessType":
          filters.businessType.push(chip.value as string);
          break;
        case "status":
          filters.status.push(chip.value as string);
          break;
        case "difference":
          filters.difference.push(chip.value as string);
          break;
        case "role":
          filters.role.push(chip.value as string);
          break;
        case "group":
          filters.group.push(chip.value as string);
          break;
        case "entity":
          filters.entity.push(chip.value as string);
          break;
        case "inventory":
          filters.inventory.push(chip.value as string);
          break;
        case "category":
          filters.category.push(chip.value as string);
          break;
        case "days":
          filters.days.push(chip.value as string);
          break;
        case "expiry":
          filters.expiry.push(chip.value as string);
          break;
        case "nielsen":
          filters.nielsen.push(chip.value as string);
          break;
        case "zatcaEnabled":
          filters.zatcaEnabled.push(chip.value as string);
          break;
        case "zatcaOrderStatus":
          filters.zatcaOrderStatus.push(chip.value as string);
          break;

        case "method":
          filters.method.push(chip.value as string);
          break;
        case "invoiceMethod":
          filters.invoiceMethod.push(chip.value as string);
          break;
        case "type":
          filters.type.push(chip.value as string);
          break;
        case "discount":
          filters.discount.push(chip.value as string);
          break;
        case "orderType":
          filters.orderType.push(chip.value as string);
          break;
        case "voidAndComp":
          filters.voidAndComp.push(chip.value as string);
          break;
        case "floor":
          filters.floor.push(chip.value as string);
          break;
        case "printer":
          filters.printer.push(chip.value as string);
          break;
        case "source":
          filters.source.push(chip.value as string);
          break;
        case "orderStatus":
          filters.orderStatus.push(chip.value as string);
          break;
        case "connectivity":
          filters.connectivity.push(chip.value as string);
          break;
        case "apkVersion":
          filters.apkVersion.push(chip.value as string);
          break;
        case "user":
          filters.user.push(chip.value as string);
          break;
        case "staff":
          filters.staff.push(chip.value as string);
          break;
        case "device":
          filters.device.push(chip.value as string);
          break;
        case "driver":
          filters.driver.push(chip.value as string);
          break;
        case "chargeType":
          filters.chargeType.push(chip.value as string);
          break;
        case "package":
          filters.package.push(chip.value as string);
          break;
        case "paymentStatus":
          filters.paymentStatus.push(chip.value as string);
          break;
        case "adsStatus":
          filters.adsStatus.push(chip.value as string);
          break;
        case "adsType":
          filters.adsType.push(chip.value as string);
          break;
        case "daysOfWeek":
          filters.daysOfWeek.push(chip.value as string);
          break;
        case "sellable":
          filters.sellable.push(chip.value as string);
          break;
        case "userType":
          filters.userType.push(chip.value as string);
          break;
        case "deviceType":
          filters.deviceType.push(chip.value as string);
          break;
        case "expenseType":
          filters.expenseType.push(chip.value as string);
          break;
        case "transactionType":
          filters.transactionType.push(chip.value as string);
          break;
        case "accountingStatusType":
          filters.accountingStatusType.push(chip.value as string);
          break;
        case "boxAndCrateType":
          filters.boxAndCrateType.push(chip.value as string);
          break;
        case "hardware":
          filters.hardware.push(chip.value as string);
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

  const { find: findBusinessType, entities: businessTypeListData } =
    useEntity("business-type");
  const { find: findLocation, entities: locationsListData } =
    useEntity("location");
  const { find: findVendor, entities: vendorsListData } = useEntity("vendor");
  const { find: findRole, entities: roleListData } = useEntity("role");
  const { find: findGroup, entities: groupListData } =
    useEntity("customer-group");
  const { find: findApk, entities: apkListData } = useEntity("apk-management");
  const { find: findUser, entities: userListData } = useEntity("user");
  const { find: findStaff, entities: staffListData } =
    useEntity("user/all-staff");

  const { find: findDevice, entities: deviceListData } = useEntity("device");
  const { findOne: findOrderTypes, entity: orderTypeListData } = useEntity(
    "company/order-types"
  );
  const { findOne: findComapny, entity: companyData } = useEntity("company");
  const { find: findPaymentTypes, entities: paymentTypesData } =
    useEntity("payment-type");

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
  const dynamicPaymentMethodOptions = useMemo(() => {
    if (paymentTypesData?.results && paymentTypesData.results.length > 0) {
      return paymentTypesData.results.map((paymentType: any) => ({
        label: paymentType.name?.en || paymentType.name,
        value: (paymentType.name?.en || paymentType.name)
          .toLowerCase()
          .replace(/\s+/g, ""),
      }));
    }
    return paymentMethodOptions; // Fallback to hardcoded options
  }, [paymentTypesData]);

  const handleChipDelete = useCallback(
    (deletedChip: SearchChip): void => {
      if (deletedChip.field === "category") {
        let options: any[] = categoryOptions.filter(
          (option: any) => option.value !== deletedChip.value
        );

        setCategoryOptions(options);
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
    [categoryOptions]
  );

  const handleQueryChange = (event: any): void => {
    event.preventDefault();
    if (event?.target?.value !== undefined) {
      onQueryChange(event?.target?.value?.trim() as string);
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
          const option = dynamicPaymentMethodOptions.find(
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
            label: t("Industry"),
            field: "industry",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);
  const handleadjustmentTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "adjustmentType") {
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
          const option = adjustmentTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Adjustment Type"),
            field: "adjustmentType",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleBatchChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "batch") {
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
          const option = batchOptions.find((option) => option.value === value);

          newChips.push({
            label: t("Batch"),
            field: "batch",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

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
              label: t("Category"),
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

  const handleDaysChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "days") {
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
            label: t("days"),
            field: "days",
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
            const option = businessTypeList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Business Type"),
              field: "businessType",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [businessTypeList]
  );

  const handleUserRoleChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "role") {
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
            const option = roleList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Role"),
              field: "role",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [roleList]
  );

  const handleGroupChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "group") {
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
            const option = groupList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Group"),
              field: "group",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [groupList]
  );

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
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [locationsList]
  );

  const handleVoidAndCompChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "voidAndComp") {
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
          const option = VoidAndCompType.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Type"),
            field: "voidAndComp",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);
  const handleFloorChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "floor") {
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
          const option = floorTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Floor"),
            field: "floor",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handlePrinterChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "printer") {
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
          const option = printerFilterOption.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Printer"),
            field: "printer",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

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
            const option = vendorsList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Vendor"),
              field: "vendor",
              value,
              displayValue: option?.label,
            });
          }
        });

        return newChips;
      });
    },
    [vendorsList]
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
          const option = (
            report == "shiftAndCash" ? cashDrawerStatusOptions : statusOptions
          ).find((option) => option.value === value);

          newChips.push({
            label: t("Status"),
            field: "status",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleEntityChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "entity") {
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
          const option = (
            report == "shiftAndCash" ? cashDrawerStatusOptions : statusOptions
          ).find((option) => option.value === value);

          newChips.push({
            label: t("Entity"),
            field: "entity",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleInventoryChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "inventory") {
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
          const option = (
            report == "shiftAndCash" ? cashDrawerStatusOptions : statusOptions
          ).find((option) => option.value === value);

          newChips.push({
            label: t("Inventory"),
            field: "inventory",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDifferenceChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "difference") {
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
          const option = differenceOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Difference"),
            field: "difference",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleExpiryChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "expiry") {
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
          const option = differenceOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Expiry"),
            field: "expiry",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleNielsenChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "nielsen") {
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
          const option = nielsenOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Nielsen"),
            field: "nielsen",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleZatcaChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "zatcaEnabled") {
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
            field: "zatcaEnabled",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDeviceZatcaChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "zatcaEnabled") {
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
          const option = deviceZatcaOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("ZATCA"),
            field: "zatcaEnabled",
            value,
            displayValue: option?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleZatcaOrderStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "zatcaOrderStatus") {
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
          const option = deviceZatcaOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("ZATCA"),
            field: "zatcaOrderStatus",
            value,
            displayValue: option!?.label,
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
              displayValue: option!?.label,
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
            displayValue: option!.label,
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
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleConnectivityChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "connectivity") {
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
          const option = connectivityOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Connectivity"),
            field: "connectivity",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleApkVersionChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "apkVersion") {
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
            const option = apkVersionList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("APK Version"),
              field: "apkVersion",
              value,
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [apkVersionList]
  );

  const handleUserChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "user") {
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
              label: t("User"),
              field: "user",
              value,
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [userList]
  );

  const handleStaffChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "staff") {
            return true;
          }

          const found = values.includes(chip.value as string);

          if (found) {
            valuesFound.push(chip.value as string);
          }

          return found;
        });

        values.forEach((value) => {
          if (!valuesFound.includes(value)) {
            const option = staffList.find(
              (option: any) => option.value === value
            );

            newChips.push({
              label: t("Staff"),
              field: "staff",
              value,
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [staffList]
  );

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
              displayValue: option!?.label,
            });
          }
        });

        return newChips;
      });
    },
    [deviceList]
  );
  const handleChargeTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "chargeType") {
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
          const option = chargeTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Charge Type"),
            field: "chargeType",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handlePackageChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "package") {
            return true;
          }

          const found = values.includes(chip.value as string);

          if (found) {
            valuesFound.push(chip.value as string);
          }

          return found;
        });

        if (values.length === valuesFound.length) {
          return newChips;
        }

        values.forEach((value) => {
          if (!valuesFound.includes(value)) {
            const option = packageOptions.find(
              (option) => option.value === value
            );

            console.log(option, "otp");

            newChips.push({
              label: t("Package Name"),
              field: "package",
              value,
              displayValue: option!?.label,
            });
          }
        });

        console.log(newChips);

        return newChips;
      });
    },
    [packageOptions]
  );

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
          const option = paymentStatusOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Payment status"),
            field: "paymentStatus",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleAdsStatusChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "adsStatus") {
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
          const option = adsStatusOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Status"),
            field: "adsStatus",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleAdsTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "adsType") {
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
          const option = adsTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Type"),
            field: "adsType",
            value,
            displayValue: option!?.label,
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
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDaysOfWeekChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "daysOfWeek") {
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
          const option = daysOfWeekOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Days of Week"),
            field: "daysOfWeek",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleUserTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "userType") {
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
          const option = userTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Type"),
            field: "userType",
            value,
            displayValue: option!?.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleDeviceTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "deviceType") {
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
          const option = deviceTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Device Type"),
            field: "deviceType",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleExpenseTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "expenseType") {
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
          const option = expenseTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Expense Type"),
            field: "expenseType",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleTransactionTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "transactionType") {
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
          const option = newTransactionTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Transaction Type"),
            field: "transactionType",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleAccountingStatusTypeChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "accountingStatusType") {
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
            const option = accountingStatusOptions.find(
              (option) => option.value === value
            );

            newChips.push({
              label: t("Status"),
              field: "accountingStatusType",
              value,
              displayValue: option!.label,
            });
          }
        });

        return newChips;
      });
    },
    []
  );

  const handleBoxAndCrateTypeChange = useCallback((values: string[]): void => {
    setChips((prevChips) => {
      const valuesFound: string[] = [];

      // First cleanup the previous chips
      const newChips = prevChips.filter((chip) => {
        if (chip.field !== "boxAndCrateType") {
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
          const option = boxAndCrateTypeOptions.find(
            (option) => option.value === value
          );

          newChips.push({
            label: t("Type"),
            field: "boxAndCrateType",
            value,
            displayValue: option!.label,
          });
        }
      });

      return newChips;
    });
  }, []);

  const handleHardwareChange = useCallback(
    (values: string[]): void => {
      setChips((prevChips) => {
        const valuesFound: string[] = [];

        // First cleanup the previous chips
        const newChips = prevChips.filter((chip) => {
          if (chip.field !== "hardware") {
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
            const option = props.hardwareOptions?.find(
              (option) => option.value === value
            );

            newChips.push({
              label: t("Hardware"),
              field: "hardware",
              value,
              displayValue: option!.label,
            });
          }
        });

        return newChips;
      });
    },
    [props.hardwareOptions]
  );

  // We memoize this part to prevent re-render issues
  const industryValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "industry")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const adjustmentTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "adjustmentType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const batchValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "batch")
        .map((chip) => chip.value) as string[],

    [chips]
  );

  const userRoleValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "role")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const groupValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "group")
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

  const locationValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "location")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const vendorValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "vendor")
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

  const differenceValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "difference")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  // const daysValues = useMemo(
  //   () =>
  //     chips
  //       .filter((chip) => chip.field === "days")
  // );

  const expiryValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "expiry")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const nielsenValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "nielsen")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const zatcaValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "zatcaEnabled")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const deviceZatcaValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "zatcaEnabled")
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

  const zatcaOrderStatusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "zatcaOrderStatus")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const entityValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "entity")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const inventoryValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "inventory")
        .map((chip) => chip.value) as string[],
    [chips]
  );

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

  const discountValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "discount")
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

  const connectivityValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "connectivity")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const apkVersionValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "apkVersion")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const userValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "user")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const staffValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "staff")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const deviceValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "device")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const chargeTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "chargeType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const packageValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "package")
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

  const adsStatusValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "adsStatus")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const adsTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "adsType")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const daysOfWeekValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "daysOfWeek")
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

  const voidAndCompValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "voidAndComp")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const floorValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "floor")
        .map((chip) => chip.value) as string[],
    [chips]
  );
  const printerValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "printer")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const userTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "sellable")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const deviceTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "deviceType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const expenseTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "expenseType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const transactionTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "transactionType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const accountingStatusTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "accountingStatusType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const boxAndCrateTypeValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "boxAndCrateType")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const hardwareValues = useMemo(
    () =>
      chips
        .filter((chip) => chip.field === "hardware")
        .map((chip) => chip.value) as string[],
    [chips]
  );

  const showChips = chips.length > 0;

  useEffect(() => {
    if (initialStatus && chips.length === 0) {
      handleStatusChange([initialStatus]);
    }
  }, [initialStatus]);

  useEffect(() => {
    if (showBusinessTypeFilter) {
      findBusinessType({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef ? companyRef : user.company?._id,
      });
    }

    if (showRoleFilter) {
      findRole({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef ? companyRef : user.company?._id,
        type: "merchant",
      });
    }

    if (showGroupFilter) {
      findGroup({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef ? companyRef : user.company?._id,
      });
    }

    if (showLocationFilter) {
      findLocation({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef ? companyRef : user.company?._id,
      });
    }
    if (showVendorFilter) {
      findVendor({
        page: 0,
        sort: "desc",
        activeTab: "all",
        limit: 100,
        _q: "",
        companyRef: companyRef ? companyRef : user.company?._id,
      });
    }
    if (showApkVersionFilter) {
      findApk({
        page: 0,
        sort: "desc",
        // activeTab: "all",
        limit: 100,
        _q: "",
      });
    }

    if (showUserFilter) {
      if (companyRef) {
        findUser({
          page: 0,
          sort: "desc",
          activeTab: "all",
          limit: 100,
          _q: "",
          companyRef: companyRef !== "all" && companyRef ? companyRef : "",
          locationRef: locationRef !== "all" && locationRef ? locationRef : "",
        });
      }
    }

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

    if (showStaffFilter) {
      if (companyRef) {
        findStaff({
          page: 0,
          sort: "desc",
          activeTab: "all",
          limit: 100,
          _q: "",
          companyRef: companyRef !== "all" && companyRef ? companyRef : "",
          locationRef: locationRef !== "all" && locationRef ? locationRef : "",
        });
      }
    }

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

    if (showOrderTypeFilter) {
      if (companyRef && companyRef !== "all") {
        findOrderTypes(companyRef);
      }
    }
  }, [
    showBusinessTypeFilter,
    showLocationFilter,
    showVendorFilter,
    showApkVersionFilter,
    showUserFilter,
    showStaffFilter,
    showDeviceFilter,
    showOrderTypeFilter,
    companyRef,
    locationRef,
  ]);

  useEffect(() => {
    if (companyRef && companyRef != "all") {
      findComapny(companyRef?.toString());
    }
  }, [companyRef]);

  useEffect(() => {
    if (businessTypeListData?.results?.length) {
      const list: any = [];

      businessTypeListData?.results?.map((type) => {
        list.push({ label: type?.name?.en, value: type?._id });
      });

      setBusinessTypeList(list);
    }
  }, [businessTypeListData?.results]);

  useEffect(() => {
    if (roleListData?.results?.length) {
      const list: any = [];

      roleListData?.results?.map((type) => {
        list.push({ label: type?.name, value: type?._id });
      });

      setRoleList(list);
    }
  }, [roleListData?.results]);

  useEffect(() => {
    if (groupListData?.results?.length) {
      const list: any = [];

      groupListData?.results?.map((group) => {
        list.push({ label: group?.name, value: group?._id });
      });

      if (groupId) {
        const filterGroup = list?.filter(
          (group: any) => group.value === groupId
        );

        setChips([
          {
            label: t("Group"),
            field: "group",
            value: groupId,
            displayValue: filterGroup?.[0]?.label,
          },
        ]);
      }
      setGroupList(list);
    }
  }, [groupListData?.results, groupId]);

  useEffect(() => {
    if (locationsListData?.results?.length > 0) {
      const list: any = [];

      locationsListData?.results
        ?.filter((t) => {
          if (
            locationsListData?.results?.length > 0 &&
            user?.userType !== "app:admin" &&
            user?.userType !== "app:super-admin" &&
            user
          ) {
            return user?.locationRefs?.includes(t._id.toString());
          }
          return true;
        })
        ?.map((type) => {
          list.push({ label: type?.name?.en, value: type?._id });
        });

      setLocationsList(list);
    }
  }, [locationsListData?.results]);

  useEffect(() => {
    if (locationsList?.length > 0) {
      const chipLoc = chips?.find((t) => t.field === "location");
      if (
        user?.userType !== "app:admin" &&
        user?.userType !== "app:super-admin" &&
        user &&
        !chipLoc
      ) {
        handleLocationChange([locationsList?.[0]?.value]);
      }
    }
  }, [locationsList, chips]);

  useEffect(() => {
    if (vendorsListData?.results?.length > 0) {
      const list: any = [];

      vendorsListData?.results?.map((type) => {
        list.push({ label: type?.name, value: type?._id });
      });

      setVendorsList(list);
    }
  }, [vendorsListData?.results]);

  useEffect(() => {
    if (apkListData?.results?.length > 0) {
      const list: any = [];

      apkListData?.results?.map((type) => {
        list.push({ label: type?.version, value: type?.version });
      });

      setApkVersionList(list);
    }
  }, [apkListData?.results]);

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
    if (staffListData?.results?.length > 0) {
      const list: any = [];

      staffListData?.results?.map((staff) => {
        list.push({ label: staff?.name, value: staff?._id });
      });

      setStaffList(list);
    }
  }, [staffListData?.results]);

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
    <div {...other}>
      {showSearch && (
        <>
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
              onFocus={() => setScan(true)}
              onBlur={() => setScan(false)}
              onChange={(e) => {
                if (!e.target.value) e.target.value = "";
                handleQueryChange(e);
              }}
            />

            {showReportsSorting ? (
              showSort ? (
                <TextField
                  label={t("Sort By")}
                  name="sort"
                  onChange={handleSortChange}
                  select
                  SelectProps={{ native: true }}
                  value={sort}
                  sx={{ width: "300px" }}
                >
                  {reportsSortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </TextField>
              ) : (
                ""
              )
            ) : showSort ? (
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
            ) : (
              ""
            )}
          </Stack>

          <Divider />
        </>
      )}
      {showChips && (
        <>
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
                      <span>{chip.label}</span>:{" "}
                      {chip.displayValue || chip.value}
                    </>
                  </Box>
                }
                onDelete={(): void => handleChipDelete(chip)}
                variant="outlined"
              />
            ))}
          </Stack>

          <Divider />
        </>
      )}
      {showFilter && (
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          spacing={1}
          sx={{ p: 1 }}
        >
          {showCategoryFilter && (
            <CategoryMultiSelect
              label={
                industry === "restaurant" ? "Reporting Category" : "Category "
              }
              isFromGlobalProduct={isFromGlobalProduct}
              businessTypeRef={businessTypeRef}
              isFromProduct={true}
              companyRef={companyRef == "all" ? "" : companyRef}
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
          )}
          {showLocationFilter && (
            <MultiSelect
              label={t("Location")}
              onChange={handleLocationChange}
              options={locationsList}
              value={locationValues}
              isMulti={false}
            />
          )}
          {showVendorFilter && (
            <MultiSelect
              label={t("Vendor")}
              onChange={handleVendorChange}
              options={vendorsList}
              value={vendorValues}
            />
          )}
          {showVoidAndCompFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Type")}
              onChange={handleVoidAndCompChange}
              options={VoidAndCompType}
              value={voidAndCompValues}
            />
          )}
          {showFloorFilter && (
            <MultiSelect
              label={t("Floor")}
              isMulti={false}
              onChange={handleFloorChange}
              options={floorTypeOptions}
              value={floorValues}
            />
          )}
          {/* {showDaysFilter && (
            <MultiSelect
              label="Days"
              onChange={handleDaysChange}
              options={daysOptions}
              value={daysValues}
            />
          )} */}
          {showBusinessTypeFilter && (
            <MultiSelect
              label={t("Business Type")}
              onChange={handleBusinessTypeChange}
              options={businessTypeList}
              value={businessTypeValues}
            />
          )}
          {showIndustryFilter && (
            <MultiSelect
              label={t("Industry")}
              onChange={handleIndustryChange}
              options={industriesOptions}
              value={industryValues}
            />
          )}
          {showadjustmentTypeFilter && (
            <MultiSelect
              label={t("Adjustment Type")}
              onChange={handleadjustmentTypeChange}
              options={adjustmentTypeOptions}
              value={adjustmentTypeValues}
            />
          )}
          {showBatchFilter && (
            <BatchMultiSelect
              label={t("Batch")}
              isMulti={false}
              onChange={handleBatchChange}
              options={batchOptions}
              value={batchValues.length > 0 ? batchValues : ["available"]}
            />
          )}
          {showUserRoleFilter && (
            <MultiSelect
              label={t("Role")}
              isMulti={false}
              onChange={handleUserRoleChange}
              options={roleList}
              value={userRoleValues}
            />
          )}
          {showGroupFilter && (
            <MultiSelect
              label={t("Group")}
              isMulti={false}
              onChange={handleGroupChange}
              options={groupList}
              value={groupValues}
            />
          )}
          {differenceFilter && (
            <MultiSelect
              label={t("Difference")}
              onChange={handleDifferenceChange}
              options={differenceOptions}
              value={differenceValues}
            />
          )}
          {showEntityFilter && (
            <MultiSelect
              label={t("Entity")}
              isMulti={false}
              onChange={handleEntityChange}
              options={entityOption}
              value={entityValues}
            />
          )}
          {showExpiryFilter && (
            <MultiSelect
              label={t("Expiry")}
              onChange={handleExpiryChange}
              options={expiryOptions}
              value={expiryValues}
            />
          )}
          {showNielsenFilter && (
            <MultiSelect
              label={t("Nielsen Report")}
              onChange={handleNielsenChange}
              options={nielsenOptions}
              value={nielsenValues}
            />
          )}
          {showZatcaFilter && (
            <MultiSelect
              label={t("ZATCA Status")}
              onChange={handleZatcaChange}
              options={zatcaOptions}
              value={zatcaValues}
            />
          )}
          {showDeviceZatcaFilter && (
            <MultiSelect
              label={t("ZATCA")}
              onChange={handleDeviceZatcaChange}
              options={deviceZatcaOptions}
              value={deviceZatcaValues}
            />
          )}
          {showStatusFilter && (
            <MultiSelect
              label={t("Status")}
              isMulti={false}
              onChange={handleStatusChange}
              options={
                report == "shiftAndCash"
                  ? cashDrawerStatusOptions
                  : statusOptions
              }
              value={statusValues}
            />
          )}
          {showInventoryFilter && (
            <MultiSelect
              label={t("Inventory")}
              isMulti={false}
              onChange={handleInventoryChange}
              options={inventoryOption}
              value={inventoryValues}
            />
          )}
          {showPaymentMethodFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Payment Method")}
              onChange={handleMethodChange}
              options={
                fromMiscExpense
                  ? paymentMethodForMiscExpenseOptions
                  : dynamicPaymentMethodOptions
              }
              value={methodValues}
            />
          )}
          {showInvoicePaymentMethodFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Payment Method")}
              onChange={handleMethodChange}
              options={[
                { label: t("Cash"), value: "cash" },
                { label: t("Card"), value: "card" },
                { label: t("Account Transfer"), value: "accountTransfer" },
              ]}
              value={methodValues}
            />
          )}
          {showPaymentTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Payment Type")}
              onChange={handleTypeChange}
              options={transactionTypeOptions}
              value={typeValues}
            />
          )}
          {showDiscountFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Discount")}
              onChange={handleDiscountChange}
              options={discountOptions}
              value={discountValues}
            />
          )}
          {showOrderTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Order Type")}
              onChange={handleOrderTypeChange}
              options={orderTypeList}
              value={orderValues}
            />
          )}
          {showPrinterFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Printer")}
              onChange={handlePrinterChange}
              options={printerFilterOption}
              value={printerValues}
            />
          )}
          {showSourceFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Source")}
              onChange={handleSourceChange}
              options={sourceOptions}
              value={sourceValues}
            />
          )}
          {showOrderStatusFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Order Status")}
              onChange={handleOrderStatusChange}
              options={orderStatusOptions}
              value={orderStatusValues}
            />
          )}
          {showOrderZatcaFilter && (
            <MultiSelect
              label={t("ZATCA")}
              onChange={handleZatcaOrderStatusChange}
              options={zatcaOrderStatusOptions}
              value={zatcaOrderStatusValues}
            />
          )}
          {showConnectivityFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Connectivity")}
              onChange={handleConnectivityChange}
              options={connectivityOptions}
              value={connectivityValues}
            />
          )}
          {showApkVersionFilter && (
            <MultiSelect
              isMulti={false}
              label={t("APK Version")}
              onChange={handleApkVersionChange}
              options={apkVersionList}
              value={apkVersionValues}
            />
          )}
          {showUserFilter && (
            <MultiSelect
              isMulti={false}
              label={t("User")}
              onChange={handleUserChange}
              options={userList}
              value={userValues}
            />
          )}
          {showStaffFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Staff")}
              onChange={handleStaffChange}
              options={staffList}
              value={staffValues}
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
          {showChargeTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Charge Type")}
              onChange={handleChargeTypeChange}
              options={chargeTypeOptions}
              value={chargeTypeValues}
            />
          )}
          {showPackageNameFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Package Name")}
              onChange={handlePackageChange}
              options={props.packageOptions}
              value={packageValues}
            />
          )}
          {showPaymentStatusFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Payment Status")}
              onChange={handlePaymentStatusChange}
              options={props.paymentStatusOptions}
              value={paymentStatusValues}
            />
          )}
          {showAdsStatus && (
            <MultiSelect
              isMulti={false}
              label={t("Status")}
              onChange={handleAdsStatusChange}
              options={adsStatusOptions}
              value={adsStatusValues}
            />
          )}
          {showAdsTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Type")}
              onChange={handleAdsTypeChange}
              options={adsTypeOptions}
              value={adsTypeValues}
            />
          )}
          {showDaysOfWeekFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Days of Week")}
              onChange={handleDaysOfWeekChange}
              options={daysOfWeekOptions}
              value={daysOfWeekValues}
            />
          )}
          {showSellableFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Product Status")}
              onChange={handleSellableChange}
              options={sellableOptions}
              value={sellableValues}
            />
          )}
          {showUserTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Type")}
              onChange={handleUserTypeChange}
              options={userTypeOptions}
              value={userTypeValues}
            />
          )}
          {showDeviceTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Device Type")}
              onChange={handleDeviceTypeChange}
              options={deviceTypeOptions}
              value={deviceTypeValues}
            />
          )}
          {showExpenseTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Expense Type")}
              onChange={handleExpenseTypeChange}
              options={expenseTypeOptions}
              value={expenseTypeValues}
            />
          )}

          {showTransactionTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Transaction Type")}
              onChange={handleTransactionTypeChange}
              options={newTransactionTypeOptions}
              value={transactionTypeValues}
            />
          )}

          {showDriverFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Driver")}
              onChange={handleDriverChange}
              options={userList}
              value={driverValues}
            />
          )}

          {showAccountingPaymentStatus && (
            <MultiSelect
              isMulti={false}
              label={t("Status")}
              onChange={handleAccountingStatusTypeChange}
              options={accountingStatusOptions}
              value={accountingStatusTypeValues}
            />
          )}

          {showBoxAndCrateTypeFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Type")}
              onChange={handleBoxAndCrateTypeChange}
              options={boxAndCrateTypeOptions}
              value={boxAndCrateTypeValues}
            />
          )}
          {props.showHardwareFilter && (
            <MultiSelect
              isMulti={false}
              label={t("Hardware")}
              onChange={handleHardwareChange}
              options={props.hardwareOptions}
              value={hardwareValues}
            />
          )}
        </Stack>
      )}
    </div>
  );
};

SuperTableHeader.propTypes = {
  onFiltersChange: PropTypes.func,
};
