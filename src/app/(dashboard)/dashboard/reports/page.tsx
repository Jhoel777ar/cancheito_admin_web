
"use client";

import { useState, useEffect, useMemo } from "react";
import { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, isWithinInterval, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { FirebaseUser, FirebaseJobOffer, FirebasePostulation, User, JobOffer, Postulation } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Download, Users, Briefcase, ClipboardList } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";
import { useToast } from "@/hooks/use-toast";


function ReportsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-10 w-full sm:w-80" />
                <Skeleton className="h-10 w-full sm:w-32" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        </div>
    );
}

function ChartCard({ title, data, dataKey, name, color }) {
    if (!data || data.length < 2) {
        return (
             <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex h-60 items-center justify-center">
                    <p className="text-muted-foreground">No hay suficientes datos para este periodo.</p>
                </CardContent>
            </Card>
        )
    }
    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false}/>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--border))" }} />
                        <Legend />
                        <Line type="monotone" dataKey={dataKey} name={name} stroke={color} />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}

export default function ReportsPage() {
    const { toast } = useToast();
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allOffers, setAllOffers] = useState<JobOffer[]>([]);
    const [allPostulations, setAllPostulations] = useState<Postulation[]>([]);
    const [usersMap, setUsersMap] = useState(new Map());

    useEffect(() => {
        const usersRef = ref(db, 'Usuarios');
        const offersRef = ref(db, 'ofertas');
        const postulationsRef = ref(db, 'postulaciones');
        
        let initialDataLoaded = { users: false, offers: false, postulations: false };
        
        const checkAllDataLoaded = () => {
            if(Object.values(initialDataLoaded).every(Boolean)) {
                setLoading(false);
            }
        }

        const usersListener = onValue(usersRef, snapshot => {
            const usersData = snapshot.val() || {};
            const usersList: User[] = Object.keys(usersData).map(key => {
                const fbUser: FirebaseUser = usersData[key];
                return {
                    id: fbUser.uid || key,
                    fullName: fbUser.nombre_completo || 'Sin nombre',
                    email: fbUser.email || 'Sin email',
                    registrationDate: format(new Date(fbUser.tiempo_registro || 0), 'yyyy-MM-dd'),
                    profileUrl: fbUser.fotoPerfilUrl || '',
                    isVerified: fbUser.usuario_verificado === true,
                    experience: fbUser.experiencia || 'No especificado',
                    education: fbUser.formacion || 'No especificado',
                    userType: fbUser.tipoUsuario || 'No especificado',
                    location: fbUser.ubicacion || 'No especificado',
                    cvUrl: fbUser.cvUrl || '',
                    accountState: fbUser.estadoCuenta || 'Activa',
                }
            });
            
            const newUsersMap = new Map();
            usersList.forEach(user => newUsersMap.set(user.id, user));
            
            setAllUsers(usersList);
            setUsersMap(newUsersMap);
            initialDataLoaded.users = true;
            checkAllDataLoaded();
        });

        const offersListener = onValue(offersRef, snapshot => {
            const offersData = snapshot.val() || {};
            const offersList: JobOffer[] = Object.keys(offersData).map(key => {
                const fbOffer: FirebaseJobOffer = offersData[key];
                const employer = usersMap.get(fbOffer.employerId);
                return {
                    id: fbOffer.id,
                    title: fbOffer.cargo,
                    employer: {
                        id: employer?.id || fbOffer.employerId,
                        name: employer?.fullName || 'Usuario Desconocido',
                        email: employer?.email || 'Email no disponible',
                        avatarUrl: employer?.profileUrl || ''
                    },
                    location: fbOffer.ubicacion,
                    modality: fbOffer.modalidad,
                    approxPayment: fbOffer.pago_aprox,
                    postedDate: format(new Date(fbOffer.createdAt), 'yyyy-MM-dd'),
                    status: fbOffer.estado === 'ACTIVA' ? 'Activa' : 'Cerrada',
                };
            });
            setAllOffers(offersList);
            initialDataLoaded.offers = true;
            checkAllDataLoaded();
        });

        const postulationsListener = onValue(postulationsRef, snapshot => {
             const postulationsData = snapshot.val() || {};
             const postulationsList: Postulation[] = Object.keys(postulationsData).map(key => {
                 const fbPostulation: FirebasePostulation = postulationsData[key];
                 const applicant = usersMap.get(fbPostulation.postulanteId);
                 const offer = allOffers.find(o => o.id === fbPostulation.offerId);
                 return {
                    id: key,
                    applicant: {
                        id: applicant?.id || fbPostulation.postulanteId,
                        name: applicant?.fullName || 'Usuario Desconocido',
                        email: applicant?.email || 'Email no disponible',
                        avatarUrl: applicant?.profileUrl || ''
                    },
                    offer: {
                        id: offer?.id || fbPostulation.offerId,
                        title: offer?.title || 'Oferta Desconocida',
                        employer: offer?.employer || { id: '', name: 'Publicador Desconocido', email: '', avatarUrl: ''},
                        location: offer?.location || '',
                        modality: offer?.modality || '',
                        approxPayment: offer?.approxPayment || '',
                        postedDate: offer?.postedDate || 'Fecha desconocida',
                        status: offer?.status || 'Cerrada'
                    },
                    postulationDate: format(new Date(fbPostulation.fechaPostulacion), 'yyyy-MM-dd'),
                    postulationStatus: fbPostulation.estado_postulacion || 'Enviada',
                 }
             });
             setAllPostulations(postulationsList);
             initialDataLoaded.postulations = true;
             checkAllDataLoaded();
        });

        return () => {
            off(usersRef, 'value', usersListener);
            off(offersRef, 'value', offersListener);
            off(postulationsRef, 'value', postulationsListener);
        }

    }, [usersMap, allOffers]); // Dependencies to re-enrich data if base data changes

    const filteredData = useMemo(() => {
        if (!date?.from || !date?.to) {
            return { users: [], offers: [], postulations: [], chartData: { users: [], offers: [], postulations: [] } };
        }
        const interval = { start: startOfDay(date.from), end: startOfDay(date.to) };

        const users = allUsers.filter(u => isWithinInterval(new Date(u.registrationDate), interval));
        const offers = allOffers.filter(o => isWithinInterval(new Date(o.postedDate), interval));
        const postulations = allPostulations.filter(p => isWithinInterval(new Date(p.postulationDate), interval));

        const generateChartData = (data, dateField, dataLabel) => {
            const countsByDay = data.reduce((acc, item) => {
                const day = format(new Date(item[dateField]), 'yyyy-MM-dd');
                acc[day] = (acc[day] || 0) + 1;
                return acc;
            }, {});

            return eachDayOfInterval(interval).map(day => {
                const formattedDate = format(day, 'yyyy-MM-dd');
                return {
                    date: format(day, 'MMM d'),
                    [dataLabel]: countsByDay[formattedDate] || 0,
                }
            });
        };

        return {
            users,
            offers,
            postulations,
            chartData: {
                users: generateChartData(users, 'registrationDate', 'Usuarios'),
                offers: generateChartData(offers, 'postedDate', 'Ofertas'),
                postulations: generateChartData(postulations, 'postulationDate', 'Postulaciones'),
            }
        }
    }, [date, allUsers, allOffers, allPostulations]);

    const handleExport = () => {
        const { users, offers, postulations } = filteredData;
        if (users.length === 0 && offers.length === 0 && postulations.length === 0) {
            toast({
                variant: "destructive",
                title: "No hay datos",
                description: "No hay datos para exportar en el rango de fechas seleccionado."
            });
            return;
        }

        const usersCsv = Papa.unparse({
            fields: ["ID", "Nombre Completo", "Email", "Fecha de Registro", "Tipo", "Verificado"],
            data: users.map(u => [u.id, u.fullName, u.email, u.registrationDate, u.userType, u.isVerified])
        });

        const offersCsv = Papa.unparse({
            fields: ["ID", "Cargo", "Publicador", "Fecha de Publicación", "Estado"],
            data: offers.map(o => [o.id, o.title, o.employer.name, o.postedDate, o.status])
        });

        const postulationsCsv = Papa.unparse({
            fields: ["ID", "Postulante", "Oferta", "Publicador", "Fecha de Postulación", "Estado"],
            data: postulations.map(p => [p.id, p.applicant.name, p.offer.title, p.offer.employer.name, p.postulationDate, p.postulationStatus])
        });

        const csvString = [
            "Usuarios",
            usersCsv,
            "\nOfertas",
            offersCsv,
            "\nPostulaciones",
            postulationsCsv
        ].join("\n");
        
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `reporte_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }


    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                <ReportsSkeleton />
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
                <div className="flex items-center gap-4">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal sm:w-80"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y", {locale: es})} -{" "}
                                            {format(date.to, "LLL dd, y", {locale: es})}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Selecciona un rango</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Resumen del Periodo</CardTitle>
                    <CardDescription>
                        Totales para el rango de fechas seleccionado.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <StatsCard title="Nuevos Usuarios" value={filteredData.users.length} icon={Users} />
                        <StatsCard title="Nuevas Ofertas" value={filteredData.offers.length} icon={Briefcase} />
                        <StatsCard title="Nuevas Postulaciones" value={filteredData.postulations.length} icon={ClipboardList} />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                <ChartCard title="Tendencia de Usuarios" data={filteredData.chartData.users} dataKey="Usuarios" name="Usuarios" color="#8884d8"/>
                <ChartCard title="Tendencia de Ofertas" data={filteredData.chartData.offers} dataKey="Ofertas" name="Ofertas" color="#82ca9d"/>
                <ChartCard title="Tendencia de Postulaciones" data={filteredData.chartData.postulations} dataKey="Postulaciones" name="Postulaciones" color="#ffc658"/>
            </div>

        </div>
    );
}

