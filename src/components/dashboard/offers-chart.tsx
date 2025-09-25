
"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type OffersChartProps = {
    data: { date: string; signups: number }[];
}

export function OffersChart({ data }: OffersChartProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Resumen de Ofertas</CardTitle>
        <CardDescription>Ofertas de trabajo publicadas en los últimos 7 días.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
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
               formatter={(value: number) => [value, 'Ofertas']}
            />
            <Line
              type="monotone"
              dataKey="signups"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 4, fill: "hsl(var(--chart-2))" }}
              activeDot={{ r: 8, style: { stroke: "hsl(var(--chart-2))", strokeWidth: 2 } }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
