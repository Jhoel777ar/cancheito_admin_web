"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Postulation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

function getInitials(name: string) {
  if (!name) return "S/N";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

export const postulationColumns: ColumnDef<Postulation>[] = [
  {
    accessorKey: "applicant",
    header: "Postulante",
    cell: ({ row }) => {
      const applicant = row.original.applicant;
      return (
        <Link href={`/dashboard/users/${applicant.id}`} className="group flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors">
          <Avatar className="h-10 w-10">
            <AvatarImage src={applicant.avatarUrl} data-ai-hint="person face" alt={applicant.name} />
            <AvatarFallback>{getInitials(applicant.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover:text-primary">{applicant.name}</span>
            <span className="text-sm text-muted-foreground">{applicant.email}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "offer",
    header: "Oferta Aplicada",
    cell: ({ row }) => {
      const offer = row.original.offer;
      return (
         <div className="flex flex-col">
            <span className="font-medium">{offer.title}</span>
            <span className="text-sm text-muted-foreground">de {offer.employer.name}</span>
          </div>
      );
    }
  },
  {
    accessorKey: "postulationDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Postulación
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
      // You can customize badge variants based on status
      return <Badge variant="outline">{status}</Badge>;
    },
  },
];
