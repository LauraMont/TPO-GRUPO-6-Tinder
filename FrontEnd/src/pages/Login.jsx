import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importamos el hook de navegación
import "../layouts/loginForm.css";

import Card from "../components/ui/Card/Card";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import LinkText from "../components/ui/linkText/LinkText";

import { User, Lock, Heart } from "lucide-react";
import CenteredCardLayout from "../layouts/centeredCard/CenteredCard";

function Login() {
  const navigate = useNavigate();

  // 1. Estados para capturar los datos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2. Función que maneja el envío del formulario
  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    setError("");
    setIsLoading(true);

    try {
      // Llamada a tu backend en FastAPI para validar credenciales
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();

      // Guardamos el token para mantener la sesión abierta
      localStorage.setItem("token", data.access_token);

      // 3. LA MAGIA: Redirección condicional según el rol
      if (data.role === "admin") {
        navigate("/admin/events"); // O la ruta principal de tu backoffice
      } else {
        navigate("/swipe"); // Ruta para usuarios normales
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredCardLayout>  
      <Card>
        <div className="logo-circle">
          <Heart fill="white" size={28} />
        </div>

        <h1>Bienvenido de nuevo</h1>

        <p className="subtitle">
          Ingresa tus credenciales para continuar
        </p>

        {/* Mostramos errores si los hay */}
        {error && <p style={{ color: "#ef4444", fontSize: "14px", textAlign: "center" }}>{error}</p>}

        {/* Envolvemos los inputs en un <form> para poder usar la tecla "Enter" */}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuario o Correo Electrónico</label>
            <Input
              type="text"
              placeholder="carlos_95@ejemplo.com"
              icon={<User size={20} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <Input
              type="password"
              placeholder="••••••••••"
              icon={<Lock size={20} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="forgot-password">
            <LinkText>
              ¿Olvidaste tu contraseña?
            </LinkText>
          </div>

          {/* Cambiamos el href por type="submit" para que active el handleLogin */}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </Button>
        </form>

        <p className="register-text">
          ¿No tienes una cuenta?
          <LinkText href="/register">
            Regístrate
          </LinkText>
        </p>

      </Card>
    </CenteredCardLayout>
  );
}

export default Login;