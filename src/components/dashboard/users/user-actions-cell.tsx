"use client";

import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, Loader2, AlertTriangle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { getAccountControlReasoning, updateUserAccountState } from "@/app/(dashboard)/dashboard/users/actions";
import { UserEditDialog } from "./user-edit-dialog";


interface UserActionsCellProps {
  row: Row<User>;
}

export function UserActionsCell({ row }: UserActionsCellProps) {
  const user = row.original;
  const { toast } = useToast();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertContent, setAlertContent] = useState({
    title: "",
    description: "",
    action: () => {},
    actionLabel: "",
  });

  const handleActionConfirm = async (actionType: "activate" | "suspend") => {
    setIsLoading(true);
    const newState = actionType === 'activate' ? 'Activa' : 'Desactivada';
    const result = await updateUserAccountState(user.id, newState);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: `Usuario ${newState === 'Activa' ? 'Activado' : 'Suspendido'}`,
        description: `La cuenta de ${user.fullName} ha sido ${newState === 'Activa' ? 'activada' : 'suspendida'}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error al Actualizar",
        description: result.error || "Ocurrió un error inesperado.",
      });
    }
  };


  const handleActionClick = async (actionType: "activate" | "suspend") => {
    setIsLoading(true);
    setIsMenuOpen(false); 

    const result = await getAccountControlReasoning(actionType, user);
    setIsLoading(false);

    if (result.success) {
      setAlertContent({
        title: `Confirmar ${actionType === 'activate' ? 'Activación' : 'Suspensión'}`,
        description: result.reasoning || "¿Estás seguro de que quieres proceder?",
        action: () => handleActionConfirm(actionType),
        actionLabel: `Confirmar ${actionType === 'activate' ? 'Activación' : 'Suspensión'}`,
      });
    } else {
      setAlertContent({
        title: "Error de IA",
        description: result.error || "Ocurrió un error desconocido al obtener el razonamiento.",
        action: () => {},
        actionLabel: "OK",
      });
    }

    setIsAlertOpen(true);
  };


  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-primary" />
                {alertContent.title}
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={alertContent.action}>
              {alertContent.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <UserEditDialog user={user} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0" disabled={isLoading}>
            <span className="sr-only">Abrir menú</span>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.accountState === 'Activa' ? (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => handleActionClick("suspend")}
            >
              Suspender
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => handleActionClick("activate")}>
              Activar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
