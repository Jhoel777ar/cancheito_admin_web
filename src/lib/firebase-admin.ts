import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG as string);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();
