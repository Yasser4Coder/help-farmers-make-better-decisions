const admin = require("firebase-admin");
const logger = require("./logger");

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 */
const initializeFirebase = () => {
  try {
    // Check if Firebase credentials are provided via environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.projectId,
      });

      logger.info("Firebase Admin SDK initialized successfully");
      return firebaseApp;
    } 
    // Alternative: Use service account JSON file
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });

      logger.info("Firebase Admin SDK initialized successfully from service account file");
      return firebaseApp;
    } else {
      logger.warn("Firebase credentials not found. Push notifications will be disabled.");
      return null;
    }
  } catch (error) {
    logger.error("Error initializing Firebase Admin SDK:", error);
    return null;
  }
};

/**
 * Get Firebase Admin instance
 */
const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

/**
 * Get Firebase Messaging instance
 */
const getMessaging = () => {
  const app = getFirebaseAdmin();
  if (!app) {
    return null;
  }
  return admin.messaging(app);
};

module.exports = {
  initializeFirebase,
  getFirebaseAdmin,
  getMessaging,
};

