"use client";

import {
  SortingState,
  getSortedRowModel,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  VisibilityState,
  getFilteredRowModel,
} from "@tanstack/table-core";
import { ColumnDef, flexRender, useReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useDataTableStyles } from "./use-data-table-styles";

export type DataTableColumnDef<TData, TValue> = ColumnDef<TData, TValue> & {
  fixed?: boolean,
  accessorKey: string,
};

interface DataTableProps<TData, TValue> {
  columns: DataTableColumnDef<TData, TValue>[];
  data: TData[];
  expandFilters: () => void;
  minimizeFilters: () => void;
  areFiltersExpanded: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  expandFilters,
  minimizeFilters,
  areFiltersExpanded,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const { generateClassnameForCell, generateClassnameForHeader } =
    useDataTableStyles<TData, TValue>({ columns });

  const getAllVisibleData = () => {
    // Get the columns we want in the csv
    let visibleColumns = table
      .getAllColumns()
      .filter((column) => column.getIsVisible());
    let column_keys: string[] = visibleColumns.map((column) => {
      return column.id;
    });
    const newArrayWithSubsetAttributes: Record<string, any>[] = table
      .getFilteredRowModel()
      .rows.map((originalObject: any) => {
        const newObj: Record<string, any> = {};
        column_keys.forEach((attribute) => {
          let temp_data = originalObject["original"][attribute];
          if (Array.isArray(temp_data)) {
            temp_data = temp_data.join(";");
          }
          newObj[attribute] = temp_data;
        });
        return newObj;
      });
    // TODO: FIX THIS FILENAME
    const csvConfig = mkConfig({
      useKeysAsHeaders: true,
      filename: "arbotracker_dataset",
    });
    let csv = generateCsv(csvConfig)(newArrayWithSubsetAttributes);
    download(csvConfig)(csv);
  };

  const setAllColumnVisibility = (visibility: boolean) => {
    // Iterate through all columns and toggle visibility based on selectAll state
    table.getAllColumns().forEach((column) => {
      if (column.getCanHide()) {
        column.toggleVisibility(visibility);
      }
    });
  };

  const handleSelectAll = () => {
    setAllColumnVisibility(true);
  };
  const handleClearAll = () => {
    setAllColumnVisibility(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <h2>
          <b>Explore arbovirus seroprevalence estimates in our database</b>
        </h2>
        <div className="flex">
          <Button
            variant="outline"
            className="bg-foreground mx-2 whitespace-nowrap"
            onClick={() =>
              areFiltersExpanded ? minimizeFilters() : expandFilters()
            }
          >
            {areFiltersExpanded ? "Hide Filters" : "See Filters"}
          </Button>
          <Button
            variant="outline"
            className="bg-foreground mx-2 whitespace-nowrap"
            onClick={getAllVisibleData}
          >
            Download CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="bg-foreground">
              <Button variant="outline" className="mx-2 whitespace-nowrap">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-foreground">
              <Button
                variant="outline"
                className="ml-auto bg-white"
                onClick={handleSelectAll}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                className="ml-auto bg-white"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer"
                      checked={column.getIsVisible()}
                      onClick={(e) => {
                        column.toggleVisibility();
                        e.preventDefault();
                      }}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table className="border-separate border-spacing-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const className = generateClassnameForHeader({ columnId: header.column.id });

                  return (
                    <TableHead key={header.id} className={className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={generateClassnameForCell({ columnId: cell.column.id })}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
