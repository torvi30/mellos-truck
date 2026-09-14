import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

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
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const token = await credentials.user.getIdToken();
    localStorage.setItem("token", token);
    setUser(credentials.user);
    return credentials.user;
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
