import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig.js";

let app = null;
let auth = null;
let db = null;
let storage = null;
let isConfigured = false;

// Inicializar Firebase únicamente si se cuenta con API Key válida
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here") {
  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isConfigured = true;
    console.info("🚀 Firebase conectado exitosamente (Firestore, Auth, Storage)");
  } catch (err) {
    console.warn("⚠️ Advertencia al inicializar Firebase:", err.message);
  }
} else {
  console.info("ℹ️ Modo Local / Offline Activo: Configura las variables en client/.env.local para sincronizar en tiempo real con Firebase.");
}

export { auth, db, storage, isConfigured };
export default app;
