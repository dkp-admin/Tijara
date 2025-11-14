import { useState } from "react";
import { useQuery } from "react-query";
import serviceCaller from "../api";

type EntityNames =
  | "dash"
  | "dash/merchant/stats"
  | "dash/inventory"
  | "dash/other/stats"
  | "dash/other/vendor-order/stats"
  | "dash/other/vendor-order"
  | "dash/other/vendor-profit"
  | "report/sale-summary"
  | "report/vat/stats";

type FindQueryType = {
  _q?: string;
  page?: number;
  sort?: "asc" | "desc";
  limit?: number;
  companyRef?: string;
  locationRef?: string;
  dateRange?: any;
  type?: string;
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
    dataUpdatedAt,
  } = useQuery(
    [`find-one-${entityName}`, findQuery],
    () => {
      return serviceCaller(`/${entityName}`, { query: findQuery });
    },
    {
      enabled: findOneEnabled,
      staleTime: 3600000,
    }
  );

  function findOne(findQuery: FindQueryType) {
    setFindQuery(findQuery);
    setFindOneEnabled(true);
  }

  return {
    findOne,
    entity: entity as T,
    isFetching,
    dataUpdatedAt,
    error: findOneError,
    refetch: refetchFindOne,
    loading: findOneLoading,
  };
}
