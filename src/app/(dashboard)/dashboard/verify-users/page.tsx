
"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, onValue, off, update } from "firebase/database";
import type { FirebaseUser, User } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FileText, Briefcase, GraduationCap, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string) {
  if (!name) return "S/N";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

function VerificationSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-40" />
                           <Skeleton className="h-4 w-48" />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-8 w-24" />
                    </CardContent>
                    <CardFooter className="flex justify-between items-center">
                        <Skeleton className="h-8 w-32" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}


export default function VerifyUsersPage() {
  const [unverifiedUsers, setUnverifiedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const usersRef = ref(db, 'Usuarios');
    const listener = onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        for (const userKey in usersData) {
          const fbUser: FirebaseUser = usersData[userKey];
          if (fbUser && fbUser.usuario_verificado === false) {
             const user: User = {
                id: fbUser.uid || userKey,
                fullName: fbUser.nombre_completo || 'Sin nombre',
                email: fbUser.email || 'Sin email',
                registrationDate: new Date(fbUser.tiempo_registro || 0).toLocaleDateString(),
                profileUrl: fbUser.fotoPerfilUrl || '',
                isVerified: false,
                experience: fbUser.experiencia || 'No especificado',
                education: fbUser.formacion || 'No especificado',
                userType: fbUser.tipoUsuario || 'No especificado',
                location: fbUser.ubicacion || 'No especificado',
                cvUrl: fbUser.cvUrl || '',
                accountState: fbUser.estadoCuenta || 'Activa',
              };
            usersList.push(user);
          }
        }
      }
      setUnverifiedUsers(usersList.reverse());
      setLoading(false);
    }, (error) => {
      console.error("Firebase read error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar los usuarios para verificación."
      })
    });

    return () => {
      off(usersRef, 'value', listener);
    };
  }, [toast]);

  const handleVerificationChange = async (userId: string, isVerified: boolean) => {
    const userRef = ref(db, `Usuarios/${userId}`);
    try {
      await update(userRef, { usuario_verificado: isVerified });
      toast({
        title: "Usuario Verificado",
        description: "El estado de verificación del usuario ha sido actualizado.",
      });
      // The user will be automatically removed from the list by the onValue listener
    } catch (error) {
      console.error("Firebase verification update error:", error);
      toast({
        variant: "destructive",
        title: "Error al Verificar",
        description: "No se pudo actualizar el estado del usuario.",
      });
    }
  };

  if (loading) {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Verificar Usuarios</h1>
            <p className="text-muted-foreground mb-6">Usuarios pendientes de verificación. Activa el interruptor para verificar su cuenta.</p>
            <VerificationSkeleton />
        </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Verificar Usuarios</h1>
      <p className="text-muted-foreground mb-6">Usuarios pendientes de verificación. Activa el interruptor para verificar su cuenta.</p>
      
      {unverifiedUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unverifiedUsers.map((user) => (
            <Card key={user.id} className="bg-card/80 backdrop-blur-sm flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{user.fullName}</CardTitle>
                   <p className="text-sm text-muted-foreground flex items-center gap-2 pt-1"><Mail size={14} /> {user.email}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <p className="text-sm text-muted-foreground flex items-center gap-2"><GraduationCap size={16} />{user.education}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase size={16} />{user.experience}</p>
                {user.cvUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a href={user.cvUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> Ver CV
                    </a>
                  </Button>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/50 py-3 px-6">
                <Label htmlFor={`verify-switch-${user.id}`} className="text-sm font-medium">
                  Verificar Usuario
                </Label>
                <Switch
                  id={`verify-switch-${user.id}`}
                  checked={user.isVerified}
                  onCheckedChange={(isChecked) => handleVerificationChange(user.id, isChecked)}
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 rounded-lg border border-dashed">
            <UserCheck size={48} className="text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Todo al día</h3>
            <p className="text-muted-foreground">No hay usuarios pendientes de verificación.</p>
        </div>
      )}
    </div>
  );
}
