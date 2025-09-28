
"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "../ui/skeleton";

type PredictionPoint = { date: string; prediction: number; };
type UserPredictionChartProps = {
    predictions: PredictionPoint[] | undefined;
    isLoading: boolean;
}

function ChartSkeleton() {
    return (
        <Card className="bg-card/80 backdrop-blur-sm animate-pulse">
            <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[250px] w-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                </div>
            </CardContent>
        </Card>
    )
}

export function UserPredictionChart({ predictions, isLoading }: UserPredictionChartProps) {
  if (isLoading) {
    return <ChartSkeleton />
  }
  
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Predicción de Usuarios (IA)</CardTitle>
        <CardDescription>Nuevos usuarios previstos para los próximos 7 días.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={250}>
           {predictions && predictions.length > 0 ? (
            <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                dataKey="date"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
                allowDecimals={false}
                />
                <Tooltip
                contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                }}
                labelFormatter={(label) => `Fecha: ${label}`}
                formatter={(value: number) => [value, 'Predicción']}
                />
                <Line
                type="monotone"
                dataKey="prediction"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--chart-1))" }}
                activeDot={{ r: 8, style: { stroke: "hsl(var(--chart-1))", strokeWidth: 2 } }}
                />
            </LineChart>
           ) : (
             <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground text-sm">No se pudieron generar predicciones.</p>
             </div>
           )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
