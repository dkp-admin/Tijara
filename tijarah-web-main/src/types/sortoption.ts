export type Sort = "asc" | "desc";

export interface SortOption {
  value: Sort;
  label: string;
}

export interface ReportSortOption {
  value: string;
  label: string;
}
