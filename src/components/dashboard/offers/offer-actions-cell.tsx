
"use client";

import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, PowerOff, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import type { JobOffer } from "@/lib/types";
import { updateOfferStatus } from "@/app/(dashboard)/dashboard/offers/actions";

interface OfferActionsCellProps {
  row: Row<JobOffer>;
}

export function OfferActionsCell({ row }: OfferActionsCellProps) {
  const offer = row.original;
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | null>(null);

  const handleConfirm = async () => {
    if (!actionType) return;

    const newStatus = actionType === 'activate' ? 'ACTIVA' : 'CERRADA';
    const result = await updateOfferStatus(offer.id, newStatus);
    
    setIsAlertOpen(false);

    if (result.success) {
      toast({
        title: `Oferta ${actionType === 'activate' ? 'Activada' : 'Desactivada'}`,
        description: `La oferta "${offer.title}" ha sido actualizada.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: `Error al ${actionType === 'activate' ? 'Activar' : 'Desactivar'}`,
        description: result.error || "Ocurrió un error inesperado.",
      });
    }
    setActionType(null);
  };

  const openAlertDialog = (type: 'activate' | 'deactivate') => {
    setActionType(type);
    setIsAlertOpen(true);
  };

  const alertContent = {
    activate: {
      title: "¿Estás seguro de que quieres reactivar esta oferta?",
      description: `Esta acción marcará la oferta "${offer.title}" como "Activa" y volverá a ser visible.`,
      actionLabel: "Confirmar Activación",
      actionClass: "bg-primary hover:bg-primary/90",
    },
    deactivate: {
      title: "¿Estás seguro de que quieres desactivar esta oferta?",
      description: `Esta acción marcará la oferta "${offer.title}" como "Cerrada".`,
      actionLabel: "Confirmar Desactivación",
      actionClass: "bg-destructive hover:bg-destructive/90",
    },
  };

  const currentAlert = actionType ? alertContent[actionType] : null;

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        {currentAlert && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{currentAlert.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {currentAlert.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setActionType(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} className={currentAlert.actionClass}>
                {currentAlert.actionLabel}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {offer.status === 'Activa' ? (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => openAlertDialog('deactivate')}
            >
              <PowerOff className="mr-2 h-4 w-4" />
              Desactivar Oferta
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => openAlertDialog('activate')}
            >
              <Power className="mr-2 h-4 w-4" />
              Activar Oferta
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
