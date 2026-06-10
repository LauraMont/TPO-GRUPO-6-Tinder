import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEvents, createAdminEvent, updateAdminEvent, deleteAdminEvent } from '../api/authApi';
import { Plus, Edit2, Trash2, X, ChevronLeft, MapPin } from 'lucide-react';
import './Admin.css';

const EMPTY_FORM = { title: '', description: '', location: '', event_date: '', tags: '', status: 'Publicado' };
const STATUS_FILTERS = ['Todos', 'Activos', 'Borradores'];

function getDay(d) { try { return String(new Date(d).getDate()).padStart(2,'0'); } catch { return '--'; } }
function getMonth(d) {
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  try { return months[new Date(d).getMonth()]; } catch { return ''; }
}
function fmtDate(d) {
  if (!d) return '';
  try {
    const dt = new Date(d);
    const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    return `${days[dt.getDay()]}, ${dt.getDate()} ${months[dt.getMonth()]} • ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')} hs`;
  } catch { return d; }
}
const DAY_COLORS = ['#ff4f87','#ff6d5a','#9b5de5','#0095ff','#00d9b4'];

export default function Admin() {
  const { token, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { navigate('/'); return; }
    if (!isAdmin) { navigate('/swipe'); return; }
    load();
  }, [token, isAdmin]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = events.filter(e => {
    if (filter === 'Activos') return e.status === 'Publicado';
    if (filter === 'Borradores') return e.status === 'Borrador';
    return true;
  });

  const featured = filtered[0];
  const rest = filtered.slice(1);

  const openNew = () => { setForm(EMPTY_FORM); setEditingEvent(null); setError(''); setShowModal(true); };
  const openEdit = (ev) => {
    setForm({ title: ev.title || '', description: ev.description || '', location: ev.location || '', event_date: ev.event_date || '', tags: ev.tags || '', status: ev.status || 'Publicado' });
    setEditingEvent(ev);
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('El título es obligatorio'); return; }
    setSaving(true); setError('');
    try {
      if (editingEvent) {
        await updateAdminEvent(token, editingEvent.id, form);
      } else {
        await createAdminEvent(token, form);
      }
      setShowModal(false);
      await load();
    } catch (e) { setError(e.message || 'Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este evento?')) return;
    try {
      await deleteAdminEvent(token, id);
      setEvents(ev => ev.filter(e => e.id !== id));
    } catch (e) { alert('Error: ' + e.message); }
  };

  return (
    <div className="admin-page">
      {/* Topbar */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="back-btn" onClick={() => navigate('/perfil')}><ChevronLeft size={20}/></button>
          <div>
            <h1 className="admin-title">Administrar IRL</h1>
            <p className="admin-sub">Panel de Control</p>
          </div>
        </div>
        <button className="add-btn" onClick={openNew}><Plus size={20} /></button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        {STATUS_FILTERS.map(f => (
          <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Content */}
      <div className="admin-content">
        {loading ? (
          <div className="admin-loading"><div className="ev-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <p>No hay eventos. ¡Crea el primero!</p>
            <button className="btn-create-first" onClick={openNew}>Crear evento</button>
          </div>
        ) : (
          <>
            {featured && (
              <div className="admin-featured-card">
                <div className="af-badge">
                  <span className={`status-dot ${featured.status === 'Publicado' ? 'green' : 'yellow'}`} />
                  {featured.status === 'Publicado' ? '🟡 PRÓXIMO' : '📝 BORRADOR'}
                </div>
                <div className="af-info">
                  <h2 className="af-title">{featured.title}</h2>
                  <p className="af-date">{fmtDate(featured.event_date)}</p>
                  {featured.location && (
                    <div className="af-loc"><MapPin size={12}/><span>{featured.location}</span></div>
                  )}
                </div>
                <button className="btn-edit-featured" onClick={() => openEdit(featured)}>Editar</button>
              </div>
            )}

            {rest.length > 0 && (
              <div className="admin-catalog">
                <h3 className="catalog-title">Gestionar catálogo</h3>
                <div className="catalog-list">
                  {rest.map((ev, i) => (
                    <div key={ev.id} className="catalog-item">
                      <div className="ci-date-box" style={{ background: `linear-gradient(135deg, ${DAY_COLORS[(i+2)%5]}, ${DAY_COLORS[(i+3)%5]})` }}>
                        <span className="ci-day">{getDay(ev.event_date)}</span>
                        <span className="ci-month">{getMonth(ev.event_date)}</span>
                      </div>
                      <div className="ci-info">
                        <span className="ci-name">{ev.title}</span>
                        {ev.location && (
                          <div className="ci-loc"><MapPin size={10}/><span>{ev.location}</span></div>
                        )}
                      </div>
                      <div className="ci-actions">
                        <button className="btn-edit-sm" onClick={() => openEdit(ev)}>Editar</button>
                        <button className="btn-delete-sm" onClick={() => handleDelete(ev.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              {[
                { key: 'title', label: 'Título *', placeholder: 'Sunset Speed Dating' },
                { key: 'description', label: 'Descripción', placeholder: 'Descripción del evento...' },
                { key: 'location', label: 'Ubicación', placeholder: 'Palermo Soho, CABA' },
                { key: 'event_date', label: 'Fecha y Hora', placeholder: '', type: 'datetime-local' },
                { key: 'tags', label: 'Tags (ej: Fiestas, Música)', placeholder: 'Fiestas' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} className="modal-field">
                  <label>{label}</label>
                  <input
                    type={type || 'text'}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div className="modal-field">
                <label>Estado</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option>Publicado</option>
                  <option>Borrador</option>
                  <option>Cancelado</option>
                  <option>Finalizado</option>
                </select>
              </div>
              {error && <p className="modal-error">{error}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn-modal-cancel" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : editingEvent ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
