
"use server";

import { accountControlErrorReasoning, AccountControlErrorReasoningInput } from '@/ai/flows/account-control-error-reasoning';
import type { User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { adminAuth } from '@/lib/firebase-admin';
import { ref, update } from 'firebase/database';
import { revalidatePath } from 'next/cache';

export async function getAccountControlReasoning(actionType: 'activate' | 'suspend', user: User) {
  try {
    const input: AccountControlErrorReasoningInput = {
      actionType: actionType,
      userEmail: user.email,
      currentAccountState: user.accountState === 'Activa',
    };
    const result = await accountControlErrorReasoning(input);
    return { success: true, reasoning: result.reasoningSummary };
  } catch (error) {
    console.error("AI reasoning error:", error);
    return { success: false, error: "Failed to get reasoning from AI. Please try again." };
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

export async function updateUserPassword(userId: string, newPassword: string) {
    // This check is now the main guard.
    if (!adminAuth) {
        console.error("Firebase Admin Auth is not available. Check server environment variables and initialization.");
        return { success: false, error: "La configuración del administrador de Firebase no está disponible. Revisa las variables de entorno del servidor." };
    }

    if (!userId) {
        return { success: false, error: "User ID is missing." };
    }
     if (!newPassword || newPassword.length < 6) {
        return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
    }

    try {
        await adminAuth.updateUser(userId, {
            password: newPassword,
        });
        return { success: true };
    } catch (error: any) {
        console.error("Firebase admin password update error:", error);
        let errorMessage = "No se pudo actualizar la contraseña del usuario.";
        if (error.code === 'auth/user-not-found') {
            errorMessage = "El usuario no fue encontrado en Firebase Authentication.";
        }
        return { success: false, error: errorMessage };
    }
}
