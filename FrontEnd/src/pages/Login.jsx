import "../layouts/loginForm.css";

import Card from "../components/ui/Card/Card";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import LinkText from "../components/ui/linkText/LinkText";

import { User, Lock, Heart } from "lucide-react";
import CenteredCardLayout from "../layouts/centeredCard/CenteredCard";

function Login() {
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
          <label>Usuario o Correo Electrónico</label>

          <Input
            placeholder="carlos_95@ejemplo.com"
            icon={<User size={20} />}
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>

          <Input
            type="password"
            placeholder="••••••••••"
            icon={<Lock size={20} />}
          />
        </div>

        <div className="forgot-password">
          <LinkText>
            ¿Olvidaste tu contraseña?
          </LinkText>
        </div>

        <Button href="/swipe">
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