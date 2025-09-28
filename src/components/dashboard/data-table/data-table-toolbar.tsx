
"use client"

import type { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  placeholder?: string
  filterValue: string
  onFilterChange: (value: string) => void
}

export function DataTableToolbar<TData>({
  placeholder = "Filtrar items...",
  filterValue,
  onFilterChange,
}: DataTableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={placeholder}
          value={filterValue ?? ''}
          onChange={(event) => onFilterChange(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
      </div>
    </div>
  )
}
