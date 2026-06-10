import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi';
import { User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import './auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirm) { setError('Completá todos los campos'); return; }
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (!terms) { setError('Debés aceptar los términos'); return; }
    setLoading(true); setError('');
    try {
      await registerApi(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow left" />
      <div className="auth-bg-glow right" />
      <div className="auth-card">
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Únete y encuentra tu conexión ideal hoy</p>

        <div className="form-group">
          <label>Nombre</label>
          <div className="input-wrap">
            <User size={18} className="input-icon" />
            <input placeholder="Sofía" value={name} onChange={e => setName(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Correo Electrónico</label>
          <div className="input-wrap">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="sofia@ejemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="input-eye" onClick={() => setShowPass(v => !v)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
        </div>

        <div className="terms-row">
          <input type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)} />
          <span>Acepto los <span className="terms-link">Términos</span> y <span className="terms-link">Política de Privacidad</span></span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p className="auth-switch">
          ¿Ya tienes una cuenta?{' '}
          <button className="link-btn" onClick={() => navigate('/')}>Inicia Sesión</button>
        </p>
      </div>
    </div>
  );
}
