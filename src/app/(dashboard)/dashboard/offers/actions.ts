
"use server";

import { db } from '@/lib/firebase';
import { ref, update } from 'firebase/database';
import { revalidatePath } from 'next/cache';

export async function updateOfferStatus(offerId: string, newStatus: 'ACTIVA' | 'CERRADA') {
    if (!offerId) {
        return { success: false, error: "Offer ID is missing." };
    }

    try {
        const offerRef = ref(db, `ofertas/${offerId}`);
        await update(offerRef, {
            estado: newStatus
        });
        revalidatePath('/dashboard/offers');
        return { success: true };

    } catch (error) {
        console.error("Firebase offer status update error:", error);
        return { success: false, error: "Failed to update offer status." };
    }
}
