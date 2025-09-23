
import admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | undefined;
let adminDb: admin.database.Database | undefined;

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
    if (!serviceAccountString) {
      // This error will be logged on the server if the environment variable is missing.
      console.error('Firebase Admin SDK Error: FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
    } else {
      // Parse the JSON string from the environment variable.
      const serviceAccount = JSON.parse(serviceAccountString);

      // Initialize the app with credentials and database URL.
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });

      // If initialization is successful, get the services.
      adminAuth = admin.auth();
      adminDb = admin.database();
    }
  } catch (error: any) {
    // Provide a more detailed error message for easier debugging.
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
} else {
  // If the app is already initialized, just get the services.
  adminAuth = admin.auth();
  adminDb = admin.database();
}


export { adminAuth, adminDb };
