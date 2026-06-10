import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/authApi';
import { User, Lock, Heart, Eye, EyeOff } from 'lucide-react';
import './auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) { setError('Completá todos los campos'); return; }
    setLoading(true); setError('');
    try {
      const data = await loginApi(email, password);
      login(data.access_token);
      navigate('/swipe');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-glow left" />
      <div className="auth-bg-glow right" />
      <div className="auth-card">
        <div className="auth-logo">
          <Heart fill="white" size={28} />
        </div>
        <h1 className="auth-title">Bienvenido de nuevo</h1>
        <p className="auth-subtitle">Ingresa tus credenciales para continuar</p>

        <div className="form-group">
          <label>Usuario o Correo Electrónico</label>
          <div className="input-wrap">
            <User size={18} className="input-icon" />
            <input
              type="email"
              placeholder="carlos_95@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <div className="input-wrap">
            <Lock size={18} className="input-icon" />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <button className="input-eye" onClick={() => setShowPass(v => !v)}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button className="forgot-link">¿Olvidaste tu contraseña?</button>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>

        <p className="auth-switch">
          ¿No tienes una cuenta?{' '}
          <button className="link-btn" onClick={() => navigate('/register')}>Regístrate</button>
        </p>
      </div>
    </div>
  );
}
