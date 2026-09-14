import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "./firebaseConfig.js";

let app = null;
let auth = null;
let db = null;
let storage = null;

// Inicializar Firebase únicamente si se cuenta con API Key válida
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "your_api_key_here") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn("⚠️ Advertencia al conectar con Firebase:", err.message);
  }
} else {
  console.info("ℹ️ Modo Local / Offline Activo: Firebase no configurado en .env.local. La aplicación utiliza el backend Express local.");
}

export { auth, db, storage };
export default app;
