import { DataTable } from "@/components/dashboard/data-table/data-table";
import { userColumns } from "@/components/dashboard/users/columns";
import { mockUsers } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">User Management</h1>
      <DataTable 
        columns={userColumns} 
        data={mockUsers} 
        filterColumn="fullName"
        filterPlaceholder="Filter by name or email..."
      />
    </div>
  );
}
