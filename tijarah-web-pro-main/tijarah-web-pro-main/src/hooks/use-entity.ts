import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";

type EntityNames =
  | "company"
  | "business-type"
  | "payment-type"
  | "brands"
  | "global-categories"
  | "global-products"
  | "global-products/notify"
  | "tax"
  | "category"
  | "product"
  | "location"
  | "customer"
  | "apk-management"
  | "coupon"
  | "user"
  | "user/all-staff"
  | "location"
  | "device"
  | "print-template"
  | "report/product"
  | "report/category"
  | "report/company"
  | "report/shift"
  | "report/payment-method"
  | "report/inventory"
  | "report/inventory/location"
  | "report/vat"
  | "report/custom-charge-vat"
  | "report/sale-summary"
  | "report/order"
  | "report/sales"
  | "report/void"
  | "report/comp"
  | "order"
  | "csv-import/product"
  | "csv-import/globalProduct"
  | "csv-import/brand"
  | "platform-logs"
  | "role"
  | "wallet"
  | "quick-items"
  | "quick-items/check-status"
  | "quick-items/sort"
  | "product/sku"
  | "vendor"
  | "vendor/add-product"
  | "vendor-product"
  | "purchase-order"
  | "purchase-order/return"
  | "stock-history"
  | "stock-history/update"
  | "batch"
  | "purchase-order/partial-payment"
  | "po-activity-log"
  | "internal-transfer"
  | "custom-charge"
  | "apk-management/device-count"
  | "report/custom-charge-vat"
  | "credit"
  | "updated-product"
  | "report/variant"
  | "report/best-gas"
  | "report/inventory-change"
  | "user/find-by-onboarding"
  | "menu"
  | "group"
  | "zatca"
  | "menu"
  | "ads-management"
  | "ordering/menu-config"
  | "ordering/address"
  | "ordering/order"
  | "ordering/driver"
  | "ordering/driver/assign-driver"
  | "notification"
  | "pos-ads"
  | "report/ad"
  | "collection"
  | "modifier"
  | "promotion"
  | "promotion/pos"
  | "customer-group"
  | "promotion/customer-usage"
  | "customer-group/assign"
  | "product/price-adjustment"
  | "price-adjustment"
  | "customer-group/remove"
  | "customer-group/remove"
  | "collection/assign"
  | "collection/remove"
  | "time-based-events"
  | "reporting-hours"
  | "menu-management"
  | "misc-expenses"
  | "sections"
  | "void-comp"
  | "kitchen-group"
  | "kitchen-management"
  | "kitchen-management/assign"
  | "kitchen-management/remove"
  | "kitchen-management/delete-or-assign"
  | "stocktakes"
  | "volumetric-pricing"
  | "quick-items/many"
  | "boxes-crates"
  | "product/search-variants"
  | "ads-management/sort"
  | "ads-management/sort"
  | "order-activity-log"
  | "product/search"
  | "product/search-variants"
  | "boxes-crates/product"
  | "accounting"
  | "cash-drawer-txn/get-day-end"
  | "menu-management/menu"
  | "product/search/all"
  | "audit-log"
  | "quick-items/delete"
  | "package"
  | "authentication/modules"
  | "subscription"
  | "subscription/payment"
  | "subscription/invoice"
  | "subscription/merchant-update"
  | "invoice"
  | "subscription/expiry"
  | "subscription/status"
  | "subscription/ownerRef"
  | "invoice/ownerRef"
  | "currency"
  | "subscription/renewal"
  | "hyperlocal"
  | "zatca-invoices"
  | "company/order-types";

