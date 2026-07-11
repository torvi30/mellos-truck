import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default PrivateRoute;