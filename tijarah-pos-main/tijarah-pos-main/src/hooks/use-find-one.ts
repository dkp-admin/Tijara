import { useState } from "react";
import { useQuery } from "react-query";
import serviceCaller from "../api";

type EntityNames =
  | "dash/merchant/stats"
  | "dash"
  | "report/sale-summary"
  | "report/order/stats"
  | "accounting/stats";

type FindQueryType = {
  _q?: string;
  page?: number;
  sort?: "asc" | "desc";
  limit?: number;
  activeTab?: string;
  companyRef?: string;
  locationRef?: string;
  dateRange?: any;
};

export function useFindOne(entityName: EntityNames) {
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
      staleTime: 60000,
    }
  );

  function findOne(findQuery: FindQueryType) {
    setFindQuery(findQuery);
    setFindOneEnabled(true);
  }

  return {
    findOne,
    entity,
    isFetching,
    dataUpdatedAt,
    error: findOneError,
    refetch: refetchFindOne,
    loading: findOneLoading,
  };
}
