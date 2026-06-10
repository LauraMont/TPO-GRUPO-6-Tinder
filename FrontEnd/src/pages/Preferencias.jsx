import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import BottomNav from '../components/ui/BottomNav/BottomNav';
import './Preferencias.css';

export default function Preferencias() {
  const navigate = useNavigate();
  const [edadMin, setEdadMin] = useState(18);
  const [edadMax, setEdadMax] = useState(35);
  const [distancia, setDistancia] = useState(20);
  const [genero, setGenero] = useState('Todos');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="prefs-page">
      <div className="prefs-topbar">
        <button className="back-btn" onClick={() => navigate('/perfil')}>
          <ChevronLeft size={20} />
        </button>
        <h1>Preferencias</h1>
        <div style={{width: 36}} />
      </div>

      <div className="prefs-content">
        <div className="pref-section">
          <div className="pref-header">
            <span>Rango de edad</span>
            <span className="pref-value">{edadMin} – {edadMax}</span>
          </div>
          <input type="range" min={18} max={50} value={edadMin}
            onChange={e => setEdadMin(Number(e.target.value))} className="pref-slider" />
          <input type="range" min={18} max={50} value={edadMax}
            onChange={e => setEdadMax(Number(e.target.value))} className="pref-slider" />
        </div>

        <div className="pref-section">
          <div className="pref-header">
            <span>Distancia máxima</span>
            <span className="pref-value">{distancia} km</span>
          </div>
          <input type="range" min={1} max={100} value={distancia}
            onChange={e => setDistancia(Number(e.target.value))} className="pref-slider" />
        </div>

        <div className="pref-section">
          <div className="pref-header">
            <span>Me interesan</span>
          </div>
          <div className="pref-chips">
            {['Todos', 'Mujeres', 'Hombres'].map(g => (
              <button key={g}
                className={`pref-chip ${genero === g ? 'active' : ''}`}
                onClick={() => setGenero(g)}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {saved && <p className="pref-saved">✓ Preferencias guardadas</p>}

        <button className="btn-save-prefs" onClick={handleSave}>
          Guardar preferencias
        </button>
      </div>

      <BottomNav />
    </div>
  );
}