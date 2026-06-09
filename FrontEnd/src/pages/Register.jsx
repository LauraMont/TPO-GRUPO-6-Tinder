import { useState } from "react";

import { useNavigate } from "react-router-dom";

import Card from "../components/ui/Card/Card";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import LinkText from "../components/ui/linkText/LinkText";

import { User, Lock, Heart } from "lucide-react";

import "../layouts/register.css";

import CenteredCardLayout from "../layouts/centeredCard/CenteredCard";

import { registerUser } from "../api/authApi";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleRegister = async () => {

    if (password !== confirmPassword) {

      setError(
        "Las contraseñas no coinciden"
      );

      return;
    }

    try {

      await registerUser(
        name,
        email,
        password
      );

      navigate("/");

    } catch {

      setError(
        "Error al registrar usuario"
      );

    }
  };

  return (

    <CenteredCardLayout>

      <Card>

        <div className="logo-circle">
          <Heart fill="white" size={28} />
        </div>

        <h1>Crear Cuenta</h1>

        <p className="subtitle">
          Reunete y encuentra tu conexión ideal hoy
        </p>

        <div className="form-group">

          <label>Nombre</label>

          <Input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Carlos García"
            icon={<User size={20} />}
          />

        </div>

        <div className="form-group">

          <label>Correo</label>

          <Input
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="correo@test.com"
          />

        </div>

        <div className="form-group">

          <label>Contraseña</label>

          <Input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

        </div>

        <div className="form-group">

          <label>
            Confirmar Contraseña
          </label>

          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />

        </div>

        {error && (
          <p>{error}</p>
        )}

        <Button
          onClick={handleRegister}
        >
          Registrarse
        </Button>

        <p className="register-text">

          Ya tienes cuenta?

          <LinkText href="/">
            Inicia Sesión
          </LinkText>

        </p>

      </Card>

    </CenteredCardLayout>

  );
}

export default Register;