
import admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | null = null;

function initializeAdminApp(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
  if (!serviceAccountString) {
    console.error('Firebase Admin SDK Error: La variable de entorno FIREBASE_ADMIN_SDK_CONFIG no está configurada.');
    return null;
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error: Error al analizar las credenciales. Revisa el formato del JSON en la variable de entorno.', error.message);
    return null;
  }
}

export function getAdminAuth(): admin.auth.Auth | null {
  if (!adminAuth) {
    const app = initializeAdminApp();
    if (app) {
      adminAuth = app.auth();
    }
  }
  return adminAuth;
}
