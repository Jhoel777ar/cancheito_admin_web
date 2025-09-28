
"use client";

import { DataTable } from "@/components/dashboard/data-table/data-table";
import { offerColumns } from "@/components/dashboard/offers/columns";
import { db } from "@/lib/firebase";
import { ref, onValue, off, update } from "firebase/database";
import type { JobOffer, FirebaseJobOffer, FirebaseUser } from "@/lib/types";
import { format, isPast, startOfDay } from "date-fns";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGlobalLoader } from "@/hooks/use-global-loader";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { OfferActionsCell } from "@/components/dashboard/offers/offer-actions-cell";
import { CalendarClock, Zap } from "lucide-react";
import { updateOfferStatus } from "./actions";


function getInitials(name: string) {
  if (!name) return "S/N";
  return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

function OffersSkeleton() {
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

export default function OffersPage() {
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const router = useRouter();
  const { showLoader, isLoading } = useGlobalLoader();

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
          deadline: fbOffer.fecha_limite ? format(new Date(fbOffer.fecha_limite), 'yyyy-MM-dd') : undefined,
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

  useEffect(() => {
    if (jobOffers.length === 0) return;

    const today = startOfDay(new Date());

    jobOffers.forEach(offer => {
      if (offer.status === 'Activa' && offer.deadline) {
        const deadlineDate = startOfDay(new Date(offer.deadline));
        if (isPast(deadlineDate) && deadlineDate.getTime() !== today.getTime()) {
          console.log(`Desactivando oferta vencida: ${offer.title}`);
          updateOfferStatus(offer.id, 'CERRADA');
        }
      }
    });

  }, [jobOffers]);
  
  const handlePublisherClick = (publisherId: string) => {
    if (isLoading) return;
    showLoader();
    router.push(`/dashboard/users/${publisherId}`);
  };
  
  const filteredOffers = jobOffers.filter(offer => 
    offer.title.toLowerCase().includes(filter.toLowerCase()) ||
    offer.employer.name.toLowerCase().includes(filter.toLowerCase())
  );


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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Ofertas de Trabajo</h1>
        <Badge variant="outline" className="w-fit">
          <Zap className="mr-2 h-3 w-3 text-yellow-500" />
          Desactivación automática activada
        </Badge>
      </div>

       {isMobile ? (
        <div className="space-y-4">
          <Input 
            placeholder="Filtrar por cargo o publicador..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4">
            {filteredOffers.length > 0 ? filteredOffers.map(offer => (
              <Card 
                key={offer.id}
                className={cn(
                  "hover:bg-muted/50 transition-colors bg-card/80 backdrop-blur-sm",
                  isLoading && "opacity-50 pointer-events-none"
                )}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-card-foreground break-all pr-2">{offer.title}</p>
                    <OfferActionsCell row={{ original: offer }} />
                  </div>

                  <div 
                    onClick={() => handlePublisherClick(offer.employer.id)}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={offer.employer.avatarUrl} data-ai-hint="person face" alt={offer.employer.name} />
                      <AvatarFallback>{getInitials(offer.employer.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground group-hover:text-primary truncate">{offer.employer.name}</p>
                      <p className="text-xs text-muted-foreground/80 truncate">{offer.employer.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/50 text-sm">
                    <Badge variant={offer.status === 'Activa' ? "secondary" : "destructive"}>{offer.status}</Badge>
                    <Badge variant="outline">{offer.modality}</Badge>
                    <span className="text-muted-foreground">{offer.location}</span>
                  </div>
                   {offer.deadline && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Fecha Límite: {offer.deadline}
                    </div>
                  )}
                </CardContent>
              </Card>
            )) : (
              <p className="text-center text-muted-foreground py-10">No se encontraron ofertas.</p>
            )}
          </div>
        </div>
      ) : (
        <DataTable 
          columns={offerColumns(handlePublisherClick, isLoading)} 
          data={jobOffers} 
          filterColumn="title"
          secondaryFilterColumn="employer.name"
          filterPlaceholder="Filtrar por cargo o publicador..."
        />
      )}
    </div>
  );
}
