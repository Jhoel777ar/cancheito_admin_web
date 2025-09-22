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
import { ref, get, query, orderByChild, limitToLast } from "firebase/database";
import { format } from "date-fns";

function getInitials(name: string) {
  if (!name) return "S/N";
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');
}

async function getRecentUsers(): Promise<User[]> {
  const usersRef = query(ref(db, 'usuarios'), orderByChild('tiempo_registro'), limitToLast(5));
  const snapshot = await get(usersRef);

  if (snapshot.exists()) {
    const usersData = snapshot.val();
    const usersList = Object.keys(usersData).map(key => {
      const fbUser: FirebaseUser = usersData[key];
      const registrationTime = fbUser.tiempo_registro ? new Date(fbUser.tiempo_registro) : new Date();
      return {
        id: fbUser.uid || key,
        fullName: fbUser.nombre_completo || 'Sin nombre',
        email: fbUser.email || 'Sin email',
        registrationDate: format(registrationTime, 'yyyy-MM-dd'),
        profileUrl: fbUser.fotoPerfilUrl || '',
        isVerified: true,
      };
    });
    // The data is returned in ascending order, so we reverse it to show the most recent first
    return usersList.reverse();
  }
  return [];
}


export async function RecentUsersCard() {
  const recentUsers = await getRecentUsers();

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
        <CardDescription>
          The 5 most recent users who signed up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {recentUsers.length > 0 ? (
          <div className="space-y-8">
            {recentUsers.map((user: User) => (
              <div key={user.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt="Avatar" />
                  <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{user.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="ml-auto font-medium text-sm">{user.registrationDate}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent users to display.</p>
        )}
      </CardContent>
    </Card>
  )
}
