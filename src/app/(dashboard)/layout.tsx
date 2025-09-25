
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FlameKindling,
  LogOut,
  LifeBuoy,
  UserCheck,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { ref, onValue } from "firebase/database";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const initialLoadDone = useRef(false);
  const userCountRef = useRef(0);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Usuarios", icon: Users },
    { href: "/dashboard/verify-users", label: "Verificar Usuarios", icon: UserCheck },
    { href: "/dashboard/companies", label: "Empresas", icon: Building2 },
    { href: "/dashboard/offers", label: "Ofertas", icon: Briefcase },
  ];

  useEffect(() => {
    const usersRef = ref(db, 'Usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const currentUserCount = Object.keys(usersData).length;

        if (initialLoadDone.current && currentUserCount > userCountRef.current) {
            toast({
              title: "Nuevo Usuario Registrado",
              description: "Un nuevo usuario se ha unido a la plataforma.",
            });
        }
        userCountRef.current = currentUserCount;

        if (!initialLoadDone.current) {
          initialLoadDone.current = true;
        }
      }
    }, (error) => {
      console.error("Firebase real-time error:", error);
       toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron obtener actualizaciones en tiempo real."
      })
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [toast]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al cerrar sesión",
        description: "No se pudo cerrar la sesión. Por favor, inténtalo de nuevo.",
      });
    }
  };

  const handleSupportClick = () => {
    window.open("https://arkdev.pages.dev/nosotros", "_blank");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FlameKindling className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">AdminEdge</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: "right", align: "center" }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://picsum.photos/seed/admin/100/100" data-ai-hint="person face" alt="@admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSupportClick}>
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Soporte</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
