
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { DateRange } from "react-day-picker";
import { subDays, format, startOfDay, endOfDay, isWithinInterval, eachDayOfInterval } from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/firebase";
import { ref, onValue, off } from "firebase/database";
import type { FirebaseUser, FirebaseJobOffer, FirebasePostulation, User, JobOffer, Postulation } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar as CalendarIcon, Download, Users, Briefcase, ClipboardList, ChevronDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";


function ReportsSkeleton() {
    const isMobile = useIsMobile();
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                 <Skeleton className={isMobile ? "h-10 w-full" : "h-10 w-80"} />
                 <Skeleton className={isMobile ? "h-10 w-full" : "h-10 w-32"} />
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
    const isMobile = useIsMobile();
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 29),
        to: new Date(),
    });

    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allOffers, setAllOffers] = useState<JobOffer[]>([]);
    const [allPostulations, setAllPostulations] = useState<Postulation[]>([]);
    
    const usersMapRef = useRef(new Map<string, User>());
    const offersMapRef = useRef(new Map<string, JobOffer>());

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
                    registrationDate: fbUser.tiempo_registro ? format(new Date(fbUser.tiempo_registro), 'yyyy-MM-dd') : 'Fecha desconocida',
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
            
            usersMapRef.current.clear();
            usersList.forEach(user => usersMapRef.current.set(user.id, user));
            
            setAllUsers(usersList);
            initialDataLoaded.users = true;
            checkAllDataLoaded();
        }, (error) => {
            console.error("Firebase users read error:", error);
            initialDataLoaded.users = true;
            checkAllDataLoaded();
        });

        const offersListener = onValue(offersRef, snapshot => {
            const offersData = snapshot.val() || {};
            const offersList: JobOffer[] = Object.keys(offersData).map(key => {
                const fbOffer: FirebaseJobOffer = offersData[key];
                const employer = usersMapRef.current.get(fbOffer.employerId);
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
                    postedDate: fbOffer.createdAt ? format(new Date(fbOffer.createdAt), 'yyyy-MM-dd') : 'Fecha desconocida',
                    status: fbOffer.estado === 'ACTIVA' ? 'Activa' : 'Cerrada',
                };
            });

            offersMapRef.current.clear();
            offersList.forEach(offer => offersMapRef.current.set(offer.id, offer));
            setAllOffers(offersList);
            initialDataLoaded.offers = true;
            checkAllDataLoaded();
        }, (error) => {
            console.error("Firebase offers read error:", error);
            initialDataLoaded.offers = true;
            checkAllDataLoaded();
        });

        const postulationsListener = onValue(postulationsRef, snapshot => {
             const postulationsData = snapshot.val() || {};
             const postulationsList: Postulation[] = Object.keys(postulationsData).map(key => {
                 const fbPostulation: FirebasePostulation = postulationsData[key];
                 const applicant = usersMapRef.current.get(fbPostulation.postulanteId);
                 const offer = offersMapRef.current.get(fbPostulation.offerId);
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
                    postulationDate: fbPostulation.fechaPostulacion ? format(new Date(fbPostulation.fechaPostulacion), 'yyyy-MM-dd') : 'Fecha desconocida',
                    postulationStatus: fbPostulation.estado_postulacion || 'Enviada',
                 }
             });
             setAllPostulations(postulationsList);
             initialDataLoaded.postulations = true;
             checkAllDataLoaded();
        }, (error) => {
            console.error("Firebase postulations read error:", error);
            initialDataLoaded.postulations = true;
            checkAllDataLoaded();
        });

        return () => {
            off(usersRef, 'value', usersListener);
            off(offersRef, 'value', offersListener);
            off(postulationsRef, 'value', postulationsListener);
        }
    }, []);

    const filteredData = useMemo(() => {
        if (!date?.from || !date?.to) {
            return { users: [], offers: [], postulations: [], chartData: { users: [], offers: [], postulations: [] } };
        }
        const interval = { start: startOfDay(date.from), end: endOfDay(date.to) };

        const users = allUsers.filter(u => u.registrationDate !== 'Fecha desconocida' && isWithinInterval(new Date(u.registrationDate), interval));
        const offers = allOffers.filter(o => o.postedDate !== 'Fecha desconocida' && isWithinInterval(new Date(o.postedDate), interval));
        const postulations = allPostulations.filter(p => p.postulationDate !== 'Fecha desconocida' && isWithinInterval(new Date(p.postulationDate), interval));

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

    const handleCSVExport = () => {
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
            fields: ["ID Usuario", "Nombre Completo", "Email", "Fecha Registro", "Tipo Usuario", "Estado Cuenta", "Verificado", "Ubicación", "Formación", "Experiencia"],
            data: users.map(u => [u.id, u.fullName, u.email, u.registrationDate, u.userType, u.accountState, u.isVerified, u.location, u.education, u.experience])
        });

        const offersCsv = Papa.unparse({
            fields: ["ID Oferta", "Cargo", "ID Publicador", "Nombre Publicador", "Email Publicador", "Fecha Publicación", "Estado Oferta", "Ubicación", "Modalidad", "Pago Aprox."],
            data: offers.map(o => [o.id, o.title, o.employer.id, o.employer.name, o.employer.email, o.postedDate, o.status, o.location, o.modality, o.approxPayment])
        });

        const postulationsCsv = Papa.unparse({
            fields: ["ID Postulación", "ID Postulante", "Nombre Postulante", "Email Postulante", "ID Oferta", "Título Oferta", "ID Publicador", "Nombre Publicador", "Fecha Postulación", "Estado Postulación"],
            data: postulations.map(p => [p.id, p.applicant.id, p.applicant.name, p.applicant.email, p.offer.id, p.offer.title, p.offer.employer.id, p.offer.employer.name, p.postulationDate, p.postulationStatus])
        });

        const csvString = [
            "Usuarios",
            usersCsv,
            "\nOfertas",
            offersCsv,
            "\nPostulaciones",
            postulationsCsv
        ].join("\n");
        
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const fromDate = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
        const toDate = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
        link.setAttribute("download", `reporte_${fromDate}_a_${toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    const handleExcelExport = () => {
        const { users, offers, postulations } = filteredData;
        if (users.length === 0 && offers.length === 0 && postulations.length === 0) {
            toast({
                variant: "destructive",
                title: "No hay datos",
                description: "No hay datos para exportar en el rango de fechas seleccionado."
            });
            return;
        }

        const wb = XLSX.utils.book_new();

        const processSheet = (data, headers, sheetName) => {
            const ws_data = [
                headers,
                ...data
            ];
            const ws = XLSX.utils.aoa_to_sheet(ws_data);

            // Style headers
            const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFD9EAD3" } }, border: { bottom: { style: "thin" } } };
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const addr = XLSX.utils.encode_cell({ r: 0, c: C });
                ws[addr].s = headerStyle;
            }

            // Auto-fit columns
            const colWidths = headers.map((_, i) => ({
                wch: Math.max(
                    headers[i].length,
                    ...data.map(row => (row[i] ? String(row[i]).length : 0))
                )
            }));
            ws['!cols'] = colWidths;

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
        };
        
        processSheet(
             users.map(u => [u.id, u.fullName, u.email, u.registrationDate, u.userType, u.accountState, u.isVerified, u.location, u.education, u.experience]),
            ["ID Usuario", "Nombre Completo", "Email", "Fecha Registro", "Tipo Usuario", "Estado Cuenta", "Verificado", "Ubicación", "Formación", "Experiencia"],
            "Usuarios"
        );
        
        processSheet(
            offers.map(o => [o.id, o.title, o.employer.id, o.employer.name, o.employer.email, o.postedDate, o.status, o.location, o.modality, o.approxPayment]),
            ["ID Oferta", "Cargo", "ID Publicador", "Nombre Publicador", "Email Publicador", "Fecha Publicación", "Estado Oferta", "Ubicación", "Modalidad", "Pago Aprox."],
            "Ofertas"
        );

        processSheet(
             postulations.map(p => [p.id, p.applicant.id, p.applicant.name, p.applicant.email, p.offer.id, p.offer.title, p.offer.employer.id, p.offer.employer.name, p.postulationDate, p.postulationStatus]),
            ["ID Postulación", "ID Postulante", "Nombre Postulante", "Email Postulante", "ID Oferta", "Título Oferta", "ID Publicador", "Nombre Publicador", "Fecha Postulación", "Estado Postulación"],
            "Postulaciones"
        );

        const fromDate = date?.from ? format(date.from, 'yyyy-MM-dd') : '';
        const toDate = date?.to ? format(date.to, 'yyyy-MM-dd') : '';
        XLSX.writeFile(wb, `reporte_${fromDate}_a_${toDate}.xlsx`);
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
                <div className="flex flex-col items-center gap-4 sm:flex-row">
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
                                numberOfMonths={isMobile ? 1 : 2}
                                locale={es}
                            />
                        </PopoverContent>
                    </Popover>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Download className="mr-2 h-4 w-4" />
                                Exportar
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={handleCSVExport}>
                                Exportar como CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExcelExport}>
                                Exportar como Excel (.xlsx)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                <ChartCard title="Tendencia de Usuarios" data={filteredData.chartData.users} dataKey="Usuarios" name="Usuarios" color="hsl(var(--chart-1))"/>
                <ChartCard title="Tendencia de Ofertas" data={filteredData.chartData.offers} dataKey="Ofertas" name="Ofertas" color="hsl(var(--chart-2))"/>
                <ChartCard title="Tendencia de Postulaciones" data={filteredData.chartData.postulations} dataKey="Postulaciones" name="Postulaciones" color="hsl(var(--chart-4))"/>
            </div>

        </div>
    );
}
