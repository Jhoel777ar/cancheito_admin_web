
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { JobOffer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MapPin, CircleDollarSign, Laptop, CalendarClock } from "lucide-react";
import { OfferActionsCell } from "./offer-actions-cell";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

const baseOfferColumns = (
  onPublisherClick: (publisherId: string) => void,
  isNavigating: boolean,
): ColumnDef<JobOffer>[] => [
  {
    accessorKey: "title",
    header: "Cargo",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>
    }
  },
  {
    id: "details",
    header: "Detalles de la Oferta",
    cell: ({ row }) => {
        const { location, modality, approxPayment, deadline } = row.original;
        const parsedPayment = parseFloat(approxPayment);
        const paymentString = isNaN(parsedPayment) ? approxPayment : `Bs. ${parsedPayment.toLocaleString('es-BO')}`;

        return (
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="outline">{modality}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    <span>{paymentString}</span>
                </div>
                {deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Límite: {deadline}</span>
                  </div>
                )}
            </div>
        )
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


export const offerColumns = (
  onPublisherClick: (publisherId: string) => void,
  isNavigating: boolean,
): ColumnDef<JobOffer>[] => [
  ...baseOfferColumns(onPublisherClick, isNavigating).slice(0,1),
  {
    accessorKey: "employer",
    header: "Publicado por",
    cell: ({ row }) => {
      const employer = row.original.employer;
      return (
        <div 
          onClick={() => onPublisherClick(employer.id)}
          className={cn(
            "group flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors cursor-pointer",
            isNavigating && "opacity-50 pointer-events-none"
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={employer.avatarUrl} data-ai-hint="person face" alt={employer.name} />
            <AvatarFallback>{getInitials(employer.name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover:text-primary">{employer.name}</span>
            <span className="text-sm text-muted-foreground">{employer.email}</span>
          </div>
        </div>
      );
    },
  },
  ...baseOfferColumns(onPublisherClick, isNavigating).slice(1)
];

export const userOfferColumns: ColumnDef<JobOffer>[] = [
  {
    accessorKey: "title",
    header: "Cargo",
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return <div className="font-medium">{title}</div>
    }
  },
  {
    id: "details",
    header: "Detalles de la Oferta",
    cell: ({ row }) => {
        const { location, modality, approxPayment, deadline } = row.original;
        const parsedPayment = parseFloat(approxPayment);
        const paymentString = isNaN(parsedPayment) ? approxPayment : `Bs. ${parsedPayment.toLocaleString('es-BO')}`;

        return (
            <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{location}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
                    <Badge variant="outline">{modality}</Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                    <span>{paymentString}</span>
                </div>
                {deadline && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>Límite: {deadline}</span>
                  </div>
                )}
            </div>
        )
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
