import { DataTable } from "@/components/dashboard/data-table/data-table";
import { offerColumns } from "@/components/dashboard/offers/columns";
import { mockJobOffers } from "@/lib/mock-data";

export default function OffersPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">Job Offers</h1>
      <DataTable 
        columns={offerColumns} 
        data={mockJobOffers} 
        filterColumn="title"
        filterPlaceholder="Filter by job title..."
      />
    </div>
  );
}
