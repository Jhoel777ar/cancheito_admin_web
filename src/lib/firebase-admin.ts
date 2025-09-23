import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  try {
    // Ensure the environment variable is set.
    const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set or is empty.');
    }
    
    // Parse the JSON string from the environment variable.
    const serviceAccount = JSON.parse(serviceAccountString);

    // Initialize the app with credentials and database URL.
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    // Provide a more detailed error message for easier debugging.
    console.error('Firebase Admin SDK initialization error:', error.message);
  }
}

// Safely export auth and db instances.
// This structure prevents runtime errors if initialization fails.
let adminAuth: admin.auth.Auth | undefined;
let adminDb: admin.database.Database | undefined;

try {
  adminAuth = admin.auth();
  adminDb = admin.database();
} catch (error) {
  console.error('Failed to get Firebase Admin services. The app might not have been initialized correctly.');
}

export { adminAuth, adminDb };
