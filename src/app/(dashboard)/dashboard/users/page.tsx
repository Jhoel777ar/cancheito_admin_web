"use client";

import { useState, useEffect, useRef } from "react";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { userColumns } from "@/components/dashboard/users/columns";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { FirebaseUser, User } from "@/lib/types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function UserSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
      </div>
      <div className="rounded-md border">
        <div className="flex flex-col space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[150px]" />
        <Skeleton className="h-8 w-[200px]" />
      </div>
    </div>
  )
}


export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    const usersRef = ref(db, 'Usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      if (snapshot.exists()) {
        const usersData = snapshot.val();

        // Show notification for new users after the initial load
        if (initialLoadDone.current && Object.keys(usersData).length > users.length) {
            toast({
              title: "Nuevo Usuario Registrado",
              description: "Un nuevo usuario se ha unido a la plataforma.",
            });
        }

        for (const userKey in usersData) {
          const fbUser: FirebaseUser = usersData[userKey];
          
          if (fbUser) {
            const registrationTime = fbUser.tiempo_registro ? new Date(fbUser.tiempo_registro) : new Date(0);
            
            const user: User = {
              id: fbUser.uid || userKey,
              fullName: fbUser.nombre_completo || 'Sin nombre',
              email: fbUser.email || 'Sin email',
              registrationDate: registrationTime.getTime() === 0 ? 'Fecha desconocida' : format(registrationTime, 'yyyy-MM-dd'),
              profileUrl: fbUser.fotoPerfilUrl || '',
              isVerified: fbUser.usuario_verificado === true, // Default to false if undefined or not exactly true
              experience: fbUser.experiencia || 'No especificado',
              education: fbUser.formacion || 'No especificado',
              userType: fbUser.tipoUsuario || 'No especificado',
              location: fbUser.ubicacion || 'No especificado',
              cvUrl: fbUser.cvUrl || '',
            };
            usersList.push(user);
          }
        }
      }
      setUsers(usersList.reverse()); // Show newest users first
      setLoading(false);
      
      // Mark initial load as done after a short delay to prevent notifications on first render
      setTimeout(() => {
        initialLoadDone.current = true;
      }, 1000);
    }, (error) => {
      console.error("Firebase read error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar los usuarios desde Firebase."
      })
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-6">Gestión de Usuarios</h1>
        <UserSkeleton />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Gestión de Usuarios</h1>
      <DataTable
        columns={userColumns}
        data={users}
        filterColumn="fullName" // Primary filter column
        secondaryFilterColumn="email" // Secondary filter column for the same input
        filterPlaceholder="Filtrar por nombre o email..."
      />
    </div>
  );
}
