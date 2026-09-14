import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
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
        return mockUser;
      }
      throw new Error("Credenciales inválidas en modo local.");
    }
    const credentials = await signInWithEmailAndPassword(auth, email, password);
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
