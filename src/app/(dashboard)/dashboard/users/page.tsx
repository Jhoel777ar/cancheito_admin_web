import { DataTable } from "@/components/dashboard/data-table/data-table";
import { userColumns } from "@/components/dashboard/users/columns";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { FirebaseUser, User } from "@/lib/types";
import { format } from 'date-fns';

async function getUsersFromFirebase(): Promise<User[]> {
  const usersRef = ref(db, 'usuarios');
  const snapshot = await get(usersRef);

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    return Object.keys(usersData).map(key => {
      const fbUser: FirebaseUser = usersData[key];
      return {
        id: fbUser.uid,
        fullName: fbUser.nombre_completo,
        email: fbUser.email,
        registrationDate: format(new Date(fbUser.tiempo_registro), 'yyyy-MM-dd'),
        profileUrl: fbUser.fotoPerfilUrl,
        // Firebase Auth doesn't have a built-in 'suspended' flag like this, 
        // you might need to manage this state in your DB.
        // For now, we'll default to true (active).
        isVerified: true, 
      };
    });
  }
  return [];
}


export default async function UsersPage() {
  const users = await getUsersFromFirebase();

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight mb-6">User Management</h1>
      <DataTable 
        columns={userColumns} 
        data={users} 
        filterColumn="fullName"
        filterPlaceholder="Filter by name or email..."
      />
    </div>
  );
}
