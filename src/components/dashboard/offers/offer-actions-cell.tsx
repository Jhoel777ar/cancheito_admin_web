
"use client";

import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { MoreHorizontal, PowerOff } from "lucide-react";
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
import type { JobOffer } from "@/lib/types";
import { updateOfferStatus } from "@/app/(dashboard)/dashboard/offers/actions";

interface OfferActionsCellProps {
  row: Row<JobOffer>;
}

export function OfferActionsCell({ row }: OfferActionsCellProps) {
  const offer = row.original;
  const { toast } = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleDeactivateConfirm = async () => {
    const result = await updateOfferStatus(offer.id, 'CERRADA');
    setIsAlertOpen(false);

    if (result.success) {
      toast({
        title: "Oferta Desactivada",
        description: `La oferta "${offer.title}" ha sido marcada como cerrada.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error al Desactivar",
        description: result.error || "Ocurrió un error inesperado.",
      });
    }
  };

  if (offer.status !== 'Activa') {
    return null; // No actions for non-active offers
  }

  return (
    <>
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de que quieres desactivar esta oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la oferta <span className="font-semibold">"{offer.title}"</span> como "Cerrada" y no se podrá revertir fácilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateConfirm} className="bg-destructive hover:bg-destructive/90">
              Confirmar Desactivación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setIsAlertOpen(true)}
          >
            <PowerOff className="mr-2 h-4 w-4" />
            Desactivar Oferta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
