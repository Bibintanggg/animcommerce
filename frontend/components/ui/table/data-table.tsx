"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState,
  OnChangeFn,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table/data-table-pagination";
import { DataTableToolbar } from "./data-table/data-table-toolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableProps } from "./data-table/types/data-table-props";


export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting: sortingProp,
  onSortingChange,
  filterFields = [],
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  isLoading = false,
  emptyMessage = "Tidak ada data.",
  className,
}: DataTableProps<TData, TValue>) {
  const [localSorting, setLocalSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [localRowSelection, setLocalRowSelection] = React.useState<RowSelectionState>({});

  const isServerSide = pagination !== undefined && onPaginationChange !== undefined;

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount ?? -1,
    manualPagination: isServerSide,
    manualSorting: !!onSortingChange,
    state: {
      sorting: sortingProp ?? localSorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionProp ?? localRowSelection,
      ...(isServerSide && { pagination }),
    },
    onSortingChange: onSortingChange ?? setLocalSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: onRowSelectionChange ?? setLocalRowSelection,
    ...(isServerSide && { onPaginationChange }),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableRowSelection: true,
  });

  return (
    <div className={`space-y-4 ${className ?? ""}`}>
      <DataTableToolbar table={table} filterFields={filterFields} />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: pagination?.pageSize ?? 10 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}