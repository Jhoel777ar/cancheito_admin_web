
"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { postulationColumns } from "@/components/dashboard/postulations/columns";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { Postulation, FirebasePostulation, FirebaseUser, FirebaseJobOffer } from "@/lib/types";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  if (!name) return "S/N";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}


function PostulationsSkeleton() {
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
  );
}

export default function PostulationsPage() {
  const [postulations, setPostulations] = useState<Postulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { showLoader, isLoading } = useGlobalLoader();

  useEffect(() => {
    const postulationsRef = ref(db, 'postulaciones');
    const usersRef = ref(db, 'Usuarios');
    const offersRef = ref(db, 'ofertas');

    let usersData: { [id: string]: FirebaseUser } = {};
    let offersData: { [id: string]: FirebaseJobOffer } = {};

    const usersListener = onValue(usersRef, (snapshot) => {
        usersData = snapshot.val() || {};
    }, (error) => {
      console.error("Firebase users read error:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de usuarios." });
    });

    const offersListener = onValue(offersRef, (snapshot) => {
        offersData = snapshot.val() || {};
    }, (error) => {
      console.error("Firebase offers read error:", error);
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar los datos de ofertas." });
    });

    const postulationsListener = onValue(postulationsRef, (snapshot) => {
      if (!snapshot.exists()) {
        setPostulations([]);
        setLoading(false);
        return;
      }
      
      const postulationsData = snapshot.val();
      const postulationsList: Postulation[] = Object.keys(postulationsData).map(key => {
        const fbPostulationData: FirebasePostulation = postulationsData[key];
        
        const applicantId = fbPostulationData.postulanteId;

        const applicant = usersData[applicantId];
        const offer = offersData[fbPostulationData.offerId];
        const employer = offer ? usersData[offer.employerId] : undefined;

        return {
          id: key,
          applicant: {
            id: applicant?.uid || applicantId,
            name: applicant?.nombre_completo || 'Usuario Desconocido',
            email: applicant?.email || 'Email no disponible',
            avatarUrl: applicant?.fotoPerfilUrl || ''
          },
          offer: {
            id: offer?.id || fbPostulationData.offerId,
            title: offer?.cargo || 'Oferta Desconocida',
            employer: {
                id: employer?.uid || offer?.employerId || '',
                name: employer?.nombre_completo || 'Publicador Desconocido',
                email: employer?.email || '',
                avatarUrl: employer?.fotoPerfilUrl || ''
            },
            location: offer?.ubicacion || '',
            modality: offer?.modalidad || '',
            approxPayment: offer?.pago_aprox || '',
            postedDate: offer ? format(new Date(offer.createdAt), 'yyyy-MM-dd') : 'Fecha desconocida',
            status: offer?.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'
          },
          postulationDate: fbPostulationData.fechaPostulacion ? format(new Date(fbPostulationData.fechaPostulacion), 'yyyy-MM-dd HH:mm') : 'Fecha desconocida',
          postulationStatus: fbPostulationData.estado_postulacion || 'Enviada',
        };
      });

      setPostulations(postulationsList.sort((a, b) => new Date(b.postulationDate).getTime() - new Date(a.postulationDate).getTime()));
      setLoading(false);
    }, (error) => {
      console.error("Firebase postulations read error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar las postulaciones."
      });
    });

    return () => {
      off(usersRef, 'value', usersListener);
      off(offersRef, 'value', offersListener);
      off(postulationsRef, 'value', postulationsListener);
    };
  }, [toast]);

  const handleUserClick = (userId: string) => {
    if (isLoading) return;
    showLoader();
    router.push(`/dashboard/users/${userId}`);
  };

  const filteredPostulations = postulations.filter(postulation =>
    postulation.applicant.name.toLowerCase().includes(filter.toLowerCase()) ||
    postulation.offer.title.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
     return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Postulaciones de Trabajo</h1>
        <PostulationsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Postulaciones de Trabajo</h1>
      {isMobile ? (
        <div className="space-y-4">
          <Input 
            placeholder="Filtrar por postulante u oferta..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4">
            {filteredPostulations.length > 0 ? filteredPostulations.map(postulation => {
              const status = postulation.postulationStatus.toLowerCase();
              let variant: "secondary" | "destructive" | "default" | "outline" = "outline";
              if (status === 'aceptada') variant = 'secondary';
              if (status === 'rechazada') variant = 'destructive';
              if (status === 'revisada') variant = 'default';

              return (
              <Card 
                key={postulation.id}
                className={cn(
                  "bg-card/80 backdrop-blur-sm",
                  isLoading && "opacity-50 pointer-events-none"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-card-foreground break-all">{postulation.offer.title}</p>
                    <p className="text-sm text-muted-foreground">Publicada por: {postulation.offer.employer.name}</p>
                  </div>
                  
                  <div 
                    onClick={() => handleUserClick(postulation.applicant.id)}
                    className="flex items-center gap-3 group cursor-pointer pt-3 border-t border-border/50"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={postulation.applicant.avatarUrl} data-ai-hint="person face" alt={postulation.applicant.name} />
                      <AvatarFallback>{getInitials(postulation.applicant.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-primary truncate">{postulation.applicant.name}</p>
                      <p className="text-xs text-muted-foreground/80 truncate">{postulation.applicant.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 text-sm">
                    <span className="text-muted-foreground">{postulation.postulationDate}</span>
                    <Badge variant={variant} className="capitalize">{status}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}) : (
              <p className="text-center text-muted-foreground py-10">No se encontraron postulaciones.</p>
            )}
          </div>
        </div>
      ) : (
        <DataTable 
          columns={postulationColumns(handleUserClick, isLoading)} 
          data={postulations} 
          filterColumn="applicant.name"
          secondaryFilterColumn="offer.title"
          filterPlaceholder="Filtrar por postulante u oferta..."
        />
      )}
    </div>
  );
}
