"use client";

import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface DataTablePaginationProps<TData> {
    table: Table<TData>;
    pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
    table,
    pageSizeOptions = [10, 20, 30, 50, 100],
}: DataTablePaginationProps<TData>) {
    const selectedCount = table.getFilteredSelectedRowModel().rows.length;
    const totalCount = table.getFilteredRowModel().rows.length;

    return (
        <div className="flex items-center justify-between gap-4 flex-wrap px-2">
            <div className="text-sm text-muted-foreground flex-1">
                {selectedCount > 0 ? (
                    <>
                        {selectedCount} dari {totalCount} baris dipilih.
                    </>
                ) : (
                    <span>{totalCount} total baris</span>
                )}
            </div>

            <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium whitespace-nowrap">Baris per halaman</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {pageSizeOptions.map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Page info */}
                <div className="flex items-center justify-center text-sm font-medium whitespace-nowrap">
                    Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
                </div>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Ke halaman pertama"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Halaman sebelumnya"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Halaman berikutnya"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        aria-label="Ke halaman terakhir"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}