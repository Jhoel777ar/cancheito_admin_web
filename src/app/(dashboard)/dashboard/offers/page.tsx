
"use client";

import { DataTable } from "@/components/dashboard/data-table/data-table";
import { offerColumns } from "@/components/dashboard/offers/columns";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { JobOffer, FirebaseJobOffer, FirebaseUser } from "@/lib/types";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function OffersSkeleton() {
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

export default function OffersPage() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const offersRef = ref(db, 'ofertas');
    const usersRef = ref(db, 'Usuarios');

    let usersData: any = {};

    const usersListener = onValue(usersRef, (usersSnapshot) => {
      if (usersSnapshot.exists()) {
        usersData = usersSnapshot.val();
      }
    }, (error) => {
      console.error("Firebase users read error:", error);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar los datos de los publicadores."
      });
    });

    const offersListener = onValue(offersRef, (offersSnapshot) => {
      if (!offersSnapshot.exists()) {
        setJobOffers([]);
        setLoading(false);
        return;
      }
      
      const offersData = offersSnapshot.val();
      const usersMap = new Map<string, FirebaseUser>();
      for (const userId in usersData) {
        if(usersData[userId]){
          usersMap.set(userId, {uid: userId, ...usersData[userId]});
        }
      }

      const offersList: JobOffer[] = Object.keys(offersData).map(key => {
        const fbOffer: FirebaseJobOffer = offersData[key];
        const employer = usersMap.get(fbOffer.employerId);
        
        return {
          id: fbOffer.id,
          title: fbOffer.cargo,
          employer: {
            id: employer?.uid || fbOffer.employerId,
            name: employer?.nombre_completo || 'Usuario Desconocido',
            email: employer?.email || 'Email no disponible',
            avatarUrl: employer?.fotoPerfilUrl || ''
          },
          location: fbOffer.ubicacion,
          modality: fbOffer.modalidad,
          approxPayment: fbOffer.pago_aprox,
          postedDate: format(new Date(fbOffer.createdAt), 'yyyy-MM-dd'),
          status: fbOffer.estado === 'ACTIVA' ? 'Activa' : 'Cerrada',
        };
      });

      setJobOffers(offersList.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
      setLoading(false);
    }, (error) => {
      console.error("Firebase offers read error:", error);
      setLoading(false);
      toast({
        variant: "destructive",
        title: "Error de Carga",
        description: "No se pudieron cargar las ofertas de trabajo."
      });
    });

    return () => {
      off(usersRef, 'value', usersListener);
      off(offersRef, 'value', offersListener);
    };
  }, [toast]);

  if (loading) {
     return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Ofertas de Trabajo</h1>
        <OffersSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Ofertas de Trabajo</h1>
      <DataTable 
        columns={offerColumns} 
        data={jobOffers} 
        filterColumn="title"
        secondaryFilterColumn="employer.name"
        filterPlaceholder="Filtrar por cargo o publicador..."
      />
    </div>
  );
}
