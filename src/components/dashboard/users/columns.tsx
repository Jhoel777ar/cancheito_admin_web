"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { UserActionsCell } from "./user-actions-cell";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, FileText } from "lucide-react";

function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

export const userColumns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "fullName",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "isVerified",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Estado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified");
      return (
        <Badge variant={isVerified ? "secondary" : "destructive"}>
          {isVerified ? "Activo" : "Suspendido"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userType",
    header: "Tipo de Usuario",
  },
  {
    accessorKey: "location",
    header: "Ubicación",
  },
  {
    accessorKey: "education",
    header: "Formación",
  },
  {
    accessorKey: "experience",
    header: "Experiencia",
  },
  {
    accessorKey: "cvUrl",
    header: "CV",
    cell: ({ row }) => {
      const cvUrl = row.getValue("cvUrl") as string;
      if (!cvUrl) return <span>-</span>;
      return (
        <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          <FileText className="inline-block" />
        </a>
      )
    },
  },
  {
    accessorKey: "registrationDate",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha de Registro
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
  },
  {
    id: "actions",
    cell: ({ row }) => <UserActionsCell row={row} />,
  },
];