export type FindQueryType = {
  page?: number;
  sort?: "asc" | "desc";
  limit?: number;
  activeTab?: string;
  _q?: string;
  type?: string;
  status?: any;
  id?: string;
  poRef?: string;
  startDate?: any;
  endDate?: any;
  startOfDay?: any;
  endOfDay?: any;
  locationRefs?: string | string[];
  locationRef?: string;
  roleRef?: string;
  categoryRefs?: any;
  companyRef?: string;
  businessTypeRefs?: string[];
  updatedBy?: string;
  update?: string;
  brandRefs?: any;
  dateRange?: any;
  userType?: any;
  customerRef?: any;
  orderType?: string;
  vendorRef?: string;
  sku?: any;
  paymentStatus?: string;
  shipToRef?: string;
  shipFromRef?: string;
  subscription?: any;
  nielsenReportEnabled?: any;
  onboarded?: boolean;
  packageName?: string;
  packageRef?: string;
  adsStatus?: string;
  businessTypeRef?: string;
  zatcaEnabled?: boolean;
  index?: number;
  isSellable?: string;
  collectionRef?: string | string[];
  groupRef?: string;
  applyAutoChargeOnOrders?: boolean;
  channel?: string;
  productRef?: string;
  deviceType?: string;
  industry?: string;
  showCustomPrice?: string;
  floor?: string;
  printer?: boolean;
  orderRef?: string;
  isComposite?: boolean;
  online?: boolean;
  sortType?: string;
  showAdvancedPromo?: boolean;
  withCollections?: boolean;
  showNonSaleable?: boolean;
};

type Options = {
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  refetchOnReconnect?: boolean;
  refetchInterval?: number;
};

export function useEntity<T = any>(entityName: EntityNames, options?: Options) {
  const queryClient = useQueryClient();
  const [entityId, setEntityId] = useState("");
  const [findEnabled, setFindEnabled] = useState(false);
  const [findOneEnabled, setFindOneEnabled] = useState(false);
  const [findQuery, setFindQuery] = useState<FindQueryType>();

  const {
    isLoading: findLoading,
    data: entities = [],
    isFetching,
    error: findError,
    refetch: refetchFind,
  } = useQuery(
    [`find-${entityName}`, findQuery],
    () => {
      return serviceCaller(`/${entityName}`, { query: findQuery });
    },
    { enabled: findEnabled, ...options }
  );

  const {
    isLoading: findOneLoading,
    data: entity,
    error: findOneError,
    refetch: refetchFindOne,
  } = useQuery(
    [`find-one-${entityName}`, entityId],
    () => {
      return serviceCaller(`/${entityName}/${entityId}`);
    },
    {
      enabled: findOneEnabled,
    }
  );

  const updateMutation = useMutation<any, any, any>(
    [`update-one-${entityName}`],
    async ({ id, ...data }) => {
      return serviceCaller(`/${entityName}/${id}`, {
        method: "PATCH",
        body: data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-${entityName}`);
        queryClient.invalidateQueries(`find-one-${entityName}`);
      },
    }
  );

  const deleteMutation = useMutation<any, any, any>(
    [`delete-one-${entityName}`],
    async ({ id }) => {
      return serviceCaller(`/${entityName}/${id}`, {
        method: "DELETE",
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-${entityName}`);
        queryClient.invalidateQueries(`find-one-${entityName}`);
      },
    }
  );

  const createMutation = useMutation<any, any, any>(
    `create-${entityName}`,
    async (data) => {
      return serviceCaller(`/${entityName}`, {
        method: "POST",
        body: data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-${entityName}`);
        queryClient.invalidateQueries(`find-one-${entityName}`);
      },
    }
  );

  function find(findQuery: FindQueryType) {
    setFindQuery(findQuery);
    setFindEnabled(true);
  }

  function findOne(id: string) {
    setEntityId(id);
    setFindOneEnabled(true);
  }

  function updateEntity(id: string, update: any) {
    return updateMutation.mutateAsync({ ...update, id });
  }

  function deleteEntity(id: string) {
    return deleteMutation.mutateAsync({ id });
  }

  function create(data: any) {
    return createMutation.mutateAsync(data);
  }

  return {
    findOne,
    entity: entity as T,
    find,
    entities: entities as {
      sku: string;
      results: T[];
      categories?: T[];
      total: number;
      count?: number;
      aggregationResp?: T[];
    },
    create,
    updateEntity,
    deleteEntity,
    isFetching,
    error: findError || findOneError,
    refetch: refetchFindOne || refetchFind,
    loading:
      findLoading ||
      findOneLoading ||
      updateMutation.isLoading ||
      deleteMutation.isLoading ||
      createMutation.isLoading,
  };
}
