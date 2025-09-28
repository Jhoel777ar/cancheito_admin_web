
'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating a dashboard summary.
 *
 * It exports:
 * - `generateDashboardSummary`: The main function to trigger the summary flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardSummaryInputSchema = z.object({
  totalUsers: z.number().describe('El número total de usuarios registrados en la plataforma.'),
  newUsersLast30Days: z.number().describe('El número de nuevos usuarios registrados en los últimos 30 días.'),
  totalOffers: z.number().describe('El número total de ofertas de trabajo publicadas.'),
  newOffersLast30Days: z.number().describe('El número de nuevas ofertas publicadas en los últimos 30 días.'),
  activeOffers: z.number().describe('El número de ofertas que están actualmente activas.'),
  closedOffers: z.number().describe('El número de ofertas que están cerradas.'),
});
type DashboardSummaryInput = z.infer<typeof DashboardSummaryInputSchema>;

const DashboardSummaryOutputSchema = z.object({
  executiveSummary: z.string().describe('Un resumen ejecutivo en español sobre el estado de la plataforma, de 2 a 3 párrafos.'),
  keyObservations: z.array(z.string()).describe('Una lista de 3 a 4 observaciones clave o puntos destacados.'),
  recommendations: z.array(z.string()).describe('Una lista de 2 a 3 recomendaciones accionables para el administrador.'),
});
type DashboardSummaryOutput = z.infer<typeof DashboardSummaryOutputSchema>;

export async function generateDashboardSummary(input: DashboardSummaryInput): Promise<DashboardSummaryOutput> {
  return dashboardSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dashboardSummaryPrompt',
  input: {schema: DashboardSummaryInputSchema},
  output: {schema: DashboardSummaryOutputSchema},
  prompt: `Eres un analista de datos experto y consultor de negocios para una plataforma de búsqueda de empleo. Tu tarea es analizar las métricas clave del dashboard y proporcionar un informe conciso y estratégico para el administrador de la plataforma. Responde SIEMPRE en español.

**Métricas Clave del Dashboard:**
*   **Usuarios Totales:** {{{totalUsers}}}
*   **Nuevos Usuarios (últimos 30 días):** {{{newUsersLast30Days}}}
*   **Ofertas Totales:** {{{totalOffers}}}
*   **Nuevas Ofertas (últimos 30 días):** {{{newOffersLast30Days}}}
*   **Ofertas Activas:** {{{activeOffers}}}
*   **Ofertas Cerradas:** {{{closedOffers}}}

**Tu Tarea:**
Basado en estos datos, genera el siguiente informe en el formato JSON solicitado:

1.  **Resumen Ejecutivo:** Escribe un resumen de 2 a 3 párrafos que describa la salud general y la tendencia de la plataforma. Comenta sobre el crecimiento de usuarios y la actividad de publicación de ofertas.
2.  **Observaciones Clave:** Identifica de 3 a 4 puntos notables. Por ejemplo, ¿el crecimiento de usuarios es más rápido que el de ofertas? ¿Hay una alta proporción de ofertas activas?
3.  **Recomendaciones Estratégicas:** Proporciona de 2 a 3 recomendaciones claras y accionables para el administrador. Por ejemplo, "Considerar una campaña para atraer más empresas publicadoras" o "Investigar por qué las ofertas se cierran rápidamente".`,
});

const dashboardSummaryFlow = ai.defineFlow(
  {
    name: 'dashboardSummaryFlow',
    inputSchema: DashboardSummaryInputSchema,
    outputSchema: DashboardSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
