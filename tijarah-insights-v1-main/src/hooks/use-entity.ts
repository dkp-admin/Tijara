import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import serviceCaller from "../api";

type EntityNames = "location" | "notification" | "user";

type FindQueryType = {
  page?: number;
  sort?: "asc" | "desc";
  limit?: number;
  activeTab?: string;
  _q?: string;
  companyRef?: string;
};

export function useEntity<T = any>(entityName: EntityNames) {
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
    { enabled: findEnabled }
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

  const updateMutation = useMutation(
    [`update-one-${entityName}`],
    async ({ id, ...data }: any) => {
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

  const deleteMutation = useMutation(
    [`delete-one-${entityName}`],
    async ({ id }: any) => {
      return serviceCaller(`/${entityName}/${id}`, { method: "DELETE" });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-${entityName}`);
        queryClient.invalidateQueries(`find-one-${entityName}`);
      },
    }
  );

  const createMutation = useMutation(
    `create-${entityName}`,
    async (data: any) => {
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
      total: number;
      count?: number;
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
