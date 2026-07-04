"use client";

import { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  OnChangeFn,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "../button";
import { formatDate } from "@/helper/formatDate";
import { getInitials } from "@/helper/getInitials";
import { ActionConfig, ColumnConfig } from "./table-config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table"
import { Badge } from "../badge";
import { Input } from "../input";

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  idKey?: keyof T; // default "id"
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnConfig<T>[];
  actions?: ActionConfig<T>[];
  idKey?: keyof T;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  pageCount?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions,
  idKey = "id" as keyof T,
  pagination,
  onPaginationChange,
  pageCount,
  searchValue,
  onSearchChange,
}: DataTableProps<T>) {
  const tableColumns: ColumnDef<T>[] = useMemo(() => {
    const built = columns.map((col, i): ColumnDef<T> => {
      switch (col.type) {
        case "text":
          return {
            id: String(col.key) + i,
            header: col.header,
            cell: ({ row }) => (
              <span className={col.className ?? "text-sm"}>
                {String(row.original[col.key] ?? "-")}
              </span>
            ),
          };

        case "avatar":
          return {
            id: String(col.titleKey) + i,
            header: col.header,
            cell: ({ row }) => {
              const title = String(row.original[col.titleKey] ?? "");
              const subtitle = col.subtitleKey
                ? String(row.original[col.subtitleKey] ?? "")
                : undefined;
              return (
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {getInitials(title)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-sm truncate">{title}</span>
                    {subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {subtitle}
                      </span>
                    )}
                  </div>
                </div>
              );
            },
          };

        case "badge":
          return {
            id: String(col.key) + i,
            header: col.header,
            filterFn: (row, colId, value) => value.includes(row.getValue(colId)),
            cell: ({ row }) => {
              const raw = String(row.original[col.key]);
              const variant = col.variantMap?.[raw] ?? "secondary";
              const label = col.labelMap?.[raw] ?? raw;
              return <Badge variant={variant}>{label}</Badge>;
            },
          };

        case "date":
          return {
            id: String(col.key) + i,
            header: col.header,
            cell: ({ row }) => {
              const value = row.original[col.key];
              return <span className="text-sm">{value ? formatDate(value) : "-"}</span>;
            },
          };

        case "iconStatus":
          return {
            id: String(col.key) + i,
            header: col.header,
            cell: ({ row }) => {
              const value = !!row.original[col.key];
              const Icon = value ? col.trueIcon : col.falseIcon;
              return (
                <Icon
                  className={`h-4 w-4 ${value ? "text-[#3B6D11]" : "text-muted-foreground"
                    }`}
                />
              );
            },
          };

        case "custom":
          return {
            id: col.header + i,
            header: col.header,
            cell: ({ row }) => col.render(row.original),
          };
      }
    });

    if (actions && actions.length > 0) {
      built.push({
        id: "actions",
        header: "Aksi",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            {actions
              .filter((a) => a.show?.(row.original) ?? true)
              .map((action, i) => (
                <Button
                  key={i}
                  size="icon"
                  variant="ghost"
                  className={`h-7 w-7 ${action.className ?? ""}`}
                  title={action.label}
                  onClick={() => action.onClick(row.original)}
                >
                  <action.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
          </div>
        ),
      });
    }

    return built;
  }, [columns, actions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
    state: { pagination },
    onPaginationChange,
  });


  return (
    <div className="space-y-4">
      {onSearchChange && (
        <Input
          placeholder="Cari..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      )}

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableHead key={header.id}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={String(row.original[idKey])}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination && (
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-muted-foreground">
            Halaman {pagination.pageIndex + 1} dari {pageCount ?? 1}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      )}
    </div>

  );
}