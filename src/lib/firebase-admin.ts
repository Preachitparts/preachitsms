
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: admin.app.App;

async function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }
  
  if (admin.apps.length > 0) {
     adminApp = admin.apps[0]!;
     return adminApp;
  }

  if (!serviceAccount) {
    throw new Error(
      'Firebase service account credentials are not set in the environment variables. Please add FIREBASE_SERVICE_ACCOUNT to your .env.local file.'
    );
  }
  
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return adminApp;
}

export { getAdminApp };
