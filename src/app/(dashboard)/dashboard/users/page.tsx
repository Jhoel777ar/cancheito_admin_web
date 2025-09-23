import { DataTable } from "@/components/dashboard/data-table/data-table";
import { userColumns } from "@/components/dashboard/users/columns";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import type { FirebaseUser, User } from "@/lib/types";
import { format } from 'date-fns';

async function getUsersFromFirebase(): Promise<User[]> {
  const usersRef = ref(db, 'Usuarios'); 
  const snapshot = await get(usersRef);
  const usersList: User[] = [];

  if (snapshot.exists()) {
    snapshot.forEach(childSnapshot => {
      const fbUser: FirebaseUser = childSnapshot.val();
      const userKey = childSnapshot.key;

      if (fbUser && (fbUser.email || fbUser.uid)) {
        const registrationTime = fbUser.tiempo_registro ? new Date(fbUser.tiempo_registro) : new Date(0);

        const user: User = {
          id: fbUser.uid || userKey || 'no-id',
          fullName: fbUser.nombre_completo || 'Sin nombre',
          email: fbUser.email || 'Sin email',
          registrationDate: registrationTime.getTime() === 0 ? 'Fecha desconocida' : format(registrationTime, 'yyyy-MM-dd'),
          profileUrl: fbUser.fotoPerfilUrl || '',
          isVerified: fbUser.usuario_verificado !== undefined ? fbUser.usuario_verificado : true, // Default to true if not present
          experience: fbUser.experiencia || 'No especificado',
          education: fbUser.formacion || 'No especificado',
          userType: fbUser.tipoUsuario || 'No especificado',
          location: fbUser.ubicacion || 'No especificado',
          cvUrl: fbUser.cvUrl || '',
        };
        usersList.push(user);
      }
    });
  }
  return usersList;
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
