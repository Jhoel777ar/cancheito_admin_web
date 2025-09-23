
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import type { User } from "@/lib/types";
import { updateUserPassword } from "@/app/(dashboard)/dashboard/users/actions";

interface ChangePasswordDialogProps {
  user: User;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const changePasswordSchema = z.object({
  newPassword: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordDialog({ user, isOpen, setIsOpen }: ChangePasswordDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    setIsLoading(true);
    const result = await updateUserPassword(user.id, data.newPassword);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Contraseña Actualizada",
        description: `La contraseña para ${user.email} ha sido actualizada correctamente.`,
      });
      setIsOpen(false);
      form.reset();
    } else {
      toast({
        variant: "destructive",
        title: "Error al Actualizar",
        description: result.error || "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
          <DialogDescription>
            Estás cambiando la contraseña para el usuario <span className="font-semibold">{user.email}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} placeholder="••••••••" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isLoading}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Contraseña
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
