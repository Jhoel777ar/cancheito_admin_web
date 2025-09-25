
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { JobOffer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

export const offerColumns: ColumnDef<JobOffer>[] = [
  {
    accessorKey: "title",
    header: "Cargo",
  },
  {
    accessorKey: "employerName",
    header: "Publicado por",
  },
  {
    accessorKey: "location",
    header: "Ubicación",
  },
  {
    accessorKey: "modality",
    header: "Modalidad",
    cell: ({ row }) => {
      const modality: string = row.getValue("modality");
      return <Badge variant="outline">{modality}</Badge>
    }
  },
  {
    accessorKey: "approxPayment",
    header: "Pago Aprox.",
    cell: ({ row }) => {
      const payment = row.getValue("approxPayment") as string;
      const parsedPayment = parseFloat(payment);
      if (isNaN(parsedPayment)) {
        return <span>{payment}</span>
      }
      return <span>${parsedPayment.toLocaleString('en-US')}</span>
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
          Fecha de Publicación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      return (
        <Badge variant={status === 'Activa' ? "secondary" : "destructive"}>
          {status}
        </Badge>
      );
    },
  },
];
