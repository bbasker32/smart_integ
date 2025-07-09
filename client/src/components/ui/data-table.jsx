import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "./input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

export function DataTable({
  columns,
  data,
  searchKey,
  searchValue,
  onSearchChange,
  showSearchInTable = true,
  meta,
}) {
  const [localFilter, setLocalFilter] = useState("");
  const globalFilter = searchValue ?? localFilter;
  const handleSearchChange = onSearchChange ?? setLocalFilter;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: handleSearchChange,
    meta,
  });

  return (
    <div>
      {showSearchInTable && (
        <div className="flex items-center justify-between py-4">
          <Input
            placeholder="Search"
            value={globalFilter}
            onChange={(event) => handleSearchChange(event.target.value)}
            className="max-w-sm border-[#DFD4D4] font-['Montserrat',Helvetica] text-sm"
          />
        </div>
      )}
      <div className="rounded-md border border-[#DFD4D4]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    <TableCell key={cell.id}>
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
    </div>
  );
}
