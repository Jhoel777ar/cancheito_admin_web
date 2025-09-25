
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { FirebaseUser, User, JobOffer, FirebaseJobOffer } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Briefcase, GraduationCap, MapPin, Calendar, CheckCircle, XCircle, Edit, UserX, UserCheck, AlertTriangle, Loader2 } from "lucide-react";
import { userOfferColumns } from "@/components/dashboard/offers/columns";
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

    const [user, setUser] = useState<User | null>(null);
    const [userOffers, setUserOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // State for alert dialog
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [alertContent, setAlertContent] = useState({
        title: "",
        description: "",
        action: () => {},
        actionLabel: "",
        actionVariant: "default" as "default" | "destructive"
    });

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        const userRef = ref(db, `Usuarios/${userId}`);
        const offersRef = ref(db, 'ofertas');

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

        const offersListener = onValue(offersRef, (snapshot) => {
            const offersList: JobOffer[] = [];
            if (snapshot.exists()) {
                const offersData = snapshot.val();
                const userRef = ref(db, `Usuarios/${userId}`);
                
                onValue(userRef, (userSnapshot) => {
                    const employerData = userSnapshot.val();

                    Object.keys(offersData).forEach(key => {
                        const fbOffer: FirebaseJobOffer = offersData[key];
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
                }, { onlyOnce: true });
            }
        });

        return () => {
            off(userRef, 'value', userListener);
            off(offersRef, 'value', offersListener);
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
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Perfil de Publicador</h1>
                 <div className="flex items-center gap-2">
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
                     <div className="flex items-center space-x-2">
                        <Label htmlFor={`verify-switch-${user.id}`} className="font-medium">
                            {user.isVerified ? "Usuario Verificado" : "Verificar Usuario"}
                        </Label>
                        <Switch
                            id={`verify-switch-${user.id}`}
                            checked={user.isVerified}
                            onCheckedChange={handleVerificationChange}
                        />
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

    