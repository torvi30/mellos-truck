# Guía para configurar Firebase en Mellos Trucks

## Paso 1: Crear un proyecto en Firebase

1. Ve a https://console.firebase.google.com/
2. Inicia sesión con tu cuenta de Google (o crea una si no tienes)
3. Haz clic en "Crear proyecto"
4. Pon un nombre como: **mellos-trucks**
5. Sigue los pasos y crea el proyecto

## Paso 2: Agregar una aplicación web

1. En tu proyecto Firebase, busca el ícono `</>` (web)
2. Haz clic para registrar una app web
3. Dale un nombre como: **mellos-trucks-web**
4. Selecciona "También configura Firebase Hosting" (opcional)
5. Se te mostrará un código con la configuración

## Paso 3: Copiar la configuración

Firebase te mostrará algo así:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDr5z...", // ← COPIA ESTE VALOR
  authDomain: "mellos-trucks.firebaseapp.com", // ← COPIA ESTE
  projectId: "mellos-trucks", // ← COPIA ESTE
  storageBucket: "mellos-trucks.appspot.com", // ← COPIA ESTE
  messagingSenderId: "123456789...", // ← COPIA ESTE
  appId: "1:123456789:web:abcd...", // ← COPIA ESTE
};
```

## Paso 4: Configurar tu archivo .env.local

1. En la carpeta `client/`, crea un archivo llamado `.env.local`
2. Pega lo siguiente y **reemplaza con tus valores reales**:

```env
VITE_FIREBASE_API_KEY=AIzaSyDr5z...
VITE_FIREBASE_AUTH_DOMAIN=mellos-trucks.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mellos-trucks
VITE_FIREBASE_STORAGE_BUCKET=mellos-trucks.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789...
VITE_FIREBASE_APP_ID=1:123456789:web:abcd...
```

## Paso 5: Crear usuario admin en Firebase

1. En Firebase Console, ve a **Authentication** (en el menú izquierdo)
2. Haz clic en **Usuarios** (pestaña superior)
3. Haz clic en **Agregar usuario**
4. Pon un email y contraseña, por ejemplo:
   - Email: `admin@mellostrucks.com`
   - Contraseña: `123456789`
5. Haz clic en **Crear usuario**

## Paso 6: Arrancar el proyecto

En la carpeta `client/`:

```bash
npm install
npm run dev
```

Abre:
- `http://localhost:5173/` para la página pública
- `http://localhost:5173/admin/login` para el admin

Usa el email y contraseña que creaste en Firebase para iniciar sesión.

## Paso 7: Configurar Firestore (base de datos)

1. En Firebase Console, ve a **Firestore Database**
2. Haz clic en **Crear base de datos**
3. Selecciona **Iniciar en modo de prueba** (para comenzar)
4. Elige tu región más cercana (ej: `us-east1` o similar)
5. Crea la base de datos

## Paso 8: Configurar Storage (para galería)

1. En Firebase Console, ve a **Storage**
2. Haz clic en **Comenzar**
3. Selecciona **Iniciar en modo de prueba**
4. Elige tu región (la misma de Firestore es recomendado)
5. Crea el storage

---

## Resumen de los valores que necesitas

| Variable | Dónde obtenerla |
|----------|-----------------|
| `apiKey` | Firebase Console > Configuración del Proyecto > Tu App Web |
| `authDomain` | Firebase Console > Configuración del Proyecto > Tu App Web |
| `projectId` | Firebase Console > Configuración del Proyecto > Tu App Web |
| `storageBucket` | Firebase Console > Configuración del Proyecto > Tu App Web |
| `messagingSenderId` | Firebase Console > Configuración del Proyecto > Tu App Web |
| `appId` | Firebase Console > Configuración del Proyecto > Tu App Web |

---

¿Necesitas ayuda? Sigue estos pasos y luego pasa la información que obtengas para que configure todo por ti.
