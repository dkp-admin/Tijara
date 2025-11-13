import { useState } from "react";
import { useQuery, useMutation } from "react-query";
import serviceCaller from "../api";

type Product = {
  id: string;
  sku: string;
  name: string;
  stock: number;
  price: number;
  // Add other product fields as needed
};

type UpdateStockPayload = {
  id: string;
  stock: number;
};

type UpdatePricePayload = {
  id: string;
  price: number;
};

export function useProductManagement() {
  const [searchEnabled, setSearchEnabled] = useState(false);
  const [searchSku, setSearchSku] = useState<string>();

  // Query for searching product by SKU
  const {
    isLoading: searchLoading,
    data: product,
    isFetching,
    error: searchError,
    refetch: refetchProduct,
  } = useQuery(
    ["product-search", searchSku],
    () => {
      return serviceCaller(`/product/search-by-sku`, {
        query: { sku: searchSku },
      });
    },
    {
      enabled: searchEnabled,
      staleTime: 60000,
    }
  );

  // Mutation for updating stock
  const {
    mutate: updateStock,
    isLoading: updateStockLoading,
    error: updateStockError,
  } = useMutation((payload: UpdateStockPayload) =>
    serviceCaller("/product/update-stock", {
      method: "PATCH",
      body: payload,
    })
  );

  // Mutation for updating price
  const {
    mutate: updatePrice,
    isLoading: updatePriceLoading,
    error: updatePriceError,
  } = useMutation((payload: UpdatePricePayload) =>
    serviceCaller("/product/update-price", {
      method: "PATCH",
      body: payload,
    })
  );

  // Function to search product by SKU
  function searchBySku(sku: string) {
    setSearchSku(sku);
    setSearchEnabled(true);
  }

  // Function to update product stock
  function handleUpdateStock(productId: string, newStock: number) {
    updateStock(
      { id: productId, stock: newStock },
      {
        onSuccess: () => {
          refetchProduct(); // Refresh product data after successful update
        },
      }
    );
  }

  // Function to update product price
  function handleUpdatePrice(productId: string, newPrice: number) {
    updatePrice(
      { id: productId, price: newPrice },
      {
        onSuccess: () => {
          refetchProduct(); // Refresh product data after successful update
        },
      }
    );
  }

  return {
    searchBySku,
    product,
    isFetching,
    searchError,
    refetchProduct,
    loading: searchLoading,
    updateStock: handleUpdateStock,
    updatePrice: handleUpdatePrice,
    isUpdatingStock: updateStockLoading,
    isUpdatingPrice: updatePriceLoading,
    updateStockError,
    updatePriceError,
  };
}
