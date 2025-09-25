
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";


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
        <Link href={`/dashboard/users/${user.id}`} className="group flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors -ml-1">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover:text-primary">{user.fullName}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "accountState",
    header: "Estado",
    cell: ({ row }) => {
        const state = row.getValue("accountState") as string;
        return (
            <Badge variant={state === 'Activa' ? "secondary" : "destructive"}>
                {state}
            </Badge>
        );
    }
  },
  {
    accessorKey: "isVerified",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Verificado
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
    },
    cell: ({ row }) => {
      const isVerified = row.getValue("isVerified") as boolean;
      return (
        <Badge variant={isVerified ? "secondary" : "outline"}>
          {isVerified ? "Sí" : "No"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "userType",
    header: "Tipo",
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
];

    