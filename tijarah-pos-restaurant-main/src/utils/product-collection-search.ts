// utils/product-collection-search.ts

import nextFrame from "next-frame";
import { Product } from "../db/schema/product/product";
import repository from "../db/repository";

export async function fetchCollectionProducts(
  pageParam: number,
  collectionData: any,
  query: string,
  rowsPerPage: number
): Promise<[Product[], number]> {
  await nextFrame();

  const allProducts = await repository.productRepository.findAll();

  const filteredProducts = allProducts.filter((product) => {
    if (product.status !== "active") return false;

    if (!product.collectionsRefs?.includes(collectionData?.productRef))
      return false;

    const hasNonSaleableVariant = product.variants?.some(
      (variant) => variant.nonSaleable
    );
    if (hasNonSaleableVariant) return false;

    if (query) {
      const searchQuery = query.toLowerCase();

      const nameMatchesEn = product.name?.en
        ?.toLowerCase()
        .includes(searchQuery);
      const nameMatchesAr = product.name?.ar
        ?.toLowerCase()
        .includes(searchQuery);

      const variantMatches = product.variants?.some(
        (variant) =>
          variant.sku?.toLowerCase().includes(searchQuery) ||
          variant.code?.toLowerCase().includes(searchQuery)
      );

      const boxMatches = product.boxes?.some(
        (box) =>
          box.sku?.toLowerCase().includes(searchQuery) ||
          box.code?.toLowerCase().includes(searchQuery)
      );

      if (!nameMatchesEn && !nameMatchesAr && !variantMatches && !boxMatches) {
        return false;
      }
    }

    return true;
  });

  // Sort by English name
  filteredProducts.sort((a, b) => {
    return (a.name?.en || "").localeCompare(b.name?.en || "");
  });

  // Calculate pagination
  const startIndex = (pageParam - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return [paginatedProducts, filteredProducts.length];
}

export async function fetchRestaurantCollectionProducts(
  pageParam: number,
  collectionData: any,
  query: string,
  channel: string,
  rowsPerPage: number
): Promise<[Product[], number]> {
  await nextFrame();

  let whereClause = `
  WHERE status = 'active'
  AND NOT EXISTS (
    SELECT 1 FROM json_each(variants)
    WHERE json_extract(value, '$.nonSaleable') = 1
  )
  AND collectionsRefs LIKE '%${collectionData?.productRef}%'
`;

  if (channel) {
    whereClause += ` AND channels LIKE '%${channel}%'`;
  }

  if (query) {
    whereClause += ` AND (
      json_extract(name, '$.en') LIKE '%${query}%'
      OR json_extract(name, '$.ar') LIKE '%${query}%'
      OR EXISTS (
        SELECT 1 FROM json_each(variants)
        WHERE json_extract(value, '$.sku') LIKE '%${query}%'
        OR json_extract(value, '$.code') LIKE '%${query}%'
      )
      OR EXISTS (
        SELECT 1 FROM json_each(boxes)
        WHERE json_extract(value, '$.sku') LIKE '%${query}%'
        OR json_extract(value, '$.code') LIKE '%${query}%'
      )
    )`;
  }

  return repository.productRepository.getPaginatedProductsWithQuery(
    pageParam,
    rowsPerPage,
    whereClause
  );
}
