"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/lib/types";
import { UserActionsCell } from "./user-actions-cell";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, FileText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { updateUserVerification } from "@/app/(dashboard)/dashboard/users/actions";
import { toast } from "@/hooks/use-toast";


function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

const handleVerificationChange = async (user: User, isChecked: boolean) => {
  const result = await updateUserVerification(user.id, isChecked);
  if (result.success) {
    toast({
      title: "Estado de Verificación Actualizado",
      description: `El usuario ${user.fullName} ha sido ${isChecked ? 'verificado' : 'desverificado'}.`,
    });
  } else {
    toast({
      variant: "destructive",
      title: "Error al Actualizar",
      description: result.error,
    });
  }
};


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
    accessorKey: "accountState",
    header: "Estado de la Cuenta",
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
      const user = row.original;
      return (
        <div className="flex items-center space-x-2">
            <Switch
              id={`verified-switch-${user.id}`}
              checked={user.isVerified}
              onCheckedChange={(isChecked) => handleVerificationChange(user, isChecked)}
              aria-label="Verificación de usuario"
            />
             <Badge variant={user.isVerified ? "secondary" : "outline"}>
                {user.isVerified ? "Sí" : "No"}
             </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "userType",
    header: "Tipo de Usuario",
  },
  {
    accessorKey: "commercialName",
    header: "Nombre Comercial",
    cell: ({ row }) => row.original.commercialName || "N/A"
  },
  {
    accessorKey: "industry",
    header: "Rubro",
    cell: ({ row }) => row.original.industry || "N/A"
  },
  {
    accessorKey: "description",
    header: "Descripción",
    cell: ({ row }) => {
        const description = row.original.description;
        if (!description) return "N/A";
        return (
            <div className="max-w-xs truncate" title={description}>
                {description}
            </div>
        )
    }
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
