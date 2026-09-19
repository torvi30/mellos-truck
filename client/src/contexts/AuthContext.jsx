import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(() => {
    return localStorage.getItem("mello_user_role") || "admin";
  });

  const switchRole = (newRole) => {
    const validRole = newRole === "workshop" ? "workshop" : "admin";
    setRole(validRole);
    localStorage.setItem("mello_user_role", validRole);
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            const token = await currentUser.getIdToken();
            localStorage.setItem("token", token);
          } catch (_) {}
        } else {
          // Si no hay usuario y no es dev-mock, limpiar token
          const currentToken = localStorage.getItem("token");
          if (currentToken && !currentToken.startsWith("dev-mock-")) {
            localStorage.removeItem("token");
          }
        }
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Firebase Auth no disponible en este entorno:", err.message);
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (!auth) {
      // Mock de autenticación para modo desarrollo sin Firebase
      if (email === "admin@mellostrucks.com" && password === "123456789") {
        const mockUser = { email, displayName: "Administrador Mellos Truck" };
        setUser(mockUser);
        localStorage.setItem("token", "dev-mock-token-mellostruck");
        return mockUser;
      }
      throw new Error("Credenciales inválidas en modo local.");
    }

    try {
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const token = await credentials.user.getIdToken();
      localStorage.setItem("token", token);
      setUser(credentials.user);
      return credentials.user;
    } catch (firebaseErr) {
      // Si el usuario admin demo aún no existe en Firebase Auth, intentar auto-aprovisionarlo
      if (
        (firebaseErr.code === "auth/user-not-found" || firebaseErr.code === "auth/invalid-credential") &&
        email === "admin@mellostrucks.com"
      ) {
        try {
          const created = await createUserWithEmailAndPassword(auth, email, password);
          const token = await created.user.getIdToken();
          localStorage.setItem("token", token);
          setUser(created.user);
          return created.user;
        } catch (createErr) {
          if (createErr.code === "auth/operation-not-allowed") {
            throw new Error("Debes habilitar el proveedor 'Correo y contraseña' en Firebase Console > Authentication.");
          }
          // Si ya existe pero la contraseña no coincidió, mostrar error de contraseña
          if (createErr.code === "auth/email-already-in-use") {
            throw new Error("Contraseña incorrecta para este usuario.");
          }
          throw createErr;
        }
      }

      if (firebaseErr.code === "auth/operation-not-allowed") {
        throw new Error("Debes habilitar el proveedor 'Correo y contraseña' en Firebase Console > Authentication.");
      }
      if (firebaseErr.code === "auth/wrong-password" || firebaseErr.code === "auth/invalid-credential") {
        throw new Error("Correo o contraseña incorrectos.");
      }
      if (firebaseErr.code === "auth/user-not-found") {
        throw new Error("Usuario no encontrado en la base de datos.");
      }
      if (firebaseErr.code === "auth/too-many-requests") {
        throw new Error("Demasiados intentos fallidos. Intenta más tarde.");
      }
      throw new Error(firebaseErr.message || "Error al autenticar.");
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        role,
        switchRole,
        isManager: role === "admin",
        isWorkshop: role === "workshop",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
