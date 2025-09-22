import { DataTable } from "@/components/dashboard/data-table/data-table";
import { companyColumns } from "@/components/dashboard/companies/columns";
import { mockCompanies } from "@/lib/mock-data";

export default function CompaniesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Company Data</h1>
      <DataTable 
        columns={companyColumns} 
        data={mockCompanies} 
        filterColumn="name"
        filterPlaceholder="Filter by company name..."
      />
    </div>
  );
}
