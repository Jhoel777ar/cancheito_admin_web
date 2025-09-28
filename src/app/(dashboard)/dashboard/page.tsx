import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentUsersCard } from "@/components/dashboard/recent-users-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, UserCheck, UserX, UserPlus, Briefcase, FileCheck, FileX, FilePlus } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { FirebaseUser, FirebaseJobOffer } from "@/lib/types";
import { subDays, eachDayOfInterval, format } from "date-fns";
import { OffersChart } from "@/components/dashboard/offers-chart";
import { AIAnalyticsSection } from "@/components/dashboard/ai-analytics-section";

async function getDashboardAnalytics() {
  const usersRef = ref(db, 'Usuarios');
  const offersRef = ref(db, 'ofertas');

  const [userSnapshot, offerSnapshot] = await Promise.all([get(usersRef), get(offersRef)]);

  // User Analytics
  let totalUsers = 0, verifiedUsers = 0, suspendedUsers = 0, newUsersLast30Days = 0;
  const userSignupsData: { date: string, signups: number }[] = [];

  const last30DaysInterval = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date()
  });

  const last7DaysInterval = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const allTimeUserSignups: { date: string, count: number }[] = [];

  if (userSnapshot.exists()) {
    const usersData = userSnapshot.val();
    const userIds = Object.keys(usersData);
    totalUsers = userIds.length;
    const thirtyDaysAgo = subDays(new Date(), 30).getTime();
    
    const userCountsByDay: { [key: string]: number } = {};

    userIds.forEach(id => {
      const user: FirebaseUser = usersData[id];
      if (user) {
        if (user.usuario_verificado === true) verifiedUsers++;
        if (user.estadoCuenta === 'Desactivada') suspendedUsers++;
        if (user.tiempo_registro) {
            if (user.tiempo_registro > thirtyDaysAgo) newUsersLast30Days++;
            
            const userDate = format(new Date(user.tiempo_registro), 'yyyy-MM-dd');
            allTimeUserSignups.push({ date: userDate, count: 1 });

            const userDate7Days = format(new Date(user.tiempo_registro), 'MMM d');
            userCountsByDay[userDate7Days] = (userCountsByDay[userDate7Days] || 0) + 1;
        }
      }
    });

    last7DaysInterval.forEach(day => {
        const formattedDate = format(day, 'MMM d');
        userSignupsData.push({
            date: formattedDate,
            signups: userCountsByDay[formattedDate] || 0
        });
    });

  } else {
     last7DaysInterval.forEach(day => {
        userSignupsData.push({
            date: format(day, 'MMM d'),
            signups: 0
        });
    });
  }

  // Offer Analytics
  let totalOffers = 0, activeOffers = 0, closedOffers = 0, newOffersLast30Days = 0;
  const offerSignupsData: { date: string, signups: number }[] = [];
  const allTimeOfferSignups: { date: string, count: number }[] = [];
  
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

        if (offer.createdAt) {
           const offerDate = format(new Date(offer.createdAt), 'yyyy-MM-dd');
           allTimeOfferSignups.push({ date: offerDate, count: 1 });
           
           const offerDate7Days = format(new Date(offer.createdAt), 'MMM d');
           offerCountsByDay[offerDate7Days] = (offerCountsByDay[offerDate7Days] || 0) + 1;
        }
      }
    });

    last7DaysInterval.forEach(day => {
        const formattedDate = format(day, 'MMM d');
        offerSignupsData.push({
            date: formattedDate,
            signups: offerCountsByDay[formattedDate] || 0
        });
    });

  } else {
     last7DaysInterval.forEach(day => {
        offerSignupsData.push({
            date: format(day, 'MMM d'),
            signups: 0
        });
    });
  }
  
  const summaryInput = {
      totalUsers,
      newUsersLast30Days,
      totalOffers,
      newOffersLast30Days,
      activeOffers,
      closedOffers
  };
  
  const predictiveInput = {
      userHistory: allTimeUserSignups,
      offerHistory: allTimeOfferSignups,
  };


  return { 
    userAnalytics: { totalUsers, verifiedUsers, suspendedUsers, newUsersLast30Days, userSignupsData },
    offerAnalytics: { totalOffers, activeOffers, closedOffers, newOffersLast30Days, offerSignupsData },
    aiInputs: { summaryInput, predictiveInput }
  };
}


export default async function DashboardPage() {
  const { userAnalytics, offerAnalytics, aiInputs } = await getDashboardAnalytics();

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
        <OverviewChart data={userAnalytics.userSignupsData} />
        <OffersChart data={offerAnalytics.offerSignupsData} />
      </div>
      <AIAnalyticsSection summaryInput={aiInputs.summaryInput} predictiveInput={aiInputs.predictiveInput} />
      <RecentUsersCard />
    </div>
  );
}
