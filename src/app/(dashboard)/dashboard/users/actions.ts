"use server";

import { accountControlErrorReasoning, AccountControlErrorReasoningInput } from '@/ai/flows/account-control-error-reasoning';
import type { User } from '@/lib/types';

export async function getAccountControlReasoning(actionType: 'activate' | 'suspend', user: User) {
  try {
    const input: AccountControlErrorReasoningInput = {
      actionType: actionType,
      userEmail: user.email,
      currentAccountState: user.isVerified,
    };
    const result = await accountControlErrorReasoning(input);
    return { success: true, reasoning: result.reasoningSummary };
  } catch (error) {
    console.error("AI reasoning error:", error);
    return { success: false, error: "Failed to get reasoning from AI. Please try again." };
  }
}
