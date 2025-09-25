import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentUsersCard } from "@/components/dashboard/recent-users-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, UserCheck, UserX, UserPlus, Briefcase, FileCheck, FileX, FilePlus } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { FirebaseUser, FirebaseJobOffer } from "@/lib/types";
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from "date-fns";
import { OffersChart } from "@/components/dashboard/offers-chart";

async function getDashboardAnalytics() {
  const usersRef = ref(db, 'Usuarios');
  const offersRef = ref(db, 'ofertas');

  const [userSnapshot, offerSnapshot] = await Promise.all([get(usersRef), get(offersRef)]);

  // User Analytics
  let totalUsers = 0, verifiedUsers = 0, suspendedUsers = 0, newUsersLast30Days = 0;
  if (userSnapshot.exists()) {
    const usersData = userSnapshot.val();
    const userIds = Object.keys(usersData);
    totalUsers = userIds.length;
    const thirtyDaysAgo = subDays(new Date(), 30).getTime();

    userIds.forEach(id => {
      const user: FirebaseUser = usersData[id];
      if (user) {
        if (user.usuario_verificado === true) verifiedUsers++;
        if (user.estadoCuenta === 'Desactivada') suspendedUsers++;
        if (user.tiempo_registro && user.tiempo_registro > thirtyDaysAgo) newUsersLast30Days++;
      }
    });
  }

  // Offer Analytics
  let totalOffers = 0, activeOffers = 0, closedOffers = 0, newOffersLast30Days = 0;
  const offerSignupsData: { date: string, signups: number }[] = [];
  
  if (offerSnapshot.exists()) {
    const offersData = offerSnapshot.val();
    const offerIds = Object.keys(offersData);
    totalOffers = offerIds.length;
    const thirtyDaysAgo = subDays(new Date(), 30).getTime();
    
    const offerCountsByDay: { [key: string]: number } = {};

    offerIds.forEach(id => {
      const offer: FirebaseJobOffer = offersData[id];
      if (offer) {
        if (offer.estado === 'ACTIVA') activeOffers++;
        if (offer.estado === 'CERRADA') closedOffers++;
        if (offer.createdAt && offer.createdAt > thirtyDaysAgo) newOffersLast30Days++;

        const offerDate = format(new Date(offer.createdAt), 'MMM d');
        offerCountsByDay[offerDate] = (offerCountsByDay[offerDate] || 0) + 1;
      }
    });

    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    last7Days.forEach(day => {
        const formattedDate = format(day, 'MMM d');
        offerSignupsData.push({
            date: formattedDate,
            signups: offerCountsByDay[formattedDate] || 0
        });
    });

  } else {
     const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });
    last7Days.forEach(day => {
        offerSignupsData.push({
            date: format(day, 'MMM d'),
            signups: 0
        });
    });
  }

  return { 
    userAnalytics: { totalUsers, verifiedUsers, suspendedUsers, newUsersLast30Days },
    offerAnalytics: { totalOffers, activeOffers, closedOffers, newOffersLast30Days, offerSignupsData }
  };
}


export default async function DashboardPage() {
  const { userAnalytics, offerAnalytics } = await getDashboardAnalytics();

  return (
    <div className="flex flex-col gap-6">
       <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Usuarios</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Total de Usuarios" value={userAnalytics.totalUsers} icon={Users} />
          <StatsCard title="Usuarios Verificados" value={userAnalytics.verifiedUsers} icon={UserCheck} />
          <StatsCard title="Cuentas Suspendidas" value={userAnalytics.suspendedUsers} icon={UserX} />
          <StatsCard title="Nuevos Usuarios (30d)" value={userAnalytics.newUsersLast30Days} icon={UserPlus} />
        </div>
      </div>
       <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Ofertas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard title="Ofertas Totales" value={offerAnalytics.totalOffers} icon={Briefcase} />
          <StatsCard title="Ofertas Activas" value={offerAnalytics.activeOffers} icon={FileCheck} />
          <StatsCard title="Ofertas Cerradas" value={offerAnalytics.closedOffers} icon={FileX} />
          <StatsCard title="Nuevas Ofertas (30d)" value={offerAnalytics.newOffersLast30Days} icon={FilePlus} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart />
        <OffersChart data={offerAnalytics.offerSignupsData} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RecentUsersCard />
      </div>
    </div>
  );
}
