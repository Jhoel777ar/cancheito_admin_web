import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentUsersCard } from "@/components/dashboard/recent-users-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Users, UserCheck, UserX, UserPlus } from "lucide-react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { FirebaseUser } from "@/lib/types";
import { subDays } from "date-fns";

async function getDashboardAnalytics() {
  const usersRef = ref(db, 'Usuarios');
  const snapshot = await get(usersRef);

  if (!snapshot.exists()) {
    return {
      totalUsers: 0,
      verifiedUsers: 0,
      suspendedUsers: 0,
      newUsersLast30Days: 0,
    };
  }

  const usersData = snapshot.val();
  const userIds = Object.keys(usersData);
  const totalUsers = userIds.length;
  
  let verifiedUsers = 0;
  let suspendedUsers = 0;
  let newUsersLast30Days = 0;
  const thirtyDaysAgo = subDays(new Date(), 30).getTime();

  userIds.forEach(id => {
    const user: FirebaseUser = usersData[id];
    if (user) {
      if (user.usuario_verificado === true) {
        verifiedUsers++;
      }
      if (user.estadoCuenta === 'Desactivada') {
        suspendedUsers++;
      }
      if (user.tiempo_registro && user.tiempo_registro > thirtyDaysAgo) {
        newUsersLast30Days++;
      }
    }
  });

  return { totalUsers, verifiedUsers, suspendedUsers, newUsersLast30Days };
}


export default async function DashboardPage() {
  const analytics = await getDashboardAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total de Usuarios" value={analytics.totalUsers} icon={Users} />
        <StatsCard title="Usuarios Verificados" value={analytics.verifiedUsers} icon={UserCheck} />
        <StatsCard title="Cuentas Suspendidas" value={analytics.suspendedUsers} icon={UserX} />
        <StatsCard title="Nuevos (30 días)" value={analytics.newUsersLast30Days} icon={UserPlus} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart />
        <RecentUsersCard />
      </div>
    </div>
  );
}
