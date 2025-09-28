import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FirebaseUser, User } from "@/lib/types"
import { db } from "@/lib/firebase";
import { ref, get, query, limitToLast } from "firebase/database";
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

function getInitials(name: string) {
  if (!name) return "S/N";
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');
}

async function getRecentUsers(): Promise<User[]> {
  const usersRef = query(ref(db, 'Usuarios'));
  const snapshot = await get(usersRef);

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    const usersList: User[] = Object.keys(usersData).map(key => {
      const fbUser: FirebaseUser = usersData[key];
      const registrationTime = fbUser.tiempo_registro ? new Date(fbUser.tiempo_registro) : new Date();
      return {
        id: fbUser.uid || key,
        fullName: fbUser.nombre_completo || 'Sin nombre',
        email: fbUser.email || 'Sin email',
        registrationDate: format(registrationTime, 'yyyy-MM-dd'),
        profileUrl: fbUser.fotoPerfilUrl || '',
        isVerified: fbUser.usuario_verificado === true,
        accountState: fbUser.estadoCuenta || 'Activa',
        experience: fbUser.experiencia || 'No especificado',
        education: fbUser.formacion || 'No especificado',
        userType: fbUser.tipoUsuario || 'No especificado',
        location: fbUser.ubicacion || 'No especificado',
        cvUrl: fbUser.cvUrl || '',
      };
    });
    
    return usersList
      .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
      .slice(0, 5);
  }
  return [];
}


export async function RecentUsersCard() {
  const recentUsers = await getRecentUsers();

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Registros Recientes</CardTitle>
        <CardDescription>
          Los 5 usuarios más recientes que se registraron.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length > 0 ? (
          <div className="space-y-6">
            {recentUsers.map((user: User) => (
              <Link key={user.id} href={`/dashboard/users/${user.id}`} className="group flex items-center gap-3 rounded-md p-2 -mx-2 hover:bg-muted/50 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt="Avatar" />
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none group-hover:text-primary">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto text-right text-sm text-muted-foreground">{user.registrationDate}</div>
              </Link>
            ))}
          </div>
        ) : (
           <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="ml-2 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
        )}
      </CardContent>
    </Card>
  )
}
