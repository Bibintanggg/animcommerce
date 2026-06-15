"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFilterField } from "./types/data-table-filter";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    filterFields?: DataTableFilterField<TData>[];
}

export function DataTableToolbar<TData>({
    table,
    filterFields = [],
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
                {filterFields.map((field) =>
                    field.options ? (
                        table.getColumn(field.value) && (
                            <DataTableFacetedFilter
                                key={field.value}
                                column={table.getColumn(field.value)}
                                title={field.value}
                                options={field.options}
                            />
                        )
                    ) : (
                        <Input
                            key={field.value}
                            placeholder={field.placeholder ?? `Filter ${field.value}...`}
                            value={(table.getColumn(field.value)?.getFilterValue() as string) ?? ""}
                            onChange={(e) => table.getColumn(field.value)?.setFilterValue(e.target.value)}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                    )
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>

            <DataTableViewOptions table={table} />
        </div>
    );
}