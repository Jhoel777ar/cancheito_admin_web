
"use server";

import { accountControlErrorReasoning } from '@/ai/flows/account-control-error-reasoning';
import { generateDashboardSummary } from '@/ai/flows/dashboard-summary-flow';
import { generatePredictiveAnalytics } from '@/ai/flows/predictive-analytics-flow';
import type { User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { revalidatePath } from 'next/cache';

// Re-defining types here as they can't be imported from 'use server' files.
type AccountControlErrorReasoningInput = {
  actionType: 'activate' | 'suspend';
  userEmail: string;
  userName: string;
  userType: string;
  accountState: boolean;
};

type DashboardSummaryInput = {
  totalUsers: number;
  newUsersLast30Days: number;
  totalOffers: number;
  newOffersLast30Days: number;
  activeOffers: number;
  closedOffers: number;
};

type PredictiveAnalyticsInput = {
  userHistory: { date: string; count: number; }[];
  offerHistory: { date: string; count: number; }[];
};


export async function getAccountControlReasoning(actionType: 'activate' | 'suspend', user: User) {
  try {
    const input: AccountControlErrorReasoningInput = {
      actionType: actionType,
      userEmail: user.email,
      userName: user.fullName,
      userType: user.userType,
      accountState: user.accountState === 'Activa',
    };
    const result = await accountControlErrorReasoning(input);
    return { success: true, reasoning: result.reasoningSummary };
  } catch (error) {
    console.error("AI reasoning error:", error);
    return { success: false, error: "No se pudo obtener el análisis de la IA. Por favor, inténtalo de nuevo." };
  }
}

export async function getDashboardSummary(input: DashboardSummaryInput) {
    try {
        const result = await generateDashboardSummary(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI summary error:", error);
        return { success: false, error: "Failed to generate AI summary." };
    }
}

export async function getPredictiveAnalytics(input: PredictiveAnalyticsInput) {
    try {
        const result = await generatePredictiveAnalytics(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI prediction error:", error);
        return { success: false, error: "Failed to generate AI predictions." };
    }
}


export async function updateUser(userId: string, data: Partial<User>) {
    if (!userId) {
        return { success: false, error: "User ID is missing." };
    }

    try {
        const userRef = ref(db, `Usuarios/${userId}`);
        
        const updateData: any = {
            nombre_completo: data.fullName,
            email: data.email,
            experiencia: data.experience,
            formacion: data.education,
            tipoUsuario: data.userType,
            ubicacion: data.location,
        };

        await update(userRef, updateData);
        revalidatePath('/dashboard/users');
        return { success: true };

    } catch (error) {
        console.error("Firebase update error:", error);
        return { success: false, error: "Failed to update user in Firebase." };
    }
}


export async function updateUserVerification(userId: string, isVerified: boolean) {
    if (!userId) {
        return { success: false, error: "User ID is missing." };
    }

    try {
        const userRef = ref(db, `Usuarios/${userId}`);
        await update(userRef, {
            usuario_verificado: isVerified
        });
        revalidatePath('/dashboard/users');
        return { success: true };

    } catch (error) {
        console.error("Firebase verification update error:", error);
        return { success: false, error: "Failed to update user verification status." };
    }
}

export async function updateUserAccountState(userId: string, newState: 'Activa' | 'Desactivada') {
    if (!userId) {
        return { success: false, error: "User ID is missing." };
    }

    try {
        const userRef = ref(db, `Usuarios/${userId}`);
        await update(userRef, {
            estadoCuenta: newState
        });
        revalidatePath('/dashboard/users');
        return { success: true };

    } catch (error) {
        console.error("Firebase account state update error:", error);
        return { success: false, error: "Failed to update user account state." };
    }
}
