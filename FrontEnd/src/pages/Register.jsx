
import Card from "../components/ui/card/Card";
import Input from "../components/ui/Input/Input";
import Button from "../components/ui/Button/Button";
import LinkText from "../components/ui/linkText/LinkText";

import { User, Lock, Heart } from "lucide-react";
import "../layouts/register.css";
import CenteredCardLayout from "../layouts/centeredCard/CenteredCard";


function Register() {
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
            placeholder="Carlos García"
            icon={<User size={20} />}
            />
        </div>

        <div className="form-group">
            <label>Correo Electronico</label>

            <Input
            type="email"
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

        <div className="form-group">
            <label>Confirmar Contraseña</label>

            <Input
            type="password"
            placeholder="••••••••••"
            icon={<Lock size={20} />}
            />
        </div>

        <div className="forgot-password">
            <input
                type="checkbox"
                className="terms-checkbox"
            />
            <p>Acepto los</p>
            <LinkText>
                Términos
            </LinkText>
            <p>y</p>
            <LinkText>
                Política de Privacidad
            </LinkText>
        </div>

        <Button href="/crear-perfil">
            Registrarse
        </Button>

        <p className="register-text">
            Ya tienes una cuenta? 
            <LinkText href="/">
                Inicia Sesión
            </LinkText>
        </p>

        </Card>
    </CenteredCardLayout>
  );
}

export default Register;