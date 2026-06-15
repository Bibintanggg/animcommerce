import { ColumnDef, OnChangeFn, PaginationState, RowSelectionState, SortingState } from "@tanstack/react-table";
import { DataTableFilterField } from "./data-table-filter";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[]
  pageCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  filterFields?: DataTableFilterField<TData>[]
  rowSelection?: RowSelectionState
  onRowSelectionChange?: OnChangeFn<RowSelectionState>
  isLoading?: boolean
  emptyMessage?: string
  className?: string
}