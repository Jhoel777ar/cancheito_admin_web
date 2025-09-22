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
import { User } from "@/lib/types"

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');
}

// NOTE: This component still uses mock data. 
// For a real application, you would fetch recent users from Firebase.
const recentUsers: User[] = [
  // You can manually add a few users here for display purposes if needed
  // Or implement a fetch similar to the UsersPage
];

export function RecentUsersCard() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
        <CardDescription>
          The latest users who signed up. (Currently static)
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
