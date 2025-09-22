import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentUsersCard } from "@/components/dashboard/recent-users-card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { dashboardStats } from "@/lib/mock-data";
import { Users, Building2, Briefcase, UserPlus } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Users" value={dashboardStats.totalUsers} icon={Users} />
        <StatsCard title="Active Companies" value={dashboardStats.activeCompanies} icon={Building2} />
        <StatsCard title="Open Job Offers" value={dashboardStats.openJobOffers} icon={Briefcase} />
        <StatsCard title="New Users (Month)" value={dashboardStats.newUsersThisMonth} icon={UserPlus} />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OverviewChart />
        <RecentUsersCard />
      </div>
    </div>
  );
}
