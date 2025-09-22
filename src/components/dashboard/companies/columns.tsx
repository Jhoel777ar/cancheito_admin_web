"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Company } from "@/lib/types";

export const companyColumns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: "Company Name",
  },
  {
    accessorKey: "industry",
    header: "Industry",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "foundedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Founded Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "website",
    header: "Website",
    cell: ({ row }) => {
      const website: string = row.getValue("website");
      return <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{website}</a>
    },
  },
];
