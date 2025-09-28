
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { FirebaseUser, User, JobOffer, FirebaseJobOffer, Postulation, FirebasePostulation } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase, GraduationCap, MapPin, Calendar, CheckCircle, XCircle, Edit, UserX, UserCheck, AlertTriangle, Loader2 } from "lucide-react";
import { userOfferColumns } from "@/components/dashboard/offers/columns";
import { userPostulationColumns } from "@/components/dashboard/postulations/columns";
import { DataTable } from "@/components/dashboard/data-table/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { UserEditDialog } from "@/components/dashboard/users/user-edit-dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getAccountControlReasoning, updateUserAccountState, updateUserVerification } from "@/app/(dashboard)/dashboard/users/actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { OfferActionsCell } from "@/components/dashboard/offers/offer-actions-cell";

function getInitials(name: string) {
    if (!name) return "S/N";
    return name.split(' ').map(n => n[0]).slice(0, 2).join('');
}

function UserProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48" />
                            <Skeleton className="h-5 w-64" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                    </div>
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
    const { toast } = useToast();
    const isMobile = useIsMobile();

    const [user, setUser] = useState<User | null>(null);
    const [userOffers, setUserOffers] = useState<JobOffer[]>([]);
    const [userPostulations, setUserPostulations] = useState<Postulation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [alertContent, setAlertContent] = useState({
        title: "",
        description: "",
        action: () => {},
        actionLabel: "",
        actionVariant: "default" as "default" | "destructive"
    });
    
    const [offerFilter, setOfferFilter] = useState("");
    const [postulationFilter, setPostulationFilter] = useState("");


    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        const userRef = ref(db, `Usuarios/${userId}`);
        const offersRef = ref(db, 'ofertas');
        const usersRef = ref(db, 'Usuarios');
        const postulationsRef = ref(db, 'postulaciones');

        let usersData: { [id: string]: FirebaseUser } = {};
        let offersData: { [id: string]: FirebaseJobOffer } = {};
        
        const allUsersListener = onValue(usersRef, (snapshot) => {
            usersData = snapshot.val() || {};
        });

        const allOffersListener = onValue(offersRef, (snapshot) => {
            offersData = snapshot.val() || {};
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
             setLoading(false);
        });

        const userOffersListener = onValue(offersRef, (snapshot) => {
            const offersList: JobOffer[] = [];
            if (snapshot.exists()) {
                const allOffersData = snapshot.val();
                const employerData = usersData[userId];

                Object.keys(allOffersData).forEach(key => {
                    const fbOffer: FirebaseJobOffer = allOffersData[key];
                    if (fbOffer.employerId === userId) {
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
                 setUserOffers(offersList.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()));
            }
        });
        
        const postulationsListener = onValue(postulationsRef, (snapshot) => {
            if (!snapshot.exists()) {
                setUserPostulations([]);
                return;
            }

            const postulationsData = snapshot.val();
            const postulationsList: Postulation[] = [];

            Object.keys(postulationsData).forEach(key => {
                const fbPostulation: FirebasePostulation = postulationsData[key];
                
                if (fbPostulation.postulanteId === userId) {
                    const applicant = usersData[fbPostulation.postulanteId];
                    const offer = offersData[fbPostulation.offerId];
                    const employer = offer ? usersData[offer.employerId] : undefined;

                    postulationsList.push({
                      id: key,
                      applicant: {
                        id: applicant?.uid || fbPostulation.postulanteId,
                        name: applicant?.nombre_completo || 'Usuario Desconocido',
                        email: applicant?.email || 'Email no disponible',
                        avatarUrl: applicant?.fotoPerfilUrl || ''
                      },
                      offer: {
                        id: offer?.id || fbPostulation.offerId,
                        title: offer?.cargo || 'Oferta Desconocida',
                        employer: {
                            id: employer?.uid || offer?.employerId || '',
                            name: employer?.nombre_completo || 'Publicador Desconocido',
                            email: employer?.email || '',
                            avatarUrl: employer?.fotoPerfilUrl || ''
                        },
                        location: offer?.ubicacion || '',
                        modality: offer?.modalidad || '',
                        approxPayment: offer?.pago_aprox || '',
                        postedDate: offer ? format(new Date(offer.createdAt), 'yyyy-MM-dd') : 'Fecha desconocida',
                        status: offer?.estado === 'ACTIVA' ? 'Activa' : 'Cerrada'
                      },
                      postulationDate: fbPostulation.fechaPostulacion ? format(new Date(fbPostulation.fechaPostulacion), 'yyyy-MM-dd HH:mm') : 'Fecha desconocida',
                      postulationStatus: fbPostulation.estado_postulacion || 'Enviada',
                    });
                }
            });
            setUserPostulations(postulationsList.sort((a, b) => new Date(b.postulationDate).getTime() - new Date(a.postulationDate).getTime()));
        });


        return () => {
            off(userRef, 'value', userListener);
            off(offersRef, 'value', userOffersListener);
            off(postulationsRef, 'value', postulationsListener);
            off(usersRef, 'value', allUsersListener);
            off(offersRef, 'value', allOffersListener);
        };

    }, [userId]);

    const handleVerificationChange = async (isVerified: boolean) => {
        if (!user) return;
        const result = await updateUserVerification(user.id, isVerified);
        if(result.success) {
            toast({
                title: "Verificación Actualizada",
                description: `El usuario ${user.fullName} ahora está ${isVerified ? 'verificado' : 'no verificado'}.`
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error al Verificar",
                description: result.error || "No se pudo actualizar el estado de verificación."
            })
        }
    }

    const handleAccountStateAction = async (actionType: "activate" | "suspend") => {
        if (!user) return;
        
        setIsActionLoading(true);

        const result = await getAccountControlReasoning(actionType, user);
        
        setIsActionLoading(false);

        if (result.success) {
            setAlertContent({
                title: `Confirmar ${actionType === 'activate' ? 'Activación' : 'Suspensión'}`,
                description: result.reasoning || "¿Estás seguro de que quieres proceder?",
                action: () => confirmAccountStateChange(actionType),
                actionLabel: `Confirmar`,
                actionVariant: actionType === 'suspend' ? 'destructive' : 'default',
            });
        } else {
             setAlertContent({
                title: "Error de IA",
                description: result.error || "No se pudo obtener el razonamiento de la IA. ¿Deseas continuar de todos modos?",
                action: () => confirmAccountStateChange(actionType),
                actionLabel: "Continuar de todos modos",
                actionVariant: actionType === 'suspend' ? 'destructive' : 'default',
            });
        }
        setIsAlertOpen(true);
    };

    const confirmAccountStateChange = async (actionType: "activate" | "suspend") => {
        if (!user) return;
        
        setIsActionLoading(true);
        const newState = actionType === 'activate' ? 'Activa' : 'Desactivada';
        const result = await updateUserAccountState(user.id, newState);
        setIsActionLoading(false);
        setIsAlertOpen(false);

        if (result.success) {
            toast({
                title: `Usuario ${newState === 'Activa' ? 'Activado' : 'Suspendido'}`,
                description: `La cuenta de ${user.fullName} ha sido actualizada.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Error al Actualizar",
                description: result.error || "Ocurrió un error inesperado.",
            });
        }
    };
    
    const filteredOffers = userOffers.filter(offer => 
        offer.title.toLowerCase().includes(offerFilter.toLowerCase())
    );

    const filteredPostulations = userPostulations.filter(postulation => 
        postulation.offer.title.toLowerCase().includes(postulationFilter.toLowerCase())
    );


    if (loading) {
        return <UserProfileSkeleton />;
    }

    if (!user) {
        return (
            <div className="flex h-full items-center justify-center">
                <Card className="p-8 text-center">
                    <CardTitle>Usuario no encontrado</CardTitle>
                    <p className="mt-2 text-muted-foreground">No se pudo encontrar el usuario con el ID proporcionado.</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="text-primary" />
                        {alertContent.title}
                    </div>
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                    {alertContent.description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={alertContent.action} className={alertContent.actionVariant === 'destructive' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : ''}>
                    {alertContent.actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <UserEditDialog user={user} isOpen={isEditOpen} setIsOpen={setIsEditOpen} />
            
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <h1 className="text-3xl font-bold tracking-tight">Perfil de {user.userType === 'empleador' ? 'Publicador' : 'Usuario'}</h1>
                 <div className="flex flex-col w-full gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                        <Edit size={16} className="mr-2"/>
                        Editar Perfil
                    </Button>
                     {user.accountState === 'Activa' ? (
                        <Button variant="destructive" onClick={() => handleAccountStateAction('suspend')} disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <UserX size={16} className="mr-2" />}
                            Suspender Cuenta
                        </Button>
                    ) : (
                        <Button variant="secondary" onClick={() => handleAccountStateAction('activate')} disabled={isActionLoading}>
                            {isActionLoading ? <Loader2 size={16} className="mr-2 animate-spin" /> : <UserCheck size={16} className="mr-2" />}
                            Activar Cuenta
                        </Button>
                    )}
                </div>
            </div>

            <Card className="overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex flex-col items-start gap-4 border-b p-4 sm:flex-row sm:items-center sm:p-6">
                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                        <AvatarImage src={user.profileUrl} data-ai-hint="person face" alt={user.fullName} />
                        <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <CardTitle className="flex flex-wrap items-center gap-2 text-2xl">
                            {user.fullName}
                            <Badge variant={user.accountState === 'Activa' ? 'secondary' : 'destructive'}>{user.accountState}</Badge>
                        </CardTitle>
                        <p className="flex items-center gap-2 text-sm text-muted-foreground break-all sm:text-base">
                            <Mail size={14} /> {user.email}
                        </p>
                    </div>
                     <div className="flex w-full items-center justify-start space-x-2 border-t pt-4 sm:w-auto sm:justify-end sm:border-none sm:pt-0">
                        <Label htmlFor={`verify-switch-${user.id}`} className="flex-1 font-medium sm:flex-initial">
                            {user.isVerified ? "Usuario Verificado" : "Verificar Usuario"}
                        </Label>                        
                        <Switch
                            id={`verify-switch-${user.id}`}
                            checked={user.isVerified}
                            onCheckedChange={handleVerificationChange}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 md:grid-cols-3">
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            <Briefcase size={16} className="text-primary" />
                            <strong>Tipo:</strong> {user.userType}
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            <GraduationCap size={16} className="text-primary" />
                            <strong>Formación:</strong> {user.education}
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            <MapPin size={16} className="text-primary" />
                            <strong>Ubicación:</strong> {user.location}
                        </div>
                        <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                           <Calendar size={16} className="text-primary" />
                            <strong>Registrado:</strong> {user.registrationDate}
                        </div>
                         <div className="flex items-center gap-2 rounded-md bg-muted/50 p-2">
                            {user.cvUrl ? (
                                <a href={user.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <CheckCircle size={16} /> <strong>CV Adjunto</strong>
                                </a>
                            ) : (
                                <>
                                    <XCircle size={16} className="text-destructive" /> <strong>Sin CV</strong>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {user.userType === 'empleador' && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Ofertas Publicadas ({userOffers.length})</h2>
                    {isMobile ? (
                        <div className="space-y-4">
                            <Input 
                                placeholder="Filtrar ofertas publicadas..."
                                value={offerFilter}
                                onChange={(e) => setOfferFilter(e.target.value)}
                            />
                            {filteredOffers.length > 0 ? filteredOffers.map(offer => (
                                <Card key={offer.id} className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="font-semibold">{offer.title}</p>
                                                <p className="text-sm text-muted-foreground">{offer.location} - <Badge variant="outline">{offer.modality}</Badge></p>
                                            </div>
                                            <OfferActionsCell row={{ original: offer }} />
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
                                            <span>Publicado: {offer.postedDate}</span>
                                            <Badge variant={offer.status === 'Activa' ? 'secondary' : 'destructive'}>
                                                {offer.status}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <p className="text-center text-muted-foreground py-10">No se encontraron ofertas.</p>
                            )}
                        </div>
                    ) : (
                        <DataTable
                            columns={userOfferColumns}
                            data={userOffers}
                            filterColumn="title"
                            filterPlaceholder="Filtrar ofertas publicadas..."
                        />
                    )}
                </div>
            )}
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Postulaciones Realizadas ({userPostulations.length})</h2>
                 {isMobile ? (
                     <div className="space-y-4">
                        <Input 
                            placeholder="Filtrar postulaciones..."
                            value={postulationFilter}
                            onChange={(e) => setPostulationFilter(e.target.value)}
                        />
                        {filteredPostulations.length > 0 ? filteredPostulations.map(postulation => {
                             const status = postulation.postulationStatus.toLowerCase();
                             let variant: "secondary" | "destructive" | "default" | "outline" = "outline";
                             if (status === 'aceptada') variant = 'secondary';
                             if (status === 'rechazada') variant = 'destructive';
                             if (status === 'revisada') variant = 'default';

                             return (
                                <Card key={postulation.id} className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-4 space-y-2">
                                        <p className="font-semibold">{postulation.offer.title}</p>
                                        <p className="text-sm text-muted-foreground">Publicado por: {postulation.offer.employer.name}</p>
                                        <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
                                            <span>Postulado: {postulation.postulationDate}</span>
                                            <Badge variant={variant} className="capitalize">{status}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                             )
                        }) : (
                            <p className="text-center text-muted-foreground py-10">No se encontraron postulaciones.</p>
                        )}
                    </div>
                ) : (
                    <DataTable
                        columns={userPostulationColumns}
                        data={userPostulations}
                        filterColumn="offer.title"
                        filterPlaceholder="Filtrar postulaciones..."
                    />
                )}
            </div>
        </div>
    );
}
