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
import { mockUsers } from "@/lib/mock-data"
import { User } from "@/lib/types"

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('');
}

export function RecentUsersCard() {
  const recentUsers = mockUsers.slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Recent Registrations</CardTitle>
        <CardDescription>
          The latest 5 users who signed up.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  )
}
