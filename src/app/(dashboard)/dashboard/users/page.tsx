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
    // The data might be nested under another key, so we handle that.
    const userList = (usersData.usuarios) ? usersData.usuarios : usersData;

    return Object.keys(userList).map(key => {
      const fbUser: FirebaseUser = userList[key];
      
      // Default values for potentially missing fields
      const registrationTime = fbUser.tiempo_registro ? new Date(fbUser.tiempo_registro) : new Date();

      return {
        id: fbUser.uid || key,
        fullName: fbUser.nombre_completo || 'Sin nombre',
        email: fbUser.email || 'Sin email',
        registrationDate: format(registrationTime, 'yyyy-MM-dd'),
        profileUrl: fbUser.fotoPerfilUrl || '',
        // We'll assume users are active unless a specific field says otherwise.
        isVerified: fbUser.isVerified !== undefined ? fbUser.isVerified : true,
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
