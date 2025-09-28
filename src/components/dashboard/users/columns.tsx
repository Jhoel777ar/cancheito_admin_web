
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}


export const userColumns = (
  onUserClick: (userId: string) => void,
  loadingUserId: string | null
): ColumnDef<User>[] => [
  {
    accessorKey: "fullName",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.original;
      const isLoading = loadingUserId === user.id;
      return (
        <div
          onClick={() => !isLoading && onUserClick(user.id)}
          className={cn(
            "group flex items-center gap-3 hover:bg-muted/50 p-1 rounded-md transition-colors -ml-1 cursor-pointer",
            isLoading && "opacity-50 pointer-events-none"
            )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium group-hover:text-primary">{user.fullName}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </div>
        </div>
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
        <div className="flex justify-center">
            <Badge variant={isVerified ? "default" : "outline"} className={isVerified ? 'bg-primary/20 text-primary' : ''}>
                {isVerified ? "Sí" : "No"}
            </Badge>
        </div>
      );
    },
    meta: {
      headerClassName: 'justify-center'
    }
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
  {
    id: 'actions',
    cell: ({row}) => {
        const user = row.original;
        const isLoading = loadingUserId === user.id;

        return (
            <div className="w-10 text-right">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Button variant="ghost" size="icon" onClick={() => onUserClick(user.id)} aria-label={`Ver perfil de ${user.fullName}`}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
        )
    }
  }
];

    

    
