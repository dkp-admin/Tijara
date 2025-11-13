import { useMutation, useQueryClient } from "react-query";
import serviceCaller from "src/api/serviceCaller";

export function useImportUpdatedProduct() {
  const queryClient = useQueryClient();

  const requestMutation = useMutation<any, any, any>(
    "product-import-updated-product",
    async (data) => {
      return serviceCaller("/product/import-updated-product", {
        method: "POST",
        body: data,
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(`find-updated-product`);
      },
    }
  );

  function importUpdateProduct(payload: any) {
    return requestMutation.mutateAsync({ ...payload });
  }

  return {
    importUpdateProduct,
    isLoadingUpdate: requestMutation.isLoading,
  };
}
