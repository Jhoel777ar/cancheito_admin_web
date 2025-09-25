
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
  Briefcase,
  FlameKindling,
  LogOut,
  LifeBuoy,
  UserCheck,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { FirebaseJobOffer, FirebaseUser } from "@/lib/types";


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Refs to track counts and prevent initial notifications
  const initialLoadDone = useRef({ users: false, offers: false });
  const dataCounts = useRef({ users: 0, offers: 0 });

  // State to hold user data for lookups
  const [usersMap, setUsersMap] = useState<Map<string, FirebaseUser>>(new Map());

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Usuarios", icon: Users },
    { href: "/dashboard/verify-users", label: "Verificar Usuarios", icon: UserCheck },
    { href: "/dashboard/offers", label: "Ofertas", icon: Briefcase },
  ];
  
  // Effect for user notifications
  useEffect(() => {
    const usersRef = ref(db, 'Usuarios');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) return;
      
      const usersData = snapshot.val();
      const newUsersMap = new Map<string, FirebaseUser>();
      Object.keys(usersData).forEach(key => {
        newUsersMap.set(key, { uid: key, ...usersData[key] });
      });
      setUsersMap(newUsersMap);
      
      const currentUserCount = newUsersMap.size;

      if (initialLoadDone.current.users && currentUserCount > dataCounts.current.users) {
          toast({
            title: "Nuevo Usuario Registrado",
            description: "Un nuevo usuario se ha unido a la plataforma.",
          });
      }
      dataCounts.current.users = currentUserCount;

      if (!initialLoadDone.current.users) {
        initialLoadDone.current.users = true;
      }
    }, (error) => {
      console.error("Firebase real-time error (Users):", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron obtener actualizaciones de usuarios."
      })
    });

    return () => unsubscribe();
  }, [toast]);

  // Effect for offers notifications
  useEffect(() => {
    if (usersMap.size === 0) return; // Wait for users to be loaded

    const offersRef = ref(db, 'ofertas');
    const unsubscribe = onValue(offersRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const offersData = snapshot.val();
      const currentOfferCount = Object.keys(offersData).length;

      if (initialLoadDone.current.offers && currentOfferCount > dataCounts.current.offers) {
        // Find the newest offer (crude method: assume the one that doesn't exist in previous state)
        const newOffers: FirebaseJobOffer[] = Object.values(offersData);
        const lastOffer = newOffers.sort((a,b) => b.createdAt - a.createdAt)[0];
        
        if (lastOffer) {
          const publisher = usersMap.get(lastOffer.employerId);
          const publisherName = publisher?.nombre_completo || 'un publicador desconocido';
          toast({
            title: "Nueva Oferta Publicada",
            description: `${publisherName} ha publicado la oferta: "${lastOffer.cargo}"`,
          });
        }
      }
      dataCounts.current.offers = currentOfferCount;
      
      if (!initialLoadDone.current.offers) {
        initialLoadDone.current.offers = true;
      }
    }, (error) => {
      console.error("Firebase real-time error (Offers):", error);
      toast({
        variant: "destructive",
        title: "Error de Conexión",
        description: "No se pudieron obtener actualizaciones de ofertas."
      });
    });

    return () => unsubscribe();
  }, [toast, usersMap]);


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
