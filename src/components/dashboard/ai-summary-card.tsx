
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Lightbulb, TrendingUp, AlertTriangle, Loader2, Info } from "lucide-react";
import type { DashboardSummaryOutput } from "@/ai/flows/dashboard-summary-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AISummaryCardProps = {
  summary: DashboardSummaryOutput | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  nextUpdate: string | null;
}

function LoadingState() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm animate-pulse">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Análisis y Recomendaciones de IA
        </CardTitle>
        <CardDescription>
          Generando resumen inteligente de la actividad de tu plataforma...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

export function AISummaryCard({ summary, isLoading, error, lastUpdated, nextUpdate }: AISummaryCardProps) {
  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <Card className="bg-destructive/10 border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle />
            Error de Análisis de IA
          </CardTitle>
          <CardDescription className="text-destructive/80">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive/90">
            El servicio de IA puede estar experimentando problemas o la clave de API no está configurada correctamente. Se reintentará automáticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null; // Or a placeholder card
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Análisis y Recomendaciones de IA
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          Resumen inteligente de la actividad de tu plataforma.
           {lastUpdated && nextUpdate && (
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Última actualización: {lastUpdated}</p>
                  <p>Próxima actualización: {nextUpdate}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
           )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-base mb-2">Resumen Ejecutivo</h3>
          <p className="text-sm text-muted-foreground">{summary.executiveSummary}</p>
        </div>

        <div>
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5"/>
            Observaciones Clave
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
            {summary.keyObservations.map((obs, i) => <li key={i}>{obs}</li>)}
          </ul>
        </div>
        
        <div>
          <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
            <Lightbulb className="h-5 w-5"/>
            Recomendaciones
          </h3>
          <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
            {summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
          </ul>
        </div>

      </CardContent>
    </Card>
  )
}
