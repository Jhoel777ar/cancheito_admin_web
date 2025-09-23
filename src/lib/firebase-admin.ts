
import admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | undefined;

// This function ensures the admin app is initialized only once.
function initializeAdminApp() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
  if (!serviceAccountString) {
    throw new Error('Firebase Admin SDK Error: La variable de entorno FIREBASE_ADMIN_SDK_CONFIG no está configurada.');
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    throw new Error('Error al analizar las credenciales del SDK de Firebase Admin. Revisa el formato del JSON en la variable de entorno.');
  }
}

// Export a function that returns the auth instance.
// This ensures initialization happens on first use.
export function getAdminAuth(): admin.auth.Auth {
  if (!adminAuth) {
    initializeAdminApp();
    adminAuth = admin.auth();
  }
  return adminAuth;
}
