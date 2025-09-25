import { DataTable } from "@/components/dashboard/data-table/data-table";
import { offerColumns } from "@/components/dashboard/offers/columns";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { JobOffer, FirebaseJobOffer, FirebaseUser } from "@/lib/types";
import { format } from "date-fns";

async function getJobOffers(): Promise<JobOffer[]> {
  const offersRef = ref(db, 'ofertas');
  const usersRef = ref(db, 'Usuarios');

  const [offersSnapshot, usersSnapshot] = await Promise.all([
    get(offersRef),
    get(usersRef),
  ]);

  if (!offersSnapshot.exists()) {
    return [];
  }

  const offersData = offersSnapshot.val();
  const usersData = usersSnapshot.exists() ? usersSnapshot.val() : {};

  const usersMap = new Map<string, FirebaseUser>();
  for (const userId in usersData) {
    usersMap.set(userId, usersData[userId]);
  }

  const jobOffers: JobOffer[] = Object.keys(offersData).map(key => {
    const fbOffer: FirebaseJobOffer = offersData[key];
    const employer = usersMap.get(fbOffer.employerId);
    
    let offerType: 'Full-time' | 'Part-time' | 'Contract' = 'Full-time';
    if (fbOffer.modalidad === 'Híbrido' || fbOffer.modalidad === 'Remoto' || fbOffer.modalidad === 'Presencial') {
        // Assuming modalidad maps to contract, could be refined
    }

    return {
      id: fbOffer.id,
      title: fbOffer.cargo,
      companyName: employer?.nombreComercial || employer?.nombre_completo || 'Empresa Desconocida',
      location: fbOffer.ubicacion,
      type: offerType,
      postedDate: format(new Date(fbOffer.createdAt), 'yyyy-MM-dd'),
      status: fbOffer.estado === 'ACTIVA' ? 'Open' : 'Closed',
    };
  });

  return jobOffers.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime());
}


export default async function OffersPage() {
  const jobOffers = await getJobOffers();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Ofertas de Trabajo</h1>
      <DataTable 
        columns={offerColumns} 
        data={jobOffers} 
        filterColumn="title"
        secondaryFilterColumn="companyName"
        filterPlaceholder="Filtrar por cargo o empresa..."
      />
    </div>
  );
}
