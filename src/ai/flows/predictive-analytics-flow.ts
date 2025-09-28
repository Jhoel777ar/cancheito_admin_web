
'use server';
/**
 * @fileOverview This file contains the Genkit flow for generating predictive analytics for the dashboard.
 *
 * It exports:
 * - `generatePredictiveAnalytics`: The main function to trigger the prediction flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { eachDayOfInterval, format, addDays } from 'date-fns';

const DataPointSchema = z.object({
  date: z.string().describe('The date of the data point in yyyy-MM-dd format.'),
  count: z.number().describe('The count for that day.'),
});

const PredictiveAnalyticsInputSchema = z.object({
  userHistory: z.array(DataPointSchema).describe('Historical user signup data.'),
  offerHistory: z.array(DataPointSchema).describe('Historical offer creation data.'),
});
type PredictiveAnalyticsInput = z.infer<typeof PredictiveAnalyticsInputSchema>;

const PredictionPointSchema = z.object({
  date: z.string().describe('The future date in "MMM d" format.'),
  prediction: z.number().int().describe('The predicted count for that day.'),
});

const PredictiveAnalyticsOutputSchema = z.object({
  userPrediction: z.array(PredictionPointSchema).describe('An array of predicted user signups for the next 7 days.'),
  offerPrediction: z.array(PredictionPointSchema).describe('An array of predicted offer creations for the next 7 days.'),
});
type PredictiveAnalyticsOutput = z.infer<typeof PredictiveAnalyticsOutputSchema>;


export async function generatePredictiveAnalytics(input: PredictiveAnalyticsInput): Promise<PredictiveAnalyticsOutput> {
  return predictiveAnalyticsFlow(input);
}

// Helper to aggregate data by day
const aggregateData = (history: z.infer<typeof DataPointSchema>[]) => {
    const aggregated: { [key: string]: number } = {};
    history.forEach(item => {
        aggregated[item.date] = (aggregated[item.date] || 0) + item.count;
    });
    return Object.entries(aggregated).map(([date, count]) => ({ date, count }));
};


const prompt = ai.definePrompt({
  name: 'predictiveAnalyticsPrompt',
  input: {schema: z.object({
      aggregatedUserHistory: z.string(),
      aggregatedOfferHistory: z.string(),
      futureDates: z.array(z.string()),
  })},
  output: {schema: PredictiveAnalyticsOutputSchema},
  prompt: `Eres un analista de datos especializado en series temporales y modelos de predicción. Tu tarea es predecir la cantidad de nuevos usuarios y nuevas ofertas para los próximos 7 días basándote en los datos históricos proporcionados. Responde SIEMPRE en español en el formato JSON solicitado.

**Datos Históricos (agregados por día):**
*   **Registros de Usuarios (JSON string):** {{{aggregatedUserHistory}}}
*   **Creación de Ofertas (JSON string):** {{{aggregatedOfferHistory}}}

**Fechas a Predecir:**
{{#each futureDates}}
*   {{this}}
{{/each}}

**Tu Tarea:**
Analiza los patrones y tendencias en los datos históricos (considera semanalidad, crecimiento, etc.) para generar una predicción realista para cada uno de los próximos 7 días.

Genera un JSON con dos claves: \`userPrediction\` y \`offerPrediction\`. Cada clave debe ser un array de 7 objetos, uno para cada día futuro, con el formato \`{ "date": "MMM d", "prediction": X }\`.

**Ejemplo de formato de salida:**
\`\`\`json
{
  "userPrediction": [
    { "date": "Jul 25", "prediction": 15 },
    { "date": "Jul 26", "prediction": 18 },
    ...
  ],
  "offerPrediction": [
    { "date": "Jul 25", "prediction": 8 },
    { "date": "Jul 26", "prediction": 7 },
    ...
  ]
}
\`\`\`
`,
});

const predictiveAnalyticsFlow = ai.defineFlow(
  {
    name: 'predictiveAnalyticsFlow',
    inputSchema: PredictiveAnalyticsInputSchema,
    outputSchema: PredictiveAnalyticsOutputSchema,
  },
  async input => {
    const aggregatedUserHistory = aggregateData(input.userHistory);
    const aggregatedOfferHistory = aggregateData(input.offerHistory);

    const futureDates = eachDayOfInterval({
        start: addDays(new Date(), 1),
        end: addDays(new Date(), 7),
    }).map(day => format(day, 'MMM d'));

    const {output} = await prompt({
      aggregatedUserHistory: JSON.stringify(aggregatedUserHistory),
      aggregatedOfferHistory: JSON.stringify(aggregatedOfferHistory),
      futureDates: futureDates
    });
    
    // Ensure the output matches the requested future dates
    if (output) {
      output.userPrediction = output.userPrediction.filter(p => futureDates.includes(p.date)).slice(0, 7);
      output.offerPrediction = output.offerPrediction.filter(p => futureDates.includes(p.date)).slice(0, 7);
    }
    
    return output!;
  }
);
