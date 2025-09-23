
import admin from 'firebase-admin';

let adminAuth: admin.auth.Auth | undefined;
let adminDb: admin.database.Database | undefined;

// Check if the app is already initialized to prevent errors in hot-reloading environments.
if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
    
    if (!serviceAccountString) {
      console.error('Firebase Admin SDK Error: FIREBASE_ADMIN_SDK_CONFIG environment variable is not set or empty.');
    } else {
      // Parse the JSON string from the environment variable.
      // The private key in the environment variable should have its newlines escaped as `\n`.
      // JSON.parse() will handle this correctly.
      const serviceAccount = JSON.parse(serviceAccountString);

      // Initialize the app with credentials and database URL.
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });

      // If initialization is successful, get the services.
      adminAuth = admin.auth();
      adminDb = admin.database();
      console.log("Firebase Admin SDK initialized successfully.");
    }
  } catch (error: any) {
    // Provide a more detailed error message for easier debugging.
    console.error('Firebase Admin SDK initialization error:', error.message);
    if (error instanceof SyntaxError) {
      console.error("This might be due to an incorrectly formatted JSON string in the FIREBASE_ADMIN_SDK_CONFIG environment variable.");
    }
  }
} else {
  // If the app is already initialized, just get the services.
  adminAuth = admin.auth();
  adminDb = admin.database();
}

export { adminAuth, adminDb };
