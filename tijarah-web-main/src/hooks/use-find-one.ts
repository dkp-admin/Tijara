import { useState } from "react";
import { useQuery } from "react-query";
import serviceCaller from "src/api/serviceCaller";

type EntityNames =
  | "report/product/stats"
  | "report/category/stats"
  | "report/company/stats"
  | "report/sales/stats"
  | "report/shift/stats"
  | "report/payment-method/stats"
  | "report/order/stats"
  | "order/stats"
  | "dash"
  | "dash/admin/stats"
  | "dash/merchant/stats"
  | "wallet/get"
  | "category/count"
  | "dash/inventory"
  | "report/inventory/stats"
  | "report/variant/stats"
  | "report/best-gas/stats"
  | "report/vat/stats"
  | "report/sale-summary"
  | "report/custom-charge-vat/stats"
  | "report/inventory-change/stats"
  | "report/void/stats"
  | "report/comp/stats"
  | "accounting/stats"
  | "report/ad/stats"
  | "cash-drawer-txn/get-day-end";

type FindQueryType = {
  _q?: string;
  page?: number;
  sort?: "asc" | "desc";
  limit?: number;
  isPort?: boolean;
  truckTypes?: [any];
  fromLocations?: [any];
  toLocations?: [any];
  numberOfTrucks?: [any];
  pickupDate?: [any];
  priceRange?: [any];
  carrierRefs?: string[];
  shipperRefs?: string[];
  bookingStatus?: string;
  paymentStatus?: string;
  viewMode?: string;
  companyRef?: string;
  locationRef?: string;
  dateRange?: any;
};

export function useFindOne<T = any>(entityName: EntityNames) {
  const [findOneEnabled, setFindOneEnabled] = useState(false);

  const [findQuery, setFindQuery] = useState<FindQueryType>();

  const {
    isLoading: findOneLoading,
    data: entity,
    isFetching,
    error: findOneError,
    refetch: refetchFindOne,
    dataUpdatedAt: newDateAndTime,
  } = useQuery(
    [`find-one-${entityName}`, findQuery],
    () => {
      return serviceCaller(`/${entityName}`, { query: findQuery });
    },
    {
      enabled: findOneEnabled,
      staleTime: 300000,
      refetchOnWindowFocus: false,
    }
  );

  function findOne(findQuery: FindQueryType) {
    setFindQuery(findQuery);
    setFindOneEnabled(true);
  }

  return {
    newDateAndTime,
    findOne,
    entity: entity as T,
    isFetching,
    error: findOneError,
    refetch: refetchFindOne,
    loading: findOneLoading,
  };
}
