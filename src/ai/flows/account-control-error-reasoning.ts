
'use server';
/**
 * @fileOverview This file contains the Genkit flow for reasoning about potential errors during account control actions.
 *
 * It exports:
 * - `accountControlErrorReasoning`: The main function to trigger the error reasoning flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccountControlErrorReasoningInputSchema = z.object({
  actionType: z.enum(['activate', 'suspend']).describe('El tipo de acción que se realiza en la cuenta (activar o suspender).'),
  userEmail: z.string().email().describe('La dirección de correo electrónico de la cuenta de usuario.'),
  userName: z.string().describe('El nombre completo del usuario.'),
  userType: z.string().describe('El tipo de usuario (ej. empleador, postulante).'),
  accountState: z.boolean().describe('El estado actual de la cuenta del usuario (true si está activa, false si está suspendida).'),
});
type AccountControlErrorReasoningInput = z.infer<typeof AccountControlErrorReasoningInputSchema>;

const AccountControlErrorReasoningOutputSchema = z.object({
  reasoningSummary: z.string().describe('Un resumen en español de los posibles errores y consecuencias de la acción de control de la cuenta.'),
});
type AccountControlErrorReasoningOutput = z.infer<typeof AccountControlErrorReasoningOutputSchema>;

export async function accountControlErrorReasoning(input: AccountControlErrorReasoningInput): Promise<AccountControlErrorReasoningOutput> {
  return accountControlErrorReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accountControlErrorReasoningPrompt',
  input: {schema: AccountControlErrorReasoningInputSchema},
  output: {schema: AccountControlErrorReasoningOutputSchema},
  prompt: `Eres un asistente de IA experto en administración de plataformas y actúas como un consultor para administradores. Tu tarea es analizar las implicaciones de una acción de moderación sobre una cuenta de usuario y responder SIEMPRE en español.

Se te proporcionará el tipo de acción (activar o suspender), detalles del usuario y el estado actual de su cuenta.

Basándote en esta información, genera un resumen conciso y claro sobre las posibles consecuencias y errores de la acción. Considera el impacto para el usuario y para la plataforma.

**Datos de la Acción:**
*   **Acción a Realizar:** {{{actionType}}}
*   **Nombre de Usuario:** {{{userName}}}
*   **Email del Usuario:** {{{userEmail}}}
*   **Tipo de Usuario:** {{{userType}}}
*   **Estado Actual de la Cuenta:** {{#if accountState}}Activa{{else}}Suspendida{{/if}}

**Análisis de Consecuencias (Resumen):**`,
});

const accountControlErrorReasoningFlow = ai.defineFlow(
  {
    name: 'accountControlErrorReasoningFlow',
    inputSchema: AccountControlErrorReasoningInputSchema,
    outputSchema: AccountControlErrorReasoningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
