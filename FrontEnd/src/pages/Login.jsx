import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../layouts/loginForm.css";

import Card from "../components/ui/Card/Card";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import LinkText from "../components/ui/linkText/LinkText";

import { User, Lock, Heart } from "lucide-react";

import CenteredCardLayout from "../layouts/centeredCard/CenteredCard";

import { loginUser } from "../api/authApi";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async () => {

    try {

      const response = await loginUser(
        email,
        password
      );

      localStorage.setItem(
        "token",
        response.access_token
      );

      navigate("/swipe");

    } catch {

      setError(
        "Credenciales inválidas"
      );

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

        <div className="form-group">

          <label>
            Usuario o Correo Electrónico
          </label>

          <Input
            placeholder="carlos@ejemplo.com"
            icon={<User size={20} />}
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

        </div>

        <div className="form-group">

          <label>
            Contraseña
          </label>

          <Input
            type="password"
            placeholder="••••••••"
            icon={<Lock size={20} />}
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

        </div>

        {error && (
          <p>
            {error}
          </p>
        )}

        <Button onClick={handleLogin}>
          Iniciar Sesión
        </Button>

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