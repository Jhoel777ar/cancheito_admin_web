
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { userColumns } from "@/components/dashboard/users/columns";
import { db } from "@/lib/firebase";
import { ref, onValue } from "firebase/database";
import type { FirebaseUser, User } from "@/lib/types";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useGlobalLoader } from "@/hooks/use-global-loader";


function getInitials(name: string) {
  if (!name) return "";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

function UserSkeleton() {
  const isMobile = useIsMobile();
  
  if (isMobile) {
     return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
      </div>
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
            <div className="flex flex-col space-y-3 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
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
  const [filter, setFilter] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { showLoader, isLoading } = useGlobalLoader();

  useEffect(() => {
    const usersRef = ref(db, 'Usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const usersList: User[] = [];
      if (snapshot.exists()) {
        const usersData = snapshot.val();
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
              isVerified: fbUser.usuario_verificado === true,
              experience: fbUser.experiencia || 'No especificado',
              education: fbUser.formacion || 'No especificado',
              userType: fbUser.tipoUsuario || 'No especificado',
              location: fbUser.ubicacion || 'No especificado',
              cvUrl: fbUser.cvUrl || '',
              accountState: fbUser.estadoCuenta || 'Activa',
              commercialName: fbUser.nombreComercial,
              industry: fbUser.rubro,
              description: fbUser.descripcion,
            };
            usersList.push(user);
          }
        }
      }
      setUsers(usersList.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()));
      setLoading(false);
      
    }, (error) => {
      console.error("Firebase read error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar los usuarios desde Firebase."
      })
    });

    return () => unsubscribe();
  }, [toast]);

  const handleUserClick = (userId: string) => {
    if (isLoading) return;
    showLoader();
    router.push(`/dashboard/users/${userId}`);
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(filter.toLowerCase()) ||
    user.email.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <UserSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
      
      {isMobile ? (
        <div className="space-y-4">
          <Input 
            placeholder="Filtrar por nombre o email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.length > 0 ? filteredUsers.map(user => {
              return (
                <Card 
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className={cn(
                    "hover:bg-muted/50 transition-colors cursor-pointer",
                    isLoading && "opacity-50 pointer-events-none"
                  )}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                       <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 min-w-0">
                        <p className="font-semibold text-card-foreground truncate">{user.fullName}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </div>
                     <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                          <Badge variant={user.accountState === 'Activa' ? "secondary" : "destructive"}>
                            {user.accountState}
                          </Badge>
                          <Badge variant={user.isVerified ? "default" : "outline"} className="bg-primary/20 text-primary">
                            {user.isVerified ? "Verificado" : "No Verificado"}
                          </Badge>
                       </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <p className="text-center text-muted-foreground py-10">No se encontraron usuarios.</p>
            )}
          </div>
        </div>
      ) : (
        <DataTable
          columns={userColumns(handleUserClick, isLoading)}
          data={users}
          filterColumn="fullName"
          secondaryFilterColumn="email"
          filterPlaceholder="Filtrar por nombre o email..."
        />
      )}
    </div>
  );
}
