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

function PostulationsSkeleton() {
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
  const { toast } = useToast();

  useEffect(() => {
    const postulationsRef = ref(db, 'postulaciones');
    const usersRef = ref(db, 'Usuarios');
    const offersRef = ref(db, 'ofertas');

    let usersData: { [id: string]: FirebaseUser } = {};
    let offersData: { [id: string]: FirebaseJobOffer } = {};

    // Pre-load users and offers to enrich postulation data
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
        const fbPostulationData = postulationsData[key];
        
        // Derive applicantId from the composite key if not present in the object
        const applicantId = fbPostulationData.applicantId || key.split('_')[1];

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
          status: fbPostulationData.status || 'Enviada',
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
      <DataTable 
        columns={postulationColumns} 
        data={postulations} 
        filterColumn="applicant.name"
        secondaryFilterColumn="offer.title"
        filterPlaceholder="Filtrar por postulante u oferta..."
      />
    </div>
  );
}
