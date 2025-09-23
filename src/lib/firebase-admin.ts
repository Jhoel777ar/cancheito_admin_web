import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_ADMIN_SDK_CONFIG;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
    }
    
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.message);
    // Log the stack for more detailed debugging if needed
    // console.error(error.stack);
  }
}

// Export auth and db instances only if the app was initialized successfully.
// This prevents the "app does not exist" error during runtime.
let adminAuth: admin.auth.Auth;
let adminDb: admin.database.Database;

if (admin.apps.length > 0) {
    adminAuth = admin.auth();
    adminDb = admin.database();
}

// @ts-ignore - We are handling the uninitialized case.
export { adminAuth, adminDb };
