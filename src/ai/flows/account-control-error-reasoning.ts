'use server';
/**
 * @fileOverview This file contains the Genkit flow for reasoning about potential errors during account control actions.
 *
 * It exports:
 * - `accountControlErrorReasoning`: The main function to trigger the error reasoning flow.
 * - `AccountControlErrorReasoningInput`: The input type for the function.
 * - `AccountControlErrorReasoningOutput`: The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AccountControlErrorReasoningInputSchema = z.object({
  actionType: z.enum(['activate', 'suspend']).describe('The type of action being performed on the account.'),
  userEmail: z.string().email().describe('The email address of the user account.'),
  currentAccountState: z.boolean().describe('The current state of the user account (true if active, false if suspended).'),
});
export type AccountControlErrorReasoningInput = z.infer<typeof AccountControlErrorReasoningInputSchema>;

const AccountControlErrorReasoningOutputSchema = z.object({
  reasoningSummary: z.string().describe('A summary of the potential errors and consequences of the account control action.'),
});
export type AccountControlErrorReasoningOutput = z.infer<typeof AccountControlErrorReasoningOutputSchema>;

export async function accountControlErrorReasoning(input: AccountControlErrorReasoningInput): Promise<AccountControlErrorReasoningOutput> {
  return accountControlErrorReasoningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'accountControlErrorReasoningPrompt',
  input: {schema: AccountControlErrorReasoningInputSchema},
  output: {schema: AccountControlErrorReasoningOutputSchema},
  prompt: `You are an AI assistant that helps administrators reason about potential errors when activating or suspending user accounts.

You will be provided with the action type (activate or suspend), the user's email address, and the current account state.

Based on this information, you will generate a summary of the potential errors and consequences of the action.

Action Type: {{{actionType}}}
User Email: {{{userEmail}}}
Current Account State: {{{currentAccountState}}}

Reasoning Summary:`,
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
