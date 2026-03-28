import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/api.js";

function LoginPage() {
  const [form, setForm] = useState({
    email: "admin@mellostrucks.com",
    password: "123456789",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginRequest(form.email, form.password);

      if (data.token) {
        localStorage.setItem("mellos_token", data.token);
        localStorage.setItem("mellos_admin", JSON.stringify(data.admin));
        navigate("/admin");
      } else {
        setError(data.message || "No se pudo iniciar sesión");
      }
    } catch (error) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <span className="login-badge">Mellos Trucks</span>
        <h1>Iniciar sesión</h1>
        <p>Accede al panel administrativo</p>

        <input
          type="email"
          name="email"
          placeholder="Correo"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <div className="error-box">{error}</div>}

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Entrando..." : "Entrar al panel"}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;