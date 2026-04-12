import { readFileSync } from "node:fs";
import { getApps, cert, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

type ServiceAccountCredentials = {
  projectId?: string;
  project_id?: string;
  clientEmail?: string;
  client_email?: string;
  privateKey?: string;
  private_key?: string;
};

function normalizePrivateKey(privateKey: string) {
  return privateKey.replace(/\\n/g, "\n");
}

function getPrivateKey() {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("FIREBASE_ADMIN_PRIVATE_KEY não configurada.");
  }
  return normalizePrivateKey(privateKey);
}

function loadServiceAccountCredentials() {
  const inlineCredentials = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (inlineCredentials) {
    return JSON.parse(inlineCredentials) as ServiceAccountCredentials;
  }

  const credentialsPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credentialsPath) {
    const fileContents = readFileSync(credentialsPath, "utf8");
    return JSON.parse(fileContents) as ServiceAccountCredentials;
  }

  return {} as ServiceAccountCredentials;
}

function getProjectIdAndClientEmail(credentials: ServiceAccountCredentials) {
  const projectId = credentials.projectId ?? credentials.project_id ?? process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = credentials.clientEmail ?? credentials.client_email ?? process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  if (!projectId || !clientEmail) {
    throw new Error("FIREBASE_ADMIN_PROJECT_ID/FIREBASE_ADMIN_CLIENT_EMAIL não configurados.");
  }

  return { projectId, clientEmail };
}

export function getAdminApp() {
  if (adminApp) return adminApp;

  const serviceAccount = loadServiceAccountCredentials();
  const { projectId, clientEmail } = getProjectIdAndClientEmail(serviceAccount);
  const privateKey = serviceAccount.privateKey ?? serviceAccount.private_key ?? getPrivateKey();

  adminApp = getApps()[0] ?? initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: normalizePrivateKey(privateKey),
    }),
  });

  return adminApp;
}

export function getAdminDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
