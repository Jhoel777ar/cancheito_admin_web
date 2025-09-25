
"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { JobOffer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { OfferActionsCell } from "./offer-actions-cell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}


export const offerColumns: ColumnDef<JobOffer>[] = [
  {
    accessorKey: "title",
    header: "Cargo",
  },
  {
    accessorKey: "employer",
    header: "Publicado por",
    cell: ({ row }) => {
      const employer = row.original.employer;
      return (
        <Link href={`/dashboard/users/${employer.id}`} className="group flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={employer.avatarUrl} data-ai-hint="person face" alt={employer.name} />
            <AvatarFallback>{getInitials(employer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover:text-primary">{employer.name}</span>
            <span className="text-sm text-muted-foreground">{employer.email}</span>
          </div>
        </Link>
      );
    },
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
      return <span>Bs. {parsedPayment.toLocaleString('es-BO')}</span>
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
  {
    id: "actions",
    cell: ({ row }) => <OfferActionsCell row={row} />,
  },
];
