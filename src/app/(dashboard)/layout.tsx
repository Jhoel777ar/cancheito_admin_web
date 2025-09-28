
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
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
  useSidebar,
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
  LogOut,
  LifeBuoy,
  UserCheck,
  ClipboardList,
  Bell,
  FileBarChart,
  Loader2,
} from "lucide-react";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, off } from "firebase/database";
import { FirebaseJobOffer, FirebasePostulation, FirebaseUser } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { GlobalLoaderProvider, useGlobalLoader } from "@/hooks/use-global-loader";

type Notification = {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
}

function GlobalLoader() {
  const { isLoading } = useGlobalLoader();
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
  );
}

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const { setIsLoading, showLoader } = useGlobalLoader();
  const { setOpenMobile } = useSidebar();


  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  const initialLoadDone = useRef({ users: false, offers: false, postulations: false });
  const dataCounts = useRef({ users: 0, offers: 0, postulations: 0 });

  const [usersMap, setUsersMap] = useState<Map<string, FirebaseUser>>(new Map());
  const [offersMap, setOffersMap] = useState<Map<string, FirebaseJobOffer>>(new Map());

  // Handle hiding loader on route change
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, setIsLoading]);


  const addNotification = (title: string, description: string) => {
    const newNotification: Notification = {
      id: new Date().toISOString(),
      title,
      description,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setHasUnread(true);
  };

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/users", label: "Usuarios", icon: Users },
    { href: "/dashboard/verify-users", label: "Verificar Usuarios", icon: UserCheck },
    { href: "/dashboard/offers", label: "Ofertas", icon: Briefcase },
    { href: "/dashboard/postulations", label: "Postulaciones", icon: ClipboardList },
    { href: "/dashboard/reports", label: "Reportes", icon: FileBarChart },
  ];
  
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
          const message = "Un nuevo usuario se ha unido a la plataforma.";
          toast({ title: "Nuevo Usuario Registrado", description: message });
          addNotification("Nuevo Usuario", message);
      }
      dataCounts.current.users = currentUserCount;

      if (!initialLoadDone.current.users) {
        initialLoadDone.current.users = true;
      }
    }, (error) => {
      console.error("Firebase real-time error (Users):", error);
    });

    return () => off(usersRef, 'value', unsubscribe);
  }, [toast]);

  useEffect(() => {
    if (usersMap.size === 0 && !initialLoadDone.current.users) return;

    const offersRef = ref(db, 'ofertas');
    const unsubscribe = onValue(offersRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const offersData = snapshot.val();
      const newOffersMap = new Map<string, FirebaseJobOffer>();
      Object.keys(offersData).forEach(key => {
          newOffersMap.set(key, offersData[key]);
      });
      setOffersMap(newOffersMap);

      const currentOfferCount = newOffersMap.size;

      if (initialLoadDone.current.offers && currentOfferCount > dataCounts.current.offers) {
        const newOffers: FirebaseJobOffer[] = Array.from(newOffersMap.values());
        const lastOffer = newOffers.sort((a,b) => b.createdAt - a.createdAt)[0];
        
        if (lastOffer) {
          const publisher = usersMap.get(lastOffer.employerId);
          const publisherName = publisher?.nombre_completo || 'un publicador desconocido';
          const message = `${publisherName} ha publicado la oferta: "${lastOffer.cargo}"`;
          toast({ title: "Nueva Oferta Publicada", description: message });
          addNotification("Nueva Oferta", message);
        }
      }
      dataCounts.current.offers = currentOfferCount;
      
      if (!initialLoadDone.current.offers) {
        initialLoadDone.current.offers = true;
      }
    }, (error) => {
      console.error("Firebase real-time error (Offers):", error);
    });

    return () => off(offersRef, 'value', unsubscribe);
  }, [toast, usersMap]);

  useEffect(() => {
    if (usersMap.size === 0 || offersMap.size === 0) return;

    const postulationsRef = ref(db, 'postulaciones');
    const unsubscribe = onValue(postulationsRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const postulationsData = snapshot.val();
      const currentPostulationCount = Object.keys(postulationsData).length;

      if (initialLoadDone.current.postulations && currentPostulationCount > dataCounts.current.postulations) {
          const newPostulations: FirebasePostulation[] = Object.values(postulationsData);
          const lastPostulation = newPostulations.sort((a,b) => b.fechaPostulacion - a.fechaPostulacion)[0];

          if (lastPostulation) {
              const applicant = usersMap.get(lastPostulation.postulanteId);
              const offer = offersMap.get(lastPostulation.offerId);
              
              const applicantName = applicant?.nombre_completo || 'Alguien';
              const offerTitle = offer?.cargo || 'una oferta';

              const message = `${applicantName} se ha postulado a la oferta: "${offerTitle}".`;
              toast({ title: "Nueva Postulación", description: message });
              addNotification("Nueva Postulación", message);
          }
      }
      dataCounts.current.postulations = currentPostulationCount;
      
      if (!initialLoadDone.current.postulations) {
        initialLoadDone.current.postulations = true;
      }

    }, (error) => {
        console.error("Firebase real-time error (Postulations):", error);
    });
    
    return () => off(postulationsRef, 'value', unsubscribe);

  }, [toast, usersMap, offersMap]);


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

  const handleNavClick = (href: string) => {
    if(pathname !== href) {
        showLoader();
    }
    setOpenMobile(false); // Auto-close mobile sidebar
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <Link href="/dashboard" className="flex items-center gap-2 p-2">
            <Image 
              src="https://arkdev.pages.dev/logos/logoarkdevsystem-removebg-preview.png"
              width={32}
              height={32}
              alt="ARK DEV SYSTEM Logo"
            />
            <span className="text-lg font-semibold">ARK ADMIN</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} onClick={() => handleNavClick(item.href)}>
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
          <div className="flex items-center gap-4">
            <DropdownMenu onOpenChange={(open) => !open && setHasUnread(false)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Bell className="h-5 w-5" />
                  {hasUnread && (
                    <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                  )}
                  <span className="sr-only">Ver notificaciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notificaciones
                  {notifications.length > 0 && (
                     <Button variant="link" size="sm" className="h-auto p-0" onClick={() => {setNotifications([]); setHasUnread(false)}}>
                        Limpiar todo
                     </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map(notif => (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start gap-1 whitespace-normal">
                       <p className="font-semibold">{notif.title}</p>
                       <p className="text-sm text-muted-foreground">{notif.description}</p>
                       <p className="text-xs text-muted-foreground/80">{formatDistanceToNow(notif.timestamp, { addSuffix: true, locale: es })}</p>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <p className="p-4 text-center text-sm text-muted-foreground">No hay notificaciones nuevas.</p>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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
          </div>
        </header>
        <main className="relative flex flex-col p-4 sm:p-6 min-h-[calc(100svh_-_56px)]">
          <div className="flex-grow">
            <GlobalLoader />
            {children}
          </div>
          <footer className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Cancheito. Todos los derechos reservados.
            </p>
            <p className="mt-1">
              Powered by ARK DEV SYSTEM, impulsado por IA.
            </p>
          </footer>
        </main>
      </SidebarInset>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GlobalLoaderProvider>
        <SidebarProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
    </GlobalLoaderProvider>
  )
}
