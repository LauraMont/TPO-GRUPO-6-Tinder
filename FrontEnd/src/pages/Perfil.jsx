import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../api/authApi';
import BottomNav from '../components/ui/BottomNav/BottomNav';
import { ChevronRight, Edit2, Settings, LogOut, Crown } from 'lucide-react';
import './Perfil.css';

export default function Perfil() {
  const { token, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', age: '', bio: '', interests: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    (async () => {
      try {
        const p = await getProfile(token);
        setProfile(p);
        setForm({
          name: p?.name || user?.name || '',
          age: String(p?.age || ''),
          bio: p?.bio || '',
          interests: Array.isArray(p?.interests) ? p.interests.join(', ') : (p?.interests || ''),
        });
      } catch {
        setForm({ name: user?.name || '', age: '', bio: '', interests: '' });
      }
    })();
  }, [token]);

  const handleSave = async () => {
    setSaving(true); setMsg('');
    try {
      const interestsArr = form.interests
        ? form.interests.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      await updateProfile(token, {
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        bio: form.bio,
        interests: interestsArr,
      });
      setMsg('¡Perfil actualizado!');
      setEditing(false);
    } catch (e) {
      setMsg('Error al guardar: ' + (e.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const displayName = form.name || user?.name || 'Usuario';
  const displayAge = form.age || '';
  const completionPct = Math.min(100, [form.name, form.age, form.bio, form.interests].filter(v => v && String(v).trim()).length * 25);

  return (
    <div className="perfil-page">
      <div className="perfil-topbar">
        <h1>Mi Perfil</h1>
        <button className="topbar-icon-btn" onClick={() => { logout(); navigate('/'); }}>
          <LogOut size={18} />
        </button>
      </div>

      <div className="perfil-content">
        {/* Avatar */}
        <div className="perfil-avatar-wrap">
          <div className="perfil-avatar">
            <span>{displayName[0]?.toUpperCase()}</span>
          </div>
        </div>

        <h2 className="perfil-name">{displayName}{displayAge ? `, ${displayAge}` : ''}</h2>
        <p className="perfil-location">📍 Buenos Aires, Argentina</p>

        {/* Progress */}
        <div className="perfil-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="progress-label">Perfil completado al {completionPct}%</p>
        </div>

        {/* Edit / Prefs buttons */}
        {!editing ? (
          <>
            <div className="perfil-actions-grid">
              <button className="perfil-action-btn" onClick={() => setEditing(true)}>
                <div className="action-btn-icon pink"><Edit2 size={20} /></div>
                <span>Editar Perfil</span>
              </button>
              <button className="perfil-action-btn" onClick={() => navigate('/preferencias')}>
                <div className="action-btn-icon purple"><Settings size={20} /></div>
                <span>Preferencias</span>
              </button>
            </div>

            {/* Premium banner */}
            <button className="premium-banner">
              <div className="premium-icon"><Crown size={22} /></div>
              <div className="premium-text">
                <span className="premium-title">Obtén Premium</span>
                <span className="premium-sub">Likes ilimitados y ver a quién le gustas</span>
              </div>
              <ChevronRight size={20} />
            </button>

            {/* Menu items */}
            <div className="perfil-menu">
              <button className="menu-item">
                <span>Seguridad y Privacidad</span>
                <ChevronRight size={16} className="menu-arrow" />
              </button>
              <button className="menu-item">
                <span>Centro de Ayuda</span>
                <ChevronRight size={16} className="menu-arrow" />
              </button>
              {isAdmin && (
                <button className="menu-item admin-item" onClick={() => navigate('/admin')}>
                  <span>Panel de Administración</span>
                  <ChevronRight size={16} className="menu-arrow" />
                </button>
              )}
              <button className="menu-item danger-item" onClick={() => { logout(); navigate('/'); }}>
                <span>Cerrar sesión</span>
                <ChevronRight size={16} className="menu-arrow" />
              </button>
            </div>
          </>
        ) : (
          <div className="edit-form">
            <h3 className="edit-title">Editar Perfil</h3>
            <div className="edit-field">
              <label>Nombre</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Tu nombre" />
            </div>
            <div className="edit-field">
              <label>Edad</label>
              <input type="number" value={form.age} onChange={e => setForm(f => ({...f, age: e.target.value}))} placeholder="Tu edad" />
            </div>
            <div className="edit-field">
              <label>Descripción</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Contá algo sobre vos..." rows={3} />
            </div>
            <div className="edit-field">
              <label>Intereses (separados por coma)</label>
              <input value={form.interests} onChange={e => setForm(f => ({...f, interests: e.target.value}))} placeholder="Viajes, Música, Fotografía..." />
            </div>
            {msg && <p className={`edit-msg ${msg.includes('Error') ? 'error' : 'success'}`}>{msg}</p>}
            <div className="edit-btns">
              <button className="btn-cancel" onClick={() => { setEditing(false); setMsg(''); }}>Cancelar</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
