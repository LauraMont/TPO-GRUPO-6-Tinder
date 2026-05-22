import "../layouts/crearPerfil.css";

import Card from "../components/ui/Card/Card";
import Button from "../components/ui/Button/Button";
import Input from "../components/ui/Input/Input";

import {
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";

function CrearPerfil() {
  return (
    <div className="crear-perfil-page">

      <Card>

        <div className="progress-bar">
          <div className="progress-fill"></div>
        </div>

        <h1 className="perfil-title">
          Crea tu Perfil
        </h1>

        <p className="perfil-subtitle">
          Sube tus mejores fotos y cuéntanos sobre ti
        </p>

        {/* FOTOS */}

        <div className="section">
          <label className="section-label">
            Fotos (Mínimo 3)
          </label>

          <div className="photos-container">

            <div className="photo-card active">
              <div className="photo-check">
                <Check size={14} />
              </div>
            </div>

            <div className="photo-card">
              <Plus size={40} />
            </div>

            <div className="photo-card empty">
              <Plus size={40} />
            </div>

          </div>
        </div>

        {/* NOMBRE */}

        <div className="section">
          <label className="section-label">
            Nombre
          </label>

          <Input placeholder="Carlos" />
        </div>

        {/* FECHA + GENERO */}

        <div className="double-fields">

          <div className="section">
            <label className="section-label">
              Fecha de Nacimiento
            </label>

            <Input placeholder="14 / 08 / 1995" />
          </div>

          <div className="section">
            <label className="section-label">
              Género
            </label>

            <div className="select-container">
              <span>Hombre</span>

              <ChevronDown size={20} />
            </div>
          </div>

        </div>

        {/* SOBRE TI */}

        <div className="section">
          <label className="section-label">
            Sobre ti
          </label>

          <div className="textarea-container">

            <textarea
              placeholder="Añade una breve descripción sobre lo que te gusta hacer..."
              maxLength={500}
            />

            <span className="counter">
              0/500
            </span>

          </div>
        </div>

        {/* INTERESES */}

        <div className="section">
          <label className="section-label">
            Tus Intereses
          </label>

          <div className="interests-container">

            <div className="interest-chip active">
              Música
            </div>

            <div className="interest-chip pink">
              Viajes
            </div>

            <div className="interest-chip add">
              + Añadir
            </div>

          </div>
        </div>

        <Button>
          Guardar y Continuar
        </Button>

      </Card>

    </div>
  );
}

export default CrearPerfil;