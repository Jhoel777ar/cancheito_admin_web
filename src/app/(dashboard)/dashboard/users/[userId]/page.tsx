
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, get, onValue, off } from "firebase/database";
import type { FirebaseUser, User, JobOffer, FirebaseJobOffer } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase, GraduationCap, MapPin, Calendar, CheckCircle, XCircle } from "lucide-react";
import { userOfferColumns } from "@/components/dashboard/offers/columns";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

function getInitials(name: string) {
    if (!name) return "S/N";
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

function UserProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-7 w-40" />
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col space-y-3 p-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.userId as string;

    const [user, setUser] = useState<User | null>(null);
    const [userOffers, setUserOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const userRef = ref(db, `Usuarios/${userId}`);
        const offersRef = ref(db, 'ofertas');
        const usersRef = ref(db, 'Usuarios');

        let allUsersData: any = {};

        // Fetch all users once for mapping employer names
        get(usersRef).then(usersSnapshot => {
            if (usersSnapshot.exists()) {
                allUsersData = usersSnapshot.val();
            }
        });

        const userListener = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const fbUser: FirebaseUser = snapshot.val();
                setUser({
                    id: userId,
                    fullName: fbUser.nombre_completo || 'Sin nombre',
                    email: fbUser.email || 'Sin email',
                    registrationDate: fbUser.tiempo_registro ? format(new Date(fbUser.tiempo_registro), 'yyyy-MM-dd') : 'Fecha desconocida',
                    profileUrl: fbUser.fotoPerfilUrl || '',
                    isVerified: fbUser.usuario_verificado === true,
                    experience: fbUser.experiencia || 'No especificado',
                    education: fbUser.formacion || 'No especificado',
                    userType: fbUser.tipoUsuario || 'No especificado',
                    location: fbUser.ubicacion || 'No especificado',
                    cvUrl: fbUser.cvUrl || '',
                    accountState: fbUser.estadoCuenta || 'Activa',
                    commercialName: fbUser.nombreComercial,
                    industry: fbUser.rubro,
                    description: fbUser.descripcion,
                });
            } else {
                setUser(null);
            }
        });

        const offersListener = onValue(offersRef, (snapshot) => {
            const offersList: JobOffer[] = [];
            if (snapshot.exists()) {
                const offersData = snapshot.val();
                Object.keys(offersData).forEach(key => {
                    const fbOffer: FirebaseJobOffer = offersData[key];
                    if (fbOffer.employerId === userId) {
                        const employerData = allUsersData[fbOffer.employerId];
                        offersList.push({
                            id: fbOffer.id,
                            title: fbOffer.cargo,
                            employer: {
                                id: userId,
                                name: employerData?.nombre_completo || 'Usuario Desconocido',
                                email: employerData?.email || 'Email no disponible',
                                avatarUrl: employerData?.fotoPerfilUrl || ''
                            },
                            location: fbOffer.ubicacion,
                            modality: fbOffer.modalidad,
                            approxPayment: fbOffer.pago_aprox,
                            postedDate: format(new Date(fbOffer.createdAt), 'yyyy-MM-dd'),
                            status: fbOffer.estado === 'ACTIVA' ? 'Activa' : 'Cerrada',
                        });
                    }
                });
            }
            setUserOffers(offersList.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
            setLoading(false);
        });


        return () => {
            off(userRef, 'value', userListener);
            off(offersRef, 'value', offersListener);
        };

    }, [userId]);

    if (loading) {
        return <UserProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="p-8 text-center">
                    <CardTitle>Usuario no encontrado</CardTitle>
                    <p className="text-muted-foreground mt-2">No se pudo encontrar el usuario con el ID proporcionado.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Perfil de Publicador</h1>
            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            {user.fullName}
                            <Badge variant={user.accountState === 'Activa' ? 'secondary' : 'destructive'}>{user.accountState}</Badge>
                        </CardTitle>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Mail size={14} /> {user.email}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <Briefcase size={16} className="text-primary" />
                            <strong>Tipo:</strong> {user.userType}
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <GraduationCap size={16} className="text-primary" />
                            <strong>Formación:</strong> {user.education}
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            <MapPin size={16} className="text-primary" />
                            <strong>Ubicación:</strong> {user.location}
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                           <Calendar size={16} className="text-primary" />
                            <strong>Registrado:</strong> {user.registrationDate}
                        </div>
                         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                            {user.isVerified ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                            <strong>Verificado:</strong> {user.isVerified ? "Sí" : "No"}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Ofertas Publicadas ({userOffers.length})</h2>
                <DataTable
                    columns={userOfferColumns}
                    data={userOffers}
                    filterColumn="title"
                    filterPlaceholder="Filtrar ofertas de este usuario..."
                />
            </div>
        </div>
    );
}
