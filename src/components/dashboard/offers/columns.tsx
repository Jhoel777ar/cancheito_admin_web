"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { JobOffer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const offerColumns: ColumnDef<JobOffer>[] = [
  {
    accessorKey: "title",
    header: "Job Title",
  },
  {
    accessorKey: "companyName",
    header: "Company",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type: string = row.getValue("type");
      return <Badge variant="outline">{type}</Badge>
    }
  },
  {
    accessorKey: "postedDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Posted Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      return (
        <Badge variant={status === 'Open' ? "secondary" : "default"}>
          {status}
        </Badge>
      );
    },
  },
];
