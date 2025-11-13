import { useMutation, useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";

export function useImportGlobalProduct() {
  const queryClient = useQueryClient();

  const requestMutation = useMutation<any, any, any>(
    "product-import",
    async (data) => {
      return serviceCaller("/product/import", {
        method: "POST",
        body: data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-global-products`);
      },
    }
  );

  function importGlobalProduct(payload: any) {
    return requestMutation.mutateAsync({ ...payload });
  }

  return {
    importGlobalProduct,
    isLoading: requestMutation.isLoading,
  };
}
